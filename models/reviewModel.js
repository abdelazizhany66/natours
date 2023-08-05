const mongoose = require('mongoose')
const Tour = require('./tourModel')

const reviewSchema = new mongoose.Schema({

        review:{
            type:String,
            required:[true,'Review can not be empty!']
        },
        rating:{
            type:Number,
            min:1,
            max:5
        },
        createAt:{
            type:Date,
            default:Date.now()
        },
        tour:{
            type:mongoose.Schema.ObjectId,
            ref:'Tour',
            required:[true,'Review must belong to a tour.']

        },
        user:{
            type:mongoose.Schema.ObjectId,
            ref:'User',
            required:[true,'Review must belong to a user.']
        }

   
    })

reviewSchema.index({tour:1 , user:1},{unique:true}) //In order for each user to make one review on each tour

reviewSchema.pre(/^find/,function(next){
        // this.populate({
        //     path:'user',
        //     select:'name photo '
        // }).populate({
        //     path:'tour',
        //     select:'name'
        // })
            this.populate({
            path:'user',
            select:'name photo '
        })
        
        next()
    })

reviewSchema.statics.calcAverageRatings= async function(tourId){
   const stats = await this.aggregate([
        {
            $match: {tour:tourId}
        },
        {
            $group:{
                _id:'$tour',
                nRatings:{$sum:1},
                avgRatings:{$avg:'$rating'}
            }
        }
    ])
    if(stats.length > 0){
        await Tour.findByIdAndUpdate(tourId,{
            ratingsQuantity:stats[0].nRatings,
            ratingsAverage:stats[0].avgRatings
         })
    }else{
        await Tour.findByIdAndUpdate(tourId,{
            ratingsQuantity:0,
            ratingsAverage:4.5
         })
    }
}

reviewSchema.post('save',function(){
    this.constructor.calcAverageRatings(this.tour) 
})

reviewSchema.post(/^findOneAnd/, async (doc) => {
    await doc.constructor.calcAverageRatings(doc.tour);
  });

// reviewSchema.pre(/^findOneAnd/, async function(next) {
//     // this.r = await this.findOne();
//     this.r = await this.model.findOne(this.getQuery())
//     next();
// });
  
// reviewSchema.post(/^findOneAnd/, async function() {
//     // await this.findOne(); does NOT work here, query has already executed
//     await this.r.constructor.calcAverageRatings(this.r.tour);
// });

const Review = mongoose.model('Review',reviewSchema)

module.exports = Review