import { createInitialState } from './state.js';
import { createPanel } from '../ui/panel.js';
import {
  INDEXED_DB_NAME,
  STORAGE_PREFIX,
  isLocal,
} from '../environment.js';

/**
 * Stage 1 controller: mount panel and wire stub actions.
 */
export function createController() {
  /** @type {ReturnType<typeof createInitialState>} */
  let state = createInitialState();
  /** @type {ReturnType<typeof createPanel> | null} */
  let panel = null;

  function setStatus(message) {
    state = { ...state, statusMessage: message };
    panel?.setStatus(message);
  }

  function onReadPlate() {
    setStatus('Plate recognition is not implemented yet.');
  }

  function onSettings() {
    state = { ...state, view: 'settings' };
    const envLabel = isLocal ? 'local development' : 'production';
    setStatus(
      `Settings (stub). Environment: ${envLabel}. Storage: ${STORAGE_PREFIX}* / ${INDEXED_DB_NAME}. Full settings arrive in later stages.`,
    );
  }

  function mount(target = document.body) {
    if (panel) {
      return panel;
    }

    panel = createPanel({
      onReadPlate,
      onSettings,
    });
    panel.mount(target);
    return panel;
  }

  function getState() {
    return state;
  }

  return {
    mount,
    onReadPlate,
    onSettings,
    getState,
    setStatus,
  };
}
