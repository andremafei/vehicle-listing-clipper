import { beforeEach, describe, expect, it, vi } from 'vitest';
import { startApp, resetAppForTests } from '../src/app/bootstrap.js';
import { PANEL_ROOT_ID } from '../src/environment.js';

describe('singleton bootstrap', () => {
  beforeEach(() => {
    resetAppForTests();
    document.body.innerHTML = '';
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

  it('shows LOCAL DEV badge and core controls', () => {
    startApp();
    const host = document.getElementById(PANEL_ROOT_ID);
    const shadow = host.shadowRoot;
    expect(shadow).toBeTruthy();
    expect(shadow.querySelector('.vlc-badge')?.textContent).toBe('LOCAL DEV');
    expect(shadow.querySelector('h1')?.textContent).toBe(
      'Vehicle Listing Clipper',
    );

    const buttons = [...shadow.querySelectorAll('button')].map(
      (el) => el.textContent,
    );
    expect(buttons).toContain('Clip listing');
    expect(buttons).toContain('Cancel');
    expect(buttons).toContain('Copy again');
    expect(buttons).toContain('Clear model cache');
    expect(buttons).toContain('Diagnostics');
    expect(buttons).toContain('Settings');
  });

  it('shows empty-gallery status for Clip listing on blank page', async () => {
    startApp();
    const host = document.getElementById(PANEL_ROOT_ID);
    const shadow = host.shadowRoot;
    const clipBtn = [...shadow.querySelectorAll('button')].find(
      (el) => el.textContent === 'Clip listing',
    );
    clipBtn.click();
    await vi.waitFor(
      () => {
        const status = shadow.querySelector('.vlc-status')?.textContent || '';
        expect(status).toContain('No reliable plate found.');
        expect(status).toContain('No listing images found.');
      },
      { timeout: 5000 },
    );
  });
});
