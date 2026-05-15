# Frontend Assessment Report

## Scope

This assessment reviews the current frontend implementation for style consistency across admin and student experiences, with an emphasis on aligning to Carbon Design guidance without changing the existing brand direction.

## Executive Summary

The project already uses Carbon components widely, but it is not yet operating as a coherent Carbon-based design system. Carbon is currently used more as a component library than as the page-level styling foundation. The result is a mixed visual language:

- shared Carbon widgets exist across many screens
- page structure, spacing, typography, and color application vary noticeably between routes
- some flows rely on Carbon tokens, while others hardcode colors, spacing, and type rules
- admin and student dashboards are close in structure, but they are not backed by a single reusable page foundation

The strongest path forward is not a rebrand. It is to standardize the app on a small global styling foundation:

- one app theme contract
- one shared dashboard shell
- one shared page layout pattern
- one shared set of spacing, heading, section, form, and table wrappers

That would preserve the current brand while making both admin and student pages feel like the same product.

## Overall Assessment

Rating: `6/10`

What is working:

- Carbon is already installed and used broadly via `@carbon/react` and `@carbon/styles`.
- Data-heavy pages already lean on Carbon `DataTable`, `InlineNotification`, `Button`, `Tile`, `Breadcrumb`, `Select`, and input components.
- The marketing and auth surfaces have a recognizable product character and should not be flattened into generic Carbon-only pages.

What is holding consistency back:

- the global theme setup conflicts with Carbon defaults
- shells and page scaffolds are duplicated instead of shared
- custom screens often bypass Carbon spacing, typography, and token usage
- inline styles are common enough to weaken maintainability
- form and table page patterns repeat across routes without a reusable foundation

## Key Findings

### 1. The global theme foundation is internally inconsistent

Carbon SCSS is loaded in [`src/app/globals.scss`](/Users/denidarta/codebase/crack/crack-fe-denidarta/src/app/globals.scss:4), Carbon CSS is loaded again in [`src/providers/CarbonProvider.tsx`](/Users/denidarta/codebase/crack/crack-fe-denidarta/src/providers/CarbonProvider.tsx:3), and the app body then overrides typography and background with non-Carbon globals in [`src/app/globals.scss`](/Users/denidarta/codebase/crack/crack-fe-denidarta/src/app/globals.scss:15) and [`src/app/globals.scss`](/Users/denidarta/codebase/crack/crack-fe-denidarta/src/app/globals.scss:34).

Impact:

- theme behavior is harder to reason about
- Carbon typography is not the true baseline
- background/foreground behavior can diverge from Carbon tokens
- Tailwind, custom CSS variables, Carbon SCSS, and Carbon CSS all compete at the root

Assessment:

- This is the single most important structural inconsistency in the project.

### 2. Admin and student shells are duplicated instead of systematized

[`src/components/DashboardShell/index.tsx`](/Users/denidarta/codebase/crack/crack-fe-denidarta/src/components/DashboardShell/index.tsx:31) and [`src/components/StudentDashboardShell/index.tsx`](/Users/denidarta/codebase/crack/crack-fe-denidarta/src/components/StudentDashboardShell/index.tsx:31) share nearly identical header, notification, logout, sidenav, and layout logic.

The SCSS files are also effectively duplicates:

- [`src/components/DashboardShell/DashboardShell.module.scss`](/Users/denidarta/codebase/crack/crack-fe-denidarta/src/components/DashboardShell/DashboardShell.module.scss:1)
- [`src/components/StudentDashboardShell/StudentDashboardShell.module.scss`](/Users/denidarta/codebase/crack/crack-fe-denidarta/src/components/StudentDashboardShell/StudentDashboardShell.module.scss:1)

Impact:

- changes to layout behavior can drift between admin and student
- consistency depends on manual duplication discipline
- it is harder to introduce one shared nav/content rhythm across the app

Assessment:

- This should become one reusable shell with role-based nav config.

### 3. Page scaffolding is inconsistent across dashboards

