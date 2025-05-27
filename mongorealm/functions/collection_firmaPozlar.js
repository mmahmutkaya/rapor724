exports = async function ({
  functionName, _firmaId, newPoz
}) {


  const user = context.user
  const _userId = new BSON.ObjectId(user.id)
  const userEmail = context.user.data.email
  const mailTeyit = user.custom_data.mailTeyit
  if (!mailTeyit) throw new Error("MONGO // collection_firmaPozlar // Öncelikle üyeliğinize ait mail adresinin size ait olduğunu doğrulamalısınız, tekrar giriş yapmayı deneyiniz veya bizimle iletişime geçiniz.")

  const dateNow = new Date()

  if (functionName == "createPoz") {

    // newPoz frontend den gelen veri

    // veri düzeltme
    if (newPoz.pozMetrajTipId === "insaatDemiri") {
      newPoz.pozBirimId = "ton"
    }

    ////// form validation - backend

    let errorObject = {}
    let isFormError = false
    
    let wbsIdError
    let pozNameError
    let pozNoError
    let pozBirimIdError
    let pozMetrajTipIdError

    if (!newPoz.firmaId) {
      // form alanına değil - direkt ekrana uyarı veren hata - (fonksiyon da durduruluyor)
      throw new Error("DB ye gönderilen sorguda 'firmaId' verisi bulunamadı, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
    }

    // form alanına uyarı veren hatalar

    if (!newPoz.wbsId && !wbsIdError) {
      errorObject.wbsIdError = "Zorunlu"
      wbsIdError = true
      isFormError = true
    }


    if (typeof newPoz.pozName !== "string" && !pozNameError) {
      errorObject.pozNameError = "Zorunlu"
      pozNameError = true
      isFormError = true
    }

    if (typeof newPoz.pozName === "string" && !pozNameError) {
      if (newPoz.pozName.length === 0) {
        errorObject.pozNameError = "Zorunlu"
        pozNameError = true
        isFormError = true
      }
    }

    if (typeof newPoz.pozName === "string" && !pozNameError) {
      let minimumHaneSayisi = 3
      if (newPoz.pozName.length > 0 && newPoz.pozName.length < minimumHaneSayisi) {
        errorObject.pozNameError = `${minimumHaneSayisi} haneden az olamaz`
        pozNameError = true
        isFormError = true
      }
    }

    const collection_firmaPozlar = context.services.get("mongodb-atlas").db("rapor724_v2_firmaPozlar").collection(newPoz.firmaId.toString())
    const pozlar = await collection_firmaPozlar.aggregate([
      {
        $match: { _firmaId:newPoz.firmaId }
      }
    ]).toArray()

    if (pozlar?.find(x => x.name === newPoz.pozName) && !pozNameError) {
      errorObject.pozNameError = `Bu poz ismi kullanılmış`
      pozNameError = true
      isFormError = true
    }


    if (!newPoz.pozNo && !pozNoError) {
      errorObject.pozNoError = `Zorunlu`
      pozNoError = true
      isFormError = true
    }

    let pozFinded = pozlar?.find(x => x.pozNo == newPoz.pozNo)
    if (pozFinded && !pozNoError) {
      errorObject.pozNoError = `'${pozFinded.pozName}' isimli poz'da bu no kullanılmış`
      pozNoError = true
      isFormError = true
    }


    if (!newPoz.pozBirimId && !pozBirimIdError) {
      errorObject.pozBirimIdError = `Zorunlu`
      pozBirimIdError = true
      isFormError = true
    }


    const collection_firmalar = context.services.get("mongodb-atlas").db("rapor724_v2").collection("firmalar")
    const selectedFirma = await collection_firmalar.findOne({_id:newPoz.firmaId})
    if (!selectedFirma.pozMetrajTipleri.find(x => x.id == newPoz.pozMetrajTipId) && !pozMetrajTipIdError) {
      errorObject.pozMetrajTipIdError = `Zorunlu`
      pozMetrajTipIdError = true
      isFormError = true
    }


    // form alanına uyarı veren hatalar olmuşsa burda durduralım
    if (isFormError) {
      return {errorObject}
    }

    newPoz = {
      ...newPoz,
      createdAt:dateNow,
      createdBy:userEmail
    }
    return {message:"kayıt yapılacak",newPoz}

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

      return { result }

    } catch (err) {

      throw new Error("MONGO // collection_firmaPozlar // " + functionName + " // " + err.message)
    }

  }



  throw new Error("MONGO // collection_firmaPozlar // " + functionName + " // " + "Herhangi bir fonksiyona uğramadı, 'functionName' eşleşmedi ya da boş gönderildi ")


};