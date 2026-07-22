/**
 * Minimal app state.
 */

/** @typedef {'idle' | 'settings' | 'reading'} PanelView */

/**
 * @returns {{
 *   statusMessage: string,
 *   view: PanelView,
 *   busy: boolean,
 * }}
 */
export function createInitialState() {
  return {
    statusMessage: '',
    view: 'idle',
    busy: false,
  };
}
