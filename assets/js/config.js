// Configurações do Supabase e do Terminal de Ponto
const SUPABASE_URL = 'https://yukzaekhnfqajegtzaxc.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_6yXPvC2KDCeQG-ReGXAa2Q_dnhKIOhx';
const ANTIFRAUD_SECRET_KEY = 'SISTEMA_PONTO_SECRET_KEY';

// Inicialização do cliente Supabase via SDK CDN
const supabaseClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY) : null;
