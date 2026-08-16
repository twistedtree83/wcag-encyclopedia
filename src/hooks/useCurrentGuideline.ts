import { useEffect, useState } from 'react';

/** Distance below the viewport top that counts as the reading line — clears the masthead. */
const READING_LINE = 120;

/**
 * Which guideline the reader is currently inside.
 *
 * Drives the rail's active marker and the "You are in" strip. Both are decorative-with-text,
 * never live regions — a screen reader must not be told about this on every scroll (user
 * story 57).
 *
 * The observer only tells us *which* sections are in play; it does not tell us which one the
 * reader is reading. Several short sections can occupy the band at once, and entries arrive in
 * arbitrary order, so the decision is made from live geometry over the whole visible set:
 * the current guideline is the last one whose head has crossed the reading line, falling back
 * to the nearest one below it when the reader is above the first heading.
 */
export function useCurrentGuideline(fallback = '1.1'): string {
  const [current, setCurrent] = useState(fallback);

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-guideline]'));
    if (sections.length === 0 || typeof IntersectionObserver === 'undefined') return;

    const visible = new Set<HTMLElement>();

    const resolve = () => {
      if (visible.size === 0) return;
      const measured = [...visible].map((el) => ({
        num: el.getAttribute('data-guideline') ?? '',
        top: el.getBoundingClientRect().top,
      }));

      // Sections whose head has already passed the reading line: take the lowest of them,
      // i.e. the one most recently scrolled into.
      const passed = measured.filter((m) => m.top <= READING_LINE);
      const choice =
        passed.length > 0
          ? passed.reduce((a, b) => (b.top > a.top ? b : a))
          : measured.reduce((a, b) => (b.top < a.top ? b : a));

      if (choice.num) setCurrent(choice.num);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const el = entry.target as HTMLElement;
          if (entry.isIntersecting) visible.add(el);
          else visible.delete(el);
        }
        resolve();
      },
      // A band running from just below the masthead to well down the viewport, so a section
      // registers as soon as its head clears the header.
      { rootMargin: `-${READING_LINE}px 0px -40% 0px` },
    );

    sections.forEach((el) => observer.observe(el));
    // Scrolling within an already-intersecting section fires no observer event, so the
    // reading line has to be re-tested on scroll too.
    window.addEventListener('scroll', resolve, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', resolve);
    };
  }, []);

  return current;
}
