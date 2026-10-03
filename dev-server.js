/**
 * Sinfonia - Servidor de Demonstração e Compartilhamento em Rede
 * Escuta em 0.0.0.0 e detecta automaticamente o IP local para compartilhar com a equipe.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = 5173;
const PREVIEW_FILE = path.join(__dirname, 'standalone-preview.html');

function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  fs.readFile(PREVIEW_FILE, (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Erro ao carregar Sinfonia: ' + err.message);
      return;
    }

    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(data);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  const localIp = getLocalIpAddress();

  console.log('================================================================');
  console.log('  🎼 Sinfonia - Fluxo & Torre de Controle da Quimioterapia');
  console.log('================================================================');
  console.log(`  👉 Acesso no seu computador:`);
  console.log(`     http://localhost:${PORT}`);
  console.log('');
  console.log(`  👥 LINK PARA A SUA EQUIPE (Mesmo Wi-Fi / Rede):`);
  console.log(`     http://${localIp}:${PORT}`);
  console.log('================================================================');
  console.log('  Dica: Seus colegas podem abrir esse link pelo computador ou celular!');
  console.log('================================================================');
});
