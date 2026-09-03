---

### 📄 Documento 2: `schema.sql` (Esquema SQL para o Supabase)

```sql
-- ==========================================
-- ESTRUTURA DO BANCO DE DADOS - SUPABASE
-- ==========================================

-- 1. Habilitar extensão para UUIDs (se necessário)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabela de Funcionários (Employees)
CREATE TABLE IF NOT EXISTS public.employees (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_code VARCHAR(30) UNIQUE NOT NULL, -- ID único da empresa (ex: EMP001)
    full_name VARCHAR(120) NOT NULL,
    work_shift_start TIME NOT NULL DEFAULT '08:00:00',
    work_shift_end TIME NOT NULL DEFAULT '17:00:00',
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3. Tabela de Registros de Ponto (Time Logs)
CREATE TABLE IF NOT EXISTS public.time_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE RESTRICT,
    entry_time TIMESTAMPTZ NOT NULL DEFAULT now(),
    exit_time TIMESTAMPTZ,
    verification_code TEXT, -- Hash SHA-256 para validação de integridade
    user_agent TEXT,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 4. Índices para Otimização de Consultas
-- Busca rápida por funcionários pelo código interno
CREATE INDEX IF NOT EXISTS idx_employees_code ON public.employees (employee_code);

-- Busca rápida por registros de ponto sem saída (em aberto)
CREATE INDEX IF NOT EXISTS idx_open_time_logs ON public.time_logs (employee_id) WHERE exit_time IS NULL;

-- 5. Função / Trigger para garantir integridade do Hash Antifraude no encerramento do ponto
CREATE OR REPLACE FUNCTION generate_time_log_hash()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.exit_time IS NOT NULL AND (OLD.exit_time IS NULL OR NEW.verification_code IS NULL) THEN
        NEW.verification_code := encode(
            digest(
                NEW.employee_id::text || 
                NEW.entry_time::text || 
                NEW.exit_time::text || 
                'SISTEMA_PONTO_SECRET_KEY', 
                'sha256'
            ), 
            'hex'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_generate_time_log_hash
BEFORE UPDATE ON public.time_logs
FOR EACH ROW
EXECUTE FUNCTION generate_time_log_hash();

-- 6. Políticas de Segurança (Row Level Security - RLS)
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_logs ENABLE ROW LEVEL SECURITY;

-- Permite leitura e inserção/atualização pela API pública anon do Supabase (Ajuste conforme política de auth)
CREATE POLICY "Acesso público via API para consulta de funcionários" 
    ON public.employees FOR SELECT USING (true);

CREATE POLICY "Acesso público via API para leitura e registro de ponto" 
    ON public.time_logs FOR ALL USING (true) WITH CHECK (true);