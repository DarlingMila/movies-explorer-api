const error = (err, req, res) => {
  const { statusCode = 500, message } = err;

  return res
    .status(statusCode)
    .send({
      message: statusCode === 500
        ? 'На сервере произошла ошибка!'
        : message,
    });
};

module.exports = error;
