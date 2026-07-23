import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createController } from '../src/app/controller.js';
import { PANEL_ROOT_ID } from '../src/environment.js';
import { downloadImage } from '../src/image/download.js';
import { __setGmXmlHttpRequestOverride } from '../src/userscript/gm-api.js';
import { __resetGmMemoryStore } from '../src/userscript/gm-api.js';

describe('controller Clip listing empty gallery', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    document.getElementById(PANEL_ROOT_ID)?.remove();
    __setGmXmlHttpRequestOverride(async () => new ArrayBuffer(8));
  });

  afterEach(() => {
    __setGmXmlHttpRequestOverride(null);
    __resetGmMemoryStore();
    vi.unstubAllGlobals();
  });

  it('still builds a listing form when gallery is empty', async () => {
    document.body.innerHTML = '<main id="mainContent"><p>empty</p></main>';
    const writeText = vi.fn(async () => undefined);
    vi.stubGlobal('navigator', { clipboard: { writeText } });

    const controller = createController();
    controller.mount(document.body);
    await controller.onClipListing();
    const status = document
      .getElementById(PANEL_ROOT_ID)
      .shadowRoot.querySelector('.vlc-status').textContent;
    expect(status).toContain('No reliable plate found.');
    expect(status).toContain('No listing images found.');
    expect(controller.getState().listingRecord).toBeTruthy();
    expect(writeText).toHaveBeenCalled();
    expect(controller.getState().lastClipboard).toContain('Matrícula:');
  });

  it('reveals phone and copies full listing text without gallery images', async () => {
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

    const controller = createController();
    controller.mount(document.body);
    await controller.onClipListing();

    expect(controller.getState().lastPhone).toBe('926811992');
    expect(controller.getState().lastClipboard).toContain('Matrícula:');
    expect(controller.getState().lastClipboard).toContain('ID: 926811992');
    expect(controller.getState().lastClipboard).toContain(
      'Telefone: 926811992',
    );
    expect(writeText).toHaveBeenCalled();
    const status = document
      .getElementById(PANEL_ROOT_ID)
      .shadowRoot.querySelector('.vlc-status').textContent;
    expect(status).toContain('Phone: 926811992');
    expect(status).toContain('Full text copied to clipboard');
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
