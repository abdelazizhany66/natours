const stripe = require('stripe')(process.env.SCRIPE_SECRET_KEY)
const Booking = require('../models/bookingModel')
const Tour = require('../models/tourModel')
const User = require('../models/userModel')

const catchAsync = require('../utils/catchAsync')
const factory = require('./handllerFactory')


exports.getCheckoutSession = catchAsync(async(req, res, next) =>{
    // 1) Get the currently booked tour
   const tour = await Tour.findById(req.params.tourId)

   const transformedItems = [{
       quantity: 1,
       price_data: {
           currency: "usd",
           unit_amount: tour.price * 100,
           product_data: {
               name: `${tour.name} Tour`,
               description: tour.summary, //summary here
               images: [`${req.protocol}://${req.get('host')}/img/tours/${tour.imageCover}`], //only accepts live images (images hosted on the internet),
           },
       },
   }]

    // 2) Create checkout session
   const session = await stripe.checkout.sessions.create({
       payment_method_types: ['card'],
       // success_url: `${req.protocol}://${req.get('host')}/`, //user will be redirected to this url when payment is successful. home page
       // cancel_url: `${req.protocol}://${req.get('host')}/${tour.slug}`, //user will be redirected to this url when payment has an issue. tour page (previous page)
       success_url: `${req.protocol}://${req.get('host')}/my-tours`,
       cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
       customer_email: req.user.email,
       client_reference_id: req.params.tourId, //this field allows us to pass in some data about this session that we are currently creating.
       line_items: transformedItems,
       mode: 'payment',

   })

    // 3) Create session as response
    res.status(200).json({
       status: 'success',
       session
    
    })
})


const createBookingCheckout = async session =>{
  const tour = session.client_reference_id
  const user = (await User.findOne({email:session.customer_email})).id
  const price = session.line_items.transformedItems[0].unit_amount/100
   await Booking.create({user,tour,price})
}

exports.webhooksCheckout = (req, res, next)=>{
    const signature = req.headers['stripe-signature']  //Checks if webhooks was sent by stripe
    let event;
    try{
      event = stripe.webhooks.constructEvent( //Create an event object to check the reliability of the payload
        req.body,
        signature,
        process.env.STRIPE_WEBHOOKS_WEBHOOKS //Secure the body so that no one plays in the data 
        
        )
    }catch(err){
     return   res.status(400).send(`error in webhooks${err}`)     
    }

    if(event.type === 'checkout.session.completed') //if this success go to create booking in data base
        createBookingCheckout(event.data.object) //event.data.object This indicates that the purchase was successful
        res.status(200).json({ received: true });
}

exports.getMyTour = catchAsync(async(req, res, next)=>{
    //find all booking for current user
    const bookings = await Booking.find({user:req.user.id})
    const tourId = bookings.map(el=> el.tour)
    const tour = await Tour.find({tour:{$in:tourId}})
    res.status(200).json({
        status:'success',
        tour
    })
})

exports.createBooking = factory.createOne(Booking)
exports.getBooking = factory.getOne(Booking)
exports.getAllBooking = factory.getAll(Booking)
exports.updateBooking = factory.updateOne(Booking)
exports.deleteBooking = factory.deleteOne(Booking)