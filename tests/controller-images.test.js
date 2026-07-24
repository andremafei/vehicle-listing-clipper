import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createController } from '../src/app/controller.js';
import { PANEL_ROOT_ID } from '../src/environment.js';
import { downloadImage } from '../src/image/download.js';
import { __setGmXmlHttpRequestOverride } from '../src/userscript/gm-api.js';
import { __resetGmMemoryStore } from '../src/userscript/gm-api.js';

describe('controller Clip listing empty gallery', () => {
  /** @type {ReturnType<typeof createController> | null} */
  let controller = null;

  beforeEach(() => {
    document.body.innerHTML = '';
    document.getElementById(PANEL_ROOT_ID)?.remove();
    __setGmXmlHttpRequestOverride(async () => new ArrayBuffer(8));
    controller = null;
  });

  afterEach(() => {
    controller?.destroy();
    controller = null;
    __setGmXmlHttpRequestOverride(null);
    __resetGmMemoryStore();
    vi.unstubAllGlobals();
    vi.useRealTimers();
    // Restore Visibility API overrides from deferred-phone tests.
    try {
      delete document.hidden;
    } catch {
      // ignore
    }
    try {
      delete document.visibilityState;
    } catch {
      // ignore
    }
  });

  it('shows No data found when gallery is empty and no useful fields', async () => {
    vi.useFakeTimers();
    document.body.innerHTML = '<main id="mainContent"><p>empty</p></main>';
    const writeText = vi.fn(async () => undefined);
    vi.stubGlobal('navigator', { clipboard: { writeText } });

    controller = createController();
    controller.mount(document.body);
    const clipPromise = controller.onClipListing();
    // No gallery shell → skip image wait; two phone-button checks (2s + 2s).
    await vi.advanceTimersByTimeAsync(4000);
    await clipPromise;
    const status = document
      .getElementById(PANEL_ROOT_ID)
      .shadowRoot.querySelector('.vlc-status').textContent;
    expect(status).toBe('No data found.');
    expect(controller.getState().listingRecord).toBeTruthy();
    expect(writeText).not.toHaveBeenCalled();
    expect(controller.getState().lastClipboard).toBe('');
    expect(
      document
        .getElementById(PANEL_ROOT_ID)
        .shadowRoot.querySelector('h1')?.textContent,
    ).toBe('No data found.');
  });

  it('reveals phone and prepares listing text without auto-copy', async () => {
    vi.useFakeTimers();
    document.body.innerHTML = `
      <main id="mainContent">
        <button type="button" data-testid="ad-contact-phone">Ver número</button>
      </main>
    `;
    const button = document.querySelector(
      'button[data-testid="ad-contact-phone"]',
    );
    button.addEventListener('click', () => {
      button.innerHTML =
        '<a href="tel:926811992" data-testid="contact-phone">926 811 992</a>';
    });

    const writeText = vi.fn(async () => undefined);
    vi.stubGlobal('navigator', { clipboard: { writeText } });

    controller = createController();
    controller.mount(document.body);
    const clipPromise = controller.onClipListing();
    // Image discovery wait + first button-appear check.
    await vi.advanceTimersByTimeAsync(4000);
    await clipPromise;

    expect(controller.getState().lastPhone).toBe('926811992');
    expect(controller.getState().lastClipboard).toContain('Matrícula:');
    expect(controller.getState().lastClipboard).toContain('ID: 926811992');
    expect(controller.getState().lastClipboard).toContain(
      'Telefone: 926811992',
    );
    expect(writeText).not.toHaveBeenCalled();
    const shadow = document.getElementById(PANEL_ROOT_ID).shadowRoot;
    const phoneField = shadow.querySelector('.vlc-field[data-field="phone"]');
    expect(phoneField).toBeTruthy();
    expect(phoneField.querySelector('.vlc-field-label')?.textContent).toContain(
      'Telefone',
    );
    expect(phoneField.querySelector('.vlc-field-input')?.value).toBe(
      '926811992',
    );
    const firstField = shadow.querySelector('.vlc-form .vlc-field');
    expect(firstField?.dataset.field).toBe('phone');
    const status = shadow.querySelector('.vlc-status').textContent;
    expect(status).toContain('Phone: 926811992');
    expect(status).toContain('Ready to copy');
    expect(shadow.querySelector('h1')?.textContent).toBe('ready to copy');
    expect(shadow.querySelector('.vlc-panel')?.classList.contains('vlc-panel--ready')).toBe(
      true,
    );
    expect(shadow.querySelector('.vlc-btn-header-copy')?.textContent).toMatch(
      /^Copy \((Alt\+C|⌥C)\)$/,
    );

    shadow.querySelector('.vlc-btn-header-copy').click();
    await vi.waitFor(() => {
      expect(writeText).toHaveBeenCalled();
      expect(shadow.querySelector('h1')?.textContent).toBe('data copied');
    });
    expect(shadow.querySelector('.vlc-status')?.textContent).toBe(
      'Data copied',
    );
  });

  it('defers phone reveal until the tab becomes visible', async () => {
    vi.useFakeTimers();
    document.body.innerHTML = `
      <main id="mainContent">
        <button type="button" data-testid="ad-contact-phone">Ver número</button>
      </main>
    `;
    const button = document.querySelector(
      'button[data-testid="ad-contact-phone"]',
    );
    const clickSpy = vi.fn(() => {
      button.innerHTML =
        '<a href="tel:926811992" data-testid="contact-phone">926 811 992</a>';
    });
    button.addEventListener('click', clickSpy);

    let hidden = true;
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      get: () => hidden,
    });
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => (hidden ? 'hidden' : 'visible'),
    });

    const writeText = vi.fn(async () => undefined);
    vi.stubGlobal('navigator', { clipboard: { writeText } });

    controller = createController();
    controller.mount(document.body);
    const clipPromise = controller.onClipListing();

    await vi.advanceTimersByTimeAsync(2000);
    await Promise.resolve();
    expect(
      document
        .getElementById(PANEL_ROOT_ID)
        .shadowRoot.querySelector('.vlc-status')?.textContent,
    ).toBe('Waiting for this tab to extract phone…');
    expect(clickSpy).not.toHaveBeenCalled();
    expect(
      document
        .getElementById(PANEL_ROOT_ID)
        .shadowRoot.querySelector('.vlc-btn-header-copy')?.disabled,
    ).toBe(true);

    hidden = false;
    document.dispatchEvent(new Event('visibilitychange'));
    await Promise.resolve();
    expect(clickSpy).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(2000);
    await clipPromise;

    expect(clickSpy).toHaveBeenCalled();
    expect(controller.getState().lastPhone).toBe('926811992');
    const shadow = document.getElementById(PANEL_ROOT_ID).shadowRoot;
    expect(shadow.querySelector('h1')?.textContent).toBe('ready to copy');
    expect(shadow.querySelector('.vlc-btn-header-copy')?.disabled).toBe(false);
    expect(shadow.querySelector('.vlc-panel')?.classList.contains('vlc-panel--ready')).toBe(
      true,
    );
  });

  it('can download a single discovered url without prefetching the gallery', async () => {
    __setGmXmlHttpRequestOverride(async ({ url }) => {
      expect(url).toContain('a-PT');
      return new ArrayBuffer(4);
    });

    document.body.innerHTML = `
      <main id="mainContent">
        <div class="swiper-wrapper">
          <div class="swiper-slide">
            <div class="swiper-zoom-container">
              <img
                src="https://ireland.apollo.olxcdn.com:443/v1/files/a-PT/image;s=1000x700"
                data-testid="swiper-image-lazy"
              />
            </div>
          </div>
          <div class="swiper-slide">
            <div class="swiper-zoom-container">
              <img
                src="https://ireland.apollo.olxcdn.com:443/v1/files/b-PT/image;s=1000x700"
                data-testid="swiper-image-lazy"
              />
            </div>
          </div>
        </div>
      </main>
    `;

    const first = await downloadImage(
      'https://ireland.apollo.olxcdn.com:443/v1/files/a-PT/image;s=1000x700',
    );
    expect(first.bytes.byteLength).toBe(4);
  });
});
