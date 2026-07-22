import { APP_NAME, isLocal } from './environment.js';

export const config = {
  appName: APP_NAME,
  version: isLocal ? '0.0.0-dev' : '0.2.0',
  githubOwner: 'andremafei',
  githubRepo: 'vehicle-listing-clipper',
  devServerOrigin: 'http://127.0.0.1:4173',
  devBundlePath: '/vehicle-listing-clipper.dev.js',
};
