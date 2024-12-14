// exports('mmahmutkaya@gmail.com','başlık','bu da mesaj')
// kkiivcrjbsduexdy
exports = async function(email,konu,mesaj){
  
  const validateEmail = context.functions.execute("validateEmail", email);
  if(validateEmail == null) return ({ok:false,hataYeri:"FONK // validateEmail",hataMesaj:"Mail adresinin doğruluğunu kontrol ediniz."})
    
  const nodemailer = require('nodemailer');

    var transporter = nodemailer.createTransport({
        host: 'smtp.office365.com', // Office 365 server
        port: 587,     // secure SMTP
        secure: false, // false for TLS - as a boolean not string - but the default is false so just remove this completely
        auth: {
          user: 'mkaya@outdoorfactory.com.tr',
          pass: 'Outdoor2022*1'
        },
        tls: {
            ciphers: 'SSLv3'
        }
    });

// user: 'mkaya@outdoorfactory.com.tr',
// pass: 'Outdoor2022*1'
  
  const mailOptions = {
    to: email,
    subject: konu,
    text: mesaj
  }
  
  try{
    await transporter.sendMail(mailOptions)
    return ({ok:true,mesaj:"Email başarı ile gönderildi"})
  } catch(err){
    return ({ok:false,hataYeri:"FONK // sendMail",message:err.message})
  }
  
  
};