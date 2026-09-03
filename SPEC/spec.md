# SPEC Principal - Sistema de Controle de Ponto (Time Clock)

## 1. Visão Geral & Objetivos
Desenvolver uma aplicação web estática (Client-Side) para registro de entrada e saída de funcionários, com foco em simplicidade de uso em dispositivos Desktop/Tablet, alta autencidade dos registros e prevenção contra fraudes.

---

## 2. Instruções para Agentes de IA (ex: Google Jules)
1. **Dúvidas e Incertezas:** NÃO CODIFIQUE caso haja qualquer ambiguidade ou dúvida sobre uma regra de negócio ou arquitetura. Solicite esclarecimentos antes de prosseguir.
2. **Decomposição em Tarefas:** Sempre divida programações ou implementações extensas em tarefas e subtarefas incrementais.
3. **Registro de Progresso:** Crie e mantenha atualizado o arquivo `backlog.md` na raiz do projeto, registrando todas as funcionalidades implementadas, corrigidas ou alteradas a cada ciclo de desenvolvimento.
4. **Respeito à Stack:** Não adicione dependências via `npm`, `node`, `composer` ou arquivos de build/bundling.

---

## 3. Stack Tecnológica
- **Hospedagem & Repositório:** GitHub / GitHub Pages (Arquivos estáticos).
- **Backend & Database:** Supabase (PostgreSQL) consumido estritamente via API REST / Client JS CDN.
- **Frontend Core:** HTML5, CSS3, JavaScript ES6+ Vanilla.
- **Bibliotecas via CDN (Permitidas para redução de código e erros):**
  - `@supabase/supabase-js` (v2 via cdn.jsdelivr.net) - Comunicação com o Supabase.
  - `Alpine.js` (v3 via cdn.jsdelivr.net) - Gerenciamento de estado reativo simples sem bundler.
  - `Lucide Icons` (vía cdn.jsdelivr.net) - Biblioteca de ícones SVG leves.
  - `CryptoJS` (via cdnjs.cloudflare.com) - Geração de hash SHA-256 para verificação antifraude.

---

## 4. Requisitos de UI / UX
- **Target Device:** Exclusivo e otimizado para exibições em **Tablets (orientação paisagem/retrato)** e **Desktop**.
- **Estilo:** Design limpo, fundo predominantemente **branco** (`#FFFFFF`), tipografia legível, contraste alto para rápido manuseio.
- **Ícones:** **PROIBIDO o uso de emojis na interface.** Utilize exclusivamente ícones da biblioteca `Lucide Icons`.
- **APIs Nativas:** Utilizar Web APIs nativas do JS apenas quando estritamente necessário (ex: captura de geolocalização do dispositivo ou IP do cliente para auditoria).

---

## 5. Regras de Negócio & Fluxos do Usuário

### Identificação
- O funcionário insere seu **ID de Funcionário** (código interno alfanumérico, ex: `EMP-001`), evitando a digitação e exposição de dados sensíveis como CPF.

### Fluxo de Registro
1. **Entrada:** Funcionário insere o ID. O sistema valida se existe um registro sem saída em aberto. Se não houver, registra o horário atual (`entry_time`).
2. **Saída:** Funcionário insere o ID. O sistema identifica o registro em aberto, salva o horário de saída (`exit_time`), calcula as horas trabalhadas e exibe o ticket/comprovante digital.

### Estratégia Antifraude
- **Timestamp da Fonte de Verdade:** O horário de registro é capturado via timestamp do servidor do Supabase (`now()`), prevenindo fraudes relativas ao relógio do dispositivo local.
- **Código de Verificação (Hash Antifraude):** Cada registro concluído gera um hash SHA-256 combinando `Employee_ID + Entry_Timestamp + Exit_Timestamp + Chave_Secreta`.
- **Auditoria:** Captura do `User-Agent` e do IP público do dispositivo solicitante.

---

## 6. Estrutura de Arquivos Recomendada
```text
/
├── SPEC.md
├── schema.sql
├── backlog.md
├── index.html        # Interface do Terminal de Ponto (Tablet/Desktop)
├── assets/
│   ├── js/
│   │   ├── config.js # Configuração e chaves de API do Supabase
│   │   └── app.js    # Lógica de interface e chamadas Alpine.js / Supabase
│   └── css/
│       └── style.css # Estilização customizada (fundo branco, layout responsivo)