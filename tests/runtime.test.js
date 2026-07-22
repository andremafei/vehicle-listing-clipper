import { afterEach, describe, expect, it } from 'vitest';
import {
  __setOrtOverride,
  createInferenceSession,
  getActiveProvider,
} from '../src/anpr/runtime.js';
import mockOrt from './mocks/onnxruntime-web.js';

describe('ORT runtime provider fallback', () => {
  afterEach(() => {
    __setOrtOverride(null);
    delete globalThis.__VLC_FORCE_WEBGPU_FAIL__;
  });

  it('falls back to wasm when webgpu fails', async () => {
    __setOrtOverride(mockOrt);
    globalThis.__VLC_FORCE_WEBGPU_FAIL__ = true;
    const { provider } = await createInferenceSession(new ArrayBuffer(8));
    expect(provider).toBe('wasm');
    expect(getActiveProvider()).toBe('wasm');
  });
});
