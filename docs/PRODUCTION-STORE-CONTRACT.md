# Production Store Contract

Story Lab currently ships with a preview-safe storage abstraction.

## Current adapter

`MemoryProductionStore`

Durability:

```text
EPHEMERAL
```

It is suitable for:

- local development;
- Story Lab UI prototyping;
- API contract testing;
- preview demonstrations.

It is **not** considered production persistence.

The jobs API returns:

```json
{
  "durability": "EPHEMERAL",
  "productionSafe": false
}
```

so the UI and operators cannot accidentally mistake the preview store for a durable database.

## Production requirement

Before Storyforge production release, implement a `ProductionStore` with:

```text
durability = DURABLE
```

The interface already supports:

- listJobs
- getJob
- createJob
- updateJob

Recommended backends can be selected later without changing T-PIR or Story Lab route contracts.
