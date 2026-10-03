#  Sinfonia – Fluxo & Torre de Controle da Quimioterapia


O **Sinfonia** é uma plataforma clínica full-stack de orquestração do fluxo oncológico. Ele sincroniza o dia da unidade de quimioterapia para que **a bolsa esteja pronta no momento exato em que o paciente senta na poltrona** (Just-in-Time), **o trabalho da capela da farmácia seja distribuído suavemente ao longo do dia** e o **giro de leito seja acionado com antecedência**.


---

## 🌟 Funcionalidades Integradas do Sinfonia

### 1.  Torre de Controle (Kanban em Tempo Real)
- **6 Colunas de Fluxo Contínuo:** `Recepção / Check-in` ➔ `Triagem e Punção` ➔ `Capela Manipulando` ➔ `Bolsa a Caminho` ➔ `Poltrona em Infusão` ➔ `Finalizado / Alta`.
- Avanço de etapa com **1 clique**.
- **Alerta de Giro de Leito ($\le 15$ min):** Borda amarela luminosa e faixa de alerta para acionar a equipe de limpeza antes do paciente desocupar a poltrona.

### 2.  Visão da Capela (Farmácia Oncológica)
- Status visual trifásico (🟢 Livre | 🟠 Manipulando | 🔴 Limpeza).
- Botões farmacêuticos diretos: *"Iniciar Preparo"* e *"Concluir e Liberar Bolsa"*.
- Fila inteligente ordenada por prioridade Just-in-Time (bolsa pronta 15 min antes da punção).

### 3.  Mapa Visual das Poltronas
- Grid com codificação de cores hospitalares:
  - 🟢 **Verde:** Livre
  - 🔵 **Azul:** Ocupada (cronômetro regressivo + barra de progresso)
  - 🟠 **Laranja:** Em Higienização (com botão *"Liberar Poltrona"*)

### 4.  Aba "Hoje × Proposta" (Auditoria de Ganhos & Histórias Reais)
- Comparação lado a lado entre o modelo caótico atual e a proposta do Sinfonia:
  - **Remarcados por perder horário limite:** 2 pacientes (Hoje) ➔ **0 pacientes (Sinfonia)**
  - **Horas de poltrona sem tratamento (ociosa):** 54.8 h ➔ **22.5 h (-59%)**
  - **Pacientes que esperam mais de 30 min:** 24% ➔ **0%**
  - **Ocupação da Capela:** 75% manhã / 9% tarde ➔ **48% manhã / 45% tarde (Balanceada)**
- **Histórias de Pacientes Antes e Depois:**
  - *PAC-069 (Maria de Lourdes):* 5h42 na unidade ➔ 1h06 (Economia de 4h36 de espera)
  - *PAC-041 (Carlos Eduardo):* 4h50 na unidade ➔ 1h45
  - *PAC-018 (Ana Beatriz):* 3h30 na unidade ➔ 0h55

### 5.  Diagrama de Gantt da Unidade (07h às 18h)
- Linha do tempo visual integrada entre a Capela de Fluxo Laminar e as 4 Poltronas, mostrando faixas de preparo, tempo de transporte e blocos de 15 min de desinfecção.

### 6.  Horários-Limite dos Protocolos (Cut-off) & Regra de Sexta-feira
- Cada protocolo tem seu horário-limite estrito baseado na folha do setor (ex: FOLFIRINOX limite 11h00; Paclitaxel 13h00; Pembrolizumabe 15h30).
- **Checkbox "Sexta-feira":** Quando ativado, todos os limites são antecipados em 1 hora para assegurar o encerramento do ambulatório sem horas extras.

### 7. Registro de Imprevistos Clínicos
- Registro rápido de atraso de paciente, atraso de bolsa, falta ou término estendido com recálculo do efeito cascata na agenda sem perda de esterilidade.

---

##  As Regras de Negócio do Motor Inteligente

1. **Tetris Clínico:** Protocolos longos (> 240 min) agendados na manhã (07h30 às 08h30); intermediários a partir das 10h00; rápidos no início da tarde.
2. **Sincronia Just-in-Time da Capela:**
   $$\text{Início Capela} = \text{Início Infusão} - \text{Duração Manipulação} - 15\text{ min (transporte e checagem)}$$
3. **Previsão de Giro de Leito:** Bloqueio obrigatório de 15 minutos para higienização entre pacientes na mesma poltrona.
4. **Horário-Limite (Cut-off):** Pacientes que chegam após o limite do protocolo são sinalizados como remarcados para outro dia.


---

##  Como Rodar o Projeto

### Opção 1: Acesso Instantâneo (Sem Instalar Nada)
Abra diretamente no navegador o arquivo autônomo:
👉 **[`standalone-preview.html`](file:///C:/Users/Usuário/.gemini/antigravity/scratch/oncoflow/standalone-preview.html)**

### Opção 2: Servidor Node Local em Rede (Para Toda a Equipe)
Execute no terminal:
```bash
node dev-server.js
```
O servidor inicializa e exibe:
- Seu acesso: `http://localhost:5173`
- Acesso da equipe (mesmo Wi-Fi / Clínica): `http://192.168.X.X:5173`