
exports = async ({ token, tokenId, username, password, currentPasswordValid }, {mailCode}) => {


  // let email = username
  
  // // mail doğrulama
  // const isMailValid = String(email)
  //   .toLowerCase()
  //   .match(
  //     /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  //   );
      
  // if(!isMailValid) {
  //   throw new Error("Mail adresi hatalı (backend)")
  // }

  
   if(mailCode !== "123456") {
    throw new Error()
  }

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
