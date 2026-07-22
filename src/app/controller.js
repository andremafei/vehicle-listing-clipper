import { createInitialState } from './state.js';
import { createPanel } from '../ui/panel.js';
import {
  INDEXED_DB_NAME,
  STORAGE_PREFIX,
  isLocal,
} from '../environment.js';
import { resolveAdapter } from '../adapters/registry.js';
import {
  recognizeFirstPlateFromUrls,
  resetAnprSessions,
} from '../anpr/pipeline.js';
import { clearModelCache } from '../anpr/model-cache.js';
import { copyText } from '../clipboard/clipboard.js';

/**
 * Application controller.
 */
export function createController() {
  /** @type {ReturnType<typeof createInitialState>} */
  let state = createInitialState();
  /** @type {ReturnType<typeof createPanel> | null} */
  let panel = null;
  /** @type {AbortController | null} */
  let activeAbort = null;

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

  function renderDiagnostics() {
    if (!state.diagnosticsVisible) {
      panel?.setDiagnostics(false);
      return;
    }
    const d = state.lastDiagnostics;
    if (!d) {
      panel?.setDiagnostics(true, 'No diagnostics yet. Run Read plate.');
      return;
    }
    panel?.setDiagnostics(
      true,
      [
        `Provider: ${d.provider || 'n/a'}`,
        `Detector cache: ${d.detectorCacheHit ? 'hit' : 'miss'}`,
        `OCR cache: ${d.ocrCacheHit ? 'hit' : 'miss'}`,
        `Images scanned: ${d.imagesScanned ?? 0}`,
        `Detections tried: ${d.detectionsTried ?? 0}`,
        `Elapsed: ${d.elapsedMs ?? 0} ms`,
      ].join('\n'),
    );
  }

  async function onReadPlate() {
    if (state.busy) {
      return;
    }

    activeAbort = new AbortController();
    const { signal } = activeAbort;
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

      setStatus('Loading plate recognition models…');
      const result = await recognizeFirstPlateFromUrls(urls, {
        signal,
        onStatus: setStatus,
      });

      state = { ...state, lastDiagnostics: result.diagnostics };
      renderDiagnostics();

      if (!result.ok) {
        if (result.reason === 'cancelled') {
          setStatus('Cancelled.');
        } else {
          setStatus('No reliable plate found.');
        }
        return;
      }

      state = { ...state, lastPlate: result.plate };
      panel?.setCopyEnabled(true);

      const copied = await copyText(result.plate);
      if (copied.ok) {
        setStatus(`Plate found: ${result.plate}\nCopied to clipboard`);
      } else {
        setStatus(
          `Plate found: ${result.plate}\nClipboard copy failed — use Copy again`,
        );
      }
    } catch (error) {
      if (signal.aborted) {
        setStatus('Cancelled.');
        return;
      }
      const message =
        error instanceof Error ? error.message : 'Unknown recognition error';
      setStatus(`Failed: ${message}`);
    } finally {
      activeAbort = null;
      setBusy(false);
    }
  }

  function onCancel() {
    activeAbort?.abort();
  }

  async function onCopyAgain() {
    if (!state.lastPlate) {
      setStatus('No plate to copy yet.');
      return;
    }
    const copied = await copyText(state.lastPlate);
    setStatus(
      copied.ok
        ? `Copied to clipboard: ${state.lastPlate}`
        : 'Clipboard copy failed.',
    );
  }

  async function onClearModelCache() {
    try {
      await clearModelCache();
      resetAnprSessions();
      setStatus('Model cache cleared.');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to clear cache';
      setStatus(message);
    }
  }

  function onToggleDiagnostics() {
    state = {
      ...state,
      diagnosticsVisible: !state.diagnosticsVisible,
    };
    renderDiagnostics();
    setStatus(
      state.diagnosticsVisible
        ? 'Diagnostics enabled.'
        : 'Diagnostics disabled.',
    );
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
      onCancel,
      onCopyAgain,
      onClearModelCache,
      onToggleDiagnostics,
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
    onCancel,
    onCopyAgain,
    onClearModelCache,
    onToggleDiagnostics,
    onSettings,
    getState,
    setStatus,
  };
}
