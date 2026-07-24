import { afterEach, describe, expect, it, vi } from 'vitest';
import { createFillerPanel } from '../src-crm-filler/app/panel.js';

describe('CRM filler panel minimize/expand', () => {
  afterEach(() => {
    document.getElementById('lead-crm-filler-root')?.remove();
  });

  it('starts expanded and toggles minimize via the header control', () => {
    const panel = createFillerPanel({
      onReadClipboard() {},
      onParseText() {},
      onCreate() {},
    });

    const host = document.getElementById('lead-crm-filler-root');
    const shadow = host.shadowRoot;
    const shell = shadow.querySelector('.lcf-panel');
    const body = shadow.querySelector('.lcf-body');
    const miniBtn = shadow.querySelector('.lcf-mini');

    expect(panel.isMinimized()).toBe(false);
    expect(shell.classList.contains('lcf-panel--minimized')).toBe(false);
    expect(body.hidden).toBe(false);
    expect(miniBtn.textContent).toBe('–');
    expect(miniBtn.getAttribute('aria-label')).toBe('Minimizar painel');

    miniBtn.click();
    expect(panel.isMinimized()).toBe(true);
    expect(shell.classList.contains('lcf-panel--minimized')).toBe(true);
    expect(body.hidden).toBe(true);
    expect(miniBtn.textContent).toBe('+');
    expect(miniBtn.getAttribute('aria-label')).toBe('Expandir painel');

    miniBtn.click();
    expect(panel.isMinimized()).toBe(false);
    expect(shell.classList.contains('lcf-panel--minimized')).toBe(false);
    expect(body.hidden).toBe(false);
    expect(miniBtn.textContent).toBe('–');
  });

  it('supports programmatic setMinimized for lead detail pages', () => {
    const panel = createFillerPanel({
      onReadClipboard() {},
      onParseText() {},
      onCreate() {},
    });

    const host = document.getElementById('lead-crm-filler-root');
    const shadow = host.shadowRoot;
    const shell = shadow.querySelector('.lcf-panel');

    panel.setMinimized(true);
    expect(panel.isMinimized()).toBe(true);
    expect(shell.classList.contains('lcf-panel--minimized')).toBe(true);

    panel.setMinimized(false);
    expect(panel.isMinimized()).toBe(false);
    expect(shell.classList.contains('lcf-panel--minimized')).toBe(false);
  });
});

describe('CRM filler panel actions', () => {
  afterEach(() => {
    document.getElementById('lead-crm-filler-root')?.remove();
  });

  it('exposes only clipboard and create actions with shortcuts', () => {
    const onReadClipboard = vi.fn();
    const onCreate = vi.fn();
    const onOpen = vi.fn();
    const panel = createFillerPanel({
      onReadClipboard,
      onParseText() {},
      onCreate,
    });

    const host = document.getElementById('lead-crm-filler-root');
    const shadow = host.shadowRoot;
    const buttons = [...shadow.querySelectorAll('.lcf-actions .lcf-btn')];
    const labels = buttons.map((btn) => btn.querySelector('span')?.textContent);

    expect(labels).toEqual(['Ler área de transferência', 'Criar lead']);
    expect(shadow.querySelector('.lcf-btn-primary')).toBeTruthy();
    expect(shadow.querySelector('.lcf-btn-success')).toBeTruthy();
    expect(shadow.textContent).not.toContain('Analisar texto');
    expect(shadow.textContent).not.toContain('Verificar cadastro');

    panel.setCreateVisible(true, true);
    panel.setMatches(
      [
        { id: 'lead-1', title: 'Lead 1', subtitle: 'first' },
        { id: 'lead-2', title: 'Lead 2', subtitle: 'second' },
      ],
      onOpen,
    );

    window.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'v', code: 'KeyV', altKey: true }),
    );
    window.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'b', code: 'KeyB', altKey: true }),
    );
    window.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'a', code: 'KeyA', altKey: true }),
    );

    expect(onReadClipboard).toHaveBeenCalledTimes(1);
    expect(onCreate).toHaveBeenCalledTimes(1);
    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(onOpen).toHaveBeenCalledWith('lead-1');

    panel.destroy();
  });

  it('expands a minimized panel when Alt+V reads the clipboard', () => {
    const onReadClipboard = vi.fn();
    const panel = createFillerPanel({
      onReadClipboard,
      onParseText() {},
      onCreate() {},
    });

    panel.setMinimized(true);
    expect(panel.isMinimized()).toBe(true);

    window.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'v', code: 'KeyV', altKey: true }),
    );

    expect(panel.isMinimized()).toBe(false);
    expect(onReadClipboard).toHaveBeenCalledTimes(1);

    panel.destroy();
  });
});
