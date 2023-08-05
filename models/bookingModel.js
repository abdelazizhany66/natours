const mongoose = require('mongoose')

const bookingSchema = new mongoose.Schema({
    tour:{
        type: mongoose.Schema.ObjectId,
        ref:'Tour',
        required: [true, 'Booking must belong to a Tour!']
    },
    user:{
        type:mongoose.Schema.ObjectId,
        ref:'User',
        requierd:[true, 'Booking must belong to a User!']
    },
    price:{
        type:Number,
        requierd:[true, 'Booking must have a price']
    },
    createAt:{
        type:Date,
        default:Date.now()
    },
    paid:{
        type:Boolean,
        defualt:true
    }
})

bookingSchema.pre(/^find/, function(next){
    this.populate('user').populate({
        path:'Tour',
        select:'name'
    })
    next()
})

const Booking = mongoose.model('Booking',bookingSchema)

module.exports = Booking 