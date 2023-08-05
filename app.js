const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const hpp = require('hpp')
const path = require('path')
const compression = require('compression')
// const bodyParser = require('body-parser')
// const cors = require('cors')

const AppError = require('./utils/appError')
const globalErrorHandller = require('./controllers/errorcontroller')
const tourRouter = require('./routes/tourRoute')
const userRouter = require('./routes/userRoute');
const reviewRouter = require('./routes/reviewRoute')
const bookingRouter = require('./routes/bookingRoute')
const bookingController = require('./controllers/bookingController')



const app = express();

// app.use(cors())
// app.use(bodyParser.json())
// app.use(bodyParser.urlencoded({extended:false}))


app.set('view engine','pug')
app.set('view', path.join(__dirname, 'view'))

//1)MIDDLEWARES
// app.use(express.static(path.join(__dirname,'public')))

app.use(helmet())
const limiter = rateLimit({
   max:100,
   windowMs:60*60*1000,
   message:'Too many request from this IP , please try again in an hour!' 
})
app.use('/api', limiter)
if(process.env.NODE_ENV==='development'){
    app.use(morgan('dev'))
}
app.use(express.json())
// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp({
    whitelist:[
    'duration',
    'ratingsQuantity',
    'ratingsAverage',
    'maxGroupSize',
    'difficulty',
    'price']
}))

app.use(compression()) //All sauces that will be sent to the customer will be compressed



// app.get('/api/v1/tours',getAllTour)
// app.get('/api/v1/tours/:id',getTour)
// app.post('/api/v1/tours',createTour)
// app.patch('/api/v1/tours/:id',updateTour)
// app.delete('/api/v1/tours/:id',deleteTour)
 
//3)ROUTES
app.post('/webhooks-checkout',express.raw() ,bookingController.webhooksCheckout)
app.use('/api/v1/tours',tourRouter)
app.use('/api/v1/users',userRouter)
app.use('/api/v1/reviews',reviewRouter)
app.use('/api/v1/bookings',bookingRouter)


//4) HANDLING ERROR ROUTES
app.all('*',(req,res,next)=>{
    // res.status(404).json({
    //     status:'fail',
    //     message:`Can't find ${req.originalUrl} on this server`
    // })

    // const err = new Error (`Can't find ${req.originalUrl} on this server`)
    // err.status = 'fail'
    // err.statusCode = 404
    // next(err)

    next(new AppError(`Can't find ${req.originalUrl} on this server`,404))
})

app.use(globalErrorHandller)
//4)START SERVER
module.exports = app