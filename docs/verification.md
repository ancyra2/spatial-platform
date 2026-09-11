# Foundation verification — 2026-09-11

Executed locally on Windows with Node 24.13.0 and pnpm 11.19.0. No product features or native projects were added. Git history was preserved; changes are uncommitted.

| Check                                                    | Result                                                                                        |
| -------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `pnpm install --frozen-lockfile`                         | PASS                                                                                          |
| `pnpm format:check`                                      | PASS                                                                                          |
| Nx lint, all four application/library projects           | PASS                                                                                          |
| Nx typecheck, application and spec sources               | PASS                                                                                          |
| Nx tests                                                 | PASS: API 18, web 2, shared util 1                                                            |
| Nx production builds                                     | PASS                                                                                          |
| Prisma 7.10 models-free generation and schema validation | PASS                                                                                          |
| Prisma migration deploy against local PostgreSQL         | PASS                                                                                          |
| Nx project graph export and Nx 23.2.1 package alignment  | PASS                                                                                          |
| Negative architecture probes                             | PASS: web→API, web→Node, contracts→Nest, web business→Capacitor, API→Angular imports rejected |
| `docker compose config --quiet`                          | PASS                                                                                          |
| PostgreSQL and Redis startup/health                      | PASS                                                                                          |
| SQL `postgis_full_version()`                             | PASS: PostgreSQL 17.5, PostGIS 3.5.2                                                          |
| Authenticated Redis PING                                 | PASS: PONG                                                                                    |
| Running Nest liveness / readiness / OpenAPI              | PASS: HTTP 200                                                                                |
| Running web dev server and API proxy                     | PASS: HTTP 200                                                                                |
| Browser start route / unknown route / return home        | PASS                                                                                          |
| Production PWA shell, manifest, PNG sizes, worker assets | PASS                                                                                          |
| Browser `/ngsw/state`                                    | PASS: Angular 22.1.6 driver NORMAL                                                            |

The original host PostgreSQL port 5432 was occupied. Only this project's ignored `.env` was changed to PostgreSQL 55432 and Redis 56379. Existing services were not modified. Both project containers were left healthy; the database uses a persistent named volume.

## Review outcomes

Four read-only sub-agents reviewed architecture, frontend, backend/infrastructure and quality. Integrated corrections:

- Extended native import restrictions to future `libs/web` sources.
- Removed unused Angular forms and direct Nx Vite dependencies.
- Documented the HTTPS API URL requirement before Capacitor adoption.
- Added application cleanup on bootstrap/listen failure.
- Included test sources in strict typechecking and fixed API spec compiler settings.
- Replaced the generated debug launch preset with an attach configuration targeting the real API build output.

Relevant checks were rerun after integration and passed.

## Limits

- The GitHub Actions workflow was configured and reviewed, but not executed on GitHub. Its local quality commands passed.
- PWA manifest and service-worker operation were tested; installation onto an OS home screen was not performed.
- Android/iOS builds and native AR were intentionally not attempted. Identifiers remain TODO.
- API reload behavior with the Nx daemon was not tested: verification used `NX_DAEMON=false`. Normal development commands use Nx's default daemon behavior.
- Production deployment, TLS hosting and production infrastructure are outside scope.
