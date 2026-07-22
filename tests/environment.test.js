import { describe, expect, it } from 'vitest';
import {
  ENV,
  INDEXED_DB_NAME,
  STORAGE_PREFIX,
  isLocal,
  GLOBAL_INIT_FLAG,
  PANEL_ROOT_ID,
} from '../src/environment.js';

describe('environment (local test build)', () => {
  it('uses the local environment flag in Vitest', () => {
    expect(ENV).toBe('local');
    expect(isLocal).toBe(true);
  });

  it('uses local storage and IndexedDB names', () => {
    expect(STORAGE_PREFIX).toBe('vlc_local_');
    expect(INDEXED_DB_NAME).toBe('vehicle-listing-clipper-local');
    expect(GLOBAL_INIT_FLAG).toBe('__VLC_LOCAL_INITIALIZED__');
    expect(PANEL_ROOT_ID).toBe('vlc-panel-root-local');
  });

  it('differs from production naming conventions', () => {
    expect(STORAGE_PREFIX).not.toBe('vlc_prod_');
    expect(INDEXED_DB_NAME).not.toBe('vehicle-listing-clipper');
    expect(GLOBAL_INIT_FLAG).not.toBe('__VLC_PROD_INITIALIZED__');
    expect(PANEL_ROOT_ID).not.toBe('vlc-panel-root');
  });
});
