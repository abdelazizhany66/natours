const mongoose = require('mongoose');
const dotenv = require('dotenv')

// eslint-disable-next-line import/no-extraneous-dependencies
// process.on('uncaughtException', err => {
//   console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
//   console.log(err.name, err.message);
//   process.exit(1);
// });
dotenv.config({path:'./config.env'})
const app = require('./app')


const db = process.env.DATABASE.replace('<PASSWORD>',process.env.DATABASE_PASSWORD)
mongoose.connect(db,{
  // useNewUrlParser:true,
  // useCreateIndex:true,
  // useFindAndModify:false
}).then(()=>console.log('DB connection successful!'))


const port = process.env.PORT ||3000
app.listen(port ,()=>{
  console.log(`App running in port ${port}`)
})
// process.on('unhandledRejection', err => {
//   console.log('UNHANDLED REJECTION! 💥 Shutting down...');
//   console.log(err.name, err.message);
//   // eslint-disable-next-line no-undef
//   server.close(() => {
//     process.exit(1);
//   });
// });
