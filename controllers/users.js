const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

const BadRequestError = require('../errors/bad-request-error');
const UnauthorizedError = require('../errors/unauthorized-error');
const ConflictError = require('../errors/conflict-error');
const InternalServerError = require('../errors/internal-server-error');

const { SALT, NODE_ENV, JWT_KEY } = process.env;

const createUser = (req, res, next) => {
  const {
    email,
    password,
    name,
  } = req.body;

  bcrypt.hash(password, Number(SALT))
    .then((hash) => {
      User.create({
        email,
        password: hash,
        name,
      })
        .then((user) => {
          res.send({
            email: user.email,
            name: user.name,
            _id: user._id,
          });
        })
        .catch((err) => {
          if (err.name === 'MongoError' && err.code === 11000) {
            next(new ConflictError('Пользователь с данной почтой уже существует'));
          } else {
            next(err);
          }
        });
    });
};

const login = (req, res, next) => {
  const {
    email,
    password,
  } = req.body;

  User.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        throw new UnauthorizedError('Необходима авторизация');
      }

      return bcrypt.compare(password, user.password, ((error, isValid) => {
        if (error) {
          throw new BadRequestError('Переданы некорректные данные');
        }

        if (!isValid) {
          throw new UnauthorizedError('Почта или пароль введены неверно');
        }

        const token = jwt.sign(
          { _id: user._id },
          NODE_ENV === 'production' ? JWT_KEY : 'dev-secret',
          { expiresIn: '7d' },
        );

        return res.send({
          message: 'Вход выполнен',
          token,
        });
      }));
    })
    .catch(next);
};

const getUserInfo = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => {
      res.send({
        email: user.email,
        name: user.name,
      });
    })
    .catch(next);
};

const updateUserInfo = (req, res, next) => {
  const userId = req.user._id;

  const {
    email,
    name,
  } = req.body;

  User.findById(userId)
    .then((user) => {
      if (userId !== String(user._id)) {
        throw new InternalServerError('Запрос не может быть выполнен');
      } else {
        User.findByIdAndUpdate(
          userId,
          {
            email,
            name,
          },
          {
            new: true,
            runValidators: true,
            upsert: true,
          },
        )
          .then((newUser) => res.send({
            email: newUser.email,
            name: newUser.name,
          }))
          .catch(next);
      }
    })
    .catch(next);
};

module.exports = {
  createUser,
  login,
  getUserInfo,
  updateUserInfo,
};
