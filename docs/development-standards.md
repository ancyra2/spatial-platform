# Development standards

These rules apply to every feature, fix and refactor, together with [architecture](architecture.md), [design guidelines](design-guidelines.md) and the root [AGENTS.md](../AGENTS.md). The goal is a coherent, maintainable application whose structure explains its responsibilities.

## Before writing code

1. Inspect the existing implementation, decisions, shared components and working tree.
2. State the user outcome, scope and observable acceptance criteria, including relevant failure cases.
3. Identify the owning domain and assign responsibilities to presentation, application/domain logic and data-access/platform integration. Check Nx tags and allowed dependency directions before creating files.
4. Describe the data flow, state ownership and public contracts. Reuse existing behavior before introducing new libraries, dependencies or abstractions.
5. For UI changes, identify the shared visual/interaction rules and affected screens before implementation. Use the same component for the same interaction wherever appropriate.

Scale this preparation to the work: a small change needs a short explanation in its task/PR; a consequential architectural decision needs a repository document. Routine implementation choices do not require a separate approval ceremony.

## SOLID, cohesion and coupling

| Principle             | Application in this repository                                                                                                                                                                                       |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Single responsibility | A component/service/module has a clear responsibility and reason to change. Do not combine rendering, provider calls and business decisions in one file.                                                             |
| Open/closed           | Extend a proven variation point through composition or a small contract when a real second behavior requires it. Avoid branching on provider/platform throughout the application.                                    |
| Liskov substitution   | Implementations of the same contract preserve its promised behavior, error semantics and relevant preconditions. Test those guarantees when alternatives exist.                                                      |
| Interface segregation | Expose small contracts tailored to consumers. Do not require unrelated methods or large DTOs for a narrow task.                                                                                                      |
| Dependency inversion  | Keep feature policy independent of concrete external SDKs through focused ports/adapters at real integration boundaries. Respect existing Nx directions; do not introduce reverse imports to implement an interface. |

Aim for **high cohesion**: group related behavior that changes for the same reason inside its domain. Aim for **low coupling**: consumers depend on small public interfaces instead of another module's internals, mutable global state or storage/provider details. Cohesion does not mean putting all related application behavior in one large class; low coupling does not mean adding an interface for every class.

Prefer composition over inheritance. Keep functions and public APIs clear, side effects explicit, state owned in one place and naming consistent with the domain. Extract repeated knowledge or behavior when it has the same meaning; superficially similar code from unrelated domains need not share an abstraction. Do not move business logic into a generic shared-util library just to reduce line count.

## Choosing design patterns

Use a pattern only when its problem exists, and state why it fits. Examples are an adapter around an AI/native provider, a repository around actual persistence/spatial queries, or a strategy for genuinely interchangeable behavior. Patterns are tools rather than mandatory layers or a checklist of classes.

Keep Nest controllers focused on HTTP concerns, domain/application services on feature policy, and data-access code on persistence or external integration. Keep Angular presentation components focused on rendering and interaction; feature code owns orchestration and state, while data-access code owns transport. A reusable UI component must not fetch domain data or depend on backend/native SDKs.

Avoid speculative factories, generic base repositories, service locators, unnecessary inheritance, universal configurable components and premature microservices. Extract libraries when a real boundary or reuse need exists, with a small explicit public API and the existing Nx tags.

## Recording decisions

Existing documented decisions are the baseline for future work. For a significant change in dependency direction, public contract, state ownership, provider, persistence, component behavior or design conventions, record the context, chosen approach, alternatives/tradeoffs and consequences. Update affected documentation and consumers together; do not silently introduce a competing convention.

Small decisions belong in the relevant existing document. Create a focused decision record under `docs/architecture/` only when the decision needs its own history; do not pre-create empty records. Mark replaced decisions as superseded and link their replacement when such records exist. Changes in project direction require an explicit documented decision rather than incidental implementation drift.

## Definition of done

- Acceptance criteria and relevant loading, empty, failure and permission states are handled.
- Responsibilities, dependency directions and reuse conform to the documented architecture. Any intentional deviation has a documented rationale.
- Tests cover observable behavior and important risks, including external integration failures. Avoid tests that merely copy the implementation.
- Format, lint, strict typechecking, relevant tests and builds pass. Report actual execution, cache reuse and any environment limits honestly.
- UI work includes browser checks for the affected flow, responsive layout, keyboard/focus behavior, content and shared component consistency. Check other consumers when shared behavior changes.
- Documentation and configuration examples match the implementation. No secrets, generated artifacts, unrelated edits or unused dependencies are included.

## First product increment

First define a small user journey and its information architecture. Establish its wireframes, content hierarchy and minimum shared design foundations, then implement that journey through UI, API and persistence as needed. Prototypes may use clearly identified fixtures while contracts are being designed; do not present simulated behavior as a completed integration. Do not build every screen in isolation before validating the first end-to-end flow.
