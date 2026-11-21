/** The design's pass and fail icons. Decorative: always beside a word that says the same. */

export function PassIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" focusable="false">
      <path d="M1.5 7.5 5.5 11.5 12.5 2.5" stroke="currentColor" strokeWidth="2.4" fill="none" />
    </svg>
  );
}

export function FailIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" focusable="false">
      <path d="M2 2l10 10M12 2 2 12" stroke="currentColor" strokeWidth="2.4" />
    </svg>
  );
}
