const { celebrate, Joi } = require('celebrate');
const validator = require('validator');
const BadRequestError = require('../errors/bad-request-error');

const emailValidation = (value) => {
  const result = validator.isEmail(value);
  if (!result) {
    throw new BadRequestError('Почта введена некорректно!');
  } else {
    return value;
  }
};

const nameValidation = (value) => {
  const result = /[А-ЯЁ][а-яё]+/.test(value);
  if (!result) {
    throw new BadRequestError('Имя должно быть на русском и начинаться с большой буквы');
  } else {
    return value;
  }
};

const urlValidation = (value) => {
  const result = validator.isURL(value);
  if (!result) {
    throw new BadRequestError('Ссылка на картинку некорректна');
  } else {
    return value;
  }
};

const ruLangValidation = (value) => {
  const result = /[А-ЯЁа-яё\d !?-]+/.test(value);
  if (!result) {
    throw new BadRequestError('Название фильма должно быть на русском');
  } else {
    return value;
  }
};

const enLangValidation = (value) => {
  const result = /[A-Za-z\d !?-]+/.test(value);
  if (!result) {
    throw new BadRequestError('Название фильма должно быть на английскомт');
  } else {
    return value;
  }
};

const createUserValidation = celebrate({
  body: Joi.object().keys({
    email: Joi.string().trim().required()
      .custom(emailValidation)
      .messages({
        'string.empty': 'Поле "email" должно быть заполнено',
      }),
    password: Joi.string().required()
      .messages({
        'string.empty': 'Введить пароль',
      }),
    name: Joi.string().min(2).max(30)
      .custom(nameValidation)
      .messages({
        'string.min': 'Имя не должно быть короче 2-х символов',
        'string.max': 'Имя не должно быть длиннее 30-и символов',
        'string.empty': 'Поле "имя" должно быть заполнено',
      }),
  }),
});

const loginValidation = celebrate({
  body: Joi.object().keys({
    email: Joi.string().trim().required()
      .custom(emailValidation)
      .messages({
        'string.empty': 'Поле "email" должно быть заполнено',
      }),
    password: Joi.string().required()
      .messages({
        'string.empty': 'Введить пароль',
      }),
  }),
});

const updateUserInfoValidation = celebrate({
  body: Joi.object().keys({
    email: Joi.string().trim().required()
      .custom(emailValidation)
      .messages({
        'string.empty': 'Поле "email" должно быть заполнено',
      }),
    name: Joi.string().min(2).max(30)
      .custom(nameValidation)
      .messages({
        'string.min': 'Имя не должно быть короче 2-х символов',
        'string.max': 'Имя не должно быть длиннее 30-и символов',
        'string.empty': 'Поле "имя" должно быть заполнено',
      }),
  }),
});

const createMovieValidation = celebrate({
  body: Joi.object().keys({
    country: Joi.string().required().messages({
      'string.empty': 'Поле должно быть заполнено',
    }),
    director: Joi.string().required().messages({
      'string.empty': 'Поле должно быть заполнено',
    }),
    duration: Joi.number().required().messages({
      'string.empty': 'Поле должно быть заполнено',
    }),
    year: Joi.string().required().messages({
      'string.empty': 'Поле должно быть заполнено',
    }),
    description: Joi.string().required().messages({
      'string.empty': 'Поле должно быть заполнено',
    }),
    image: Joi.string().required().custom(urlValidation).messages({
      'string.empty': 'Поле должно быть заполнено',
    }),
    trailer: Joi.string().required().custom(urlValidation).messages({
      'string.empty': 'Поле должно быть заполнено',
    }),
    thumbnail: Joi.string().required().custom(urlValidation).messages({
      'string.empty': 'Поле должно быть заполнено',
    }),
    movieId: Joi.string().required().messages({
      'string.empty': 'Поле должно быть заполнено',
    }),
    nameRU: Joi.string().required().custom(ruLangValidation).messages({
      'string.empty': 'Поле должно быть заполнено',
    }),
    nameEN: Joi.string().required().custom(enLangValidation).messages({
      'string.empty': 'Поле должно быть заполнено',
    }),
  }),
});

const deleteMovieValidation = celebrate({
  params: Joi.object().keys({
    movieId: Joi.string().length(24).hex(),
  }).unknown(true),
});

module.exports = {
  createUserValidation,
  loginValidation,
  updateUserInfoValidation,
  createMovieValidation,
  deleteMovieValidation,
};
