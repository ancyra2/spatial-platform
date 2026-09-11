# Architecture

**Common by default, native when necessary.**

One Angular/TypeScript application serves Web/PWA and, later, Capacitor Android/iOS. NestJS is a REST modular monolith. No product domains are implemented yet.

Implementation must follow [development standards](development-standards.md) and [design guidelines](design-guidelines.md). Establish the owning domain, responsibilities and dependency direction before creating files. These are repository-wide rules; the visual system and feature implementations will be built incrementally through real user flows.

## Responsibilities

| Location                | Responsibility                                                                              |
| ----------------------- | ------------------------------------------------------------------------------------------- |
| `apps/web`              | Standalone, zoneless Angular shell, lazy routes, public configuration, web platform adapter |
| `apps/api`              | HTTP composition, validation/configuration, health, infrastructure lifecycle                |
| `libs/shared/contracts` | Pure TypeScript transport shapes; no runtime framework, Node, DOM or Prisma dependencies    |
| `libs/shared/util`      | Small, platform-independent functions actually used by applications                         |

Applications compose libraries; libraries never import applications. Create a domain library only with a real feature. Future organization is domain-first (`libs/web/<domain>/...`, `libs/api/<domain>/...`), with shared transport contracts kept narrow. Do not create empty domain libraries, generic base repositories, event buses or microservices speculatively.

## Enforced boundaries

Nx project tags have two independent dimensions. Both sets of constraints must be satisfied.

| Source scope   | Allowed library scopes |
| -------------- | ---------------------- |
| `scope:web`    | web, shared            |
| `scope:api`    | api, shared            |
| `scope:shared` | shared                 |

| Source type   | Allowed library types                    |
| ------------- | ---------------------------------------- |
| app / feature | feature, data-access, ui, util, contract |
| data-access   | util, contract                           |
| ui            | ui, util, contract                       |
| util          | util, contract                           |
| contract      | contract                                 |

`eslint.config.mjs` uses Nx `enforce-module-boundaries`, restricts external server/framework imports and bans third-party imports in shared production code. Shared tsconfigs have `types: []` and an ECMAScript-only library surface. Web source and future `libs/web` code prohibit Node/server/native imports. The sole current exception is `apps/web/src/platform`, which owns Capacitor runtime detection. Review any future platform exception explicitly; native feature adapters should become an intentionally tagged library when real functionality warrants it.

Use `@spatial/contracts` and `@spatial/util` aliases across project boundaries. Every new project must receive scope/type tags. Do not bypass boundaries with relative imports. Nx graph records actual imports, including type-only references.

## Web and public configuration

Standalone components use OnPush; route components load lazily. Signals are local Angular state, with no NgRx or UI framework. `APP_CONFIG` provides a public API base URL. Environment file replacement selects development/production configuration. Browser bundles must never contain secrets.

`/api/v1` assumes same-origin hosting in production; the development server proxies `/api` to the configured API target. Hosting/API routing is a later deployment decision. Capacitor must receive a separately configured HTTPS API URL before native builds: a relative API URL would resolve against the local native asset origin. Angular business code continues to depend only on public configuration.

## Backend and database

The API uses `/api/v1`, strict environment validation, a global whitelisting ValidationPipe (unknown properties rejected), explicit CORS origins, shutdown hooks, and Swagger disabled by default in production. CORS is a browser policy, not authentication. Error responses share one transport shape; unexpected exceptions and 5xx details are sanitized. Server logs currently record failure metadata without request query strings or secrets. Extend observability when an actual operational requirement arises.

`GET /api/v1/health` probes the responding process without a DB query. `GET /api/v1/health/ready` probes PostgreSQL and PostGIS, returning 503 when unavailable. Startup connects Prisma; process liveness remains independent of subsequent DB failures. Redis is not a readiness dependency because nothing consumes it yet.

Prisma 7.10 uses `prisma.config.ts`, the `prisma-client` generator and the PostgreSQL driver adapter. Client output stays inside the API and is generated, never committed or shared. The Nx build/typecheck/test prerequisites generate it automatically. The schema intentionally has no business models; the first SQL migration enables PostGIS idempotently. Apply migrations before running the API. Database service owns client/pool lifecycle and a bounded readiness query. Future domain repositories/data-access own Prisma and spatial SQL; controllers and shared contracts must never expose Prisma types or scatter PostGIS queries. PostGIS extension-owned tables are not product models and should not be imported indiscriminately during introspection.

## AI integration strategy (planned)

AI is a planned capability, not an implemented subsystem. No provider, model, SDK, endpoint or AI library has been selected or added. Introduce working code with the first concrete use case; keep feature policy inside its owning domain rather than creating a generic AI platform in advance.

For server-hosted AI, the intended request flow is:

```text
Angular feature
  -> NestJS domain endpoint
  -> domain application service
  -> provider adapter
  -> selected AI provider
```

The domain service owns the task, input selection, prompt construction and interpretation of results. A narrow provider adapter owns SDK calls and maps provider responses/errors into application-owned types. Start with one provider and only the interface needed by that use case; add provider switching, orchestration or queues only when justified by a real requirement. Keep this inside the modular monolith.

Use existing Nx scopes/types: future domain application libraries use `scope:api` / `type:feature`, and extracted provider integration libraries use `scope:api` / `type:data-access`. Create those libraries only when code needs them. Provider SDKs and types stay on the server; Angular must not call paid provider APIs directly or receive their credentials. Shared contracts contain only the transport shapes the frontend actually consumes, never provider SDK types, prompts or internal tool definitions. These AI-specific restrictions are design requirements for the first integration; no new SDK-specific lint rules exist yet.

