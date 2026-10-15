document.addEventListener('alpine:init', () => {
  Alpine.data('timeClock', () => ({
    employeeCode: '',
    loading: false,
    errorMessage: '',
    currentDateStr: '',
    currentTimeStr: '',
    clientIp: 'Detectando...',
    employee: null,
    timeLogResult: null,
    receiptType: null, // 'ENTRY' ou 'EXIT'
    workedDuration: null,
    resetCountdown: 8,
    timerInterval: null,

    init() {
      this.updateClock();
      setInterval(() => this.updateClock(), 1000);
      this.fetchClientIp();
      this.$nextTick(() => {
        if (window.lucide) window.lucide.createIcons();
      });
    },

    updateClock() {
      const now = new Date();
      this.currentDateStr = now.toLocaleDateString('pt-BR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      this.currentTimeStr = now.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    },

    async fetchClientIp() {
      try {
        const res = await fetch('https://api.ipify.org?format=json');
        if (res.ok) {
          const data = await res.json();
          this.clientIp = data.ip || '127.0.0.1';
        } else {
          this.clientIp = 'Indisponível';
        }
      } catch (err) {
        this.clientIp = 'Indisponível';
      }
    },

    async handleSubmit() {
      this.errorMessage = '';
      const code = this.employeeCode.trim().toUpperCase();

      if (!code) {
        this.errorMessage = 'Por favor, informe seu ID de funcionário.';
        return;
      }

      this.loading = true;

      try {
        // 1. Buscar dados do funcionário no Supabase
        const { data: employees, error: empError } = await supabaseClient
          .from('employees')
          .select('*')
          .eq('employee_code', code)
          .eq('is_active', true);

        if (empError) throw empError;

        if (!employees || employees.length === 0) {
          this.errorMessage = 'Funcionário não encontrado ou inativo.';
          this.loading = false;
          return;
        }

        const emp = employees[0];
        this.employee = emp;

        // 2. Verificar se existe registro sem saída em aberto (exit_time IS NULL)
        const { data: openLogs, error: logError } = await supabaseClient
          .from('time_logs')
          .select('*')
          .eq('employee_id', emp.id)
          .is('exit_time', null)
          .order('entry_time', { ascending: false });

        if (logError) throw logError;

        const userAgent = navigator.userAgent;

        if (openLogs && openLogs.length > 0) {
          // --- FLUXO DE SAÍDA ---
          const openLog = openLogs[0];
          const exitTimeIso = new Date().toISOString();

          // Hash de integridade Antifraude no cliente
          const rawHashString = `${emp.id}${openLog.entry_time}${exitTimeIso}${ANTIFRAUD_SECRET_KEY}`;
          const clientHash = CryptoJS.SHA256(rawHashString).toString(CryptoJS.enc.Hex);

          const { data: updatedLogs, error: updateError } = await supabaseClient
            .from('time_logs')
            .update({
              exit_time: exitTimeIso,
              verification_code: clientHash,
              user_agent: userAgent,
              ip_address: this.clientIp
            })
            .eq('id', openLog.id)
            .select();

          if (updateError) throw updateError;

          const finalLog = updatedLogs[0];
          this.timeLogResult = finalLog;
          this.receiptType = 'EXIT';
          this.workedDuration = this.calculateWorkedTime(finalLog.entry_time, finalLog.exit_time);

        } else {
          // --- FLUXO DE ENTRADA ---
          const entryTimeIso = new Date().toISOString();

          const { data: insertedLogs, error: insertError } = await supabaseClient
            .from('time_logs')
            .insert([
              {
                employee_id: emp.id,
                entry_time: entryTimeIso,
                user_agent: userAgent,
                ip_address: this.clientIp
              }
            ])
            .select();

          if (insertError) throw insertError;

          this.timeLogResult = insertedLogs[0];
          this.receiptType = 'ENTRY';
          this.workedDuration = null;
        }

        this.startResetTimer();

      } catch (err) {
        console.error('Erro ao processar registro de ponto:', err);
        this.errorMessage = 'Erro de conexão ou ao salvar ponto. Tente novamente.';
      } finally {
        this.loading = false;
        this.$nextTick(() => {
          if (window.lucide) window.lucide.createIcons();
        });
      }
    },

    calculateWorkedTime(startStr, endStr) {
      const start = new Date(startStr);
      const end = new Date(endStr);
      const diffMs = end - start;

      const totalMinutes = Math.floor(diffMs / (1000 * 60));
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;

      return `${hours}h ${minutes}min`;
    },

    formatTime(dateIso) {
      if (!dateIso) return '--:--:--';
      return new Date(dateIso).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    },

    formatDate(dateIso) {
      if (!dateIso) return '--/--/----';
      return new Date(dateIso).toLocaleDateString('pt-BR');
    },

    startResetTimer() {
      this.resetCountdown = 8;
      if (this.timerInterval) clearInterval(this.timerInterval);

      this.timerInterval = setInterval(() => {
        this.resetCountdown--;
        if (this.resetCountdown <= 0) {
          this.resetTerminal();
        }
      }, 1000);
    },

    resetTerminal() {
      if (this.timerInterval) clearInterval(this.timerInterval);
      this.employeeCode = '';
      this.employee = null;
      this.timeLogResult = null;
      this.receiptType = null;
      this.workedDuration = null;
      this.errorMessage = '';
      this.loading = false;
      this.$nextTick(() => {
        if (window.lucide) window.lucide.createIcons();
        const inputEl = document.getElementById('employeeCodeInput');
        if (inputEl) inputEl.focus();
      });
    }
  }));
});
