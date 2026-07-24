import { describe, expect, it, vi } from 'vitest';
import {
  finishCreateInNewTab,
  openLeadInNewTab,
  reserveLeadTab,
} from '../src-crm-filler/app/open-lead.js';

describe('openLeadInNewTab', () => {
  it('opens the lead path in a new tab when allowed', () => {
    const win = { opener: 'x' };
    const open = vi.fn(() => win);
    const assign = vi.fn();

    const mode = openLeadInNewTab('/main/lead-tasacion/42', {
      open,
      assign,
      origin: 'https://crm.flexicar.pt',
    });

    expect(mode).toBe('new-tab');
    expect(open).toHaveBeenCalledWith(
      'https://crm.flexicar.pt/main/lead-tasacion/42',
      '_blank',
    );
    expect(win.opener).toBeNull();
    expect(assign).not.toHaveBeenCalled();
  });

  it('falls back to same-tab navigation when the popup is blocked', () => {
    const open = vi.fn(() => null);
    const assign = vi.fn();

    const mode = openLeadInNewTab('/crm/leads/abc', {
      open,
      assign,
      origin: 'http://127.0.0.1:4173',
    });

    expect(mode).toBe('same-tab');
    expect(assign).toHaveBeenCalledWith('/crm/leads/abc');
  });
});

describe('reserveLeadTab', () => {
  it('navigates the reserved tab when create finishes', () => {
    const win = { closed: false, opener: 'x', location: { href: 'about:blank' } };
    const open = vi.fn(() => win);
    const assign = vi.fn();

    const tab = reserveLeadTab({
      open,
      assign,
      origin: 'https://crm.flexicar.pt',
    });
    expect(win.opener).toBeNull();
    expect(open).toHaveBeenCalledWith('about:blank', '_blank');

    const mode = tab.go('/main/lead-tasacion/99');
    expect(mode).toBe('new-tab');
    expect(win.location.href).toBe('https://crm.flexicar.pt/main/lead-tasacion/99');
    expect(assign).not.toHaveBeenCalled();
  });

  it('falls back to same-tab when the reserved tab is missing', () => {
    const open = vi.fn(() => null);
    const assign = vi.fn();

    const tab = reserveLeadTab({ open, assign, origin: 'https://crm.flexicar.pt' });
    expect(tab.go('/main/lead-tasacion/1')).toBe('same-tab');
    expect(assign).toHaveBeenCalledWith('/main/lead-tasacion/1');
  });

  it('cancels by closing the reserved tab', () => {
    const win = { closed: false, opener: null, close: vi.fn(), location: { href: '' } };
    const tab = reserveLeadTab({
      open: () => win,
      assign: () => {},
      origin: 'https://crm.flexicar.pt',
    });
    tab.cancel();
    expect(win.close).toHaveBeenCalledOnce();
  });
});

describe('finishCreateInNewTab', () => {
  it('reloads the list page after opening the new lead tab', () => {
    const setStatus = vi.fn();
    const reload = vi.fn();

    finishCreateInNewTab('new-tab', 42, { setStatus }, reload);

    expect(setStatus).toHaveBeenCalledWith(
      'Lead 42 criado. Aberto em nova aba. A atualizar a lista…',
      'ok',
    );
    expect(reload).toHaveBeenCalledOnce();
  });

  it('does not reload when falling back to same-tab navigation', () => {
    const setStatus = vi.fn();
    const reload = vi.fn();

    finishCreateInNewTab('same-tab', 7, { setStatus }, reload);

    expect(reload).not.toHaveBeenCalled();
    expect(setStatus).toHaveBeenCalledWith(
      'Lead 7 criado. Pop-up bloqueado — abrindo nesta aba…',
      'warn',
    );
  });
});
