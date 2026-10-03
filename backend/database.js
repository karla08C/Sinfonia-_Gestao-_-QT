/**
 * Sinfonia - Database Management & Automatic Seed
 * Supports native SQLite via sqlite3 with seamless fallback for instant resilience.
 */
const path = require('path');
const fs = require('fs');

let sqlite3;
try {
  sqlite3 = require('sqlite3').verbose();
} catch (err) {
  console.warn('[Database] Pacote sqlite3 não encontrado. Usando adaptador SQLite nativo/JSON com persistência.');
}

const DB_PATH = path.join(__dirname, 'oncoflow.db');
const JSON_BACKUP_PATH = path.join(__dirname, 'oncoflow_data.json');

// Interface unificada assíncrona
class DatabaseService {
  constructor() {
    this.useSqlite = !!sqlite3;
    this.db = null;
    this.memoryData = {
      pacientes: [],
      protocolos: [],
      poltronas: [],
      capelas: [],
      agendamentos: []
    };
  }

  async init() {
    if (this.useSqlite) {
      return new Promise((resolve, reject) => {
        this.db = new sqlite3.Database(DB_PATH, async (err) => {
          if (err) {
            console.error('[Database] Erro ao conectar ao SQLite, chaveando para memória/JSON:', err.message);
            this.useSqlite = false;
            this.initJsonStorage();
            return resolve();
          }
          console.log('[Database] Conectado ao banco SQLite:', DB_PATH);
          await this.createTables();
          await this.seedDataIfEmpty();
          resolve();
        });
      });
    } else {
      this.initJsonStorage();
      await this.seedDataIfEmpty();
    }
  }

  initJsonStorage() {
    if (fs.existsSync(JSON_BACKUP_PATH)) {
      try {
        const raw = fs.readFileSync(JSON_BACKUP_PATH, 'utf-8');
        this.memoryData = JSON.parse(raw);
        console.log('[Database] Dados carregados do arquivo local:', JSON_BACKUP_PATH);
      } catch (e) {
        console.warn('[Database] Falha ao ler arquivo JSON existente:', e.message);
      }
    }
  }

  persistJson() {
    if (!this.useSqlite) {
      fs.writeFileSync(JSON_BACKUP_PATH, JSON.stringify(this.memoryData, null, 2), 'utf-8');
    }
  }

  async createTables() {
    if (!this.useSqlite) return;

    const queries = [
      `CREATE TABLE IF NOT EXISTS protocolos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        duracao_manipulacao_min INTEGER NOT NULL,
        duracao_infusao_min INTEGER NOT NULL,
        tipo_droga TEXT NOT NULL
      );`,
      `CREATE TABLE IF NOT EXISTS poltronas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        numero TEXT NOT NULL UNIQUE,
        status TEXT NOT NULL DEFAULT 'Livre',
        paciente_atual_id INTEGER
      );`,
      `CREATE TABLE IF NOT EXISTS capelas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL UNIQUE,
        status TEXT NOT NULL DEFAULT 'Disponível',
        paciente_atual_id INTEGER
      );`,
      `CREATE TABLE IF NOT EXISTS pacientes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        prontuario TEXT NOT NULL UNIQUE,
        status TEXT NOT NULL DEFAULT 'Aguardando Check-in',
        protocolo_id INTEGER,
        poltrona_id INTEGER,
        horario_chegada TEXT,
        origem TEXT DEFAULT 'Não informado',
        horario_inicio_infusao_real TEXT,
        minutos_restantes_infusao INTEGER,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (protocolo_id) REFERENCES protocolos(id),
        FOREIGN KEY (poltrona_id) REFERENCES poltronas(id)
      );`,
      `CREATE TABLE IF NOT EXISTS agendamentos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        paciente_id INTEGER NOT NULL,
        protocolo_id INTEGER NOT NULL,
        poltrona_id INTEGER NOT NULL,
        capela_id INTEGER,
        data TEXT NOT NULL,
        horario_chegada TEXT NOT NULL,
        horario_inicio_capela TEXT NOT NULL,
        horario_fim_capela TEXT NOT NULL,
        horario_inicio_infusao TEXT NOT NULL,
        horario_fim_infusao TEXT NOT NULL,
        status TEXT DEFAULT 'Agendado',
        FOREIGN KEY (paciente_id) REFERENCES pacientes(id),
        FOREIGN KEY (protocolo_id) REFERENCES protocolos(id),
        FOREIGN KEY (poltrona_id) REFERENCES poltronas(id)
      );`
    ];

    for (const q of queries) {
      await this.run(q);
    }

    // Adiciona o campo também a bancos SQLite criados por versões anteriores.
    const colunasPacientes = await this.all('PRAGMA table_info(pacientes)');
    if (!colunasPacientes.some(coluna => coluna.name === 'origem')) {
      await this.run("ALTER TABLE pacientes ADD COLUMN origem TEXT DEFAULT 'Não informado'");
    }
  }

