import { useEffect, useRef, type RefObject } from 'react';

// Closes a surface when a click lands outside it. The listener sits on the document
// because the surface does not cover the viewport: the page behind it stays scrollable
// and clickable, so there is no backdrop element to take the click.
//
// The layer check keeps the surface open under its own overlays. A popover, dropdown,
// select, dialog or toast is its own child of the body, so none of them have to be named
// here. That holds while the app renders into one child of the body: an element wrapping
// the providers would put those overlays in the surface's own layer and a click in one
// would close it.
//
// Click, not pointerdown: a field that saves on blur commits before the surface closes,
// and a scrollbar drag or a right-click raises no click at all.
//
// A click reports the common ancestor of press and release, so selecting text in the
// surface and releasing over the page reports an element outside it. The press decides:
// a gesture that started inside the surface never exits, which is what keeps a selection
// dragged out of it from closing it. The handler is kept in a ref so the listeners are
// registered once and always call the latest onExit.
export function useExitOnClickOutside(ref: RefObject<HTMLElement | null>, onExit: () => void) {
  const onExitRef = useRef(onExit);
  onExitRef.current = onExit;

  useEffect(() => {
    let pressedInside = false;

    function onPointerDown(e: PointerEvent) {
      const surface = ref.current;
      pressedInside = !!surface && e.target instanceof Node && surface.contains(e.target);
    }

    function onClick(e: MouseEvent) {
      const surface = ref.current;
      // A click already handled by what it landed on is left alone, the same way
      // useExitOnEscape leaves a handled key, so opening another issue from the page
      // behind replaces what the panel shows rather than closing it.
      if (pressedInside || e.defaultPrevented) return;
      if (!surface || !(e.target instanceof Element)) return;
      if (surface.contains(e.target)) return;
      if (!surface.closest('body > *')?.contains(e.target)) return;
      onExitRef.current();
    }

    document.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('click', onClick);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true);
      document.removeEventListener('click', onClick);
    };
  }, [ref]);
}
