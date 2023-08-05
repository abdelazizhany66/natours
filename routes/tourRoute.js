const express = require('express')
const tourController= require('../controllers/tourController')
const authController = require('../controllers/authController')
const reviewRouter = require('./reviewRoute')

const router = express.Router()

// router.param('id',tourController.checkId)
router.use('/:tourId/reviews',reviewRouter)


// /tours-within/:distance/center/:latlng/unit/:unit
// /tours-within/233/center/34.111745,-118.113491/unit/mi

router.route('/tours-within/:distance/center/:latlng/unit/:unit').get(tourController.getToursWithin)
router.route('/distance/:latlng/unit/:unit').get(tourController.getDistances)

router
.route('/Top-5-cheap')
.get(tourController.aliasTopTours,tourController.getAllTours)
router
.route('/tour-stats')
.get(tourController.getTourStats)
router
.route('/monthly-plan/:year')
.get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide') ,
    tourController.getMonthlyPlan
)

router
.route('/')
.get(tourController.getAllTours)
.post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide') ,
    tourController.createTour
)
router
.route('/:id')
.get(tourController.getTour)
.patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide') ,
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.updateTour
)
.delete(
    authController.protect,
    authController.restrictTo('admin','lead-guide'),
    tourController.deleteTour
)

module.exports = router