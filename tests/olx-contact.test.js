import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clickLikeUser,
  findPhoneRevealButton,
  invokeReactClick,
  readRevealedPhone,
  revealContactPhone,
} from '../src/adapters/olx-pt/contact.js';

function mountContact(html) {
  document.body.innerHTML = `<main id="mainContent">${html}</main>`;
  return document;
}

describe('olx-pt contact phone reveal', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('finds the reveal button via data-testid', () => {
    mountContact(`
      <button type="button" data-testid="ad-contact-phone">Ver número</button>
    `);
    expect(findPhoneRevealButton(document)?.textContent).toBe('Ver número');
  });

  it('reads phone from tel: href when already visible', () => {
    mountContact(`
      <button type="button" data-testid="ad-contact-phone">
        <a href="tel:926811992" data-testid="contact-phone">926 811 992</a>
      </button>
    `);
    expect(readRevealedPhone(document)).toBe('926811992');
  });

  it('reads full number when tel: href contains spaces', () => {
    mountContact(`
      <a href="tel:21 145 5787" data-testid="contact-phone">21 145 5787</a>
    `);
    expect(readRevealedPhone(document)).toBe('211455787');
  });

  it('strips Portugal +351 country code from tel: href', () => {
    mountContact(`
      <a href="tel:+351 914 746 358" data-testid="contact-phone">914 746 358</a>
    `);
    expect(readRevealedPhone(document)).toBe('914746358');
  });

  it('returns no-button when reveal control is missing', async () => {
    mountContact('<p>no phone</p>');
    const result = await revealContactPhone({ root: document, timeoutMs: 50 });
    expect(result).toEqual({ ok: false, reason: 'no-button' });
  });

  it('clicks reveal and waits for the phone link', async () => {
    mountContact(`
      <button type="button" data-testid="ad-contact-phone">Ver número</button>
    `);
    const button = findPhoneRevealButton(document);
    button.addEventListener('click', () => {
      setTimeout(() => {
        button.innerHTML =
          '<a href="tel:926811992" data-testid="contact-phone">926 811 992</a>';
      }, 80);
    });

    const result = await revealContactPhone({
      root: document,
      timeoutMs: 1000,
      intervalMs: 20,
    });

    expect(result).toEqual({
      ok: true,
      phone: '926811992',
      clicked: true,
      alreadyVisible: false,
    });
  });

  it('skips click when phone is already visible', async () => {
    mountContact(`
      <button type="button" data-testid="ad-contact-phone">
        <a href="tel:912345678" data-testid="contact-phone">912 345 678</a>
      </button>
    `);
    const clicked = vi.fn();
    findPhoneRevealButton(document)?.addEventListener('click', clicked);

    const result = await revealContactPhone({ root: document, timeoutMs: 50 });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.phone).toBe('912345678');
      expect(result.clicked).toBe(false);
      expect(result.alreadyVisible).toBe(true);
    }
    expect(clicked).not.toHaveBeenCalled();
  });

  it('times out when phone never appears', async () => {
    mountContact(`
      <button type="button" data-testid="ad-contact-phone">Ver número</button>
    `);
    const result = await revealContactPhone({
      root: document,
      timeoutMs: 60,
      intervalMs: 20,
    });
    expect(result).toEqual({ ok: false, reason: 'timeout' });
  });

  it('respects abort signal', async () => {
    mountContact(`
      <button type="button" data-testid="ad-contact-phone">Ver número</button>
    `);
    const controller = new AbortController();
    const pending = revealContactPhone({
      root: document,
      timeoutMs: 2000,
      intervalMs: 50,
      signal: controller.signal,
    });
    controller.abort();
    expect(await pending).toEqual({ ok: false, reason: 'cancelled' });
  });

  it('clicks the visible reveal button when duplicates exist', async () => {
    mountContact(`
      <button
        type="button"
        data-testid="ad-contact-phone"
        style="display:none"
        id="hidden-phone-btn"
      >Ver número</button>
      <button
        type="button"
        data-testid="ad-contact-phone"
        id="visible-phone-btn"
      >Ver número</button>
    `);

    const hidden = document.getElementById('hidden-phone-btn');
    const visible = document.getElementById('visible-phone-btn');

    const hiddenClick = vi.fn();
    const visibleClick = vi.fn();
    hidden.addEventListener('click', hiddenClick);
    visible.addEventListener('click', () => {
      visibleClick();
      visible.innerHTML =
        '<a href="tel:926811992" data-testid="contact-phone">926 811 992</a>';
    });

    const result = await revealContactPhone({
      root: document,
      timeoutMs: 500,
      intervalMs: 20,
    });

    expect(hiddenClick).not.toHaveBeenCalled();
    expect(visibleClick).toHaveBeenCalled();
    expect(result).toEqual({
      ok: true,
      phone: '926811992',
      clicked: true,
      alreadyVisible: false,
    });
  });

  it('prefers CSS-visible button when rects are 0×0 (Tampermonkey sandbox)', async () => {
    mountContact(`
      <button
        type="button"
        data-testid="ad-contact-phone"
        style="display:none"
        id="hidden-phone-btn"
      >Ver número</button>
      <button
        type="button"
        data-testid="ad-contact-phone"
        style="display:flex"
        id="visible-phone-btn"
      >Ver número</button>
    `);

    const hidden = document.getElementById('hidden-phone-btn');
    const visible = document.getElementById('visible-phone-btn');
    // Simulate TM sandbox: checkVisibility false-negatives, rects empty.
    hidden.checkVisibility = () => false;
    visible.checkVisibility = () => false;
    hidden.getBoundingClientRect = () => ({
      width: 0,
      height: 0,
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
      x: 0,
      y: 0,
      toJSON() {},
    });
    visible.getBoundingClientRect = () => ({
      width: 0,
      height: 0,
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
      x: 0,
      y: 0,
      toJSON() {},
    });

    const chosen = findPhoneRevealButton(document);
    expect(chosen?.id).toBe('visible-phone-btn');

    visible.addEventListener('click', () => {
      visible.innerHTML =
        '<a href="tel:911111111" data-testid="contact-phone">911 111 111</a>';
    });

    const result = await revealContactPhone({
      root: document,
      timeoutMs: 500,
      intervalMs: 20,
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.phone).toBe('911111111');
    }
  });

  it('invokes React onClick props when present', () => {
    mountContact(`
      <button type="button" data-testid="ad-contact-phone" id="react-btn">
        Ver número
      </button>
    `);
    const btn = document.getElementById('react-btn');
    const onClick = vi.fn();
    btn.__reactProps$test = { onClick };

    expect(invokeReactClick(btn)).toBe(true);
    expect(onClick).toHaveBeenCalledTimes(1);

    clickLikeUser(btn);
    expect(onClick).toHaveBeenCalledTimes(2);
  });
});
