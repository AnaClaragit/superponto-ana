# Backlog do Projeto - SuperPonto ANA

Este arquivo registra o progresso do desenvolvimento, decomposição em tarefas técnicas e acompanhamento do status de cada funcionalidade do Terminal de Ponto.

---

## 1. Configuração do Banco de Dados & Seeds
- [x] **[DB-01]** Criação das tabelas `employees` e `time_logs`, triggers antifraude e RLS no Supabase.
- [x] **[DB-02]** Inserção de funcionários de teste (ex: `EMP-001` - Maria Silva, `EMP-002` - João Santos).

---

## 2. Estrutura Base & Interface de Usuário (UI/UX)
- [x] **[UI-01]** Criar `index.html` otimizado para Tablet (Retrato/Paisagem) e Desktop.
- [x] **[UI-02]** Criar `assets/css/style.css` com design predominantemente branco (`#FFFFFF`), alta legibilidade e contraste.
- [x] **[UI-03]** Integrar bibliotecas CDN autorizadas (`@supabase/supabase-js`, `Alpine.js`, `Lucide Icons`, `CryptoJS`).
- [x] **[UI-04]** Garantir uso exclusivo de ícones da biblioteca `Lucide Icons` (sem uso de emojis).

---

## 3. Configurações & Integração com Supabase
- [x] **[INT-01]** Criar `assets/js/config.js` inicializando o cliente Supabase utilizando a **Publishable Key**.
- [x] **[INT-02]** Implementar módulo para obtenção do IP público do dispositivo via API pública (`api.ipify.org`) e User-Agent.

---

## 4. Lógica de Ponto & Antifraude (`assets/js/app.js`)
- [x] **[LOG-01]** Implementar identificação e consulta do funcionário por código (`employee_code`).
- [x] **[LOG-02]** Implementar verificação de registro de ponto em aberto (`exit_time IS NULL`).
- [x] **[LOG-03]** Implementar fluxo de Registro de Entrada (`entry_time` capturado pelo servidor Supabase).
- [x] **[LOG-04]** Implementar fluxo de Registro de Saída, cálculo do total de horas trabalhadas no turno e salvamento de `exit_time`.
- [x] **[LOG-05]** Implementar geração e exibição do hash SHA-256 de integridade no comprovante.
- [x] **[LOG-06]** Implementar comprovante/ticket digital de registro com temporizador de reset automático para o próximo funcionário.

---

## 5. Testes & Qualidade
- [x] **[TST-01]** Testar fluxo e2e de Entrada para novos funcionários.
- [x] **[TST-02]** Testar fluxo e2e de Saída e validação do comprovante.
- [x] **[TST-03]** Validar regras antifraude, gravação de IP e User-Agent.
