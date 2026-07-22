/**
 * Minimal app state for Stage 1.
 */

/** @typedef {'idle' | 'settings'} PanelView */

/**
 * @returns {{
 *   statusMessage: string,
 *   view: PanelView,
 * }}
 */
export function createInitialState() {
  return {
    statusMessage: '',
    view: 'idle',
  };
}
