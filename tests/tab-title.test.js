import { afterEach, describe, expect, it } from 'vitest';
import {
  applyTabTitleForPhase,
  phaseToTabPrefix,
  restoreTabTitle,
  stripTabTitlePrefix,
} from '../src/ui/tab-title.js';

describe('tab title status prefixes', () => {
  afterEach(() => {
    restoreTabTitle({ title: '' });
  });

  it('maps capture phases to emoji prefixes', () => {
    expect(phaseToTabPrefix('waiting')).toBe('\u23F3');
    expect(phaseToTabPrefix('reading')).toBe('\u23F3');
    expect(phaseToTabPrefix('analisando imagem 2 de 5')).toBe('\u23F3');
    expect(phaseToTabPrefix('lendo tel')).toBe('\u{1F514}');
    expect(phaseToTabPrefix('ready to copy')).toBe('\u{1F4CB}');
    expect(phaseToTabPrefix('data copied')).toBe('\u2705');
    expect(phaseToTabPrefix('No data found.')).toBe('\u26D4');
    expect(phaseToTabPrefix('Cancelled.')).toBeNull();
  });

  it('strips a known prefix without stacking', () => {
    expect(stripTabTitlePrefix('\u23F3 Fiat Punto')).toBe('Fiat Punto');
    expect(stripTabTitlePrefix('\u{1F4CB} Fiat Punto')).toBe('Fiat Punto');
    expect(stripTabTitlePrefix('Fiat Punto')).toBe('Fiat Punto');
  });

  it('applies phases without stacking prefixes and restores base title', () => {
    const doc = { title: 'Fiat Punto · OLX' };

    applyTabTitleForPhase('waiting', doc);
    expect(doc.title).toBe('\u23F3 Fiat Punto · OLX');

    applyTabTitleForPhase('lendo tel', doc);
    expect(doc.title).toBe('\u{1F514} Fiat Punto · OLX');

    applyTabTitleForPhase('ready to copy', doc);
    expect(doc.title).toBe('\u{1F4CB} Fiat Punto · OLX');

    applyTabTitleForPhase('data copied', doc);
    expect(doc.title).toBe('\u2705 Fiat Punto · OLX');

    restoreTabTitle(doc);
    expect(doc.title).toBe('Fiat Punto · OLX');
  });

  it('captures base title from an already-prefixed document.title', () => {
    const doc = { title: '\u23F3 Anúncio já prefixado' };

    applyTabTitleForPhase('ready to copy', doc);
    expect(doc.title).toBe('\u{1F4CB} Anúncio já prefixado');

    restoreTabTitle(doc);
    expect(doc.title).toBe('Anúncio já prefixado');
  });
});
