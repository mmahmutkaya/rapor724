exports = async function () {
  
  const userId = context.user.id
  const email = context.user.data.email


  // aşağıdaki konrolü yapmamıza gerek yok zaten sistemden alıyoruz mail adresini
  // const isMailValid = String(email)
  //   .toLowerCase()
  //   .match(
  //     /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  //   );
      
  // if(!isMailValid) {
  //   return ({ok:false, hataYeri:"MONGODB // FONK // sendMail_ConfirmationCode", hataMesaj:"payload içindeki mail adresi hatalı", payload:{email} })
  // }


  
  // maile gidecek kodu üretme
  let mailConfirmationKod = ''
  try {
    let length = 6 // kod üretilecek hane sayısı
    var characters = '123456789';
    // var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      mailConfirmationKod += characters.charAt(Math.floor(Math.random() *  charactersLength));
    }
  } catch (err) {
    return ({ok:false, hataYeri:"maile gidecek kodu üretme", hataMesaj:err.message})
  }

  
  // maile gidecek kodu db ye kaydetme
  let resultdbKayit
  try {
    const collection_Users = context.services.get("mongodb-atlas").db("rapor724_v2").collection("mailConfirmationCodes")
    resultMongo = await collection_Users.updateOne(
      { email },
      { $set: { code } },
      { upsert: true }
    );
    resultdbKayit = {ok:true, yer:"maile gidecek kodu db ye kaydetme", mesaj:"kod db ye kaydedildi", resultMongo }
  } catch (err) {
    throw new Error({ok:false, hataYeri:"maile gidecek kodu db ye kaydetme", hataMesaj:err.message})
  }



  
  // maile gidecek kodu mail atma
  let resultMailSend
  try {
    const subject = "Rapor 7/24 - Mail Doğrulama Kodu"
    const message = "Mail Doğrulama Kodunuz - " + mailConfirmationKod
    resultMailSend = await context.functions.execute("sendMail", email, subject, message)
  } catch (err) {
    return ({ok:false, hataYeri:"maile gidecek kodu mail atma", hataMesaj:err.message})
  }

  
  return {resultdbKayit, resultMailSend}





  
  // try {
    
  //   const collection_mailConfirmationCodes = context.services.get("mongodb-atlas").db("rapor724_v2").collection("mailConfirmationCodes")
  //   const dbKayit = await collection_mailConfirmationCodes.updateOne(
  //     { email }, // Query for the user object of the logged in user
  //     { $set: { mailConfirmationKod} }, // Set the logged in user's favorite color to purple
  //     { upsert: true }
  //   );
    
  //   const subject = "Rapor 7/24 - Mail Doğrulama Kodu"
  //   const message = "Mail Doğrulama Kodunuz - " + mailConfirmationKod
  //   const mailSend = await context.functions.execute("sendMail", email, subject, message)
    
  //   return ({ok:true, Fonksiyon:"MONGO // FONK // auth_SendConfirmationCode ", mesaj:"kod db ye kaydedildi ve mail adresine iletildi", dbKayit, mailSend })
    
  // } catch (err) {
  //   return ({ok:false, hataYeri:"MONGO // FONK // auth_SendConfirmationCode ", hataMesaj:err.message})
  // }


}