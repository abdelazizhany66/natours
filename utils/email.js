const nodemailer = require('nodemailer')
const pug = require('pug')
const htmlToText = require('html-to-text').htmlToText;

module.exports = class Email{
    constructor(user, url){
        this.firstName = user.name.split(' ')[0]
        this.to = user.email
        this.url = url
        this.from = `Abdel-Aziz Hany <${process.env.EMAIL_FROM}>`
    }

    newTransport(){
        if(process.env.NODE_ENV==='production'){
        return  nodemailer.createTransport({
            service:'sendGrid',
            auth:{
                user:process.env.USER_SENDGRID,
                pass:process.env.PASS_SENDGRID
            }
        })
        } 
        return nodemailer.createTransport({
            host:'sandbox.smtp.mailtrap.io', 
            port:587,
            secure: false,
            auth:{
                username:'73e5917ec75001',
                password:'031c44df0ccd34' 
            }
        })
    }

    async send(template, subject){
      const html= pug.renderFile(`${__dirname}/../views/email/${template}.pug`,{
        firsrName:this.firstName,
        url:this.url,
        subject
       })

       const mailOptions ={
        from:this.from,
        to:this.to,
        subject,
        html,
        text: htmlToText(html, {
            wordwrap: 130})
       }

      await this.newTransport().sendMail(mailOptions)
    }

    async sendWelcome(){
      await this.send('welcome','welcom to natour family')
    }

    async sendResetToken(){
        await this.send('ResetToken','Your password reset token (valid for only 10 minutes)')
    }
}


// // const sendEmail =async options =>{
// //      // 1) Create a transporter
// //     const transporter = nodemailer.createTransport({
// //         host:process.env.EMAIL_HOST,
// //         port:process.env.EMAIL_PORT,
// //         auth:{
// //             username:process.env.EMAIL_USERNAME,
// //             password:process.env.EMAIL_PASSWORD
// //         }
        
// //     })
// //    // 2) Define the email options
// //     const mailOptions ={
// //         from:'Adhm Hany',
// //         to:options.email,
// //         subject:options.subject,
// //         text:options.message

// //     }
// //     // 3) Actually send the email  
// //     await transporter.sendMail(mailOptions)


// // }

// // module.exports = sendEmail