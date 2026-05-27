# Scope Primario por Equipo
## Iniciativa: 001-inversions
## Fuente: constitucion + UCC 001-INV-UCC + team-roster
## Fecha: 2026-05-12

| team_id | team_alias | scope_primario | carpeta_diana |
| ------- | ---------- | -------------- | ------------- |
| TEAM-01 | DIANArchiTEC | Modelo BD backend/frontend + integracion IBKR/Alpaca + dashboard principal y confluencia de senales | teams/TEAM-01/ |
| TEAM-02 | CocaDe6Lts | Core de indicadores tecnicos (EMA, MACD, ADX, RSI, Bollinger) + Chat IA | teams/TEAM-02/ |
| TEAM-03 | SQLitoNo | Analisis fundamental + estrategias Long Call/Put y Short Call/Put + Chat IA | teams/TEAM-03/ |
| TEAM-04 | DiviNoSQL | Analisis tecnico (soportes, resistencias, tendencias) + estrategia Wheel (Covered Call, Cash-Secured Put) + Chat IA | teams/TEAM-04/ |
| TEAM-05 | TurboPapus | Analisis institucional + estrategias Protective/Married Put, Collar Put, Covered Straddle | teams/TEAM-05/ |
| TEAM-06 | CodersTMNT | Analisis de noticias + estrategias Debit Spread y Credit Spread | teams/TEAM-06/ |
| TEAM-07 | SixPackDevs | Analisis AI + estrategias Long/Short Volatility (Straddle, Strangle) | teams/TEAM-07/ |
| TEAM-08 | GlassCoke | Estrategias Iron Condor, Iron Butterfly, Butterfly Spread, Condor | teams/TEAM-08/ |
| TEAM-09 | SquadISC | Estrategias Calendar Spread y Diagonal Spread | teams/TEAM-09/ |

## Notas de Division
- La topologia fuente de verdad se definio en integration-profile.md con valor multi_team.
- Este documento define la division funcional para generar artefactos canonicos por equipo.
- Los artefactos globales base se preservan y no se reemplazan:
  - 001-inv-spec.md
  - 001-inv-plan.md
  - 001-inv-tasks.md
- Diana debe generar por equipo en teams/TEAM-XX/ los siguientes archivos:
  - spec.md
  - plan.md
  - tasks.md
