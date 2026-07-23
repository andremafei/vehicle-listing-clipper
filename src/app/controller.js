import { createInitialState } from './state.js';
import { createPanel } from '../ui/panel.js';
import {
  INDEXED_DB_NAME,
  STORAGE_PREFIX,
  isLocal,
} from '../environment.js';
import { canonicalizeListingUrl } from '../adapters/shared/normalize.js';
import { resolveAdapter } from '../adapters/registry.js';
import {
  recognizeFirstPlateFromUrls,
  resetAnprSessions,
} from '../anpr/pipeline.js';
import { clearModelCache } from '../anpr/model-cache.js';
import { copyText } from '../clipboard/clipboard.js';
import {
  formatFullText,
  generateFallbackId,
  parseClipboardId,
} from '../clipboard/full-text.js';
import { formatListingJson } from '../clipboard/json.js';
import {
  applyListingEdit,
  createListingRecord,
} from '../listing/record.js';
import {
  getListingCacheEntry,
  setListingCacheEntry,
} from '../storage/listing-cache.js';
import {
  getValuationDefaults,
  setValuationDefaults,
} from '../storage/settings.js';

const AUTO_CLIP_DELAY_MS = 5000;

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
  /** @type {ReturnType<typeof setTimeout> | null} */
  let autoClipTimer = null;
  /** @type {string} */
  let cacheUrl = '';
  /** @type {number} */
  let cacheProcessedAt = 0;
  let pendingCachedCopy = false;

  /**
   * @param {'waiting' | 'reading' | 'text copied' | 'cached (not copied yet)'} [phase]
   */
  function setCaptureStatus(phase) {
    if (phase) {
      panel?.setCaptureStatus(phase);
    }
  }

  /**
   * @returns {string}
   */
  function resolveCurrentListingUrl() {
    try {
      const extracted = resolveAdapter().extractListing(document);
      if (extracted?.url) {
        return canonicalizeListingUrl(extracted.url);
      }
    } catch {
      // fall through to location
    }
    if (typeof location !== 'undefined' && location?.href) {
      return canonicalizeListingUrl(location.href);
    }
    return '';
  }

  /**
   * @param {string} url
   * @param {import('../storage/listing-cache.js').ListingCacheEntry} entry
   */
  function applyCachedEntry(url, entry) {
    const record = entry.listingRecord;
    const phone = entry.phone || '';
    const plate = record?.fields?.plate || '';
    const needsFallback = !String(plate).trim() && !String(phone).trim();
    const fallbackId = needsFallback
      ? entry.fallbackId || parseClipboardId(entry.clipboard) || ''
      : '';
    cacheUrl = url;
    cacheProcessedAt = entry.processedAt;
    pendingCachedCopy = true;
    state = {
      ...state,
      lastPlate: plate,
      lastPhone: phone,
      lastClipboard: entry.clipboard || '',
      fallbackId,
      listingRecord: record,
      view: 'form',
    };
    panel?.showListingForm(record);
    panel?.setCopyEnabled(Boolean(entry.clipboard));
    panel?.setCopyLabel('Copy');
    setCaptureStatus('cached (not copied yet)');
    setStatus('cached (not copied yet)');
  }

  /**
   * Build clipboard text, generating and remembering a fallback ID when needed.
   * @param {object} record
   * @param {string} [phone]
   * @returns {string}
   */
  function formatListingClipboard(record, phone = '') {
    const plate = record?.fields?.plate || '';
    const phoneValue = phone == null ? '' : String(phone).trim();
    let fallbackId = state.fallbackId || '';
    if (!String(plate).trim() && !phoneValue) {
      if (!fallbackId) {
        fallbackId = generateFallbackId();
      }
      state = { ...state, fallbackId };
    }
    return formatFullText(record.fields, {
      phone: phoneValue,
      fallbackId: state.fallbackId,
    });
  }

  /**
   * @param {{
   *   clipboard: string,
   *   phone?: string,
   *   listingRecord?: object | null,
   *   processedAt?: number,
   *   fallbackId?: string,
   * }} payload
   */
  async function persistListingCache(payload) {
    const url =
      cacheUrl ||
      canonicalizeListingUrl(payload.listingRecord?.fields?.url || '') ||
      resolveCurrentListingUrl();
    if (!url || !payload.listingRecord || !payload.clipboard) {
      return;
    }
    const processedAt = payload.processedAt ?? cacheProcessedAt ?? Date.now();
    cacheUrl = url;
    cacheProcessedAt = processedAt;
    await setListingCacheEntry(url, {
      processedAt,
      phone: payload.phone ?? state.lastPhone ?? '',
      clipboard: payload.clipboard,
      fallbackId: payload.fallbackId ?? state.fallbackId ?? '',
      listingRecord: payload.listingRecord,
    });
  }

  async function restoreFromCacheOrSchedule() {
    try {
      const url = resolveCurrentListingUrl();
      if (url) {
        const entry = await getListingCacheEntry(url);
        if (entry) {
          applyCachedEntry(url, entry);
          return;
        }
      }
    } catch {
      // fall through to auto-clip
    }
    scheduleAutoClip();
  }

  function clearAutoClipTimer() {
    if (autoClipTimer != null) {
      clearTimeout(autoClipTimer);
      autoClipTimer = null;
    }
  }

  function scheduleAutoClip() {
    clearAutoClipTimer();
    setCaptureStatus('waiting');
    autoClipTimer = setTimeout(() => {
      autoClipTimer = null;
      void onClipListing();
    }, AUTO_CLIP_DELAY_MS);
  }

  function setStatus(message) {
    state = { ...state, statusMessage: message };
    panel?.setStatus(message);
  }

  /**
   * @param {boolean} busy
   */
  function setBusy(busy) {
    state = {
      ...state,
      busy,
      view: busy ? 'reading' : state.listingRecord ? 'form' : 'idle',
    };
    panel?.setBusy(busy);
    if (busy) {
      setCaptureStatus('reading');
    }
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
   * @param {ReturnType<typeof createListingRecord>} record
   * @param {{ plate?: string, phone?: string }} parts
   * @param {boolean} copiedOk
   */
  function statusForClipResult(record, parts, copiedOk) {
    const lines = [];
    if (parts.plate) {
      lines.push(`Plate found: ${parts.plate}`);
    } else {
      lines.push('No reliable plate found.');
    }
    if (parts.phone) {
      lines.push(`Phone: ${parts.phone}`);
    }
    if (record.fields.make || record.fields.model) {
      lines.push(
        `Listing: ${[record.fields.make, record.fields.model]
          .filter(Boolean)
          .join(' ')}`.trim(),
      );
    }
    lines.push(
      copiedOk
        ? 'Full text copied to clipboard'
        : 'Clipboard copy failed — use Copy full text',
    );
    return lines.join('\n');
  }

  /**
   * @param {string} text
   */
  async function copyAndRemember(text) {
    state = { ...state, lastClipboard: text };
    panel?.setCopyEnabled(Boolean(text));
    return copyText(text);
  }

  async function onClipListing() {
    clearAutoClipTimer();
    if (state.busy) {
      return;
    }

    activeAbort = new AbortController();
    const { signal } = activeAbort;
    setBusy(true);

    try {
      const adapter = resolveAdapter();
      const defaults = await getValuationDefaults();

      setStatus('Revealing phone (if available)…');
      const phonePromise = adapter.revealContactPhone({
        root: document,
        timeoutMs: 15000,
        intervalMs: 250,
        signal,
      });

      setStatus('Extracting listing fields…');
      const extracted = adapter.extractListing(document);

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

      const record = createListingRecord({
        extracted,
        plate,
        defaults,
      });

      state = {
        ...state,
        lastPlate: plate,
        lastPhone: phone,
        fallbackId: '',
        listingRecord: record,
        view: 'form',
      };
      panel?.showListingForm(record);

      const fullText = formatListingClipboard(record, phone);
      const copied = await copyAndRemember(fullText);
      pendingCachedCopy = false;
      panel?.setCopyLabel('Copy again');
      if (copied.ok) {
        setCaptureStatus('text copied');
      }

      cacheUrl = canonicalizeListingUrl(record.fields.url || '') || resolveCurrentListingUrl();
      cacheProcessedAt = Date.now();
      await persistListingCache({
        clipboard: fullText,
        phone,
        listingRecord: record,
        processedAt: cacheProcessedAt,
        fallbackId: state.fallbackId,
      });

      let status = statusForClipResult(record, { plate, phone }, copied.ok);
      if (plate && !phone && phoneResult.reason === 'timeout') {
        status += '\nPhone reveal timed out.';
      } else if (plate && !phone && phoneResult.reason === 'no-button') {
        status += '\nNo phone button on this listing.';
      }
      if (count === 0 && !phone && phoneResult.reason === 'no-button') {
        status += '\nNo listing images found.';
      }
      setStatus(status);
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
    let text = state.lastClipboard;
    if (state.listingRecord) {
      text = formatListingClipboard(state.listingRecord, state.lastPhone);
      state = { ...state, lastClipboard: text };
      panel?.setCopyEnabled(Boolean(text));
    }
    if (!text) {
      setStatus('Nothing to copy yet.');
      return;
    }
    const wasPendingCachedCopy = pendingCachedCopy;
    const copied = await copyText(text);
    if (copied.ok) {
      pendingCachedCopy = false;
      setCaptureStatus('text copied');
      panel?.setCopyLabel('Copy again');
      panel?.flashCopySuccess();
      await persistListingCache({
        clipboard: text,
        phone: state.lastPhone,
        listingRecord: state.listingRecord,
        processedAt: cacheProcessedAt || Date.now(),
        fallbackId: state.fallbackId,
      });
    }
    setStatus(
      copied.ok
        ? wasPendingCachedCopy
          ? 'Full text copied to clipboard.'
          : 'Copied to clipboard again.'
        : 'Clipboard copy failed.',
    );
  }

  async function onCopyFullText() {
    if (!state.listingRecord) {
      setStatus('No listing to copy yet. Run Clip listing.');
      return;
    }
    const text = formatListingClipboard(
      state.listingRecord,
      state.lastPhone,
    );
    const copied = await copyAndRemember(text);
    if (copied.ok) {
      pendingCachedCopy = false;
      setCaptureStatus('text copied');
      panel?.setCopyLabel('Copy again');
      await persistListingCache({
        clipboard: text,
        phone: state.lastPhone,
        listingRecord: state.listingRecord,
        processedAt: cacheProcessedAt || Date.now(),
        fallbackId: state.fallbackId,
      });
    }
    setStatus(
      copied.ok
        ? 'Full text copied to clipboard.'
        : 'Clipboard copy failed.',
    );
  }

  async function onCopyPlateOnly() {
    const plate = state.listingRecord?.fields?.plate || state.lastPlate || '';
    if (!plate) {
      setStatus('No plate to copy.');
      return;
    }
    const copied = await copyAndRemember(plate);
    setStatus(
      copied.ok
        ? `Plate copied: ${plate}`
        : 'Clipboard copy failed.',
    );
  }

  async function onCopyJson() {
    if (!state.listingRecord) {
      setStatus('No listing to copy yet. Run Clip listing.');
      return;
    }
    const text = formatListingJson(state.listingRecord);
    const copied = await copyAndRemember(text);
    setStatus(
      copied.ok ? 'JSON copied to clipboard.' : 'Clipboard copy failed.',
    );
  }

  /**
   * @param {string} fieldId
   * @param {string} value
   */
  function onFieldChange(fieldId, value) {
    if (!state.listingRecord) {
      return;
    }
    const next = applyListingEdit(state.listingRecord, fieldId, value);
    state = {
      ...state,
      listingRecord: next,
      lastPlate: fieldId === 'plate' ? value : state.lastPlate,
    };
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

  async function onSettings() {
    if (state.busy) {
      return;
    }
    const defaults = await getValuationDefaults();
    state = { ...state, view: 'settings' };
    panel?.showSettingsForm(defaults);
    const envLabel = isLocal ? 'local development' : 'production';
    setStatus(
      `Settings. Environment: ${envLabel}. Storage: ${STORAGE_PREFIX}* / ${INDEXED_DB_NAME}.`,
    );
  }

  function onSettingsBack() {
    state = {
      ...state,
      view: state.listingRecord ? 'form' : 'idle',
    };
    if (state.listingRecord) {
      panel?.showListingForm(state.listingRecord);
      setStatus('Back to listing review.');
    } else {
      panel?.hideForm();
      setStatus('Settings closed.');
    }
  }

  /**
   * @param {Record<string, string>} defaults
   */
  async function onSaveDefaults(defaults) {
    await setValuationDefaults(defaults);
    setStatus('Defaults saved.');
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
      onFieldChange,
      onCopyFullText,
      onCopyPlateOnly,
      onCopyJson,
      onSettingsBack,
      onSaveDefaults,
    });
    panel.mount(target);
    panel.setMinimized(true);
    void restoreFromCacheOrSchedule();
    return panel;
  }

  function destroy() {
    clearAutoClipTimer();
    activeAbort?.abort();
    activeAbort = null;
    panel?.destroy();
    panel = null;
    cacheUrl = '';
    cacheProcessedAt = 0;
    pendingCachedCopy = false;
    state = createInitialState();
  }

  function getState() {
    return state;
  }

  return {
    mount,
    destroy,
    onClipListing,
    onCancel,
    onCopyAgain,
    onCopyFullText,
    onCopyPlateOnly,
    onCopyJson,
    onFieldChange,
    onClearModelCache,
    onToggleDiagnostics,
    onSettings,
    onSettingsBack,
    onSaveDefaults,
    getState,
    setStatus,
  };
}
