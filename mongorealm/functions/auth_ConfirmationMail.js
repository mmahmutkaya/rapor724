exports = async function (mailCode) {

  // const userId = context.user.id
  const email = context.user.data.email

  const dbData = await context.services.get("mongodb-atlas").db("rapor724_v2").collection("mailConfirmationCodes").findOne({ email })

  // return {dbData, mailCode, email}
  if (dbData.code == mailCode) {

    await context.services.get("mongodb-atlas").db("rapor724_v2").collection("users").updateOne(
      { email },
      [
        { $set: { "mailTeyit": true } }
      ]
    )
    return "teyit edildi" 
  }

  return "mail kodu doğru girilmedi" // bu ifadeleri değiştirmeyelim, fronend de bu metinlere göre işlem yapılıyor


};