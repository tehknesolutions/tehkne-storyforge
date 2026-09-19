# TEHKNÉ Solutions — Product Language Standard

## Status

**MANDATORY PRODUCT POLICY**

This rule applies to TEHKNÉ Solutions products unless a product-specific
exception is explicitly approved.

## Official language order

1. **Português do Brasil — PT-BR**
2. **English — EN**
3. **Español — ES**

## Core rule

PT-BR is the official product language of TEHKNÉ Solutions.

Every new product experience must be authored and released in PT-BR first.

English and Spanish are supported distribution languages, in that order.

## Implementation invariant

```text
SOURCE / DEFAULT / FALLBACK = pt-BR

SUPPORTED ORDER
pt-BR
→ en
→ es
```

A missing translation must fall back to PT-BR.

It must never silently fall back to English.

## Product UX requirements

Every multilingual TEHKNÉ product should:

- open in PT-BR by default;
- provide PT-BR, EN and ES;
- display them in that order;
- persist an explicit user language choice;
- update the document language metadata;
- preserve technical identifiers independently from translated labels;
- keep user-generated content in the user's chosen language where possible.

## AI / provider requirement

When a TEHKNÉ product generates user-facing content through AI, the selected
product locale must be passed to the provider adapter.

If no supported locale is supplied:

`pt-BR`

must be used.

## Canon and data model

Locale changes presentation, not narrative truth.

```text
same CANON
→ PT-BR realization
→ EN realization
→ ES realization
```

Canonical IDs, event IDs, entity IDs, predicates, state-machine values and
authority states remain stable across languages.

## Storyforge implementation

Story Lab implements:

```text
DEFAULT_LOCALE = pt-BR
SUPPORTED_LOCALES = [pt-BR, en, es]
fallback = pt-BR
storage = localStorage
document.lang = selected locale
provider locale header = x-storyforge-locale
```

The language switcher is global and available on all Story Lab screens.

## Governance

A product change that:

- changes the default away from PT-BR;
- removes PT-BR;
- changes the official order;
- introduces English-only UI without PT-BR fallback;

is a policy regression and should fail validation.
