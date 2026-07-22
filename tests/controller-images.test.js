import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createController } from '../src/app/controller.js';
import { createPanel } from '../src/ui/panel.js';
import { PANEL_ROOT_ID } from '../src/environment.js';
import { resolveAdapter } from '../src/adapters/registry.js';
import { downloadImagesSequential } from '../src/image/download.js';
import { __setGmXmlHttpRequestOverride } from '../src/userscript/gm-api.js';

function mountGallery() {
  document.body.innerHTML = `
    <main id="mainContent">
      <div class="swiper-wrapper">
        <div class="swiper-slide">
          <div class="swiper-zoom-container">
            <img
              src="https://ireland.apollo.olxcdn.com:443/v1/files/a-PT/image;s=750x1000"
              srcset="
                https://ireland.apollo.olxcdn.com:443/v1/files/a-PT/image;s=389x272 420w,
                https://ireland.apollo.olxcdn.com:443/v1/files/a-PT/image;s=1000x700 992w
              "
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
}

describe('controller Read plate (Stage 2)', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    document.getElementById(PANEL_ROOT_ID)?.remove();
    __setGmXmlHttpRequestOverride(async () => new ArrayBuffer(8));
  });

  afterEach(() => {
    __setGmXmlHttpRequestOverride(null);
  });

  it('reports found, downloading, and downloaded statuses', async () => {
    mountGallery();
    const statuses = [];
    const panel = createPanel({
      onReadPlate() {},
      onSettings() {},
    });
    panel.mount(document.body);
    const setStatus = (message) => {
      statuses.push(message);
      panel.setStatus(message);
    };

    setStatus('Looking for listing images…');
    const adapter = resolveAdapter();
    const discovered = await adapter.discoverListingImagesWithWait({
      root: document,
      timeoutMs: 0,
      intervalMs: 10,
    });
    expect(discovered.count).toBe(2);
    setStatus(`Found ${discovered.count} listing images`);

    await downloadImagesSequential(discovered.urls, {
      onProgress({ index, total }) {
        setStatus(`Downloading image ${index} of ${total}`);
      },
    });
    setStatus(
      `Downloaded ${discovered.count} images. Plate recognition is not implemented yet.`,
    );

    expect(statuses).toEqual([
      'Looking for listing images…',
      'Found 2 listing images',
      'Downloading image 1 of 2',
      'Downloading image 2 of 2',
      'Downloaded 2 images. Plate recognition is not implemented yet.',
    ]);
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
});
