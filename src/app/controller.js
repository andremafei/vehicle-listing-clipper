import { createInitialState } from './state.js';
import { createPanel } from '../ui/panel.js';
import {
  INDEXED_DB_NAME,
  STORAGE_PREFIX,
  isLocal,
} from '../environment.js';
import { resolveAdapter } from '../adapters/registry.js';
import { downloadImagesSequential } from '../image/download.js';

/**
 * Application controller: panel actions and Stage 2 image pipeline.
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

  /**
   * @param {boolean} busy
   */
  function setBusy(busy) {
    state = { ...state, busy, view: busy ? 'reading' : 'idle' };
    panel?.setBusy(busy);
  }

  async function onReadPlate() {
    if (state.busy) {
      return;
    }

    setBusy(true);
    try {
      setStatus('Looking for listing images…');
      const adapter = resolveAdapter();
      const discovered = await adapter.discoverListingImagesWithWait({
        root: document,
        timeoutMs: 2000,
        intervalMs: 100,
      });

      const { urls, count } = discovered;
      if (count === 0) {
        setStatus('No listing images found.');
        return;
      }

      setStatus(`Found ${count} listing images`);

      await downloadImagesSequential(urls, {
        onProgress({ index, total }) {
          setStatus(`Downloading image ${index} of ${total}`);
        },
      });

      setStatus(
        `Downloaded ${count} images. Plate recognition is not implemented yet.`,
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown download error';
      setStatus(`Failed to download images: ${message}`);
    } finally {
      setBusy(false);
    }
  }

  function onSettings() {
    if (state.busy) {
      return;
    }
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
