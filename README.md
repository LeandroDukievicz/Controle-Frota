# FleetGuard — Controle de Frota

App web mobile para controle de frota corporativa: check-out e check-in de veículos com foto e justificativa, mapa ao vivo, histórico de trajetos com resumo por IA, alertas e painel do gestor.

Implementação em **Next.js (App Router) + TypeScript** do protótipo criado no Claude Design. Nesta versão os dados são **mockados** (`src/lib/data.ts`) e o estado fica no navegador (`localStorage`), pronto para ser trocado por uma API.

## Rodando

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
npm run typecheck
```

Requer Node 20+.

## Rotas

| Rota | Tela |
| --- | --- |
| `/produto` | Página de apresentação do produto (por que usar, como usar, recursos, FAQ) |
| `/login` | Login (dados já preenchidos — basta clicar em **Entrar**) |
| `/` | Início do motorista: veículo em uso ou reservado, atalhos, reservas |
| `/checkout` | Check-out: veículo, hodômetro, destino, justificativa, foto obrigatória |
| `/checkin` | Check-in: hodômetro final, combustível, observações, foto de retorno |
| `/mapa` | Mapa ao vivo do veículo em uso |
| `/historico` | Trajetos com filtros por status |
| `/historico/[id]` | Detalhe do trajeto + Resumo IA + score de direção |
| `/alertas` | Alertas com filtros e “reconhecer” |
| `/frota` | Painel do gestor: KPIs, utilização, veículos, alertas recentes |

## Estrutura

```
src/
  app/
    (tabs)/      telas com barra de navegação inferior (início, mapa, histórico, alertas, frota)
    (flow)/      telas de fluxo sem navegação (check-out, check-in, detalhe do trajeto)
    login/       login
    produto/     landing page do produto
    globals.css  tokens de design (claro/escuro) e componentes base
  components/    componentes compartilhados (header, chips, mapa, alertas, foto…)
  lib/
    data.ts      tipos + dados mock
    store.tsx    estado global (sessão, tema, veículos, viagem ativa, alertas) persistido em localStorage
    format.ts    formatação pt-BR
```

## Design

- Tokens em `oklch` (slate + teal-petrol), tema claro/escuro via classe `.theme-dark` no `<html>`.
- Inter (UI) + JetBrains Mono (placas e números), carregadas por `next/font`.
- Ícones `lucide-react`.
- No celular o app ocupa a tela inteira (respeitando safe areas); no desktop aparece centralizado em uma coluna de até 430px.

## Próximos passos

- Backend/API real (autenticação, veículos, viagens, alertas) no lugar de `src/lib/data.ts` / `store.tsx`.
- Mapa real (ex.: MapLibre/Leaflet) no lugar do `StylizedMap`.
- Upload das fotos de check-out/check-in para storage.
- Resumo IA gerado a partir da telemetria real.
