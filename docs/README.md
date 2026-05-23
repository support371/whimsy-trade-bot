# Docs

Operational documentation for the trading bot.

- **backend-hosting.md** — How the FastAPI backend is hosted.
- **persistence-release-checklist.md** — Pre-release verification steps.
- **vercel-runtime-recovery.md** — Recovery procedures for Vercel deploys.
- **STABILIZATION_RUNBOOK.md** — Stabilization runbook.
- **PRODUCTION_LOCK.md** — Production lock procedure.
- **runbooks/mt5_setup.md** / **mt5_failover.md** — MT5 reference (not active in this build).

## Deferred from upload

These scripts/docs reference subsystems not currently in this project
(`backend/db`, `backend/exchanges`, MT5 adapters, branch salvage, etc.)
and were intentionally **not** copied:

- `scripts/testnet_smoke.py`, `scripts/testnet_certify_windows.ps1`
- `scripts/branch_salvage_inventory.py`
- `scripts/compose_*` / `docker_build_stack.py`
- `docs/branch-salvage*`, `docs/command-center-salvage-map.md`

They can be added later when the corresponding backend subsystems land.
