# Repository rules

- Preserve user changes and Git history. Inspect the working tree before editing.
- Follow `docs/architecture.md`: common by default, native when necessary.
- Respect Nx scopes and types. Never import API/server code into web code.
- Shared contracts are pure TypeScript: no Angular, Nest, Prisma or Node types.
- Grow domain-first when a real feature arrives; avoid empty libraries and speculative abstractions.
- Keep a modular monolith. Do not introduce microservices without an architecture decision.
- Every dependency needs a current use. Never commit secrets or generated build artifacts.
- Run format, lint, tests and builds for changes. Never report unexecuted checks as passing.
- Document major architecture changes and their tradeoffs.
- Native AR belongs behind a custom Capacitor plugin. Kotlin/ARCore and Swift/ARKit details must not enter Angular business code.
- Application name and native identifiers remain TODO until the owner chooses them.
- Review agents should report findings; the primary agent owns shared foundation configuration edits.
