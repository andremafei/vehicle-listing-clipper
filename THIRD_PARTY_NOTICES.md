# Third-party notices

This project uses the following third-party components for Stage 3 local plate recognition.

## open-image-models (plate detector ONNX)

- Project: https://github.com/ankandrew/open-image-models
- Model: `yolo-v9-t-384-license-plate-end2end`
- License: MIT

## fast-plate-ocr / cnn-ocr-lp (plate OCR ONNX)

- Project: https://github.com/ankandrew/fast-plate-ocr
- Model releases: https://github.com/ankandrew/cnn-ocr-lp
- Model: `cct-xs-v2-global-model`
- License: MIT (see upstream repositories)

## FastALPR (reference pipeline)

- Project: https://github.com/ankandrew/fast-alpr
- License: MIT
- Used as architectural reference for detector + OCR composition; this userscript reimplements preprocessing in JavaScript.

## onnxruntime-web

- Package: `onnxruntime-web`
- License: MIT
- WASM assets may be loaded at runtime from the jsDelivr CDN (`cdn.jsdelivr.net`) matching the pinned package version.

ONNX model **weights are not redistributed** in this git repository. They are downloaded at runtime (or placed under `models/` for local development) and verified with SHA-256.
