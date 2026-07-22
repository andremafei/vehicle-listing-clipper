import { gmXmlHttpRequest } from '../userscript/gm-api.js';

/**
 * @typedef {object} DownloadedImage
 * @property {string} url
 * @property {ArrayBuffer} bytes
 */

/**
 * @typedef {object} DownloadProgress
 * @property {number} index 1-based
 * @property {number} total
 * @property {string} url
 */

/**
 * Download a single image via privileged GM XHR.
 * @param {string} url
 * @param {object} [options]
 * @param {AbortSignal} [options.signal]
 * @param {(opts: { method: string, url: string, responseType: string, signal?: AbortSignal }) => Promise<unknown>} [options.request]
 * @returns {Promise<DownloadedImage>}
 */
export async function downloadImage(url, options = {}) {
  const { signal, request = gmXmlHttpRequest } = options;

  if (signal?.aborted) {
    throw new DOMException('Aborted', 'AbortError');
  }

  const response = await request({
    method: 'GET',
    url,
    responseType: 'arraybuffer',
    signal,
  });

  if (
    !(
      response instanceof ArrayBuffer ||
      Object.prototype.toString.call(response) === '[object ArrayBuffer]'
    )
  ) {
    throw new Error(`Expected ArrayBuffer for ${url}`);
  }

  return { url, bytes: /** @type {ArrayBuffer} */ (response) };
}

/**
 * Download listing images one at a time via privileged GM XHR.
 * Prefer {@link recognizeFirstPlateFromUrls} in the app so ANPR can stop early.
 * @param {string[]} urls
 * @param {object} [options]
 * @param {(progress: DownloadProgress) => void} [options.onProgress]
 * @param {AbortSignal} [options.signal]
 * @param {(opts: { method: string, url: string, responseType: string, signal?: AbortSignal }) => Promise<unknown>} [options.request]
 * @returns {Promise<DownloadedImage[]>}
 */
export async function downloadImagesSequential(urls, options = {}) {
  const { onProgress, signal, request = gmXmlHttpRequest } = options;
  /** @type {DownloadedImage[]} */
  const results = [];
  const total = urls.length;

  for (let i = 0; i < total; i += 1) {
    const url = urls[i];
    onProgress?.({ index: i + 1, total, url });
    results.push(await downloadImage(url, { signal, request }));
  }

  return results;
}
