exports = async function ({
  functionName, _firmaId, newPoz
}) {


  const user = context.user
  const _userId = new BSON.ObjectId(user.id)
  const userEmail = context.user.data.email
  const mailTeyit = user.custom_data.mailTeyit
  if (!mailTeyit) throw new Error("MONGO // collection_firmaPozlar // Öncelikle üyeliğinize ait mail adresinin size ait olduğunu doğrulamalısınız, tekrar giriş yapmayı deneyiniz veya bizimle iletişime geçiniz.")



  if (functionName == "createPoz") {
    return newPoz
  }

  if (functionName == "getFirmaPozlar") {

    if (typeof _firmaId !== "object") throw new Error("MONGO // collection_firmaPozlar // " + functionName + " // -- sorguya gönderilen --firmaId-- türü doğru değil, lütfen Rapor7/24 ile irtibata geçiniz. ")

    // aşağıdaki form verilerinden birinde hata tespit edilmişse
    // alt satırda oluşturulan errorObject objesine form verisi ile ilişkilendirilmiş  property oluşturulup, içine yazı yazılıyor
    // property isimleri yukarıda ilk satırda frontend den gelen verileri yakalarken kullanılanlar ile aynı 
    // fonksiyon returnü olarak errorObject objesi döndürülüyor, frontenddeki form ekranında form verisine ait ilgili alanda bu yazı gösteriliyor
    // form ile ilişkilendirilmiş ilgili alana ait bir ke hata yazısı yazılmışsa yani null değilse üstüne yazı yazılmıyor, ilk tespit edilen hata değiştirilmmeiş oluyor


    const collection_firmaPozlar = context.services.get("mongodb-atlas").db("rapor724_v2").collection("firmalar")

    try {

      const result = await collection_firmaPozlar.aggregate([
        {
          $match: { _firmaId }
        }
      ])

      return {result} 

    } catch (err) {

      throw new Error("MONGO // collection_firmaPozlar // " + functionName + " // " + err.message)
    }

  }



  throw new Error("MONGO // collection_firmaPozlar // " + functionName + " // " + "Herhangi bir fonksiyona uğramadı, 'functionName' eşleşmedi ya da boş gönderildi ")


};