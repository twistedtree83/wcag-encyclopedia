## Parent

#27

## What to build

The filter engine is still a pure function, but it takes a wider query. Four inputs combine:

```
{ principle: 'All' | 1 | 2 | 3 | 4, level: 'All' | 'A' | 'AA', newIn22: boolean, text: string }
```

Text now matches number, name, **restatement** and the fail **caption**. "New in 2.2" is a separate on/off input, not a level, so "AA and new in 2.2" is a query someone can actually run.

This slice is the engine and its tests only. The All criteria page (R-05) is the UI on top of it.

## Acceptance criteria

- [ ] Each input filters correctly on its own
- [ ] Inputs combine: for example AA together with new in 2.2 returns only AA criteria that are new in 2.2
- [ ] Text search finds a criterion by its number, name, restatement or fail caption
- [ ] An empty query returns all 55 in corpus order
- [ ] The returned count always matches the returned list

## Blocked by

- #29 — Criterion records gain `since` and `lab?`
