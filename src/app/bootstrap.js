import {
  GLOBAL_INIT_FLAG,
  PANEL_ROOT_ID,
  isLocal,
} from '../environment.js';
import { createController } from './controller.js';
import { detectCrmContext } from '../../src-crm-filler/app/context.js';
import { createFillerController } from '../../src-crm-filler/app/controller.js';

const CRM_INIT_FLAG = '__LEAD_CRM_FILLER_INITIALIZED__';
const CRM_PANEL_ROOT_ID = 'lead-crm-filler-root';

/** @type {ReturnType<typeof createController> | null} */
let activeController = null;
/** @type {ReturnType<typeof createFillerController> | null} */
let activeCrmController = null;

/**
 * Initialize the userscript once per page (and per env).
 * Listing pages → clipper panel. CRM pages → verify/create lead panel.
 * @returns {{ started: boolean, reason?: string }}
 */
export function startApp() {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return { started: false, reason: 'no-dom' };
  }

  const ctx = detectCrmContext();
  if (ctx.backend !== 'none') {
    return startCrmApp();
  }

  return startClipperApp();
}

/**
 * @returns {{ started: boolean, reason?: string }}
 */
function startCrmApp() {
  if (window[CRM_INIT_FLAG]) {
    return { started: false, reason: 'already-initialized' };
  }

  if (document.getElementById(CRM_PANEL_ROOT_ID)) {
    window[CRM_INIT_FLAG] = true;
    return { started: false, reason: 'panel-exists' };
  }

  window[CRM_INIT_FLAG] = true;

  const controller = createFillerController();
  activeCrmController = controller;

  const mount = () => {
    controller.mount();
  };

  if (document.body) {
    mount();
  } else {
    document.addEventListener('DOMContentLoaded', mount, { once: true });
  }

  if (isLocal) {
    console.info('[Vehicle Listing Clipper] CRM panel (LOCAL DEV) started');
  }

  return { started: true, reason: 'crm' };
}

/**
 * @returns {{ started: boolean, reason?: string }}
 */
function startClipperApp() {
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
  activeCrmController?.destroy();
  activeCrmController = null;
  if (typeof window !== 'undefined') {
    delete window[GLOBAL_INIT_FLAG];
    delete window[CRM_INIT_FLAG];
  }
  document.getElementById(PANEL_ROOT_ID)?.remove();
  document.getElementById(CRM_PANEL_ROOT_ID)?.remove();
}
