// exports('mmahmutkaya@gmail.com','başlık','bu da mesaj')
// kkiivcrjbsduexdy
exports = async function(email,konu,mesaj){
  
  const validateEmail = context.functions.execute("validateEmail", email);
  if(validateEmail == null) return ({ok:false,hataYeri:"FONK // validateEmail",hataMesaj:"Mail adresinin doğruluğunu kontrol ediniz."})
    
  const nodemailer = require('nodemailer');

  const transporter = nodemailer.createTransport({
    host: 'smtp-mail.outlook.com',                  // hostname
    service: 'outlook',                             // service name
    secureConnection: false,
    tls: {
        ciphers: 'SSLv3'                            // tls version
    },
    port: 587,  
    auth: {
        user: 'mahmutkaya1982@hotmail.com',
        pass: 'maka1453hm'
    },
  });
  
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