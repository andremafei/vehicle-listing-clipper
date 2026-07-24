import { afterEach, describe, expect, it } from 'vitest';
import { detectCrmContext } from '../src-crm-filler/app/context.js';

describe('detectCrmContext lead detail', () => {
  const original = {
    hostname: location.hostname,
    pathname: location.pathname,
  };

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {
        ...location,
        hostname: original.hostname,
        pathname: original.pathname,
      },
    });
  });

  /**
   * @param {string} hostname
   * @param {string} pathname
   */
  function stubLocation(hostname, pathname) {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {
        ...window.location,
        hostname,
        pathname,
      },
    });
  }

  it('marks Flexicar lead detail pages', () => {
    stubLocation('crm.flexicar.pt', '/main/lead-tasacion/198070');
    expect(detectCrmContext()).toEqual({
      kind: 'leadDetail',
      leadId: '198070',
      label: 'CRM · Lead 198070',
      backend: 'flexicar',
    });
  });

  it('marks LeadDesk lead detail pages on loopback /crm', () => {
    stubLocation('127.0.0.1', '/crm/leads/lead-1');
    expect(detectCrmContext()).toMatchObject({
      kind: 'leadDetail',
      leadId: 'lead-1',
      backend: 'leaddesk',
    });
  });
});
