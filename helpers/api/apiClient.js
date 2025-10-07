const { request } = require('@playwright/test');

/**
 * Generic API client for interacting with Penpot API endpoints via Playwright request.
 *
 * Provides methods for GET, POST, PUT, DELETE requests, automatic URL prefixing,
 * authentication via access token, and capturing storage state for browser contexts.
 */
class ApiClient {
  constructor(baseURL, accessToken) {
    this.baseURL = baseURL;
    this.accessToken = accessToken;
    this.context = null;
  }

  async init() {
    this.context = await request.newContext({
      baseURL: this.baseURL,
      extraHTTPHeaders: {
        'Content-Type': 'application/json',
        ...(this.accessToken ? { Authorization: `Token ${this.accessToken}` } : {}),
      },
    });
  }

  buildUrl(endpoint) {
    const prefix = 'api/rpc/command/';
    return `${prefix}${endpoint}`;
  }

  async get(endpoint, options = {}) {
    return this.context.get(this.buildUrl(endpoint), options);
  }

  async post(endpoint, data, options = {}) {
    return this.context.post(this.buildUrl(endpoint), { data, ...options });
  }

  async put(endpoint, data, options = {}) {
    return this.context.put(this.buildUrl(endpoint), { data, ...options });
  }

  async delete(endpoint, options = {}) {
    return this.context.delete(this.buildUrl(endpoint), options);
  }

  async dispose() {
    await this.context?.dispose();
  }

  async storageState() {
    return this.context.storageState();
  }
}

module.exports = { ApiClient };
