exports = async function (user) {
  
  const userId = user.id
  const email = user.data.email


  // aşağıdaki konrolü yapmamıza gerek yok zaten sistemden alıyoruz mail adresini
  // const isMailValid = String(email)
  //   .toLowerCase()
  //   .match(
  //     /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  //   );
      
  // if(!isMailValid) {
  //   return ({ok:false, hataYeri:"MONGODB // FONK // sendMail_ConfirmationCode", hataMesaj:"payload içindeki mail adresi hatalı", payload:{email} })
  // }

  const customSettings = {
    pages:{
      firmapozlari:{
        basliklar:[
          { id: "pozAciklama", baslikName: "Açıklama", visible: true, show: true },
          { id: "pozVersiyon", baslikName: "Versiyon", visible: true, show: true }
        ]
      }
    }
  }
    
  // user custom data için userId yi oluşturma, daha önceden bu mail adresine isim soyisim firma gibi bilgiler varsa bilgiler muhafaza edilmiş oluyor
  let resultdbKayit
  try {
    const collection_Users = context.services.get("mongodb-atlas").db("rapor724_v2").collection("users")
    resultMongo = await collection_Users.updateOne(
      { email },
      { $set: { userId, isActive:true, customSettings } },
      { upsert: true }
    );
    resultdbKayit = {ok:true, yer:"maile gidecek kodu db ye kaydetme", mesaj:"kod db ye kaydedildi", resultMongo }
  } catch (err) {
    throw new Error({ok:false, hataYeri:"maile gidecek kodu db ye kaydetme", hataMesaj:err.message})
  }

  return


}