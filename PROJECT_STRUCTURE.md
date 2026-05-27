# Estructura Completa del Proyecto

Generado el 2026-04-28 (Windows, salida de `tree /f /a`).

```text
C:.
+---.drfic
|   |   readme.md
|   |
|   \---diana-sdk
|       +---memory
|       +---projects
|       |   +---diana-inversions
|       |   |   |   inv-constitution.md
|       |   |   |   README.md
|       |   |   |
|       |   |   +---governance
|       |   |   |   |   decision-log.md
|       |   |   |   |
|       |   |   |   +---change-requests
|       |   |   |   |       001-inv-ucc.md
|       |   |   |   |
|       |   |   |   \---tickets
|       |   |   |           001-inv-tkt.md
|       |   |   |
|       |   |   +---initiatives
|       |   |   |   \---001-inversions
|       |   |   |       |   001-inv-plan.md
|       |   |   |       |   001-inv-spec.md
|       |   |   |       |   meta.md
|       |   |   |       \---speckit
|       |   |   \---knowledge
|       |   |       |   README.md
|       |   |       |
|       |   |       +---indexes
|       |   |       |       agent-skill-matrix.yaml
|       |   |       |       by-topic.md
|       |   |       |       master-index.md
|       |   |       |       sdd-engine-matrix.yaml
|       |   |       |       skills-manifest.yaml
|       |   |       |       skills-traceability.md
|       |   |       |
|       |   |       +---local
|       |   |       |   +---brokers
|       |   |       |   |       001-ibkr-tws-api.md
|       |   |       |   |       002-ibkr-client-portal.md
|       |   |       |   |       003-alpaca-api.md
|       |   |       |   |
|       |   |       |   +---compliance
|       |   |       |   |       001-non-advisory-disclaimer.md
|       |   |       |   |       002-data-retention-mx.md
|       |   |       |   |
|       |   |       |   +---cores
|       |   |       |   |       001-technical-analysis-core.md
|       |   |       |   |       002-fundamental-analysis-core.md
|       |   |       |   |       003-buy-sell-signals-core.md
|       |   |       |   |       004-options-strategies-core.md
|       |   |       |   |       005-institutional-options-flow-core.md
|       |   |       |   |       006-realtime-news-core.md
|       |   |       |   |       007-ai-confluence-orchestrator-core.md
|       |   |       |   |
|       |   |       |   +---domain
|       |   |       |   |       001-order-lifecycle.md
|       |   |       |   |       002-market-data.md
|       |   |       |   |       003-portfolio-analytics.md
|       |   |       |   |
|       |   |       |   \---patterns
|       |   |       |           001-jwt-supabase-auth.md
|       |   |       |           002-realtime-market-feed.md
|       |   |       |
|       |   |       +---remote
|       |   |       |   |   sources.md
|       |   |       |   |
|       |   |       |   +---evernote
|       |   |       |   |       .gitkeep
|       |   |       |   |
|       |   |       |   +---notebooklm
|       |   |       |   |       .gitkeep
|       |   |       |   |
|       |   |       |   \---notion
|       |   |       |           .gitkeep
|       |   |       |
|       |   |       +---skills
|       |   |       |       001-inv-technical-analysis-structure.md
|       |   |       |       002-inv-indicator-signal-logic.md
|       |   |       |       003-inv-fundamental-analysis.md
|       |   |       |       004-inv-options-strategy-engine.md
|       |   |       |       005-inv-institutional-options-flow.md
|       |   |       |       006-inv-realtime-news-impact.md
|       |   |       |       007-inv-ai-confluence-orchestration.md
|       |   |       |       008-inv-market-data-and-realtime.md
|       |   |       |       009-inv-execution-governance-human-control.md
|       |   |       |       010-inv-broker-integration-ibkr-alpaca.md
|       |   |       |       011-inv-portfolio-and-performance-analytics.md
|       |   |       |       012-inv-compliance-audit-retention.md
|       |   |       |       README.md
|       |   |       |
|       |   |       \---snapshots
|       |   |               .gitkeep
|       |   |
|       |   +---diana-sdk-core
|       |   |   |   dianacore-constitution.md
|       |   |   |
|       |   |   +---governance
|       |   |   |   |   decision-log.md
|       |   |   |   |
|       |   |   |   +---change-requests
|       |   |   |   |       001-dianacore-cc.md
|       |   |   |   |
|       |   |   |   \---tickets
|       |   |   |           001-dianacore-tkt.md
|       |   |   |
|       |   |   +---initiatives
|       |   |   |   \---001-dianacore
|       |   |   |           001-dianacore-plan.md
|       |   |   |           001-dianacore-spec.md
|       |   |   |           meta.md
|       |   |   |
|       |   |   \---knowledge
|       |   |       |   README.md
|       |   |       |
|       |   |       +---indexes
|       |   |       |       master-index.md
|       |   |       |
|       |   |       +---local
|       |   |       |   +---dev
|       |   |       |   |       001-developing-with-diana.md
|       |   |       |   |
|       |   |       |   +---domain
|       |   |       |   |       001-sdk-dashboard-overview.md
|       |   |       |   |
|       |   |       |   \---ui-patterns
|       |   |       |           001-admin-panel-patterns.md
|       |   |       |
|       |   |       \---remote
|       |   |               sources.md
|       |   |
|       |   \---knowledge
|       |       |   README.md
|       |       |
|       |       +---indexes
|       |       |       command-routing.md
|       |       |       master-index.md
|       |       |       projects-knowledge-radar.yaml
|       |       |
|       |       +---local
|       |       |   \---cores
|       |       |           001-technical-analysis-baseline.md
|       |       |           002-fundamental-analysis-baseline.md
|       |       |           003-buy-sell-signals-baseline.md
|       |       |           004-options-strategies-baseline.md
|       |       |           005-institutional-options-flow-baseline.md
|       |       |           006-realtime-news-impact-baseline.md
|       |       |           007-ai-confluence-baseline.md
|       |       |
|       |       +---remote
|       |       |       sources.md
|       |       |
|       |       +---skills
|       |       |       001-fin-risk-taxonomy-baseline.md
|       |       |       002-fin-human-approval-trade-governance.md
|       |       |       003-fin-realtime-market-data-slo.md
|       |       |       README.md
|       |       |
|       |       \---snapshots
|       |               .gitkeep
|       |
|       \---sdk
|           \---diana
|               |   constitution.md
|               |
|               +---checklists
|               |       checklists.md
|               |       initiative-audit-checklist.md
|               |       plan-quality-checklist.md
|               |       sdd-quality-gate.md
|               |       spec-quality-checklist.md
|               |       tasks-quality-checklist.md
|               |
|               +---knowledge
|               |   |   README.md
|               |   |
|               |   +---indexes
|               |   |       by-agent.md
|               |   |       master-index.md
|               |   |       shared-skills-manifest.yaml
|               |   |
|               |   +---local
|               |   |   +---agents
|               |   |   |       001-agent-roles-deep.md
|               |   |   |
|               |   |   +---glossaries
|               |   |   |       001-diana-terms.md
|               |   |   |
|               |   |   +---methodology
|               |   |   |       001-sdd-lifecycle.md
|               |   |   |
|               |   |   \---patterns
|               |   |           001-speckit-integration-patterns.md
|               |   |
|               |   +---remote
|               |   |       sources.md
|               |   |
|               |   \---skills
|               |           001-SDK-SDDCORE.md
|               |           002-SDK-TSSTACK.md
|               |           README.md
|               |
|               +---prompts
|               |       agent-copilot.md
|               |       agent-plan-architect.md
|               |       agent-qa-validator.md
|               |       agent-reviewer.md
|               |       agent-spec-writer.md
|               |       agent-task-generator.md
|               |
|               +---rules
|               |       agents.md
|               |       governance-and-naming.md
|               |       lifecycle.md
|               |       naming-conventions.md
|               |       sdd-quality-metrics.md
|               |       spec-versioning.md
|               |       speckit-integration.md
|               |
|               \---templates
|                       constitution.md
|                       initiative-readme.md
|                       meta.md
|                       spec.md
|
+---.github
|   |   copilot-instructions.md
|   |
|   +---agents
|   |       diana.knowledge.agent.md
|   |       diana.plan.agent.md
|   |       diana.skills.agent.md
|   |       speckit.analyze.agent.md
|   |       speckit.checklist.agent.md
|   |       speckit.clarify.agent.md
|   |       speckit.constitution.agent.md
|   |       speckit.git.commit.agent.md
|   |       speckit.git.feature.agent.md
|   |       speckit.git.initialize.agent.md
|   |       speckit.git.remote.agent.md
|   |       speckit.git.validate.agent.md
|   |       speckit.implement.agent.md
|   |       speckit.plan.agent.md
|   |       speckit.specify.agent.md
|   |       speckit.tasks.agent.md
|   |       speckit.taskstoissues.agent.md
|   |
|   +---instructions
|   |       speckit-knowledge-enrichment.instructions.md
|   |
|   \---prompts
|           diana.knowledge.prompt.md
|           diana.plan.prompt.md
|           diana.skills.prompt.md
|           speckit.analyze.prompt.md
|           speckit.checklist.prompt.md
|           speckit.clarify.prompt.md
|           speckit.constitution.prompt.md
|           speckit.git.commit.prompt.md
|           speckit.git.feature.prompt.md
|           speckit.git.initialize.prompt.md
|           speckit.git.remote.prompt.md
|           speckit.git.validate.prompt.md
|           speckit.implement.prompt.md
|           speckit.plan.prompt.md
|           speckit.specify.prompt.md
|           speckit.tasks.prompt.md
|           speckit.taskstoissues.prompt.md
|
+---.specify
|   |   extensions.yml
|   |   feature.json
|   |   init-options.json
|   |   integration.json
|   |
|   +---extensions
|   |   |   .registry
|   |   |
|   |   \---git
|   |       |   config-template.yml
|   |       |   extension.yml
|   |       |   git-config.yml
|   |       |   README.md
|   |       |
|   |       +---commands
|   |       |       speckit.git.commit.md
|   |       |       speckit.git.feature.md
|   |       |       speckit.git.initialize.md
|   |       |       speckit.git.remote.md
|   |       |       speckit.git.validate.md
|   |       |
|   |       \---scripts
|   |           +---bash
|   |           |       auto-commit.sh
|   |           |       create-new-feature.sh
|   |           |       git-common.sh
|   |           |       initialize-repo.sh
|   |           |
|   |           \---powershell
|   |                   auto-commit.ps1
|   |                   create-new-feature.ps1
|   |                   git-common.ps1
|   |                   initialize-repo.ps1
|   |
|   +---integrations
|   |   |   copilot.manifest.json
|   |   |   speckit.manifest.json
|   |   |
|   |   \---copilot
|   |       \---scripts
|   |               update-context.ps1
|   |               update-context.sh
|   |
|   +---memory
|   |       constitution.md
|   |
|   +---scripts
|   |   \---powershell
|   |           check-prerequisites.ps1
|   |           common.ps1
|   |           create-new-feature.ps1
|   |           setup-plan.ps1
|   |           update-agent-context.ps1
|   |
|   +---templates
|   |       agent-file-template.md
|   |       checklist-template.md
|   |       constitution-template.md
|   |       plan-template.md
|   |       spec-template.md
|   |       tasks-template.md
|   |
|   \---workflows
|       |   workflow-registry.json
|       |
|       \---speckit
|               workflow.yml
|
+---.vscode
|       settings.json
|
\---specs
    \---001-plataforma-inversiones-ia
        |   data-model.md
        |   plan.md
        |   quickstart.md
        |   research.md
        |   spec.md
        |
        +---checklists
        |       requirements.md
        |
        \---contracts
                auth-context.md
                broker-adapter.md
                signal-lifecycle.md
```
