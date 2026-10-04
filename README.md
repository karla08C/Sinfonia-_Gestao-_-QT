# Sinfonia – Gestão & Torre de Controle de Quimioterapia

O **Sinfonia** é uma plataforma clínica e operacional de orquestração de fluxo oncológico de ponta a ponta. Desenvolvido para centros de tratamento de alta complexidade e ambulatórios de oncologia, o sistema sincroniza em tempo real as etapas de **Recepção**, **Triagem**, **Capela de Manipulação (Farmácia)** e **Poltronas de Infusão**, garantindo o preparo *Just-in-Time* (JIT), balanceamento de carga e redução drástica do tempo de espera do paciente.

---

##  Integração com o Sistema Tasy (Philips Tasy)

O **Sinfonia** foi concebido como uma camada de inteligência operacional e orquestração em tempo real que opera **diretamente integrada ao ERP/PEP Philips Tasy**, software líder de gestão hospitalar e prontuário eletrônico no Brasil.

### Arquitetura de Interoperabilidade com o Tasy:
- **Ingestão de Dados em Tempo Real (Tasy ➔ Sinfonia):**
  - **Agendas Ambulatoriais:** Importação automática dos agendamentos do dia, horários previstos e dados demográficos do paciente.
  - **Prescrições Oncológicas & Ciclos:** Leitura dos esquemas terapêuticos validados pelo oncologista (protocolos, doses, diluições, volumes e tempos de infusão).
  - **Liberação de Exames Laboratoriais (LIS):** Captura do status de hemogramas, clearance de creatinina e marcadores para desbloqueio clínico da quimioterapia.
  - **Chegada do Paciente:** Integração com o módulo de recepção e totem de atendimento do Tasy para registro imediato de entrada na unidade.

- **Devolutiva Operacional (Sinfonia ➔ Tasy):**
  - **Rastreabilidade da Manipulação:** Atualização do status de preparo, lote e liberação da bolsa pela farmácia oncológica no Tasy.
  - **Checagem Beira-Leito:** Confirmação de início e término da infusão na poltrona com registro no prontuário eletrônico do paciente (PEP Tasy).
  - **Eventos e Intercorrências:** Sincronização de atrasos, reações infusionais e altas para o faturamento e histórico clínico do hospital.

---

##  Funcionalidades do Sistema

### 1. Torre de Controle (Kanban Clínico de 7 Etapas)
- **Fluxo Contínuo Hospitalar:**
  1. `Aguardando Recepção`: Paciente agendado aguardando check-in.
  2. `Triagem / Exames`: Verificação de sinais vitais, acesso venoso e conferência de exames laboratoriais.
  3. `Autorizado / Liberado`: Paciente clinicamente apto para início do ciclo.
  4. `Em Preparo Capela`: Farmácia oncológica manipulando a medicação em fluxo laminar.
  5. `Pronto p/ Infusão`: Bolsa liberada, transportada e checada na unidade de enfermagem.
  6. `Em Infusão`: Paciente em poltrona recebendo a medicação, com cronômetro regressivo e barra de progresso.
  7. `Alta Concedida`: Término da sessão, orientações pós-quimio e liberação do leito.
- **Filtros Avançados Integrados:**
  - Busca textual por nome do paciente ou prontuário (ex: `PAC-069`).
  - Filtro por médico oncologista assistente.
  - Filtro por turno de atendimento (`Manhã` / `Tarde`).
  - Filtro por protocolo quimioterápico.
- **Cartões de Paciente com Alta Densidade Clínica:**
  - Exibição de turno, ciclo do tratamento, médico responsável, protocolo e tempo previsto.
  - Acesso venoso (Port-a-Cath, PICC, venóclise periférica) e status de exames.
  - Designação da poltrona de atendimento.
  - **Alerta Visual de Giro de Leito ($\le 15$ min):** Cartão em destaque com borda luminosa e indicação de acionamento imediato da equipe de higienização.
- **Layout Hospitalar Fluido:** Colunas com largura fixa de 270px e rolagem horizontal suave, garantindo legibilidade sem compressão de dados.

### 2. Visão da Capela (Farmácia Oncológica)
- Monitoramento de status das cabines de segurança biológica (Disponível, Manipulando, Higienização).
- Fila de manipulação ordenada por horário de infusão e critérios de estabilidade farmacológica.
- Ações diretas de início de preparo e liberação da bolsa com registro de tempo de manipulação.
- Prevenção de gargalos através do cálculo de carga distribuída entre os turnos da manhã e tarde.

### 3. Mapa Visual de Poltronas
- Grid com acompanhamento espacial dos boxes e poltronas da unidade.
- Status operacionais em tempo real:
  - 🟢 **Livre:** Pronta para receber o próximo paciente.
  - 🔵 **Ocupada:** Em infusão ativa, com tempo restante e barra percentual.
  - 🟠 **Higienização / Alerta:** Poltrona em processo de limpeza ou com término previsto em menos de 15 minutos.
