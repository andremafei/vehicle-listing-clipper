import { beforeEach, describe, expect, it } from 'vitest';
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
    expect(buttons).toContain('Read plate');
    expect(buttons).toContain('Settings');
  });

  it('shows the Stage 1 stub message for Read plate', () => {
    startApp();
    const host = document.getElementById(PANEL_ROOT_ID);
    const shadow = host.shadowRoot;
    const readBtn = [...shadow.querySelectorAll('button')].find(
      (el) => el.textContent === 'Read plate',
    );
    readBtn.click();
    expect(shadow.querySelector('.vlc-status')?.textContent).toBe(
      'Plate recognition is not implemented yet.',
    );
  });
});
