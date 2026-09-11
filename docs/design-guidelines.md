# Interface and content guidelines

These rules apply to Web/PWA and the shared Angular UI used by Capacitor. Follow them alongside [architecture](architecture.md) and [development standards](development-standards.md). They define how design decisions are made and reused; no visual design system, brand palette, font family or production component library has been implemented yet.

## Design from the whole application

Start from the user's task, information hierarchy and navigation model. Decide what belongs on a screen before selecting cards, buttons or decoration. Use cards only when they group a meaningful entity or task; do not turn every block into a card by default. Keep navigation, action placement and feedback predictable across related screens.

Begin the first flow with wireframes and realistic content. Establish a coherent visual foundation, implement only the shared components required by that flow, and grow the system as real needs appear. The current foundation placeholder is not the final visual specification.

## Shared visual foundations

Before implementing the first product screen, define and record a compact set of semantic design tokens for color, typography, spacing, size, borders/radii, elevation and motion. Include responsive behavior, readable content widths, touch targets and focus treatment. Choose actual values together as a system; do not invent unrelated colors, font sizes or spacing for each screen.

Keep those values in one shared style source when implementation begins. Reference tokens in components and layouts. Add semantic variants only when their meaning is clear, and update dependent components consistently if a token changes. Local layout rules are legitimate; exceptions to the shared visual language need a documented reason.

Typography must use a consistent hierarchy of page titles, section headings, body text, labels and supporting text. Define font family/fallbacks, weight, size and line height per role. Preserve semantic heading order, readable line length, text scaling and adequate spacing; communicate hierarchy through more than arbitrary bold text or color.

## Component reuse and boundaries

Before creating a component, inspect the existing UI inventory. Equivalent actions must use the same shared component and its documented variants. For example, an “Add” action on two screens must not result in two separately styled add-button implementations. Its priority may differ by context, but that difference must use an intentional shared variant.

| Component level                | Responsibility                                                                                             |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| Application-wide UI primitives | Reusable button/link styling, inputs and feedback with consistent behavior and accessibility               |
| Domain UI                      | Presentation of domain concepts using common primitives, without owning transport or provider integrations |
| Feature/page composition       | Navigation, orchestration, state and arrangement of existing components for the user's task                |

Extract application-wide Angular primitives to a `scope:web` / `type:ui` library when real reuse calls for it; shared TypeScript contracts/util libraries must remain framework independent. Keep domain-specific components inside their domain. Follow the existing Nx rules; generic UI cannot import feature or data-access libraries.

Prefer native semantic elements and small Angular components/directives over duplicated markup or large configurable containers. Define clear inputs/outputs, supported variants, states and usage examples for reusable components. Use composition for meaningful combinations; do not create a separate component for every label or a universal component with unrelated options. A new variant must express a recurring semantic need, not a one-page aesthetic preference.

## Actions, interaction and feedback

Give the main task an understandable primary action and distinguish secondary or destructive actions consistently. Use a button for an action and a link for navigation. Match icon choice, label placement, spacing and feedback across equivalent actions.

Design applicable default, hover, focus, pressed, disabled and loading states together. At feature level, include empty, success, error, offline/unavailable and permission-denied states where relevant. Provide clear progress and recovery guidance; prevent accidental duplicate submissions. A disabled control should not leave the user guessing how to proceed.

Dialogs, forms and navigation must have predictable keyboard/focus behavior. Preserve user input when recoverable errors occur. Do not introduce a new interaction pattern on one page without considering its place in the whole application.

## Language and interface text

Select the initial product language and record a small domain glossary before writing product screens; neither is finalized by this document. Use the same term for the same concept throughout navigation, labels, messages and documentation. Keep copy concise, specific and consistent in tone and capitalization.

Action labels should describe the action; error text should explain the problem and the next useful step. Loading, empty and success messages must reflect actual state. Avoid ambiguous placeholder copy in completed screens. Do not expose raw backend/provider errors or use placeholder text as a replacement for form labels.

Keep common action labels/messages consistent through the shared component/content conventions chosen for the UI. Keep feature-specific copy with its feature. Choose a localization mechanism when the language requirements are known; do not scatter duplicated common strings or introduce a speculative localization dependency now. Use locale-aware formatting for dates, numbers and units when those values enter the interface.

## Accessibility and responsive behavior

Use semantic HTML, accessible names, associated form labels, visible focus and logical keyboard order. Support keyboard operation and screen readers, sufficiently contrasted text/controls, text resizing and reduced-motion preferences. Do not communicate state through color alone; icon-only actions need accessible labels.

Build layouts around content and available space. Validate narrow and wide viewports, long labels, empty and dense content, touch input and keyboard interaction. When native screens are added, account for safe areas, the software keyboard and platform permissions through the established boundary. Accessibility and responsive checks are part of each affected flow, not a final polish phase.

## Consistency review

For each UI change, compare its typography, spacing, terminology, action hierarchy, components and states with related screens. Verify the actual rendered behavior in a browser. Changes to shared primitives require checking their existing consumers; fix the shared source instead of patching inconsistent copies page by page.

Record durable design decisions and justified exceptions here or in a focused design document when needed. Keep supported component usage examples close to their implementation once components exist. This document introduces design rules only; actual tokens, components, visual values and automated accessibility coverage remain future implementation work.
