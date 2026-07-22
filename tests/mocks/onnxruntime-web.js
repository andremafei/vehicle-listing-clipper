export class Tensor {
  /**
   * @param {string} type
   * @param {ArrayBufferView|ArrayLike<number>} data
   * @param {number[]} dims
   */
  constructor(type, data, dims) {
    this.type = type;
    this.data = data;
    this.dims = dims;
  }
}

export const env = {
  wasm: {
    wasmPaths: '',
    numThreads: 1,
  },
};

export const InferenceSession = {
  /**
   * @param {ArrayBuffer} _model
   * @param {{ executionProviders?: string[] }} [options]
   */
  async create(_model, options = {}) {
    const providers = options.executionProviders || [];
    if (providers.includes('webgpu') && globalThis.__VLC_FORCE_WEBGPU_FAIL__) {
      throw new Error('webgpu unavailable');
    }
    return {
      async run() {
        return {};
      },
    };
  },
};

const ort = { Tensor, env, InferenceSession };
export default ort;
