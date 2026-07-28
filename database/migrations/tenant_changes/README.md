Incremental schema migrations, applied from Phase 2 onward by
`backend/src/infrastructure/migrations/migration-runner.service.ts` (`npm run migrate`).

Files here run against `tenant_template` **and** every live tenant schema — never against a
single tenant only. Number them sequentially: `001_add_x.sql`, `002_add_y.sql`, etc. Never
edit a file here once it has shipped (the runner checksums and rejects a changed file); add a
new migration instead.

The original Phase 1 output (`../tenant_template/*.sql`, `../../functions/*.sql`,
`../../views/*.sql`) is the frozen "genesis baseline" and is never replayed through this
mechanism — see `/database/README.md`.