  async seedDataIfEmpty() {
    const existing = await this.all('SELECT count(*) as count FROM protocolos');
    const count = existing && existing[0] ? (existing[0].count || 0) : this.memoryData.protocolos.length;

    if (count > 0) {
      console.log('[Database] Banco de dados já possui dados estruturados.');
      return;
    }

    console.log('[Database] Iniciando Seed Automático: Capela, Poltronas, Protocolos e Pacientes...');

    // 1. Capela
    await this.run(`INSERT INTO capelas (nome, status, paciente_atual_id) VALUES (?, ?, ?)`, [
      'Capela Fluxo Laminar 01',
      'Manipulando',
      4 // João Pedro
    ]);

    // 2. Poltronas
    const poltronas = [
      { numero: 'Poltrona 01', status: 'Ocupada', paciente_atual_id: 1 },
      { numero: 'Poltrona 02', status: 'Ocupada', paciente_atual_id: 2 },
      { numero: 'Poltrona 03', status: 'Livre', paciente_atual_id: null },
      { numero: 'Poltrona 04', status: 'Higienização', paciente_atual_id: null }
    ];
    for (const p of poltronas) {
      await this.run(`INSERT INTO poltronas (numero, status, paciente_atual_id) VALUES (?, ?, ?)`, [
        p.numero,
        p.status,
        p.paciente_atual_id
      ]);
    }

    // 3. Protocolos
    const protocolos = [
      { nome: 'FOLFIRINOX', manip: 45, inf: 360, tipo: 'Citotóxico / Irinotecano + Oxaliplatina + 5-FU' },
      { nome: 'Paclitaxel + Carboplatina', manip: 35, inf: 180, tipo: 'Taxano + Derivado de Platina' },
      { nome: 'AC-T (Doxorrubicina + Ciclofosfamida)', manip: 30, inf: 150, tipo: 'Antraciclina + Agente Alquilante' },
      { nome: 'Oxaliplatina + Capecitabina (XELOX)', manip: 25, inf: 120, tipo: 'Derivado de Platina' },
      { nome: 'Imunoterapia (Pembrolizumabe)', manip: 20, inf: 60, tipo: 'Anticorpo Monoclonal / Anti-PD-1' },
      { nome: 'Bortezomibe + Dexametasona', manip: 15, inf: 30, tipo: 'Inibidor de Proteassoma' }
    ];

    for (const prot of protocolos) {
      await this.run(
        `INSERT INTO protocolos (nome, duracao_manipulacao_min, duracao_infusao_min, tipo_droga) VALUES (?, ?, ?, ?)`,
        [prot.nome, prot.manip, prot.inf, prot.tipo]
      );
    }

    // 4. Pacientes (8 pacientes distribuídos nas 6 etapas do Kanban com identificadores Sinfonia)
    const pacientes = [
      {
        nome: 'Maria de Lourdes Santos',
        prontuario: 'PAC-069',
        status: 'Em Infusão',
        protocolo_id: 1, // FOLFIRINOX (360m)
        poltrona_id: 1,
        horario_chegada: '07:20',
        horario_inicio_infusao_real: '08:00',
        minutos_restantes_infusao: 12 // Faltando 12 min (<15 min -> destaque amarelo alerta Acionar Higienização)
      },
      {
        nome: 'Carlos Eduardo Meireles',
        prontuario: 'PAC-041',
        status: 'Em Infusão',
        protocolo_id: 2, // Paclitaxel 180m
        poltrona_id: 2,
        horario_chegada: '08:00',
        horario_inicio_infusao_real: '09:00',
        minutos_restantes_infusao: 110 // Em andamento normal
      },
      {
        nome: 'Ana Beatriz Nogueira',
        prontuario: 'PAC-018',
        status: 'Pronto para Infundir', // Bolsa a Caminho
        protocolo_id: 5, // Pembrolizumabe 60m
        poltrona_id: 3,
        horario_chegada: '08:30',
        horario_inicio_infusao_real: null,
        minutos_restantes_infusao: 60
      },
      {
        nome: 'João Pedro Alcântara',
        prontuario: 'PAC-024',
        status: 'Em Manipulação',
        protocolo_id: 3, // AC-T 150m
        poltrona_id: 4,
        horario_chegada: '09:00',
        horario_inicio_infusao_real: null,
        minutos_restantes_infusao: 150
      },
      {
        nome: 'Helena Silveira Ramos',
        prontuario: 'PAC-033',
        status: 'Triagem/Punção',
        protocolo_id: 4, // XELOX 120m
        poltrona_id: null,
        horario_chegada: '09:40',
        horario_inicio_infusao_real: null,
        minutos_restantes_infusao: 120
      },
      {
        nome: 'Roberto Mendes de Freitas',
        prontuario: 'PAC-052',
        status: 'Aguardando Check-in',
        protocolo_id: 1, // FOLFIRINOX 360m
        poltrona_id: null,
        horario_chegada: '10:00',
        horario_inicio_infusao_real: null,
        minutos_restantes_infusao: 360
      },
      {
        nome: 'Fernanda Costa Ribeiro',
        prontuario: 'PAC-077',
        status: 'Aguardando Check-in',
        protocolo_id: 6, // Bortezomibe 30m
        poltrona_id: null,
        horario_chegada: '10:15',
        horario_inicio_infusao_real: null,
        minutos_restantes_infusao: 30
      },
      {
        nome: 'Antônio Silva Vasconcelos',
        prontuario: 'PAC-088',
        status: 'Alta',
        protocolo_id: 5, // Pembrolizumabe
        poltrona_id: null,
        horario_chegada: '07:10',
        horario_inicio_infusao_real: '07:45',
        minutos_restantes_infusao: 0
      }
    ];

    for (const pac of pacientes) {
      await this.run(
        `INSERT INTO pacientes (nome, prontuario, status, protocolo_id, poltrona_id, horario_chegada, horario_inicio_infusao_real, minutos_restantes_infusao)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          pac.nome,
          pac.prontuario,
          pac.status,
          pac.protocolo_id,
          pac.poltrona_id,
          pac.horario_chegada,
          pac.horario_inicio_infusao_real,
          pac.minutos_restantes_infusao
        ]
      );
    }

    // 5. Agendamentos Iniciais
    const hoje = new Date().toISOString().split('T')[0];
    const agendamentos = [
      { pac_id: 1, prot_id: 1, polt_id: 1, cap_id: 1, chegada: '07:30', ini_cap: '06:45', fim_cap: '07:30', ini_inf: '07:45', fim_inf: '13:45' },
      { pac_id: 2, prot_id: 2, polt_id: 2, cap_id: 1, chegada: '08:00', ini_cap: '07:40', fim_cap: '08:15', ini_inf: '08:30', fim_inf: '11:30' },
      { pac_id: 3, prot_id: 5, polt_id: 3, cap_id: 1, chegada: '08:45', ini_cap: '08:20', fim_cap: '08:40', ini_inf: '08:55', fim_inf: '09:55' },
      { pac_id: 4, prot_id: 3, polt_id: 4, cap_id: 1, chegada: '09:15', ini_cap: '08:45', fim_cap: '09:15', ini_inf: '09:30', fim_inf: '12:00' }
    ];

    for (const a of agendamentos) {
      await this.run(
        `INSERT INTO agendamentos (paciente_id, protocolo_id, poltrona_id, capela_id, data, horario_chegada, horario_inicio_capela, horario_fim_capela, horario_inicio_infusao, horario_fim_infusao, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Agendado')`,
        [a.pac_id, a.prot_id, a.polt_id, a.cap_id, hoje, a.chegada, a.ini_cap, a.fim_cap, a.ini_inf, a.fim_inf]
      );
    }

    console.log('[Database] Seed concluído com sucesso!');
  }

  // Wrapper assíncrono para SELECT ALL
  async all(sql, params = []) {
    if (this.useSqlite) {
      return new Promise((resolve, reject) => {
        this.db.all(sql, params, (err, rows) => {
          if (err) return reject(err);
          resolve(rows || []);
        });
      });
    }

    // Fallback em memória (SQL parser simplificado para operações CRUD)
    return this.memoryQuery(sql, params);
  }

  // Wrapper assíncrono para SELECT ONE
  async get(sql, params = []) {
    const rows = await this.all(sql, params);
    return rows && rows.length > 0 ? rows[0] : null;
  }

  // Wrapper assíncrono para INSERT / UPDATE / DELETE
  async run(sql, params = []) {
    if (this.useSqlite) {
      return new Promise((resolve, reject) => {
        this.db.run(sql, params, function (err) {
          if (err) return reject(err);
          resolve({ lastID: this.lastID, changes: this.changes });
        });
      });
    }

    return this.memoryExec(sql, params);
  }

  // Execuções em fallback em memória
  memoryExec(sql, params) {
    const normalized = sql.trim().toLowerCase();

    if (normalized.startsWith('insert into')) {
      const match = sql.match(/insert into (\w+)\s*\((.*?)\)\s*values\s*\((.*?)\)/i);
      if (match) {
        const table = match[1].toLowerCase();
        const cols = match[2].split(',').map(c => c.trim().toLowerCase());
        const item = { id: (this.memoryData[table]?.length || 0) + 1 };
        cols.forEach((col, idx) => {
          item[col] = params[idx];
        });
        if (!this.memoryData[table]) this.memoryData[table] = [];
        this.memoryData[table].push(item);
        this.persistJson();
        return { lastID: item.id, changes: 1 };
      }
    } else if (normalized.startsWith('update')) {
      const match = sql.match(/update (\w+)\s+set\s+(.*?)\s+where\s+(.*)/i);
      if (match) {
        const table = match[1].toLowerCase();
        const whereClause = match[3];
        // Atribuições simples
        const targetId = params[params.length - 1];
        const record = this.memoryData[table]?.find(r => r.id === Number(targetId));
        if (record) {
          const assignments = match[2].split(',');
          assignments.forEach((assign, idx) => {
            const col = assign.split('=')[0].trim().toLowerCase();
            record[col] = params[idx];
          });
          this.persistJson();
          return { changes: 1 };
        }
      }
    }
    return { changes: 0 };
  }

  memoryQuery(sql, params) {
    const normalized = sql.trim().toLowerCase();
    if (normalized.includes('from protocolos')) return this.memoryData.protocolos;
    if (normalized.includes('from poltronas')) return this.memoryData.poltronas;
    if (normalized.includes('from capelas')) return this.memoryData.capelas;
    if (normalized.includes('from pacientes')) return this.memoryData.pacientes;
    if (normalized.includes('from agendamentos')) return this.memoryData.agendamentos;
    return [];
  }
}

const dbService = new DatabaseService();
module.exports = dbService;
