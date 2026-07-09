function handleHttpError(res, error, fallbackMessage) {
  const statusCode = error.statusCode || 500;

  return res.status(statusCode).json({
    message: error.message || fallbackMessage
  });
}

module.exports = {
  handleHttpError
};
