exports = async function({email}){
  

  if(context.user.data.name !== "reactPasswordResetUser") {
    throw new Error("'reactPasswordResetUser' kullanıcısına ait bir fonksiyon başka bir kullanıcı tarafından çağırıldı, lütfen bizimle irtibata geçiniz.") // bu ifadeyi değiştirme, frontend hata da kullanılıyor
  }


  // mail doğrulama
  const isMailValid = String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
      
  if(!isMailValid) {
    throw new Error("Mail adresi hatalı (backend)")
  }


  // bu kullanıcı kayıtlı mı kontrol edelim, değilse hata dönderelim
  try {
    const collection_Users = context.services.get("mongodb-atlas").db("rapor724_v2").collection("users")
      const user = await collection_Users.findOne({email})
      if(!user) {
        throw new Error("Bu email adresi sistemde kayıtlı değil")
      }
  } catch (error) {
      throw new Error(error)
  }

 
  // maile gidecek kodu üretme
  let confirmationCode_PasswordReset = ''
  try {
    let length = 6 // kod üretilecek hane sayısı
    var characters = '123456789';
    // var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      confirmationCode_PasswordReset += characters.charAt(Math.floor(Math.random() *  charactersLength));
    }
  } catch (err) {
     throw new Error("Mail adresine gidecek kod üretilirken hata oluştu (backend)")
  }

  
  // maile gidecek kodu db ye kaydetme
  let resultdbKayit
  try {
    resultMongo = await context.services.get("mongodb-atlas").db("rapor724_v2").collection("mailConfirmationCodes").updateOne(
      { email },
      { $set: { 
        confirmationCode_PasswordReset,
        confirmationCode_PasswordReset_ceratedAt:new Date(),
        confirmationCode_PasswordReset_context:context
      }}
    );
    resultdbKayit = {ok:true, yer:"maile gidecek kodu db ye kaydetme", mesaj:"kod db ye kaydedildi", resultMongo }
  } catch (err) {
    throw new Error("Mail adresine gidecek kod database e kaydedilirken hata oluştu (backend)")
  }



  
  // maile gidecek kodu mail atma
  let resultMailSend
  try {
    const subject = "Rapor 7/24 - Şifre Sıfırlama Mail Doğrulama Kodu"
    const message = "Şifre Sıfırlama Mail Doğrulama Kodunuz - " + confirmationCode_PasswordReset
    resultMailSend = await context.functions.execute("sendMail", email, subject, message)
  } catch (err) {
    throw new Error("Mail adresine gidecek kod mail adresine gönderilirken hata oluştu (backend)")
  }

    
  return {resultMailSend, resultdbKayit}
  
};