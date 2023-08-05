const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required:[true, 'Please tell us your name!'],
        trim:true,
        
    },
    email:{
        type:String,
        required:[true, 'Please provide your email'],
        unique:true,
        lowercase:true,
        validate:[validator.isEmail]
    },
    photo:{
      type:String,
      default:'default.jpg'
    },
    role: {
      type: String,
      enum:['user', 'guide', 'lead-guide', 'admin'],
      default: 'user'
    },
    password:{
        type:String,
        required:[true,'Please provide a password'],
        minlength:8,
        select:false
    },
    passwordConfirm:{
        type:String,
        required:[true,'Please confirm your password'],
        validate:{
            validator:function(el){
           return el === this.password 
        },
        message:'password are not the same'
    }
    },
    changedPasswordAt:Date,
    passwordResetToken:String,
    passwordResetExpiresIn:Date,
     active:{
      type:Boolean,
      default:true,
      select:false
    }
    
})

userSchema.pre('save',async function(next){
  // Only run this function if password was actually modified
    if(!this.isModified('password')) return next()

  // Hash the password with cost of 12
    this.password = await bcrypt.hash(this.password, 12)
  // Delete passwordConfirm field from DB
    this.passwordConfirm = undefined
    next()
})

userSchema.pre('save', function(next){
  if(!this.isModified('password')|| this.isNew)return next()
  this.changedPasswordAt = Date.now()-1000
  next()
})
userSchema.pre(/^find/,function(next){
  this.find({active:{$ne:false}})
  next()
})
userSchema.methods.correctPassword = async function(passwordDB,userPassword){
  return await bcrypt.compare(passwordDB, userPassword)
}
userSchema.methods.changedPasswordAfter = function(JWTTimesTemp){
  if(this.changedPasswordAt){
    const changedTimesTemp = parseInt(this.changedPasswordAt.getTime()/1000,10)
    return JWTTimesTemp < changedTimesTemp
  }
  return false
}
userSchema.methods.createPasswordResetToken= function(){
  const resetToken = crypto.randomBytes(32).toString('hex')
     this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex')
     this.passwordResetExpiresIn = Date.now()+ 10 *60 *1000
  return resetToken
}
const User = mongoose.model('User',userSchema)

module.exports = User