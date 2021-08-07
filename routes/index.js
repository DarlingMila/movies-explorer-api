const router = require('express').Router();

const { createUserValidation, loginValidation } = require('../middlewares/validators');
const { createUser, login } = require('../controllers/users');
const auth = require('../middlewares/auth');
const NotFoundError = require('../errors/not-found-error');

const userRouter = require('./users');
const movieRouter = require('./movies');

router.post('/signup', createUserValidation, createUser);
router.post('/signin', loginValidation, login);

router.use('/users', auth, userRouter);
router.use('/movies', auth, movieRouter);

router.get('*', (req, res, next) => {
  next(new NotFoundError('Запрашиваемый ресурс не найден'));
});

module.exports = router;
