const express = require('express');
const router = express.Router();
const db = require('../database');
const { gerarGradeInteligente } = require('../scheduler');

// GET /api/agendamentos - Lista os agendamentos cadastrados
router.get('/', async (req, res) => {
  try {
    const agendamentos = await db.all(`
      SELECT 
        a.*,
        p.nome as paciente_nome,
        p.prontuario as paciente_prontuario,
        prot.nome as protocolo_nome,
        prot.duracao_infusao_min,
        prot.duracao_manipulacao_min,
        polt.numero as poltrona_numero,
        c.nome as capela_nome
      FROM agendamentos a
      LEFT JOIN pacientes p ON a.paciente_id = p.id
      LEFT JOIN protocolos prot ON a.protocolo_id = prot.id
      LEFT JOIN poltronas polt ON a.poltrona_id = polt.id
      LEFT JOIN capelas c ON a.capela_id = c.id
      ORDER BY a.horario_inicio_infusao ASC
    `);

    res.json({ sucesso: true, dados: agendamentos });
  } catch (err) {
    res.status(500).json({ sucesso: false, erro: err.message });
  }
});

/**
 * POST /api/agendamentos/gerar-grade
 * Executa o Motor de Agendamento Inteligente com:
 * 1. Regra de Tetris Clínico
 * 2. Sincronia Just-in-Time da Capela
 * 3. Previsão de Giro de Leito (15 min higienização)
 */
router.post('/gerar-grade', async (req, res) => {
  try {
    const dataAlvo = req.body.data || new Date().toISOString().split('T')[0];
    let pacientes = req.body.pacientes;

    // Se não vier lista de pacientes no body, buscar os pacientes cadastrados
    if (!pacientes || !Array.isArray(pacientes) || pacientes.length === 0) {
      pacientes = await db.all('SELECT * FROM pacientes');
    }

    const protocolos = await db.all('SELECT * FROM protocolos');
    const poltronas = await db.all('SELECT * FROM poltronas');
    const capelas = await db.all('SELECT * FROM capelas');

    if (!protocolos.length || !poltronas.length) {
      return res.status(400).json({
        sucesso: false,
        erro: 'É necessário ter protocolos e poltronas cadastrados para gerar a grade.'
      });
    }

    // Execução do Algoritmo Tetris + JIT + Giro de Leito
    const resultadoGrade = gerarGradeInteligente({
      pacientes,
      protocolos,
      poltronas,
      capelas,
      data: dataAlvo
    });

    // Salvar ou atualizar na tabela de agendamentos
    // Opcional: limpar agendamentos anteriores da mesma data se solicitado ou sobrescrever
    for (const ag of resultadoGrade.grade) {
      // Atualizar no banco a poltrona sugerida para o paciente
      await db.run(
        `UPDATE pacientes SET poltrona_id = ? WHERE id = ?`,
        [ag.poltrona_id, ag.paciente_id]
      );

      // Inserir registro de agendamento na grade
      await db.run(
        `INSERT INTO agendamentos (
          paciente_id, protocolo_id, poltrona_id, capela_id, data,
          horario_chegada, horario_inicio_capela, horario_fim_capela,
          horario_inicio_infusao, horario_fim_infusao, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Agendado')`,
        [
          ag.paciente_id,
          ag.protocolo_id,
          ag.poltrona_id,
          ag.capela_id,
          ag.data,
          ag.horario_chegada,
          ag.horario_inicio_capela,
          ag.horario_fim_capela,
          ag.horario_inicio_infusao,
          ag.horario_fim_infusao
        ]
      );
    }

    res.json(resultadoGrade);
  } catch (err) {
    console.error('[Agendamentos/Gerar-Grade] Erro:', err);
    res.status(500).json({ sucesso: false, erro: err.message });
  }
});

module.exports = router;
