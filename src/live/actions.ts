/**
 * How a live example tells its stage what a key did (#45). An example's own handler calls
 * `didAction(el, 'Archived the message')`; the stage hears the bubbling event and puts the text
 * on its `keys` event, for the key log and the polite region. Works inside the inert fail stage
 * too: programmatic events are not blocked by `inert`.
 */

export const ACTION_EVENT = 'live-action';

export function didAction(from: Element, text: string): void {
  from.dispatchEvent(new CustomEvent<string>(ACTION_EVENT, { bubbles: true, detail: text }));
}

/** Calls `hear` with each action's text that bubbles up to `root`. Returns the unsubscribe. */
export function onActions(root: Element, hear: (text: string) => void): () => void {
  const listener = (e: Event) => hear((e as CustomEvent<string>).detail);
  root.addEventListener(ACTION_EVENT, listener);
  return () => root.removeEventListener(ACTION_EVENT, listener);
}
