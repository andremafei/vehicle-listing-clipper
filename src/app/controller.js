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
import { copyText, formatClipboardPayload } from '../clipboard/clipboard.js';

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
      panel?.setDiagnostics(true, 'No diagnostics yet. Run Clip listing.');
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

  /**
   * @param {{ plate?: string | null, phone?: string | null }} parts
   * @param {boolean} copiedOk
   */
  function statusForClipResult(parts, copiedOk) {
    const lines = [];
    if (parts.plate) {
      lines.push(`Plate found: ${parts.plate}`);
    } else {
      lines.push('No reliable plate found.');
    }
    if (parts.phone) {
      lines.push(`Phone: ${parts.phone}`);
    }
    if (parts.plate || parts.phone) {
      lines.push(
        copiedOk
          ? 'Copied to clipboard'
          : 'Clipboard copy failed — use Copy again',
      );
    }
    return lines.join('\n');
  }

  async function onClipListing() {
    if (state.busy) {
      return;
    }

    activeAbort = new AbortController();
    const { signal } = activeAbort;
    setBusy(true);

    try {
      const adapter = resolveAdapter();

      // Start phone reveal immediately — the OLX request can take a few seconds.
      setStatus('Revealing phone (if available)…');
      const phonePromise = adapter.revealContactPhone({
        root: document,
        timeoutMs: 15000,
        intervalMs: 250,
        signal,
      });

      setStatus('Looking for listing images…');
      const discovered = await adapter.discoverListingImagesWithWait({
        root: document,
        timeoutMs: 2000,
        intervalMs: 100,
      });

      const { urls, count } = discovered;
      /** @type {{ ok: boolean, plate?: string, reason?: string, diagnostics?: object }} */
      let plateResult = { ok: false, reason: 'no-images' };

      if (count > 0) {
        setStatus(`Found ${count} listing images — scanning…`);
        setStatus('Loading plate recognition models…');
        plateResult = await recognizeFirstPlateFromUrls(urls, {
          signal,
          onStatus: setStatus,
        });
        state = { ...state, lastDiagnostics: plateResult.diagnostics };
        renderDiagnostics();
      } else {
        setStatus('No listing images — checking phone…');
      }

      const phoneResult = await phonePromise;
      const plate =
        plateResult.ok && plateResult.plate ? plateResult.plate : '';
      const phone = phoneResult.ok ? phoneResult.phone : '';

      if (signal.aborted || plateResult.reason === 'cancelled') {
        setStatus('Cancelled.');
        return;
      }

      if (!plate && !phone) {
        if (count === 0 && phoneResult.reason === 'no-button') {
          setStatus('No listing images found.');
        } else if (phoneResult.reason === 'timeout') {
          setStatus('No reliable plate found. Phone reveal timed out.');
        } else {
          setStatus('No plate or phone found.');
        }
        return;
      }

      const clipboard = formatClipboardPayload({ plate, phone });
      state = {
        ...state,
        lastPlate: plate,
        lastPhone: phone,
        lastClipboard: clipboard,
      };
      panel?.setCopyEnabled(true);

      const copied = await copyText(clipboard);
      let status = statusForClipResult({ plate, phone }, copied.ok);
      if (plate && !phone && phoneResult.reason === 'timeout') {
        status += '\nPhone reveal timed out.';
      } else if (plate && !phone && phoneResult.reason === 'no-button') {
        status += '\nNo phone button on this listing.';
      }
      setStatus(status);    } catch (error) {
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
    if (!state.lastClipboard) {
      setStatus('Nothing to copy yet.');
      return;
    }
    const copied = await copyText(state.lastClipboard);
    setStatus(
      copied.ok
        ? `Copied to clipboard:\n${state.lastClipboard}`
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
      onClipListing,
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
    onClipListing,
    onCancel,
    onCopyAgain,
    onClearModelCache,
    onToggleDiagnostics,
    onSettings,
    getState,
    setStatus,
  };
}
