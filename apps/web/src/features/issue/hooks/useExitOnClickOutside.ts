import { useEffect, useRef, type RefObject } from 'react';

// Closes a surface when a click lands outside it. The listener sits on the document
// because the surface does not cover the viewport: the page behind it stays scrollable
// and clickable, so there is no backdrop element to take the click.
//
// The layer check keeps the surface open under its own overlays. A popover, dropdown,
// select, dialog or toast is its own child of the body, so none of them have to be named
// here.
//
// Click, not pointerdown: a field that saves on blur commits before the surface closes,
// and a scrollbar drag or a right-click raises no click at all. The handler is kept in a
// ref so the listener is registered once and always calls the latest onExit.
export function useExitOnClickOutside(ref: RefObject<HTMLElement | null>, onExit: () => void) {
  const onExitRef = useRef(onExit);
  onExitRef.current = onExit;

  useEffect(() => {
    function onClick(e: MouseEvent) {
      const surface = ref.current;
      if (!surface || !(e.target instanceof Element)) return;
      if (surface.contains(e.target)) return;
      if (!surface.closest('body > *')?.contains(e.target)) return;
      onExitRef.current();
    }
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [ref]);
}
