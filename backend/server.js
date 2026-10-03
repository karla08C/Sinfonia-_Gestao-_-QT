const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database');

const pacientesRoutes = require('./routes/pacientes');
const poltronasRoutes = require('./routes/poltronas');
const capelasRoutes = require('./routes/capelas');
const protocolosRoutes = require('./routes/protocolos');
const agendamentosRoutes = require('./routes/agendamentos');
const kpisRoutes = require('./routes/kpis');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Servir frontend compilado se existir
const frontendDist = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendDist));

// Rotas da API
app.use('/api/pacientes', pacientesRoutes);
app.use('/api/poltronas', poltronasRoutes);
app.use('/api/capelas', capelasRoutes);
app.use('/api/protocolos', protocolosRoutes);
app.use('/api/agendamentos', agendamentosRoutes);
app.use('/api/kpis', kpisRoutes);

// Endpoint de saúde e boas-vindas
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    app: 'Sinfonia: Fluxo & Torre de Controle da Quimioterapia',
    versao: '2.0.0',
    disclaimer: 'Protótipo com dados sintéticos. Não substitui decisão clínica nem o sistema Tasy.',
    timestamp: new Date().toISOString()
  });
});

// Fallback SPA
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  const indexPath = path.join(frontendDist, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.send(`
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head><title>Sinfonia API</title></head>
        <body style="font-family: sans-serif; padding: 2rem; background: #f8fafc; color: #0f172a;">
          <h1>Sinfonia: Fluxo & Torre de Controle da Quimioterapia</h1>
          <p>Servidor backend ativo na porta ${PORT}. Acesse as rotas /api/...</p>
        </body>
        </html>
      `);
    }
  });
});

// Inicialização
async function startServer() {
  try {
    await db.init();
    app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`  🎼 Sinfonia Backend rodando em http://localhost:${PORT}`);
      console.log(`  Endpoints Disponíveis:`);
      console.log(`  - /api/pacientes`);
      console.log(`  - /api/poltronas`);
      console.log(`  - /api/capelas`);
      console.log(`  - /api/protocolos`);
      console.log(`  - /api/agendamentos`);
      console.log(`  - /api/agendamentos/gerar-grade (POST)`);
      console.log(`  - /api/kpis`);
      console.log(`=======================================================`);
    });
  } catch (err) {
    console.error('Falha ao iniciar servidor Sinfonia:', err);
  }
}

startServer();
