const express = require('express');
const router = express.Router();
const db = require('../database');

// GET /api/capelas - Lista as capelas de fluxo laminar
router.get('/', async (req, res) => {
  try {
    const capelas = await db.all(`
      SELECT 
        c.*,
        p.nome as paciente_nome,
        p.prontuario as paciente_prontuario,
        prot.nome as protocolo_nome,
        prot.tipo_droga,
        prot.duracao_manipulacao_min
      FROM capelas c
      LEFT JOIN pacientes p ON c.paciente_atual_id = p.id
      LEFT JOIN protocolos prot ON p.protocolo_id = prot.id
      ORDER BY c.id ASC
    `);

    res.json({ sucesso: true, dados: capelas });
  } catch (err) {
    res.status(500).json({ sucesso: false, erro: err.message });
  }
});

// GET /api/capelas/fila-manipulacao - Fila de bolsas a serem manipuladas, ordenada por necessidade da infusão
router.get('/fila-manipulacao', async (req, res) => {
  try {
    const fila = await db.all(`
      SELECT 
        p.id as paciente_id,
        p.nome as paciente_nome,
        p.prontuario,
        p.status as paciente_status,
        p.horario_chegada,
        p.poltrona_id,
        polt.numero as poltrona_numero,
        prot.id as protocolo_id,
        prot.nome as protocolo_nome,
        prot.tipo_droga,
        prot.duracao_manipulacao_min,
        prot.duracao_infusao_min,
        ag.horario_inicio_infusao,
        ag.horario_inicio_capela,
        ag.horario_fim_capela
      FROM pacientes p
      JOIN protocolos prot ON p.protocolo_id = prot.id
      LEFT JOIN poltronas polt ON p.poltrona_id = polt.id
      LEFT JOIN agendamentos ag ON p.id = ag.paciente_id
      WHERE p.status IN ('Triagem/Punção', 'Em Manipulação', 'Aguardando Check-in')
      ORDER BY 
        CASE 
          WHEN p.status = 'Em Manipulação' THEN 1
          WHEN p.status = 'Triagem/Punção' THEN 2
          ELSE 3
        END,
        COALESCE(ag.horario_inicio_infusao, '23:59') ASC,
        p.horario_chegada ASC
    `);

    res.json({ sucesso: true, dados: fila });
  } catch (err) {
    res.status(500).json({ sucesso: false, erro: err.message });
  }
});

// POST /api/capelas/:id/iniciar-preparo - Farmacêutico inicia manipulação
router.post('/:id/iniciar-preparo', async (req, res) => {
  try {
    const capelaId = Number(req.params.id);
    const { paciente_id } = req.body;

    if (!paciente_id) {
      return res.status(400).json({ sucesso: false, erro: 'paciente_id é obrigatório para iniciar preparo.' });
    }

    const paciente = await db.get('SELECT * FROM pacientes WHERE id = ?', [paciente_id]);
    if (!paciente) {
      return res.status(404).json({ sucesso: false, erro: 'Paciente não encontrado.' });
    }

    // Atualiza status da Capela para 'Manipulando'
    await db.run(
      `UPDATE capelas SET status = 'Manipulando', paciente_atual_id = ? WHERE id = ?`,
      [paciente_id, capelaId]
    );

    // Atualiza status do Paciente para 'Em Manipulação'
    await db.run(
      `UPDATE pacientes SET status = 'Em Manipulação' WHERE id = ?`,
      [paciente_id]
    );

    res.json({
      sucesso: true,
      mensagem: `Manipulação da bolsa para o paciente ${paciente.nome} iniciada na Capela ${capelaId}!`
    });
  } catch (err) {
    res.status(500).json({ sucesso: false, erro: err.message });
  }
});

// POST /api/capelas/:id/concluir-preparo - Farmacêutico conclui preparo e libera bolsa
router.post('/:id/concluir-preparo', async (req, res) => {
  try {
    const capelaId = Number(req.params.id);
    let { paciente_id } = req.body;

    if (!paciente_id) {
      const capela = await db.get('SELECT paciente_atual_id FROM capelas WHERE id = ?', [capelaId]);
      paciente_id = capela ? capela.paciente_atual_id : null;
    }

    if (!paciente_id) {
      return res.status(400).json({ sucesso: false, erro: 'Nenhum paciente vinculado à capela para concluir preparo.' });
    }

    // Libera a Capela para 'Disponível'
    await db.run(
      `UPDATE capelas SET status = 'Disponível', paciente_atual_id = NULL WHERE id = ?`,
      [capelaId]
    );

    // Move automaticamente o paciente para 'Pronto para Infundir' (Bolsa a Caminho)
    await db.run(
      `UPDATE pacientes SET status = 'Pronto para Infundir' WHERE id = ?`,
      [paciente_id]
    );

    res.json({
      sucesso: true,
      mensagem: 'Bolsa finalizada com sucesso! Paciente transferido para "Bolsa a Caminho".'
    });
  } catch (err) {
    res.status(500).json({ sucesso: false, erro: err.message });
  }
});

// PATCH /api/capelas/:id/status - Altera status manual (ex: Limpeza/Parada ou Disponível)
router.patch('/:id/status', async (req, res) => {
  try {
    const capelaId = Number(req.params.id);
    const { status } = req.body;

    if (!['Disponível', 'Manipulando', 'Limpeza'].includes(status)) {
      return res.status(400).json({ sucesso: false, erro: 'Status inválido. Escolha Disponível, Manipulando ou Limpeza.' });
    }

    const pacienteAtual = status === 'Manipulando' ? req.body.paciente_atual_id || null : null;

    await db.run(
      `UPDATE capelas SET status = ?, paciente_atual_id = ? WHERE id = ?`,
      [status, pacienteAtual, capelaId]
    );

    res.json({ sucesso: true, mensagem: `Status da Capela alterado para ${status}.` });
  } catch (err) {
    res.status(500).json({ sucesso: false, erro: err.message });
  }
});

module.exports = router;
