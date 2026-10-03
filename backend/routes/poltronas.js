const express = require('express');
const router = express.Router();
const db = require('../database');

// GET /api/poltronas - Lista todas as poltronas com status e detalhes do paciente em infusão
router.get('/', async (req, res) => {
  try {
    const poltronas = await db.all(`
      SELECT 
        polt.*,
        p.nome as paciente_nome,
        p.prontuario as paciente_prontuario,
        p.minutos_restantes_infusao,
        prot.nome as protocolo_nome,
        prot.duracao_infusao_min
      FROM poltronas polt
      LEFT JOIN pacientes p ON polt.id = p.poltrona_id AND p.status = 'Em Infusão'
      LEFT JOIN protocolos prot ON p.protocolo_id = prot.id
      ORDER BY polt.id ASC
    `);

    // Calcular progresso percentual da infusão para visualização na barra
    const enriquecidas = poltronas.map(polt => {
      let progressoPct = 0;
      let alertaHigienizacao = false;

      if (polt.status === 'Ocupada' && polt.duracao_infusao_min && polt.minutos_restantes_infusao !== null) {
        const transcorrido = Math.max(0, polt.duracao_infusao_min - polt.minutos_restantes_infusao);
        progressoPct = Math.min(100, Math.round((transcorrido / polt.duracao_infusao_min) * 100));

        if (polt.minutos_restantes_infusao <= 15) {
          alertaHigienizacao = true;
        }
      }

      return {
        ...polt,
        progresso_pct: progressoPct,
        alerta_higienizacao: alertaHigienizacao
      };
    });

    res.json({ sucesso: true, dados: enriquecidas });
  } catch (err) {
    res.status(500).json({ sucesso: false, erro: err.message });
  }
});

// POST /api/poltronas/:id/liberar - Conclui a higienização e libera a poltrona
router.post('/:id/liberar', async (req, res) => {
  try {
    const poltronaId = Number(req.params.id);
    await db.run(
      `UPDATE poltronas SET status = 'Livre', paciente_atual_id = NULL WHERE id = ?`,
      [poltronaId]
    );

    res.json({
      sucesso: true,
      mensagem: `Poltrona ${poltronaId} higienizada e liberada para o próximo paciente!`
    });
  } catch (err) {
    res.status(500).json({ sucesso: false, erro: err.message });
  }
});

// PATCH /api/poltronas/:id/status - Atualiza status manualmente
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const poltronaId = Number(req.params.id);

    if (!['Livre', 'Ocupada', 'Higienização'].includes(status)) {
      return res.status(400).json({ sucesso: false, erro: 'Status inválido para poltrona.' });
    }

    await db.run('UPDATE poltronas SET status = ? WHERE id = ?', [status, poltronaId]);
    res.json({ sucesso: true, mensagem: `Status da poltrona atualizado para ${status}.` });
  } catch (err) {
    res.status(500).json({ sucesso: false, erro: err.message });
  }
});

module.exports = router;
