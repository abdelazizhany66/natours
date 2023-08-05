const express = require('express')
const bookingController = require('../controllers/bookingController')
const authController = require('../controllers/authController')

const router = express.Router()

router.use(authController.protect)
router.get(
    '/checkout-sessions/:tourId',
    bookingController.getCheckoutSession
    )
router.get('/mytours',
bookingController.getMyTour)

router.use(authController.restrictTo('admin', 'guide-lead'))

router.route('/')
.get(bookingController.getAllBooking)
.post(bookingController.createBooking)

router.route('/:id')
.get(bookingController.getBooking)
.patch(bookingController.updateBooking)
.delete(bookingController.deleteBooking)

module.exports = router