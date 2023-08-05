const mongoose = require('mongoose')
const slugify = require('slugify')
// const User = require('./userModel')
// const validator = require('validator');


const tourSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,'A tour must have a name'],
        unique:true,
        trim:true, //cut any whiteSpace in the input
        minlength:[10, 'A Tour name must have more or equal then 10 characters '],
        maxlength:[40, 'A Tour name must have less or equal then 40 characters ']
      // validate: [validator.isAlpha, 'Tour name must only contain characters']


    },
    slug: String,
    duration:{
        type:Number,
        required:[true,'A tour must have a duration']
    },
    maxGroupSize:{
        type:Number,
        required:[true,'A tour must have a group size']
    },
    difficulty:{
        type:String,
        required:[true,'A tour must have difficulty'],
        trim:true,
        enum:{
            values:['easy', 'medium', 'difficult'],
            message:'A Difficulty either : easy , medium , difficult '
        }
    },
    ratingsAverage:{
        type:Number,
        default:4.5,
        min:[1 , 'Rating must be below 1'],
        max:[5 , 'Rating must be above 5' ],
        set: val => Math.round(val *10)/10
    },
    ratingsQuantity:{
        type:Number,
        default:0
    },
    price:{
        type:Number,
        required:[true,'A tour must be have a price']
    },
    priceDiscount:{
        type:Number,
        validate:{ 
            validator: function(val){
            // this only points to current doc on NEW document creation
             return val < this.price  
            },
            message:' Discount price ({VALUE}) should be below regular price'
        }
    },
    summary:{
        type:String,
        trim:true,
        required:[true, 'A tour must have a summary']
    },
    description:{
        type:String,
        trim:true
    },
    imageCover:{
        type:String,
        required:[true,'A tour must have a image cover']
    },
    images:[String],
    createdAt:{
        type:Date,
        default:Date.now(),
        select:false
    },
    startDates:[Date],
    secretTour:{
        type:Boolean,
        default:false
    },
    startLocation:{
        type:{
            type:String,
            default:'Point',
            enum:['Point']
        },
        coordinates:[Number],
        address:String,
        description:String
    },
    locations:[
        {
            type:{
                type:String,
                default:'Point',
                enum:['Point']
            },
            coordinates:[Number],
            address:String,
            description:String,
            day:Number
        }
    ],
    guides:[
        {
            type:mongoose.Schema.ObjectId,
            ref:'User'
        }
    ]
},
{
 toJSON:{virtuals:true},
 toObject:{virtuals:true}
}
)
tourSchema.index({price:1})

tourSchema.virtual('durationWeeks').get(function(){
    return this.duration/7
})

tourSchema.virtual('reviews',{
    ref:'Review',
    foreignField:'tour',
    localField:'_id'
})

tourSchema.index({ startLocation: '2dsphere' });

//DOCUMENT MIDDELWARE Only really run before to .save and .create not update or any thing
tourSchema.pre('save',function(next){
    this.slug = slugify(this.name , {lower:true})
    next()
})
tourSchema.pre(/^find/,function(next){
    this.populate({
        path:'guides',
        select:'-__v -changedPasswordAt'
    })
    next()
})
// tourSchema.pre('save',async function(next){   //when we doing modling the guide data with embedding
//     const tourGuidePromises = this.guides.map(async id=> await User.findById(id) )
//    this.guides = await Promise.all(tourGuidePromises)
//     next()
// })
// tourSchema.post('save', function(doc, next) {
//   console.log(doc);
//   next();
// });

//QUERY MIDDELWARE
// tourSchema.pre('find',function(next){ // this use when query in find not work with findById or findAndUpdate and all them
tourSchema.pre(/^find/,function(next){  //this is work with anything

    this.find({secretTour:{$ne:true}}) //if you have mini tour and you not want show in your app you select true hide from app
    this.start = Date.now()
    next()
})

tourSchema.post(/^find/, function(docs, next) {
    console.log(`Query took ${Date.now() - this.start} milliseconds!`);
    next();
})

//AGGREGATION MIDDELWARE
// tourSchema.pre('aggregate', function(next){
//     this.pipeline().unshift({$match:{secretTour:{$ne:true}}}) 
//     next()
// })


const Tour = mongoose.model('Tour',tourSchema)

module.exports=Tour