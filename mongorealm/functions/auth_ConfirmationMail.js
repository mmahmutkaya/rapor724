exports = async function (mailCode) {

  const userId = context.user.id
  const userEmail = context.user.data.email

  const dbCode = await context.services.get("mongodb-atlas").db("rapor724_v2").collection("mailConfirmationCodes").find({ email }).code

  if (dbCode == mailCode) {

    await context.services.get("mongodb-atlas").db("rapor724_v2").collection("users").updateOne(
      { userEmail },
      [
        { $set: { "mailTeyit": true } }
      ]
    )
    return "teyit edildi"
  }

  return "mail kodu doğru girilmedi" // bu ifadeleri değiştirmeyelim, fronend de bu metinlere göre işlem yapılıyor


};