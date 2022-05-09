const Router = require('express').Router;
const UserController = require('../controllers/user-controller');
const CardController = require('../controllers/card-controller');

const authMiddleware = require('../middlewares/auth-middleware');
const rootMiddleware = require('../middlewares/root-middleware');
const {body} = require("express-validator");

const router = new Router();

router.post('/register',

    body('email').isEmail(),
    body('password').isLength({
        min: 6,
        max: 32,
    }),

    UserController.register);

router.post('/login', UserController.login);
router.post('/logout', authMiddleware, UserController.logout);
router.get('/refresh', UserController.refresh);
router.put('/password',
    body('data.newPassword').isLength({
        min: 6,
        max: 32,
    }),
    UserController.changePassword);

router.get('/farm', rootMiddleware, UserController.startFarm);

router.get('/cards', CardController.getCards);
router.post('/cards', CardController.makeCard);

router.put('/users', UserController.updateProfile);

module.exports = router;