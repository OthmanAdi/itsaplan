import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, it } from 'node:test';
import { act, useRef } from 'react';
import type { Root } from 'react-dom/client';
import { JSDOM } from 'jsdom';
import { useExitOnClickOutside } from './useExitOnClickOutside';

const replacedGlobals = [
  'window',
  'document',
  'navigator',
  'Element',
  'HTMLElement',
  'Event',
  'MouseEvent',
  'IS_REACT_ACT_ENVIRONMENT',
] as const;

// The app renders into one child of the body, so the surface and the page behind it
// share a layer. An overlay is appended as a further child of the body.
const markup =
  '<!doctype html><div data-testid="app"><div id="root"></div>' +
  '<div data-testid="page">Board</div></div>';

let dom: JSDOM;
let root: Root;
let exits: number;
let documentClickListeners: number;
let originalGlobalDescriptors: Map<string, PropertyDescriptor | undefined>;

function Surface() {
  const ref = useRef<HTMLDivElement>(null);
  useExitOnClickOutside(ref, () => {
    exits += 1;
  });

  return (
    <div ref={ref} data-testid="surface">
      <button type="button" data-testid="inside">
        Inside
      </button>
    </div>
  );
}

function render() {
  act(() => root.render(<Surface />));
}

function element(testId: string): HTMLElement {
  const found = document.querySelector<HTMLElement>(`[data-testid="${testId}"]`);
  assert.ok(found);
  return found;
}

function dispatch(target: HTMLElement, type: string) {
  act(() => target.dispatchEvent(new window.MouseEvent(type, { bubbles: true })));
}

function appendOverlayLayer(): HTMLElement {
  const layer = document.createElement('div');
  const target = document.createElement('button');
  target.type = 'button';
  layer.append(target);
  document.body.append(layer);
  return target;
}

beforeEach(async () => {
  originalGlobalDescriptors = new Map(
    replacedGlobals.map((name) => [name, Object.getOwnPropertyDescriptor(globalThis, name)]),
  );
  dom = new JSDOM(markup, { url: 'https://example.test/project/KEY' });
  exits = 0;
  documentClickListeners = 0;

  // Counts the hook's own registration so the unmount case fails without the cleanup.
  const { document: doc } = dom.window;
  const add = doc.addEventListener.bind(doc);
  const remove = doc.removeEventListener.bind(doc);
  type Listener = Parameters<typeof add>[1];
  type Options = Parameters<typeof add>[2];
  doc.addEventListener = (type: string, listener: Listener, options?: Options) => {
    if (type === 'click') documentClickListeners += 1;
    add(type, listener, options);
  };
  doc.removeEventListener = (type: string, listener: Listener, options?: Options) => {
    if (type === 'click') documentClickListeners -= 1;
    remove(type, listener, options);
  };

  Object.defineProperties(globalThis, {
    window: { configurable: true, value: dom.window },
    document: { configurable: true, value: doc },
    navigator: { configurable: true, value: dom.window.navigator },
    Element: { configurable: true, value: dom.window.Element },
    HTMLElement: { configurable: true, value: dom.window.HTMLElement },
    Event: { configurable: true, value: dom.window.Event },
    MouseEvent: { configurable: true, value: dom.window.MouseEvent },
    IS_REACT_ACT_ENVIRONMENT: { configurable: true, value: true },
  });

  const { createRoot } = await import('react-dom/client');
  const rootElement = doc.querySelector('#root');
  assert.ok(rootElement);
  root = createRoot(rootElement);
});

afterEach(() => {
  act(() => root.unmount());
  dom.window.close();
  for (const [name, descriptor] of originalGlobalDescriptors) {
    if (descriptor) Object.defineProperty(globalThis, name, descriptor);
    else Reflect.deleteProperty(globalThis, name);
  }
});

describe('useExitOnClickOutside', () => {
  it('exits on a click on the page behind the surface', () => {
    render();
    dispatch(element('page'), 'click');
    assert.equal(exits, 1);
  });

  it('stays on a click inside the surface', () => {
    render();
    dispatch(element('inside'), 'click');
    assert.equal(exits, 0);
  });

  it('stays on a click in an overlay, which is its own child of the body', () => {
    render();
    dispatch(appendOverlayLayer(), 'click');
    assert.equal(exits, 0);
  });

  // A field inside the surface saves on blur, which the browser fires between
  // pointerdown and click. Exiting on the earlier event would drop the edit.
  it('ignores a press, so a field saving on blur commits before the surface closes', () => {
    render();
    dispatch(element('page'), 'pointerdown');
    dispatch(element('page'), 'mousedown');
    assert.equal(exits, 0);
  });

  it('removes its document listener when the surface unmounts', () => {
    render();
    assert.equal(documentClickListeners, 1);
    act(() => root.render(null));
    assert.equal(documentClickListeners, 0);
  });
});
