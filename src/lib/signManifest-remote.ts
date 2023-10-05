import fetch from 'node-fetch';

const URL = process.env.URL || 'https://localhost:3000/api/sign-manifest';
const HEADERS = process.env.HEADERS || {};
HEADERS['Content-Type'] = 'application/json';

/**
 * Signs a manifest and returns the signature.
 *
 * @param {string} manifest - manifest to sign
 * @returns {Buffer} - signature for given manifest
 */
export async function signManifest(manifest: string): Promise<Buffer> {
  return await fetch(URL, {
    method: 'POST',
    headers: HEADERS,
    body: manifest,
  })
    .then(async (res) => {
      if (res.status !== 200) {
        throw new Error(`Failed to sign manifest: ${res.statusText}`);
      }
      return res.buffer();
    })
    .catch(err => {
      throw new Error(`Failed to sign manifest: ${err}`);
    });
}
