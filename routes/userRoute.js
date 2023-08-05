const express = require('express')
const userController = require('../controllers/userController')
const authController = require('../controllers/authController')

const router = express.Router()

router.post('/signup',authController.signUp)
router.post('/login',authController.logIn)
router.get('/logout', authController.logout);


router.post('/forgotpassword',authController.forgotPassword)
router.patch('/resetpassword/:token',authController.resetPassword)

router.use(authController.protect)
router.patch('/updatemypassword', authController.updatePassword)
router.patch('/updateme',
userController.uploadUserPhoto,
userController.userResizePhoto,
userController.updatedMe
)
router.delete('/deleteme',userController.deleteMe)
router.route('/me').get( userController.getMe, userController.getUser)

router.use(authController.restrictTo('admin'))
router
.route('/')
.get(userController.getAllUsers)
.post(userController.createUser)
router
.route('/:id')
.get(userController.getUser)
.patch(userController.updateUser)
.delete(userController.deleteUser)

module.exports = router