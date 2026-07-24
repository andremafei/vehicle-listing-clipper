import { afterEach, describe, expect, it, vi } from 'vitest';
import { createPanel } from '../src/ui/panel.js';
import { PANEL_ROOT_ID } from '../src/environment.js';

describe('listing clipper copy shortcut', () => {
  afterEach(() => {
    document.getElementById(PANEL_ROOT_ID)?.remove();
  });

  it('copies listing data with Alt+C when copy is enabled', () => {
    const onCopyAgain = vi.fn();
    const panel = createPanel({
      onClipListing() {},
      onCancel() {},
      onCopyAgain,
      onClearModelCache() {},
      onToggleDiagnostics() {},
      onSettings() {},
      onFieldChange() {},
      onCopyFullText() {},
      onCopyPlateOnly() {},
      onSettingsBack() {},
      onSaveDefaults() {},
    });
    panel.mount(document.body);

    window.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'c', code: 'KeyC', altKey: true }),
    );
    expect(onCopyAgain).not.toHaveBeenCalled();

    panel.setCopyEnabled(true);
    window.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'c', code: 'KeyC', altKey: true }),
    );
    expect(onCopyAgain).toHaveBeenCalledTimes(1);

    panel.destroy();
  });
});
