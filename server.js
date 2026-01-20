// ============================================
// BARBERX APP - Server Principal
// Sistema de Agendamento e Gestao
// URL: https://app-barberx.xrtec1.com
// ============================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 9732;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================
// Arquivos estaticos - DEVEM VIR PRIMEIRO
// ============================================
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// ============================================
// API Routes
// ============================================

// Configuracao publica (apenas chaves publicas)
app.get('/api/config', (req, res) => {
    res.json({
        supabaseUrl: process.env.SUPABASE_URL,
        supabaseAnonKey: process.env.SUPABASE_ANON_KEY
    });
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'barberx-app' });
});

// ============================================
// Page Routes
// ============================================

// Rota principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Admin - Painel da Barbearia (DEVE VIR ANTES de /:slug)
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'index.html'));
});

app.get('/admin/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'index.html'));
});

// App Cliente - Agendamento por slug da barbearia (CATCH-ALL - DEVE SER A ULTIMA)
// Ex: /barbearia-teste
app.get('/:slug', (req, res) => {
    res.sendFile(path.join(__dirname, 'app', 'index.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log('');
    console.log('╔════════════════════════════════════════════╗');
    console.log('║        BARBERX APP - Servidor Ativo        ║');
    console.log('╠════════════════════════════════════════════╣');
    console.log(`║  URL: http://localhost:${PORT}              ║`);
    console.log('║  Admin: /admin                             ║');
    console.log('║  App: /:slug (ex: /barbearia-teste)        ║');
    console.log('║  Status: Rodando                           ║');
    console.log('╚════════════════════════════════════════════╝');
    console.log('');
});
