exports = async function (user) {

  await context.services.get("mongodb-atlas").db("rapor724_v2").collection("users2").insertOne(user)
  
  
  // const userId = user.id
  // const email = context.user.data.email


  // aşağıdaki konrolü yapmamıza gerek yok zaten sistemden alıyoruz mail adresini
  // const isMailValid = String(email)
  //   .toLowerCase()
  //   .match(
  //     /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  //   );
      
  // if(!isMailValid) {
  //   return ({ok:false, hataYeri:"MONGODB // FONK // sendMail_ConfirmationCode", hataMesaj:"payload içindeki mail adresi hatalı", payload:{email} })
  // }


  
  // // maile gidecek kodu üretme
  // let mailConfirmationKod = ''
  // try {
  //   let length = 6 // kod üretilecek hane sayısı
  //   var characters = '123456789';
  //   // var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  //   var charactersLength = characters.length;
  //   for ( var i = 0; i < length; i++ ) {
  //     mailConfirmationKod += characters.charAt(Math.floor(Math.random() *  charactersLength));
  //   }
  // } catch (err) {
  //   return ({ok:false, hataYeri:"maile gidecek kodu üretme", hataMesaj:err.message})
  // }

  
  // maile gidecek kodu db ye kaydetme
  // let resultdbKayit
  // try {
  //   const collection_Users = context.services.get("mongodb-atlas").db("rapor724_v2").collection("users")
  //   resultMongo = await collection_Users.updateOne(
  //     { email },
  //     { $set: { email, userId, car:"tesla"} },
  //     { upsert: true }
  //   );
  //   resultdbKayit = {ok:true, yer:"maile gidecek kodu db ye kaydetme", mesaj:"kod db ye kaydedildi", resultMongo }
  // } catch (err) {
  //   throw new Error({ok:false, hataYeri:"maile gidecek kodu db ye kaydetme", hataMesaj:err.message})
  // }

  
  // // maile gidecek kodu mail atma
  // let resultMailSend
  // try {
  //   const subject = "Rapor 7/24 - Mail Doğrulama Kodu"
  //   const message = "Mail Doğrulama Kodunuz - " + mailConfirmationKod
  //   resultMailSend = await context.functions.execute("sendMail", email, subject, message)
  // } catch (err) {
  //   return ({ok:false, hataYeri:"maile gidecek kodu mail atma", hataMesaj:err.message})
  // }

  
  return




}