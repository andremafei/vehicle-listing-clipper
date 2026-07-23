import {
  GLOBAL_INIT_FLAG,
  PANEL_ROOT_ID,
  isLocal,
} from '../environment.js';
import { createController } from './controller.js';

/** @type {ReturnType<typeof createController> | null} */
let activeController = null;

/**
 * Initialize the userscript once per page (and per env).
 * @returns {{ started: boolean, reason?: string }}
 */
export function startApp() {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return { started: false, reason: 'no-dom' };
  }

  if (window[GLOBAL_INIT_FLAG]) {
    return { started: false, reason: 'already-initialized' };
  }

  if (document.getElementById(PANEL_ROOT_ID)) {
    window[GLOBAL_INIT_FLAG] = true;
    return { started: false, reason: 'panel-exists' };
  }

  window[GLOBAL_INIT_FLAG] = true;

  const controller = createController();
  activeController = controller;

  const mount = () => {
    controller.mount(document.body);
  };

  if (document.body) {
    mount();
  } else {
    document.addEventListener('DOMContentLoaded', mount, { once: true });
  }

  if (isLocal) {
    console.info('[Vehicle Listing Clipper] LOCAL DEV started');
  }

  return { started: true };
}

/**
 * Test helper: clear singleton guards and panel DOM.
 */
export function resetAppForTests() {
  activeController?.destroy();
  activeController = null;
  if (typeof window !== 'undefined') {
    delete window[GLOBAL_INIT_FLAG];
  }
  document.getElementById(PANEL_ROOT_ID)?.remove();
}
