const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

const BadRequestError = require('../errors/bad-request-error');
const UnauthorizedError = require('../errors/unauthorized-error');
const ConflictError = require('../errors/conflict-error');

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
          res.status(200).send({ user });
        })
        .catch((err) => {
          if (err.name === 'MongoError' && err.code === 11000) {
            next(new ConflictError('Пользователь с данной почтой уже существует'));
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
        throw new UnauthorizedError('Пользователь с данной почтой не найден');
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

        return res.status(200).send({
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
      res.status(200).send({
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
    .then((user) => res.status(200).send({
      email: user.email,
      name: user.name,
    }))
    .catch(next);
};

module.exports = {
  createUser,
  login,
  getUserInfo,
  updateUserInfo,
};
