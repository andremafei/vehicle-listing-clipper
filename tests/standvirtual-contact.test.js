import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  findPhoneRevealButton,
  readRevealedPhone,
  revealContactPhone,
} from '../src/adapters/standvirtual-pt/contact.js';

const POS_FIXTURES = {
  fiat: resolve(
    process.cwd(),
    'dev/fixtures/standvirtual-real-pos-phone-review.html',
  ),
  mercedes: resolve(
    process.cwd(),
    'dev/fixtures/standvirtual-real-pos-phone-review-example-2.html',
  ),
};

const hasFiatPos = existsSync(POS_FIXTURES.fiat);
const hasMercedesPos = existsSync(POS_FIXTURES.mercedes);

function mountSeller(html) {
  document.body.innerHTML = html;
  return document;
}

describe('standvirtual-pt contact phone reveal', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('finds Ver telefone in aside seller info', () => {
    mountSeller(`
      <aside data-testid="aside-seller-info">
        <button type="button"><span>Ver telefone</span></button>
      </aside>
      <div data-testid="seller-info-contact-box">
        <button type="button"><span>Ver telefone</span></button>
      </div>
    `);
    const btn = findPhoneRevealButton(document);
    expect(btn?.textContent).toMatch(/Ver telefone/i);
    expect(
      btn?.closest('[data-testid="aside-seller-info"]'),
    ).toBeTruthy();
  });

  it('reads phone from tel: href when already visible', () => {
    mountSeller(`
      <aside data-testid="aside-seller-info">
        <a href="tel:914630710">
          <button type="button"><span>914630710</span></button>
        </a>
      </aside>
    `);
    expect(readRevealedPhone(document)).toBe('914630710');
  });

  it('reads full landline when tel: href contains spaces', () => {
    mountSeller(`
      <aside data-testid="aside-seller-info">
        <a rel="nofollow" href="tel:21 145 5787" data-button-variant="secondary">
          <span class="n-button-text-wrapper">21 145 5787</span>
        </a>
      </aside>
    `);
    expect(readRevealedPhone(document)).toBe('211455787');
  });

  it('strips Portugal +351 country code from tel: href', () => {
    mountSeller(`
      <aside data-testid="aside-seller-info">
        <a href="tel:+351 914 746 358">
          <button type="button"><span class="n-button-text-wrapper">914 746 358</span></button>
        </a>
      </aside>
    `);
    expect(readRevealedPhone(document)).toBe('914746358');
  });

  it('returns no-button when reveal control is missing', async () => {
    mountSeller('<p>no phone</p>');
    const result = await revealContactPhone({ root: document, timeoutMs: 50 });
    expect(result).toEqual({ ok: false, reason: 'no-button' });
  });

  it('clicks reveal and waits for the phone link', async () => {
    mountSeller(`
      <aside data-testid="aside-seller-info">
        <div class="phone-wrap">
          <button type="button" id="reveal"><span>Ver telefone</span></button>
        </div>
      </aside>
    `);
    const button = document.getElementById('reveal');
    button.addEventListener('click', () => {
      setTimeout(() => {
        const wrap = document.querySelector('.phone-wrap');
        wrap.innerHTML = `
          <a href="tel:914630710">
            <button type="button"><span>914630710</span></button>
          </a>
        `;
      }, 80);
    });

    const result = await revealContactPhone({
      root: document,
      timeoutMs: 1000,
      intervalMs: 20,
    });

    expect(result).toEqual({
      ok: true,
      phone: '914630710',
      clicked: true,
      alreadyVisible: false,
    });
  });

  it('skips click when phone is already visible', async () => {
    mountSeller(`
      <aside data-testid="aside-seller-info">
        <a href="tel:911776023">
          <button type="button"><span>911776023</span></button>
        </a>
        <button type="button" id="reveal"><span>Ver telefone</span></button>
      </aside>
    `);
    const clicked = vi.fn();
    document.getElementById('reveal')?.addEventListener('click', clicked);

    const result = await revealContactPhone({ root: document, timeoutMs: 200 });
    expect(result).toEqual({
      ok: true,
      phone: '911776023',
      clicked: false,
      alreadyVisible: true,
    });
    expect(clicked).not.toHaveBeenCalled();
  });

  it.skipIf(!hasFiatPos)(
    'reads phone from real POS fixture (Fiat)',
    () => {
      document.documentElement.innerHTML = readFileSync(POS_FIXTURES.fiat, 'utf8');
      expect(readRevealedPhone(document)).toBe('914630710');
    },
  );

  it.skipIf(!hasMercedesPos)(
    'reads phone from real POS fixture (Mercedes)',
    () => {
      document.documentElement.innerHTML = readFileSync(
        POS_FIXTURES.mercedes,
        'utf8',
      );
      expect(readRevealedPhone(document)).toBe('911776023');
    },
  );
});
