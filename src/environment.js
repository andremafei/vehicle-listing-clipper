/**
 * Build-time environment. Injected by Vite via `__VLC_ENV__`.
 * Local development and production must never share storage or IndexedDB names.
 */

/** @typedef {'local' | 'production'} VlcEnv */

/** @type {VlcEnv} */
export const ENV =
  typeof __VLC_ENV__ !== 'undefined' ? __VLC_ENV__ : 'production';

export const isLocal = ENV === 'local';

export const APP_NAME = 'Vehicle Listing Clipper';

export const STORAGE_PREFIX = isLocal
  ? 'vlc_local_'
  : 'vlc_prod_';

export const INDEXED_DB_NAME = isLocal
  ? 'vehicle-listing-clipper-local'
  : 'vehicle-listing-clipper';

export const GLOBAL_INIT_FLAG = isLocal
  ? '__VLC_LOCAL_INITIALIZED__'
  : '__VLC_PROD_INITIALIZED__';

export const PANEL_ROOT_ID = isLocal
  ? 'vlc-panel-root-local'
  : 'vlc-panel-root';
