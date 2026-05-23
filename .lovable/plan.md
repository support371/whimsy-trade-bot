# Merge Plan — Provider Platform & Performance Uplift

Goal: layer the uploaded improvements onto the existing app **additively**. Nothing currently working is removed. Existing Supabase tables, RLS, edge functions, hooks, pages, and the slim `backend/` paper-trading API stay intact.

I'll ship this in 4 small PR-style stages so each one is independently verifiable.

---

## Stage 1 — Backend provider platform (additive)

Add a new namespaced API surface alongside the current `/health`, `/analyze-features`, `/simulate-session`. No existing route changes.

New files (copied & trimmed from upload, **no imports on missing modules**):

```
backend/
  services/
    providers/
      __init__.py          # re-exports the 6 provider getters
      coingecko.py         # /global market overview (httpx)
      forex_com.py         # forex context stub
      investopedia.py      # glossary stub
      yahoo_finance.py     # market overview
      tradingview.py       # charting context
      coinmarketcap.py     # market cap overview
  routes/
    __init__.py
    providers.py           # /api/v1/market/overview, /macro/forex, /glossary, ...
```

Wire-up in `backend/app.py`:

```python
from backend.routes.providers import providers_router
app.include_router(providers_router)
```

Add `httpx` to `backend/requirements.txt`.

I will **not** import `backend/routes/exchanges.py` from the upload — it depends on `backend/db`, `services/exchange_clients`, middleware that don't exist here. Bringing it in would cascade ~30 files. Out of scope for this stage.

## Stage 2 — Frontend performance upgrades

Apply only the safe, additive perf wins:

1. Replace `vite.config.ts` with the upload's version that adds `build.rollupOptions.output.manualChunks` (supabase-auth, dashboard-charts, app-core, ui-vendor, dashboard-route splits). Plugin/alias config is identical to current.
2. Convert routes in `src/App.tsx` to `React.lazy` + `<Suspense>` so Trade / Portfolio / Alerts / Config / Status pages code-split. Dashboard stays eager (LCP route).
3. Add `loading="lazy"` + width/height on any `<img>` in dashboard cards (CLS fix).
4. Memoize the heavy chart components (`PnLChart`, `DailyPnLChart`, `TradeDistributionChart`) with `React.memo` + stable props.

No behavior change, just bundle size & render cost.

## Stage 3 — Design polish (UI-only, opt-in)

I won't auto-restyle the cyberpunk theme — that's a memory-locked decision. Instead I'll:

- Tighten spacing & typography rhythm on dashboard / trade / portfolio pages using existing semantic tokens.
- Add subtle motion (framer-motion fade/slide) on card mount where it's already installed.
- Improve empty/loading skeletons on `ExecutionLog`, `HoldingsTable`, `AlertsList`.

If you'd rather see a full redesign with palette/typography options, say the word and I'll run the design-directions flow instead.

## Stage 4 — Docs, scripts & deploy configs

Drop these in **without** changing any runtime behavior:

```
docs/
  backend-hosting.md
  persistence-release-checklist.md
  vercel-runtime-recovery.md
  runbooks/mt5_setup.md, mt5_failover.md
  STABILIZATION_RUNBOOK.md
  PRODUCTION_LOCK.md
render.yaml
Dockerfile.render
docker-compose.fullstack.yml
scripts/
  release_verify.py
  render_health_smoke.py
  security_hygiene_audit.py
  (selected operational scripts)
```

I'll skip scripts that reference modules we don't have (testnet_smoke, branch_salvage_inventory, etc.) and leave a one-line note in `docs/README.md` listing what was deferred and why.

---

## Out of scope for this plan (call out explicitly)

The upload contains entire subsystems we **don't** currently have: `backend/db`, `backend/exchanges`, `backend/engine`, `backend/ws`, `backend/middleware`, `backend/services/providers/__init__` style provider registry, alternate `src/context/`, `src/tests/`, FastAPI auth middleware, MT5 adapters, full FastAPI exchange routes, ~90 tests. Pulling these in is a multi-day refactor and would touch Supabase schema / edge functions. I'm leaving them out unless you say otherwise.

---

## Verification per stage

- Stage 1: `python -m compileall backend` + `curl localhost:8000/api/v1/market/overview` returns Coingecko JSON.
- Stage 2: build succeeds; check Network tab shows split chunks; LCP route still loads first.
- Stage 3: visual check via preview.
- Stage 4: no runtime files touched; build still green.

Confirm and I'll start with **Stage 1**.
