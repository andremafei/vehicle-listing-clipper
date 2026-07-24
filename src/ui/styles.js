/** Injected panel styles (Shadow DOM friendly). */
export const PANEL_STYLES = `
:host, .vlc-root {
  all: initial;
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
}

.vlc-panel {
  position: fixed;
  z-index: 2147483646;
  right: 16px;
  bottom: 16px;
  width: 320px;
  max-height: min(90vh, 720px);
  overflow: auto;
  box-sizing: border-box;
  padding: 12px;
  border-radius: 10px;
  background: #111827;
  color: #f9fafb;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
  border: 1px solid #374151;
}

.vlc-panel--minimized {
  width: auto;
  max-width: min(360px, calc(100vw - 32px));
  max-height: none;
  overflow: hidden;
  padding: 8px 10px;
}

.vlc-panel--minimized.vlc-panel--ready {
  background: #14532d;
  border-color: #166534;
  box-shadow: 0 10px 30px rgba(20, 83, 45, 0.45);
}

.vlc-panel--minimized .vlc-body {
  display: none;
}

.vlc-panel--minimized .vlc-header {
  margin-bottom: 0;
  align-items: center;
}

.vlc-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 10px;
  cursor: grab;
  touch-action: none;
  user-select: none;
}

.vlc-header--dragging {
  cursor: grabbing;
}

.vlc-header-main {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  flex: 1;
}

.vlc-header-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1;
}

.vlc-header-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.vlc-btn-header-copy,
.vlc-btn-header-clip {
  padding: 4px 8px;
  font-size: 11px;
  white-space: nowrap;
}

.vlc-btn-header-clip {
  display: none;
}

.vlc-panel--minimized .vlc-btn-header-clip {
  display: inline-block;
}

.vlc-id-signals {
  display: none;
  align-items: center;
  gap: 3px;
  flex-shrink: 0;
  margin-top: 2px;
}

.vlc-panel--minimized .vlc-id-signals:not([hidden]) {
  display: inline-flex;
}

.vlc-signal {
  box-sizing: border-box;
  width: 16px;
  height: 16px;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  font-weight: 800;
  line-height: 1;
  letter-spacing: 0;
  border: 1px solid #4b5563;
  background: #1f2937;
  color: #6b7280;
  opacity: 0.55;
}

.vlc-signal--on {
  opacity: 1;
}

.vlc-signal--plate.vlc-signal--on {
  border-color: #059669;
  background: #064e3b;
  color: #6ee7b7;
}

.vlc-signal--phone.vlc-signal--on {
  border-color: #2563eb;
  background: #1e3a8a;
  color: #93c5fd;
}

.vlc-signal--random.vlc-signal--on {
  border-color: #d97706;
  background: #78350f;
  color: #fcd34d;
}

.vlc-panel--minimized.vlc-panel--ready .vlc-signal:not(.vlc-signal--on) {
  border-color: #166534;
  background: #14532d;
  color: #86efac;
  opacity: 0.4;
}

.vlc-plate-image-meta {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  margin-left: -1px;
}

.vlc-plate-image-index {
  box-sizing: border-box;
  min-width: 16px;
  height: 16px;
  padding: 0 3px;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  font-weight: 800;
  line-height: 1;
  border: 1px solid #059669;
  background: #064e3b;
  color: #6ee7b7;
}

.vlc-btn-plate-preview {
  width: 18px;
  height: 18px;
  min-width: 18px;
  padding: 0;
  border-radius: 4px;
  border-color: #4b5563;
  background: #1f2937;
  color: #d1d5db;
}

.vlc-btn-plate-preview:hover {
  background: #374151;
  color: #f9fafb;
}

.vlc-panel--minimized .vlc-btn-plate-preview {
  width: 16px;
  height: 16px;
  min-width: 16px;
}

.vlc-field-label-meta {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.vlc-plate-image-badge {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.02em;
  text-transform: lowercase;
  padding: 1px 5px;
  border-radius: 3px;
  border: 1px solid #059669;
  background: #064e3b;
  color: #6ee7b7;
}

.vlc-field .vlc-btn-plate-preview {
  width: 22px;
  height: 22px;
}

.vlc-plate-preview-overlay {
  position: fixed;
  inset: 0;
  z-index: 2147483647;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  box-sizing: border-box;
}

.vlc-plate-preview-overlay[hidden] {
  display: none !important;
}

.vlc-plate-preview-backdrop {
  appearance: none;
  position: absolute;
  inset: 0;
  border: 0;
  margin: 0;
  padding: 0;
  background: rgba(0, 0, 0, 0.72);
  cursor: pointer;
}

.vlc-plate-preview-dialog {
  position: relative;
  z-index: 1;
  width: min(920px, calc(100vw - 48px));
  max-height: min(86vh, 900px);
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
  border-radius: 12px;
  background: #111827;
  border: 1px solid #374151;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.55);
  box-sizing: border-box;
}

.vlc-plate-preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.vlc-plate-preview-caption {
  font-size: 13px;
  font-weight: 700;
  color: #f9fafb;
}

.vlc-plate-preview-img {
  display: block;
  width: 100%;
  max-height: min(72vh, 780px);
  object-fit: contain;
  border-radius: 8px;
  background: #0b1220;
}

.vlc-plate-preview-overlay--confirm .vlc-plate-preview-img {
  max-height: min(48vh, 520px);
}

.vlc-plate-confirm {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #b45309;
  background: #451a03;
}

.vlc-plate-confirm[hidden] {
  display: none !important;
}

.vlc-plate-confirm-alert {
  align-self: flex-start;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  padding: 2px 6px;
  border-radius: 4px;
  background: #b45309;
  color: #fffbeb;
}

.vlc-plate-confirm-msg {
  margin: 0;
  font-size: 13px;
  line-height: 1.4;
  color: #fde68a;
}

.vlc-plate-confirm-value {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: #f9fafb;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.04em;
}

.vlc-plate-confirm-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 4px;
}

.vlc-plate-confidence-badge {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.02em;
  padding: 1px 5px;
  border-radius: 3px;
  border: 1px solid #2563eb;
  background: #1e3a8a;
  color: #93c5fd;
}

.vlc-plate-confidence-badge--low {
  border-color: #b45309;
  background: #451a03;
  color: #fcd34d;
}

.vlc-title {
  font-size: 13px;
  font-weight: 700;
  line-height: 1.3;
  margin: 0;
  color: #f9fafb;
}

.vlc-badge {
  flex-shrink: 0;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  padding: 2px 6px;
  border-radius: 4px;
  background: #b45309;
  color: #fffbeb;
}

.vlc-btn-icon {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  line-height: 1;
  text-align: center;
  border-radius: 6px;
}

.vlc-icon {
  width: 20px;
  height: 20px;
  display: block;
  pointer-events: none;
}

.vlc-icon.vlc-icon-sm {
  width: 12px;
  height: 12px;
}

.vlc-btn-plate-preview .vlc-icon {
  width: 12px;
  height: 12px;
}

.vlc-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.vlc-btn {
  appearance: none;
  border: 1px solid #4b5563;
  background: #1f2937;
  color: #f9fafb;
  border-radius: 6px;
  padding: 8px 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  text-align: left;
}

.vlc-btn-primary {
  background: #1d4ed8;
  border-color: #2563eb;
}

.vlc-btn-primary:hover {
  background: #2563eb;
}

.vlc-btn:hover {
  background: #374151;
}

.vlc-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.vlc-btn--copied {
  background: #047857;
  border-color: #059669;
  color: #ecfdf5;
}

.vlc-btn--copied:hover {
  background: #059669;
}

.vlc-btn:focus-visible {
  outline: 2px solid #93c5fd;
  outline-offset: 2px;
}

.vlc-status {
  margin-top: 10px;
  min-height: 1.2em;
  font-size: 12px;
  line-height: 1.4;
  color: #d1d5db;
  white-space: pre-wrap;
}

.vlc-diag {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #374151;
  font-size: 11px;
  line-height: 1.4;
  color: #9ca3af;
  white-space: pre-wrap;
}

.vlc-form {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #374151;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.vlc-form-heading {
  font-size: 12px;
  font-weight: 700;
  color: #e5e7eb;
}

.vlc-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 6px 8px;
  border-radius: 6px;
  border: 1px solid #374151;
  background: #0b1220;
}

.vlc-field-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  font-size: 11px;
  font-weight: 600;
  color: #d1d5db;
}

.vlc-field-origin {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  padding: 1px 5px;
  border-radius: 3px;
  background: #374151;
  color: #e5e7eb;
}

.vlc-field-origin[hidden] {
  display: none !important;
}

.vlc-field-input {
  appearance: none;
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #4b5563;
  border-radius: 4px;
  background: #111827;
  color: #f9fafb;
  padding: 6px 8px;
  font-size: 12px;
}

.vlc-field-input:focus-visible {
  outline: 2px solid #93c5fd;
  outline-offset: 1px;
}

.vlc-origin-extracted {
  border-color: #2563eb;
}
.vlc-origin-extracted .vlc-field-origin {
  background: #1e3a8a;
}

.vlc-origin-anpr {
  border-color: #059669;
}
.vlc-origin-anpr .vlc-field-origin {
  background: #065f46;
}

.vlc-origin-default {
  border-color: #a16207;
}
.vlc-origin-default .vlc-field-origin {
  background: #78350f;
}

.vlc-origin-edited {
  border-color: #7c3aed;
}
.vlc-origin-edited .vlc-field-origin {
  background: #5b21b6;
}

.vlc-origin-missing {
  border-color: #6b7280;
  opacity: 0.92;
}
.vlc-origin-missing .vlc-field-origin {
  background: #4b5563;
}

.vlc-form-actions {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 4px;
}
`;
