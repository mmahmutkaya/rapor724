
exports = async ({ token, tokenId, username, password, currentPasswordValid }, {mailCode}) => {

  // bu fonksiyon private yani kullanıcılar tarafından direk çağırılamıyor, aşağıdaki şekilde çağırılıyor, {email.password} sonrasındaki değişkenler isteğe bağlı ve burada istenilen şekilde değerlendiriliyorlar
  // RealmApp.emailPasswordAuth.callResetPasswordFunction({ email, password }, { mailCode: "1234567" })
  // return {status:"success", mesaj:"deneme"}


  let email = username
  
  // // BU DOĞRULAMAYA GEREK YOK - çünkü mail adresinin doğru olup olmadığına bakılmaksızın sistemde kayıtlı değilse bu kullanıcı sistemde kayıtlı değil diyor
  // const isMailValid = String(email)
  //   .toLowerCase()
  //   .match(
  //     /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  //   );
      
  // if(!isMailValid) {
  //   throw new Error("Mail adresi hatalı (backend2)")
  // }

  
  if(mailCode !== "123456") {
    throw new Error("Mail adresi hatalı (backend2)")
    // return {status:"fail"}
  }


  // if(password !== "111111") {
  //   throw new Error("mail code uyuşmuyor")
  // }

  return {status:"success", mesaj:"deneme"}
  
  
  // // maile gidecek kodu üretme
  // let newMailConfirmationKod = ''
  // try {
  //   let length = 6 // kod üretilecek hane sayısı
  //   var characters = '123456789';
  //   // var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  //   var charactersLength = characters.length;
  //   for ( var i = 0; i < length; i++ ) {
  //     newMailConfirmationKod += characters.charAt(Math.floor(Math.random() *  charactersLength));
  //   }
  // } catch (err) {
  //    throw new Error("Mail adresine gidecek kod üretilirken hata oluştu (backend)")
  // }

  
  // // maile gidecek kodu db ye kaydetme
  // let resultdbKayit
  // try {
  //   const collection_Users = context.services.get("mongodb-atlas").db("rapor724_v2").collection("users")
  //   resultMongo = await collection_Users.updateOne(
  //     { email },
  //     { $set: { 
  //       newMailConfirmationKod,
  //       newMailConfirmationKod_ceratedAt:new Date(),
  //       newMailConfirmationKod_context:context
  //     }}
  //   );
  //   resultdbKayit = {ok:true, yer:"maile gidecek kodu db ye kaydetme", mesaj:"kod db ye kaydedildi", resultMongo }
  // } catch (err) {
  //   throw new Error("Mail adresine gidecek kod database e kaydedilirken hata oluştu (backend)")
  // }



  
  // // maile gidecek kodu mail atma
  // let resultMailSend
  // try {
  //   const subject = "Rapor 7/24 - Mail Doğrulama Kodu"
  //   const message = "Mail Doğrulama Kodunuz - " + newMailConfirmationKod
  //   resultMailSend = await context.functions.execute("sendMail", email, subject, message)
  // } catch (err) {
  //   throw new Error("Mail adresine gidecek kod mail adresine gönderilirken hata oluştu (backend)")
  // }

  
  // if(password == "333333") {
  //   return {status:"success", ok:true, mesaj:"kullanıcı kaydedildi"}
  // }

  
}