- Ação rápida para liberação de poltrona pós-higienização.

### 4. Diagrama de Gantt da Unidade (07h às 18h)
- Visão cronológica integrada das poltronas e da capela de fluxo laminar.
- Representação gráfica dos blocos de infusão, janelas de manipulação *Just-in-Time* e tempos reservados para desinfecção terminal e concorrente.

### 5. Comparativo Hoje × Proposta Sinfonia (Auditoria de Ganhos)
- Tabela de indicadores operacionais auditados comprovando o impacto da orquestração:
  - **Perda de Horário-Limite (Cut-off):** Redução de 2 pacientes/dia para **0**.
  - **Horas de Ociosidade de Poltronas:** Queda de 54.8 h para **22.5 h (-59%)**.
  - **Pacientes com Espera > 30 min:** Redução de 24% para **0%**.
  - **Pico de Lotação na Recepção:** Redução de 44 para **24 pacientes simultâneos (-45%)**.
  - **Balanceamento da Capela:** De 75% manhã / 9% tarde para **48% manhã / 45% tarde**.
- Histórias reais de pacientes com economia de até 4 horas e 36 minutos de espera desnecessária na recepção.

### 6. Regras de Agendamento & Regra de Sexta-Feira
- Modal interativo para consulta e parametrização das regras de agendamento (intervalos de chegada, horários-limite por protocolo e tempos de preparação antecipada).
- **Gatilho de Sexta-Feira:** Antecipação automática de 1 hora em todos os horários de corte para encerramento pontual da unidade sem sobrecarga da equipe.

---

## 🔮 Próximos Passos & Inovações em Desenvolvimento

### 1. Assistente de IA para Agendamento & Otimização de Medicações
- **Tetris Clínico Automatizado via IA:**
  - Modelo de inteligência artificial generativa e preditiva para sugerir os melhores horários de marcação de cada infusão.
  - Ponderação automática de múltiplos fatores: duração do protocolo, compatibilidade de drogas, janela de pico da capela de fluxo laminar e disponibilidade de poltronas adequadas.
  - Sugestão dinâmica de reagendamento em caso de intercorrências ou atrasos laboratoriais, recalculando a grade sem efeito cascata negativo.
- **Priorização Clínica Inteligente:**
  - Ranqueamento assistido com base em critérios de prioridade clínica: pacientes em primeiro ciclo de quimioterapia (maior risco de toxicidade), regimes com medicamentos de estabilidade físico-química ultracurta, pacientes pediátricos/geriátricos ou com fragilidade clínica documentada.

### 2. Suporte Especializado aos Pacientes do Interior (TFD / Transporte Sanitário)
Um dos maiores desafios dos centros de oncologia de referência é o acolhimento de pacientes que residem em municípios do interior e dependem de vans, micro-ônibus e ambulâncias do Tratamento Fora de Domicílio (TFD):
- **Compatibilização com Rotas e Janelas de Transporte:**
  - O assistente de IA priorizará horários de agendamento compatíveis com o horário de chegada e partida das caravanas municipais, evitando que o paciente chegue às 06h00 e aguarde até a tarde para iniciar o tratamento.
  - Prevenção do risco de perda do transporte de retorno para a cidade de origem decorrente de atrasos na liberação da bolsa ou na infusão.
- **Fast-Track de Triagem e Capela para Pacientes Forasteiros:**
  - Sinalização visual na Torre de Controle para pacientes do interior, disparando prioridade na coleta de exames e no preparo em capela para garantir desfecho dentro da janela de viagem.
- **Canal de Comunicação e Suporte Logístico:**
  - Informações em tempo real sobre a previsão de término da sessão para os motoristas do transporte sanitário municipal e acompanhantes, reduzindo ansiedade e garantindo acolhimento humanizado.

---

##  Tecnologias Utilizadas

- **Frontend:** React 18, Vite, Tailwind CSS, Lucide Icons, Headless UI.
- **Backend:** Python 3.11+, FastAPI, SQLAlchemy, Pydantic v2, SQLite (preparado para migração a PostgreSQL/Oracle Hospitalar).
- **Standalone:** HTML5 autônomo com React + Babel + Tailwind via CDN para apresentações rápidas sem dependência de instalação local.

---

##  Como Executar o Projeto


### Opção 1: Aplicação Full-Stack (Backend + Frontend)

1. **Backend (FastAPI):**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # No Windows: .\venv\Scripts\activate
   pip install -r requirements.txt
   uvicorn app.main:app --reload --port 8000
   ```

2. **Frontend (React + Vite):**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Acesse: `http://localhost:5173`

### Opção 2: Servidor de Apresentação em Rede Local
Para compartilhar o acesso com outros computadores ou tablets na mesma rede Wi-Fi da clínica:
```bash
node dev-server.js



##  Projeto  desenvolvido para apresentar no Ideathon do Instituto do Câncer do Ceará