### Requirements for the first AI feature

- Define the user outcome and acceptance examples first. Choose the provider/model against that task's quality, latency, cost and data-handling needs; record the decision when made.
- Validate request inputs and structured model outputs. Treat generated content as untrusted and potentially incorrect; label AI-generated information and keep it distinguishable from verified place/institution data. A model response must not grant permissions or directly authorize database writes or tool actions.
- Enforce access controls appropriate to the feature, per-user/request limits, input/output size budgets and provider spending limits before exposing paid inference. Keep model selection and credentials in validated server configuration.
- Define timeouts, bounded retries for transient failures and a predictable unavailable/error response. AI failure should affect its feature without making the core API's process health depend on an external provider.
- Send only the data required for the task. Decide disclosure/consent, retention and provider data handling before transmitting camera images, precise location or private content. Do not log API keys, raw images, full prompts or private content by default; collect request identifiers, latency, usage and sanitized failure categories.
- Treat user content, retrieved text and image-derived instructions as data, not trusted instructions. Any future tools require server-side allowlists and authorization independent of model output.
- Test domain behavior with a fake adapter, including malformed output, timeout, unavailable provider and limit enforcement. Keep a small task-specific evaluation set; real provider calls must be explicit, credentialed checks rather than a requirement for routine CI.

### Device AI and Computer Vision

On-device inference is a separate execution choice, to be evaluated when offline operation, privacy, latency or sensor access makes it useful. Apply **Common by default, native when necessary**: share TypeScript logic where practical, and keep native-only inference or advanced camera/sensor functionality behind the typed Capacitor plugin boundary. Kotlin/Swift, ARCore/ARKit and native model runtime details must not enter Angular business code.

The owning feature should define capability detection, permission behavior and an explicit unsupported/unavailable state. Uploading device data to a cloud provider must not become an automatic fallback without the feature's data-handling decision. Native AR tracking/anchors and AI inference have separate responsibilities even if a future camera feature uses both.

Possible first use cases include place information assistance, image recognition or moderation; none is selected yet. Embeddings, vector storage, RAG, agents, worker queues and model hosting remain undecided until a use case requires them.

## Development infrastructure

Host pnpm processes run Angular/Nest for fast reload/debugging. Compose runs independent PostgreSQL/PostGIS and Redis services; there is no artificial dependency between them. `docker compose up -d --wait` waits for both healthchecks. PostgreSQL data persists in a named volume. Redis is ephemeral, password-protected and unused by business code. Add caching, rate limiting or queues only when required; BullMQ/workers are absent.

Both ports bind to loopback. Credentials come from ignored `.env`; examples are placeholders. Images are pinned to verified digests as well as readable stable tags. The selected upstream PostGIS 17-3.5 image currently reports PostgreSQL 17.5/PostGIS 3.5.2; image pins must be deliberately reviewed for updates. Redis is 8.2.9-alpine3.22. This is development infrastructure, not production containerization or hardening.

## PWA and native integration

Production builds include manifest, real 192/512 PNG placeholder icons and Angular service worker. Registration is disabled for development and Capacitor. Cache policy contains only static shell assets, with `/api/**` excluded from navigation fallback; there are no data caches, offline business rules or sync services. Serve production assets over HTTPS (localhost for testing) to validate installation. Application branding and icons are provisional.

Capacitor 8 core/CLI are installed. `capacitor.config.ts` points to Angular's browser output but intentionally omits app name and app ID. **TODO(owner): final app name, Android package ID and iOS bundle ID.** Do not run native add/sync until these are decided. No native directories or fake production identifiers are included.

Future native flow:

```text
Angular shared business code
  -> typed capability/adapter boundary
  -> custom Capacitor plugin
      -> Android Kotlin + ARCore
      -> iOS Swift + ARKit
```

The plugin owns native permissions, sensors, anchors and platform errors; the adapter presents platform-neutral capabilities/results to Angular. Web reports unsupported native capabilities explicitly. No AR/plugin implementation is part of this foundation.

## Verification and evolution

Angular uses its official Vitest builder; Nest uses the documented SWC/Vitest recipe so decorator metadata is preserved. HTTP tests exercise validation, errors, CORS, OpenAPI and liveness/readiness separation without requiring Docker. Type-only contracts use compilation rather than meaningless runtime tests. CI checks format, Prisma schema, lint, types, tests and builds; pnpm and Nx caches are reused. There is no deployment or image publishing.

Root package scripts are excluded from Nx project script inference to avoid recursive task execution. Build cache inputs include shared compiler/lint/dependency configuration. Environment-sensitive runtime checks are not cached as successful builds.

Record large decisions here or in focused documents when needed. Later `docs/architecture/`, `docs/product/` and `docs/exec-plans/` can grow with actual content.

## Compatibility references

- [Nx Angular support and matching Nx packages](https://nx.dev/docs/technologies/angular/introduction)
- [Angular version compatibility](https://angular.dev/reference/versions)
- [Angular Vitest testing](https://angular.dev/guide/testing)
- [Nest SWC and Vitest integration](https://docs.nestjs.com/recipes/swc)
- [Prisma 7 generated client](https://docs.prisma.io/docs/orm/v7/prisma-client/setup-and-configuration/generating-prisma-client)
- [PostGIS image and volume layout](https://hub.docker.com/r/postgis/postgis/)
