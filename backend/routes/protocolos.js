const express = require('express');
const router = express.Router();
const db = require('../database');

// GET /api/protocolos - Lista todos os protocolos
router.get('/', async (req, res) => {
  try {
    const protocolos = await db.all('SELECT * FROM protocolos ORDER BY duracao_infusao_min DESC');
    res.json({ sucesso: true, dados: protocolos });
  } catch (err) {
    res.status(500).json({ sucesso: false, erro: err.message });
  }
});

module.exports = router;
