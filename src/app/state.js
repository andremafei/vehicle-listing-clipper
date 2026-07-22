/**
 * Minimal app state.
 */

/** @typedef {'idle' | 'settings' | 'reading'} PanelView */

/**
 * @returns {{
 *   statusMessage: string,
 *   view: PanelView,
 *   busy: boolean,
 *   lastPlate: string,
 *   lastPhone: string,
 *   lastClipboard: string,
 *   diagnosticsVisible: boolean,
 *   lastDiagnostics: object | null,
 * }}
 */
export function createInitialState() {
  return {
    statusMessage: '',
    view: 'idle',
    busy: false,
    lastPlate: '',
    lastPhone: '',
    lastClipboard: '',
    diagnosticsVisible: false,
    lastDiagnostics: null,
  };
}
