import axios from 'axios';
import toml from 'toml';
import {Config} from "./config";

// FONERO_TOML_MAX_SIZE is the maximum size of fonero.toml file
export const FONERO_TOML_MAX_SIZE = 100 * 1024;

/**
 * FoneroTomlResolver allows resolving `fonero.toml` files.
 */
export class FoneroTomlResolver {
  /**
   * Returns a parsed `fonero.toml` file for a given domain.
   * Returns a `Promise` that resolves to the parsed fonero.toml object. If `fonero.toml` file does not exist for a given domain or is invalid Promise will reject.
   * ```js
   * FoneroSdk.FoneroTomlResolver.resolve('acme.com')
   *   .then(foneroToml => {
   *     // foneroToml in an object representing domain fonero.toml file.
   *   })
   *   .catch(error => {
   *     // fonero.toml does not exist or is invalid
   *   });
   * ```
   * @see <a href="https://www.fonero.org/developers/learn/concepts/fonero-toml.html" target="_blank">Fonero.toml doc</a>
   * @param {string} domain Domain to get fonero.toml file for
   * @param {object} [opts]
   * @param {boolean} [opts.allowHttp] - Allow connecting to http servers, default: `false`. This must be set to false in production deployments!
   * @param {number} [opts.timeout] - Allow a timeout, default: 0. Allows user to avoid nasty lag due to TOML resolve issue.
   * @returns {Promise}
   */
  static resolve(domain, opts = {}) {
    let allowHttp = Config.isAllowHttp();
    let timeout = Config.getTimeout();

    if (typeof opts.allowHttp !== 'undefined') {
        allowHttp = opts.allowHttp;
    }

    if (typeof opts.timeout === 'number') {
      timeout = opts.timeout;
    } 

    let protocol = 'https';
    if (allowHttp) {
        protocol = 'http';
    }

    return axios.get(`${protocol}://${domain}/.well-known/fonero.toml`, {maxContentLength: FONERO_TOML_MAX_SIZE, timeout})
      .then(response => {
      	try {
            let tomlObject = toml.parse(response.data);
            return Promise.resolve(tomlObject);
        } catch (e) {
            return Promise.reject(new Error(`Parsing error on line ${e.line}, column ${e.column}: ${e.message}`));
        }
      })
      .catch(err => {
        if (err.message.match(/^maxContentLength size/)) {
          throw new Error(`fonero.toml file exceeds allowed size of ${FONERO_TOML_MAX_SIZE}`);
        } else {
          throw err;
        }
      });
  }
}
