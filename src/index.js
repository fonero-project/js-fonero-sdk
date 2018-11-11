require('es6-promise').polyfill();

// fonero-sdk classes to expose
export * from "./errors";
export {Config} from "./config";
export {Server} from "./server";
export {FederationServer, FEDERATION_RESPONSE_MAX_SIZE} from "./federation_server";
export {FoneroTomlResolver, FONERO_TOML_MAX_SIZE} from "./fonero_toml_resolver";

// expose classes and functions from fonero-base
export * from "fonero-base";

export default module.exports;
