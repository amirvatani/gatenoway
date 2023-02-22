const {
  UPLOAD_FILE_ENABLED,
  MAX_BODY_PAYLOAD,
  URI_MAX_LENGTH,
  GLOBAL_TIMEOUT,
} = require("#constant/environment");

var LIMITER_CONFIG = {
  enable: true,
  file_uploads: UPLOAD_FILE_ENABLED == "true",
  post_max_size: MAX_BODY_PAYLOAD,
  global_timeout: GLOBAL_TIMEOUT,
  uri_max_length: URI_MAX_LENGTH,
};

module.exports = {
  LIMITER_CONFIG,
};
