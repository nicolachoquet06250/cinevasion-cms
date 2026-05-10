// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import auth from 'auth-astro';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: node({
    mode: 'standalone',
  }),
  integrations: [auth()],
  security: {
    // Auth.js validates credentials callbacks with its own CSRF token.
    // Behind Alwaysdata's reverse proxy, Astro can compare the browser Origin
    // with the internal request origin and block form-encoded auth POSTs with 403.
    checkOrigin: false,
  },
  devToolbar: {
    enabled: false
  }
});
