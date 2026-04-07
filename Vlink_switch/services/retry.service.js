const MAX_RETRY = 3;

const shouldRetry = (retryCount) => {
  return retryCount < MAX_RETRY;
};

module.exports = { shouldRetry, MAX_RETRY };
