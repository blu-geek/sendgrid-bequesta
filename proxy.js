/**
 * Deprecated shim: proxy.js moved to api/proxy.js
 *
 * The implementation has been moved to api/proxy.js. This file re-exports
 * the new location to preserve compatibility for any code that still
 * requires('./proxy.js'). Remove this shim when you're ready to fully
 * delete the root-level proxy.js file.
 */

module.exports = require('./api/proxy.js');
