import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createController } from '../src/app/controller.js';
import { PANEL_ROOT_ID } from '../src/environment.js';
import { downloadImage } from '../src/image/download.js';
import { __setGmXmlHttpRequestOverride } from '../src/userscript/gm-api.js';

describe('controller Read plate empty gallery', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    document.getElementById(PANEL_ROOT_ID)?.remove();
    __setGmXmlHttpRequestOverride(async () => new ArrayBuffer(8));
  });

  afterEach(() => {
    __setGmXmlHttpRequestOverride(null);
  });

  it('reports empty gallery via controller', async () => {
    document.body.innerHTML = '<main id="mainContent"><p>empty</p></main>';
    const controller = createController();
    controller.mount(document.body);
    await controller.onReadPlate();
    const status = document
      .getElementById(PANEL_ROOT_ID)
      .shadowRoot.querySelector('.vlc-status').textContent;
    expect(status).toBe('No listing images found.');
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