Admin dashboard pages more often use Carbon grid primitives, for example [`src/app/(admin)/dashboard-admin/page.tsx`](/Users/denidarta/codebase/crack/crack-fe-denidarta/src/app/(admin)/dashboard-admin/page.tsx:81), while student pages often use custom wrappers and headings such as [`src/app/(student)/dashboard-student/page.tsx`](/Users/denidarta/codebase/crack/crack-fe-denidarta/src/app/(student)/dashboard-student/page.tsx:82) with bespoke spacing in [`src/app/(student)/dashboard-student/page.module.scss`](/Users/denidarta/codebase/crack/crack-fe-denidarta/src/app/(student)/dashboard-student/page.module.scss:1).

Impact:

- page headers, content width, spacing, and table framing vary by route
- admin screens feel more “system” driven than student screens
- equivalent data pages do not always feel like siblings

Assessment:

- A shared `PageLayout`, `PageHeader`, and `PageSection` foundation would remove most of this drift quickly.

### 4. Carbon tokens are used inconsistently; many screens fall back to hardcoded values

Some pages stay close to Carbon tokens, but others hardcode large amounts of color and spacing. A clear example is [`src/app/(admin)/create-program/create-program.module.scss`](/Users/denidarta/codebase/crack/crack-fe-denidarta/src/app/(admin)/create-program/create-program.module.scss:1), which hardcodes background, borders, labels, step indicators, and action areas instead of consistently referencing Carbon tokens.

The create-account experience does the same at a larger scale in:

- [`src/app/create-account/page.module.scss`](/Users/denidarta/codebase/crack/crack-fe-denidarta/src/app/create-account/page.module.scss:12)
- [`src/app/create-account/[inviteToken]/page.module.scss`](/Users/denidarta/codebase/crack/crack-fe-denidarta/src/app/create-account/[inviteToken]/page.module.scss:12)

Impact:

- visual consistency depends on repeated literal values
- brand colors are harder to preserve reliably
- dark surfaces and form surfaces are authored independently instead of through shared tokens

Assessment:

- Brand expression should remain, but it should be routed through semantic custom properties mapped to Carbon tokens and approved brand accents.

### 5. Typography is not governed by one clear rule set

The root layout uses Geist in [`src/app/layout.tsx`](/Users/denidarta/codebase/crack/crack-fe-denidarta/src/app/layout.tsx:7), the body forces Arial in [`src/app/globals.scss`](/Users/denidarta/codebase/crack/crack-fe-denidarta/src/app/globals.scss:34), and the landing page explicitly uses IBM Plex in [`src/app/page.module.scss`](/Users/denidarta/codebase/crack/crack-fe-denidarta/src/app/page.module.scss:5). The create-account pages introduce Inter in [`src/app/create-account/[inviteToken]/page.module.scss`](/Users/denidarta/codebase/crack/crack-fe-denidarta/src/app/create-account/[inviteToken]/page.module.scss:53).

Impact:

- the product lacks a stable typographic voice
- Carbon alignment is weakened even when Carbon components are used
- user perception will vary between marketing, auth, admin, and student surfaces

Assessment:

- This is a major consistency issue. Choose one primary app font strategy and one optional accent/mono usage rule.

### 6. Inline styling is common and weakens the design contract

Inline style usage appears in many routes, including:

- [`src/app/(admin)/dashboard-admin/assignments/[id]/page.tsx`](/Users/denidarta/codebase/crack/crack-fe-denidarta/src/app/(admin)/dashboard-admin/assignments/[id]/page.tsx:266)
- [`src/app/(student)/dashboard-student/page.tsx`](/Users/denidarta/codebase/crack/crack-fe-denidarta/src/app/(student)/dashboard-student/page.tsx:107)
- [`src/app/(student)/dashboard-student/profile/page.tsx`](/Users/denidarta/codebase/crack/crack-fe-denidarta/src/app/(student)/dashboard-student/profile/page.tsx:250)
- several modal components under [`src/components/Modals`](/Users/denidarta/codebase/crack/crack-fe-denidarta/src/components/Modals)

Impact:

- spacing and color decisions bypass reusable styles
- states are harder to standardize
- visual review becomes more expensive because styling is split across JSX and SCSS

