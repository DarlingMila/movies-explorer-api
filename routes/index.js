const router = require('express').Router();

const { createUserValidation, loginValidation } = require('../middlewares/validators');
const { createUser, login } = require('../controllers/users');
const auth = require('../middlewares/auth');
const UnauthorizedError = require('../errors/unauthorized-error');

const userRouter = require('./users');
const movieRouter = require('./movies');

router.post('/signup', createUserValidation, createUser);
router.post('/signin', loginValidation, login);

router.use('/users', auth, userRouter);
router.use('/movies', auth, movieRouter);

router.all('*', auth, (req, res, next) => {
  next(new UnauthorizedError('Запрашиваемый ресурс не найден'));
});

module.exports = router;
