# Local ONNX weights (not committed)

Stage 3 serves models from this directory during `npm run dev`.

## Required files

Download once into `models/`:

```bash
curl -fsSL -o models/yolo-v9-t-384-license-plates-end2end.onnx \
  "https://github.com/ankandrew/open-image-models/releases/download/assets/yolo-v9-t-384-license-plates-end2end.onnx"

curl -fsSL -o models/cct_xs_v2_global.onnx \
  "https://github.com/ankandrew/cnn-ocr-lp/releases/download/arg-plates/cct_xs_v2_global.onnx"

curl -fsSL -o models/cct_xs_v2_global_plate_config.yaml \
  "https://github.com/ankandrew/cnn-ocr-lp/releases/download/arg-plates/cct_xs_v2_global_plate_config.yaml"
```

Verify SHA-256 against [manifest.development.json](manifest.development.json).

## Tensor contracts (inspected)

### Detector `yolo-v9-t-384-license-plates-end2end`

- Input `images`: float32 `[1, 3, 384, 384]` NCHW RGB, values in `[0, 1]`
- Letterbox to 384 with pad color `(114,114,114)`, then BGR→RGB via channel reverse after HWC→CHW
- Output `output0`: float32 `[N, 7]` end-to-end NMS rows `[?, x1, y1, x2, y2, class, score]` in letterboxed coords; restore with `(coord - pad) / ratio`

### OCR `cct-xs-v2-global`

- Input `input`: uint8 `[N, 64, 128, 3]` NHWC RGB (no external float normalize)
- Resize to 64×128, `keep_aspect_ratio: false`, linear interpolation
- Output `plate`: float `[N, 10, 37]` — argmax over alphabet `0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_`, strip trailing `_`
- Output `region`: float `[N, 66]` (unused for Stage 3 accept/reject)