Assessment:

- Inline styles should be limited to truly dynamic values. Most current cases belong in shared utility classes or module classes.

### 7. Repeated list/table pages need a reusable content pattern

There are many pages with nearly the same structure:

- page title + subtitle
- inline notification
- search/filter controls
- `DataTable` or `DataTableSkeleton`

Examples include:

- [`src/app/(admin)/dashboard-admin/programs/page.tsx`](/Users/denidarta/codebase/crack/crack-fe-denidarta/src/app/(admin)/dashboard-admin/programs/page.tsx:103)
- [`src/app/(admin)/dashboard-admin/courses/page.tsx`](/Users/denidarta/codebase/crack/crack-fe-denidarta/src/app/(admin)/dashboard-admin/courses/page.tsx:101)
- [`src/app/(student)/dashboard-student/courses/page.tsx`](/Users/denidarta/codebase/crack/crack-fe-denidarta/src/app/(student)/dashboard-student/courses/page.tsx:105)
- [`src/app/(student)/dashboard-student/assignments/page.tsx`](/Users/denidarta/codebase/crack/crack-fe-denidarta/src/app/(student)/dashboard-student/assignments/page.tsx:103)

Impact:

- same pattern is restyled page-by-page
- spacing and hierarchy differ without product reason
- any future design tweak must be repeated across many routes

Assessment:

- This is a good candidate for a shared “resource page” foundation.

### 8. Form experiences are visually fragmented

Forms currently span multiple patterns:

- Carbon-first login tile: [`src/app/login/page.tsx`](/Users/denidarta/codebase/crack/crack-fe-denidarta/src/app/login/page.tsx:48)
- heavily custom create-account screens: [`src/app/create-account/[inviteToken]/page.module.scss`](/Users/denidarta/codebase/crack/crack-fe-denidarta/src/app/create-account/[inviteToken]/page.module.scss:91)
- custom multi-step admin form styles: [`src/app/(admin)/create-program/create-program.module.scss`](/Users/denidarta/codebase/crack/crack-fe-denidarta/src/app/(admin)/create-program/create-program.module.scss:99)
- profile edit mixing `FluidTextInput`, `Select`, `TextArea`, and inline spacing: [`src/app/(student)/dashboard-student/profile/page.tsx`](/Users/denidarta/codebase/crack/crack-fe-denidarta/src/app/(student)/dashboard-student/profile/page.tsx:241)

Impact:

- users encounter different field density, label styles, spacing, and action placement depending on route
- “form” does not feel like one product pattern

Assessment:

- The app needs one shared form container pattern and one rule set for standard, fluid, and dark-surface forms.

## Carbon Alignment Assessment

### Strong alignment

- widespread use of Carbon primitives for tables, inputs, notifications, buttons, and tiles
- use of Carbon theme variables in several SCSS modules
- admin dashboard page already uses Carbon `Grid` and `Column`

### Partial alignment

- Carbon is present, but not consistently used for layout rhythm
- some pages use Carbon tokens while others hardcode the same decisions
- brand-specific pages visually reference Carbon sensibilities but are not authored from the same foundation

### Weak alignment

- typography is not consistently Carbon-led
- layer/background strategy is not centralized
- duplicated shells and bespoke page wrappers bypass system composition

## Brand Preservation Guidance

The current brand direction should be kept. The issue is not the brand; it is the lack of a stable system beneath it.

What should remain:

- dark/auth split layouts
- strong blue accent usage
- structured, data-heavy dashboard feel
- bolder editorial treatment on landing and onboarding surfaces

What should change:

- hardcoded visual values should become semantic tokens
- page and form scaffolds should be shared
- font usage should be rationalized
- admin and student surfaces should use the same structural language

## Recommended Style Foundation

### 1. Establish a single global theme contract

Create a small semantic layer in global styles, mapped to Carbon tokens where possible:

- `--app-page-bg`
- `--app-surface-bg`
- `--app-surface-subtle`
- `--app-border-subtle`
- `--app-text-primary`
- `--app-text-secondary`
- `--app-brand-primary`
- `--app-brand-primary-hover`
- `--app-spacing-page-x`
- `--app-spacing-page-y`
- `--app-content-max-width`

