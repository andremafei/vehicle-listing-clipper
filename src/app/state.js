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
 *   fallbackId: string,
 *   listingRecord: object | null,
 *   plateImageIndex: number | null,
 *   plateImageUrl: string,
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
    fallbackId: '',
    listingRecord: null,
    plateImageIndex: null,
    plateImageUrl: '',
    diagnosticsVisible: false,
    lastDiagnostics: null,
  };
}
