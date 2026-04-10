import { useEffect } from 'react';

/**
 * Observes all elements matching the selector and adds `visible` when they
 * enter the viewport. Works with the `.reveal`, `.reveal-fade`, `.reveal-left`,
 * `.reveal-right`, and `.reveal-scale` CSS classes in index.css.
 *
 * Usage (static pages):
 *   useScrollReveal();
 *
 * Usage (pages with async data — pass ready=true once data has loaded):
 *   useScrollReveal(undefined, undefined, !loading);
 *
 *   <div className="reveal stagger-1"> ... </div>
 */
export default function useScrollReveal(
  selector = '.reveal, .reveal-fade, .reveal-left, .reveal-right, .reveal-scale',
  threshold = 0.12,
  ready = true,
) {
  useEffect(() => {
    if (!ready) return;

    const els = document.querySelectorAll(selector);
    if (!els.length) return;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold },
    );

    els.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [selector, threshold, ready]);
}
