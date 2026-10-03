const express = require('express');
const router = express.Router();
const db = require('../database');

// Etapas sequenciais do Kanban
const KANBAN_STAGES = [
  'Aguardando Check-in',
  'Triagem/Punção',
  'Em Manipulação',
  'Pronto para Infundir', // Bolsa a Caminho
  'Em Infusão',
  'Alta'
];

// GET /api/pacientes - Lista todos os pacientes enriquecidos
router.get('/', async (req, res) => {
  try {
    const pacientes = await db.all(`
      SELECT 
        p.*, 
        prot.nome as protocolo_nome, 
        prot.duracao_manipulacao_min, 
        prot.duracao_infusao_min, 
        prot.tipo_droga,
        polt.numero as poltrona_numero,
        polt.status as poltrona_status
      FROM pacientes p
      LEFT JOIN protocolos prot ON p.protocolo_id = prot.id
      LEFT JOIN poltronas polt ON p.poltrona_id = polt.id
      ORDER BY p.id ASC
    `);

    // Atualiza contadores dinâmicos de minutos restantes para os que estão "Em Infusão"
    const enriched = pacientes.map(pac => {
      let alertaHigienizacao = false;
      if (pac.status === 'Em Infusão') {
        // Se faltar <= 15 minutos, aciona alerta
        if (pac.minutos_restantes_infusao !== null && pac.minutos_restantes_infusao <= 15) {
          alertaHigienizacao = true;
        }
      }
      return {
        ...pac,
        alerta_higienizacao: alertaHigienizacao
      };
    });

    res.json({ sucesso: true, dados: enriched });
  } catch (err) {
    res.status(500).json({ sucesso: false, erro: err.message });
  }
});

// POST /api/pacientes - Cadastra novo paciente
router.post('/', async (req, res) => {
  try {
    const { nome, prontuario, protocolo_id, poltrona_id, horario_chegada, origem } = req.body;
    if (!nome || !prontuario || !protocolo_id) {
      return res.status(400).json({ sucesso: false, erro: 'Nome, prontuário e protocolo são obrigatórios.' });
    }

    const prot = await db.get('SELECT * FROM protocolos WHERE id = ?', [protocolo_id]);
    const duracaoInf = prot ? prot.duracao_infusao_min : 120;
    const horaChegada = horario_chegada || new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const result = await db.run(
      `INSERT INTO pacientes (nome, prontuario, status, protocolo_id, poltrona_id, horario_chegada, origem, minutos_restantes_infusao)
       VALUES (?, ?, 'Aguardando Check-in', ?, ?, ?, ?, ?)`,
      [nome, prontuario, protocolo_id, poltrona_id || null, horaChegada, origem || 'Não informado', duracaoInf]
    );

    res.status(201).json({ sucesso: true, id: result.lastID, mensagem: 'Paciente cadastrado com sucesso!' });
  } catch (err) {
    res.status(500).json({ sucesso: false, erro: err.message });
  }
});

// POST /api/pacientes/:id/avancar - Avança para a próxima etapa do Kanban com 1 clique
router.post('/:id/avancar', async (req, res) => {
  try {
    const pacienteId = Number(req.params.id);
    const paciente = await db.get('SELECT * FROM pacientes WHERE id = ?', [pacienteId]);
    if (!paciente) {
      return res.status(404).json({ sucesso: false, erro: 'Paciente não encontrado.' });
    }

    const currentIdx = KANBAN_STAGES.indexOf(paciente.status);
    if (currentIdx === -1 || currentIdx >= KANBAN_STAGES.length - 1) {
      return res.status(400).json({ sucesso: false, erro: 'Paciente já está na etapa final de Alta ou com status inválido.' });
    }

    const proximaEtapa = KANBAN_STAGES[currentIdx + 1];
    const agoraHora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    // Regras de transição de estado da Poltrona e Horários
    if (proximaEtapa === 'Em Infusão') {
      // Se não tiver poltrona vinculada, tentar vincular uma livre
      let poltronaId = paciente.poltrona_id;
      if (!poltronaId) {
        const poltronaLivre = await db.get("SELECT id FROM poltronas WHERE status = 'Livre' LIMIT 1");
        if (poltronaLivre) poltronaId = poltronaLivre.id;
      }

      await db.run(
        `UPDATE pacientes SET status = ?, poltrona_id = ?, horario_inicio_infusao_real = ? WHERE id = ?`,
        [proximaEtapa, poltronaId, agoraHora, pacienteId]
      );

      if (poltronaId) {
        await db.run(`UPDATE poltronas SET status = 'Ocupada', paciente_atual_id = ? WHERE id = ?`, [
          pacienteId,
          poltronaId
        ]);
      }
    } else if (proximaEtapa === 'Alta') {
      // Ao dar alta, a poltrona entra automaticamente em 'Higienização' (Regra de Giro de Leito)
      await db.run(
        `UPDATE pacientes SET status = ?, minutos_restantes_infusao = 0 WHERE id = ?`,
        [proximaEtapa, pacienteId]
      );

      if (paciente.poltrona_id) {
        await db.run(`UPDATE poltronas SET status = 'Higienização', paciente_atual_id = NULL WHERE id = ?`, [
          paciente.poltrona_id
        ]);
      }
    } else {
      await db.run(`UPDATE pacientes SET status = ? WHERE id = ?`, [proximaEtapa, pacienteId]);
    }

    res.json({
      sucesso: true,
      novo_status: proximaEtapa,
      mensagem: `Paciente ${paciente.nome} avançou para "${proximaEtapa}".`
    });
  } catch (err) {
    res.status(500).json({ sucesso: false, erro: err.message });
  }
});

// PATCH /api/pacientes/:id/status - Atualização direta de status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status, poltrona_id } = req.body;
    const pacienteId = Number(req.params.id);

    if (poltrona_id !== undefined) {
      await db.run('UPDATE pacientes SET status = ?, poltrona_id = ? WHERE id = ?', [
        status,
        poltrona_id,
        pacienteId
      ]);
    } else {
      await db.run('UPDATE pacientes SET status = ? WHERE id = ?', [status, pacienteId]);
    }

    res.json({ sucesso: true, mensagem: 'Status atualizado com sucesso.' });
  } catch (err) {
    res.status(500).json({ sucesso: false, erro: err.message });
  }
});

module.exports = router;
