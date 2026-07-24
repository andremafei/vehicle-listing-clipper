import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { startApp, resetAppForTests } from '../src/app/bootstrap.js';
import { PANEL_ROOT_ID } from '../src/environment.js';

describe('singleton bootstrap', () => {
  beforeEach(() => {
    resetAppForTests();
    document.body.innerHTML = '';
  });

  afterEach(() => {
    resetAppForTests();
    vi.useRealTimers();
  });

  it('mounts the panel once', () => {
    const first = startApp();
    expect(first.started).toBe(true);
    expect(document.getElementById(PANEL_ROOT_ID)).toBeTruthy();

    const second = startApp();
    expect(second.started).toBe(false);
    expect(second.reason).toBe('already-initialized');
    expect(document.querySelectorAll(`#${PANEL_ROOT_ID}`).length).toBe(1);
  });

  it('starts minimized with waiting status and core controls', () => {
    startApp();
    const host = document.getElementById(PANEL_ROOT_ID);
    const shadow = host.shadowRoot;
    expect(shadow).toBeTruthy();
    expect(shadow.querySelector('.vlc-panel')?.classList.contains('vlc-panel--minimized')).toBe(
      true,
    );
    expect(shadow.querySelector('.vlc-badge')?.textContent).toBe('LOCAL DEV');
    expect(shadow.querySelector('h1')?.textContent).toBe('waiting');

    const buttons = [...shadow.querySelectorAll('button')].map(
      (el) => el.textContent,
    );
    expect(buttons).toContain('Clip listing');
    expect(buttons).toContain('Clip again');
    expect(buttons).toContain('Cancel');
    expect(buttons.filter((label) => label === 'Copy again').length).toBe(2);
    expect(buttons).toContain('Clear model cache');
    expect(buttons).toContain('Diagnostics');
    expect(buttons).toContain('Settings');
    expect(shadow.querySelector('.vlc-btn-header-clip')?.textContent).toBe(
      'Clip again',
    );
    expect(shadow.querySelector('.vlc-clipboard-id')?.hidden).toBe(true);
  });

  it('auto-clips after 5 seconds and shows No data found on blank page', async () => {
    vi.useFakeTimers();
    const writeText = vi.fn(async () => undefined);
    vi.stubGlobal('navigator', { clipboard: { writeText } });

    startApp();
    const host = document.getElementById(PANEL_ROOT_ID);
    const shadow = host.shadowRoot;
    expect(shadow.querySelector('h1')?.textContent).toBe('waiting');

    await vi.advanceTimersByTimeAsync(5000);
    await vi.waitFor(() => {
      expect(shadow.querySelector('.vlc-status')?.textContent).toBe(
        'No data found.',
      );
      expect(shadow.querySelector('h1')?.textContent).toBe('No data found.');
      expect(writeText).not.toHaveBeenCalled();
    });

    vi.unstubAllGlobals();
  });

  it('shows No data found for Clip listing on blank page', async () => {
    const writeText = vi.fn(async () => undefined);
    vi.stubGlobal('navigator', { clipboard: { writeText } });

    startApp();
    const host = document.getElementById(PANEL_ROOT_ID);
    const shadow = host.shadowRoot;
    const clipBtn = [...shadow.querySelectorAll('button')].find(
      (el) => el.textContent === 'Clip listing',
    );
    clipBtn.click();
    await vi.waitFor(
      () => {
        expect(shadow.querySelector('.vlc-status')?.textContent).toBe(
          'No data found.',
        );
        expect(shadow.querySelector('h1')?.textContent).toBe('No data found.');
        expect(writeText).not.toHaveBeenCalled();
      },
      { timeout: 5000 },
    );
    vi.unstubAllGlobals();
  });
});
