import { describe, expect, it } from 'vitest';
import {
  getAdapter,
  resolveAdapter,
} from '../src/adapters/registry.js';

describe('adapter registry', () => {
  it('registers olx-pt and standvirtual-pt', () => {
    expect(getAdapter('olx-pt')?.siteId).toBe('olx-pt');
    expect(getAdapter('standvirtual-pt')?.siteId).toBe('standvirtual-pt');
  });

  it('resolves Standvirtual by hostname', () => {
    expect(resolveAdapter('www.standvirtual.com').siteId).toBe(
      'standvirtual-pt',
    );
    expect(resolveAdapter('standvirtual.com').siteId).toBe('standvirtual-pt');
  });

  it('resolves OLX by hostname and as default', () => {
    expect(resolveAdapter('www.olx.pt').siteId).toBe('olx-pt');
    expect(resolveAdapter('').siteId).toBe('olx-pt');
    expect(resolveAdapter('127.0.0.1').siteId).toBe('olx-pt');
  });
});
