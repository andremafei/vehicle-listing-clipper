/**
 * Model manifests — production URLs only in the production build branch.
 * Localhost URLs are confined to the local branch so release:check stays clean.
 */

import { isLocal } from '../environment.js';

const DETECTOR_SHA =
  '888397b96d761c89db40bc9c305838e8652660f5e282c2cadebbe8d2951a77a8';
const OCR_SHA =
  '8031afb5fdc6b4d80462c9d542f1284ebd2cfddf5dbacd62609848d7e2855f44';
const OCR_CONFIG_SHA =
  '0335c74a305173bb6f393efed0fde03cadeaa0b649ed8e19f431016d8232d0a6';

const ORT_WASM_BASE =
  'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.22.0/dist/';

/**
 * @returns {import('../../models/manifest.production.json')}
 */
export function getModelManifest() {
  if (isLocal) {
    const base = 'http://127.0.0.1:4173/models';
    return {
      detector: {
        id: 'yolo-v9-t-384-license-plate-end2end',
        filename: 'yolo-v9-t-384-license-plates-end2end.onnx',
        url: `${base}/yolo-v9-t-384-license-plates-end2end.onnx`,
        sha256: DETECTOR_SHA,
      },
      ocr: {
        id: 'cct-xs-v2-global-model',
        filename: 'cct_xs_v2_global.onnx',
        url: `${base}/cct_xs_v2_global.onnx`,
        sha256: OCR_SHA,
        configFilename: 'cct_xs_v2_global_plate_config.yaml',
        configUrl: `${base}/cct_xs_v2_global_plate_config.yaml`,
        configSha256: OCR_CONFIG_SHA,
      },
      ortWasmBaseUrl: ORT_WASM_BASE,
    };
  }

  return {
    detector: {
      id: 'yolo-v9-t-384-license-plate-end2end',
      filename: 'yolo-v9-t-384-license-plates-end2end.onnx',
      url: 'https://github.com/ankandrew/open-image-models/releases/download/assets/yolo-v9-t-384-license-plates-end2end.onnx',
      sha256: DETECTOR_SHA,
    },
    ocr: {
      id: 'cct-xs-v2-global-model',
      filename: 'cct_xs_v2_global.onnx',
      url: 'https://github.com/ankandrew/cnn-ocr-lp/releases/download/arg-plates/cct_xs_v2_global.onnx',
      sha256: OCR_SHA,
      configFilename: 'cct_xs_v2_global_plate_config.yaml',
      configUrl:
        'https://github.com/ankandrew/cnn-ocr-lp/releases/download/arg-plates/cct_xs_v2_global_plate_config.yaml',
      configSha256: OCR_CONFIG_SHA,
    },
    ortWasmBaseUrl: ORT_WASM_BASE,
  };
}

/** Embedded OCR plate config (from cct_xs_v2_global_plate_config.yaml). */
export const OCR_PLATE_CONFIG = {
  maxPlateSlots: 10,
  alphabet: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_',
  padChar: '_',
  imgHeight: 64,
  imgWidth: 128,
  keepAspectRatio: false,
  interpolation: 'linear',
  imageColorMode: 'rgb',
};
