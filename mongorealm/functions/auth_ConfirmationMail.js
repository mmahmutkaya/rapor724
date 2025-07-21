exports = async function (mailCode) {

  // const userId = context.user.id
  const email = context.user.data.email

  const dbData = await context.services.get("mongodb-atlas").db("rapor724_v2").collection("mailConfirmationCodes").findOne({ email })

  try {
    
    // return {dbData, mailCode, email}
    if (dbData.code == mailCode) {
  
      const result = await context.services.get("mongodb-atlas").db("rapor724_v2").collection("users").updateOne(
        { email },
        { $set: { "mailTeyit": true } }
      )
      if(!result.matchedCount) {
        throw new Error("MONGO // auth_ConfirmationMail // 'users' colelctin içinde 'userId' ye ait daat silinmiş")
      }
      return "teyit edildi" 
    } else {
      return "mail kodu doğru girilmedi" // bu ifadeleri değiştirmeyelim, fronend de bu metinlere göre işlem yapılıyor
    }
    
  } catch (error) {
    throw new Error("MONGO // auth_ConfirmationMail // " + error)
  }

  


};