Use this for custom brand surfaces instead of repeating literal hex values.

### 2. Merge the dashboard shells

Replace the two shell components with one shared shell plus a role-based nav configuration. This is the fastest way to guarantee consistent header behavior, sidenav spacing, content offset, and future responsive fixes.

### 3. Introduce reusable page primitives

Recommended primitives:

- `AppPage`
- `PageHeader`
- `PageIntro`
- `PageActions`
- `PageSection`
- `ResourceTableSection`
- `FormSection`
- `EmptyStateSection`

These do not need to be visually opinionated. They need to enforce consistent spacing, max width, and heading hierarchy.

### 4. Standardize typography

Pick one primary font strategy across product surfaces. If Carbon alignment is the priority, IBM Plex Sans should be the default product font, with mono reserved for labels, badges, or metadata. If the team keeps Geist or Inter for business reasons, apply it consistently and stop mixing three or four families across routes.

### 5. Standardize form patterns

Define one rule set for:

- default form page
- split-screen auth form
- dense admin workflow form

Each should share:

- label treatment
- section titles
- vertical rhythm
- helper/error placement
- action row placement

### 6. Reduce inline styles to near zero

Move repeated spacing, flex, and emphasis rules into reusable classes or shared modules. This is necessary if the team wants reliable consistency over time.

## Priority Roadmap

### Phase 1: Foundation

1. Normalize root theme behavior in `globals.scss` and `CarbonProvider`.
2. Choose the app-wide typography strategy.
3. Create semantic app-level custom properties for brand surfaces and spacing.
4. Merge admin and student dashboard shell implementations.

### Phase 2: Shared page structure

1. Build shared page header and section wrappers.
2. Refactor list/table pages to one common content pattern.
3. Remove repeated inline spacing and alert wrappers.

### Phase 3: Forms

1. Standardize form page scaffolds.
2. Refactor create-program, profile, login, and account activation around shared form sections.
3. Keep current brand styling, but source it from shared tokens.

### Phase 4: Brand-specific surfaces

1. Align landing and create-account pages to the same typography and token contract.
2. Preserve their visual personality, but eliminate duplicate raw color/type definitions.

## Highest-Value Refactor Targets

If the team wants maximum return with minimal brand disruption, start here:

1. [`src/app/globals.scss`](/Users/denidarta/codebase/crack/crack-fe-denidarta/src/app/globals.scss:1)
2. [`src/providers/CarbonProvider.tsx`](/Users/denidarta/codebase/crack/crack-fe-denidarta/src/providers/CarbonProvider.tsx:1)
3. [`src/components/DashboardShell/index.tsx`](/Users/denidarta/codebase/crack/crack-fe-denidarta/src/components/DashboardShell/index.tsx:1)
4. [`src/components/StudentDashboardShell/index.tsx`](/Users/denidarta/codebase/crack/crack-fe-denidarta/src/components/StudentDashboardShell/index.tsx:1)
5. [`src/app/(admin)/create-program/create-program.module.scss`](/Users/denidarta/codebase/crack/crack-fe-denidarta/src/app/(admin)/create-program/create-program.module.scss:1)
6. [`src/app/(student)/dashboard-student/profile/page.tsx`](/Users/denidarta/codebase/crack/crack-fe-denidarta/src/app/(student)/dashboard-student/profile/page.tsx:241)
7. [`src/app/create-account/page.module.scss`](/Users/denidarta/codebase/crack/crack-fe-denidarta/src/app/create-account/page.module.scss:1)
8. [`src/app/create-account/[inviteToken]/page.module.scss`](/Users/denidarta/codebase/crack/crack-fe-denidarta/src/app/create-account/[inviteToken]/page.module.scss:1)

## Final Verdict

This frontend is close to being a coherent Carbon-based product, but it is not there yet. The inconsistency is mostly structural, not aesthetic. The brand can stay intact. What the project needs is a tighter shared foundation for theme, typography, layout, and reusable page/form patterns so that admin and student experiences read as one system instead of a set of individually styled routes.
