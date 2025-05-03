exports = async function ({
  functionName, _firmaId
}) {


  const user = context.user
  const _userId = new BSON.ObjectId(user.id)
  const userEmail = context.user.data.email
  const mailTeyit = user.custom_data.mailTeyit
  if (!mailTeyit) throw new Error("MONGO // collection_firmaPozlar // Öncelikle üyeliğinize ait mail adresinin size ait olduğunu doğrulamalısınız, tekrar giriş yapmayı deneyiniz veya bizimle iletişime geçiniz.")



  if (functionName == "createWbs") {

    if (typeof _firmaId !== "object") throw new Error("MONGO // collection_firmaPozlar // " + functionName + " // -- sorguya gönderilen --firmaId-- türü doğru değil, lütfen Rapor7/24 ile irtibata geçiniz. ")

    if (!(upWbsId === "0" || typeof upWbsId === "object")) throw new Error("MONGO // collection_firmaPozlar // " + functionName + " // --upWbsId-- sorguya, gönderilmemiş, sayfayı yenileyiniz, sorun deva ederse Rapor7/24 ile irtibata geçiniz. ")


    // aşağıdaki form verilerinden birinde hata tespit edilmişse
    // alt satırda oluşturulan errorObject objesine form verisi ile ilişkilendirilmiş  property oluşturulup, içine yazı yazılıyor
    // property isimleri yukarıda ilk satırda frontend den gelen verileri yakalarken kullanılanlar ile aynı 
    // fonksiyon returnü olarak errorObject objesi döndürülüyor, frontenddeki form ekranında form verisine ait ilgili alanda bu yazı gösteriliyor
    // form ile ilişkilendirilmiş ilgili alana ait bir ke hata yazısı yazılmışsa yani null değilse üstüne yazı yazılmıyor, ilk tespit edilen hata değiştirilmmeiş oluyor

    const errorObject = {}

    // newWbsName
    if (typeof newWbsName !== "string") {
      throw new Error("MONGO // collection_firmaPozlar // " + functionName + " / db ye gelen wbsName türü 'string' türünde değil, sayfayı yenileyiniz, sorun devam ederse Rapor724 ile iritbata geçiniz.")
    }

    if (newWbsName.length < 1) {
      errorObject.wbsNameError = "Boş bırakılamaz"
    }


    // newWbsCodeName
    if (typeof newWbsCodeName !== "string") {
      throw new Error("MONGO // collection_firmaPozlar // " + functionName + " / db ye gelen wbsCodeName türü 'string' türünde değil, sayfayı yenileyiniz, sorun devam ederse Rapor724 ile iritbata geçiniz.")
    }

    if (newWbsCodeName.length < 1) {
      errorObject.wbsCodeNameError = "Boş bırakılamaz"
    }

    if (newWbsCodeName.includes(" ")) {
      errorObject.wbsCodeNameError = "Boşluk içermemeli"
    }

    // ARA VALIDATE KONTROL - VALIDATE HATA VARSA BOŞUNA DEVAM EDİP AŞAĞIDAKİ SORGUYU YAPMASIN
    if (Object.keys(errorObject).length > 0) return { errorObject }


    const collection_Firmalar = context.services.get("mongodb-atlas").db("rapor724_v2").collection("firmalar")
    const firma = await collection_Firmalar.findOne({ _id: _firmaId, "kisiler.email": userEmail, isDeleted: false })
    if (!firma) throw new Error("MONGO // collection_firmaPozlar // " + functionName + " // _firmaId ile sistemde firma bulunamadı, lütfen sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")




    const newWbsItem = {
      _id: BSON.ObjectId(),
      code: "1",
      name: newWbsName,
      codeName: newWbsCodeName,
      includesPoz: false,
      openForPoz: false
    }

    try {

      const result = await collection_Firmalar.updateOne(
        { _id: _firmaId },
        [
          { $set: { wbs: [newWbsItem] } }
        ]
      );

      return { result, wbs: [newWbsItem] }

    } catch (err) {

      throw new Error("MONGO // collection_firmaPozlar // " + functionName + " // bölüm 1/3 " + err.message)
    }



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

      return result 

    } catch (err) {

      throw new Error("MONGO // collection_firmaPozlar // " + functionName + " // " + err.message)
    }

  }



  throw new Error("MONGO // collection_firmaPozlar // " + functionName + " // " + "Herhangi bir fonksiyona uğramadı, 'functionName' eşleşmedi ya da boş gönderildi ")


};