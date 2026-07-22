/**
 * Minimal app state.
 */

/** @typedef {'idle' | 'settings' | 'reading' | 'form'} PanelView */

/**
 * @returns {{
 *   statusMessage: string,
 *   view: PanelView,
 *   busy: boolean,
 *   lastPlate: string,
 *   lastPhone: string,
 *   lastClipboard: string,
 *   listingRecord: object | null,
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
    listingRecord: null,
    diagnosticsVisible: false,
    lastDiagnostics: null,
  };
}
