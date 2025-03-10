exports = async function ({
  _firmaId, upWbsId, newWbsName, newWbsCodeName, functionName
}) {


  const user = context.user
  const _userId = new BSON.ObjectId(user.id)
  const userEmail = context.user.data.email
  const mailTeyit = user.custom_data.mailTeyit
  if (!mailTeyit) throw new Error("MONGO // collection_firmaWbs // Öncelikle üyeliğinize ait mail adresinin size ait olduğunu doğrulamalısınız, tekrar giriş yapmayı deneyiniz veya bizimle iletişime geçiniz.")





  if (functionName == "createFirmaWbs") {

    if (!_firmaId) throw new Error("MONGO // collection_firmaWbs // " + functionName + " // --Firma Id-- sorguya, gönderilmemiş, lütfen Rapor7/24 ile irtibata geçiniz. ")

    try {
      if (typeof _firmaId == "string") {
        _firmaId = new BSON.ObjectId(_firmaId)
      }
    } catch (err) {
      throw new Error("MONGO // collection_firmaWbs // " + functionName + " // -- sorguya gönderilen --_firmaId-- türü doğru değil, lütfen Rapor7/24 ile irtibata geçiniz.")
    }
    if (typeof _firmaId != "object") throw new Error("MONGO // collection_firmaWbs // " + functionName + " // -- sorguya gönderilen --firmaId-- türü doğru değil, lütfen Rapor7/24 ile irtibata geçiniz. ")


    if (!(upWbsId === "0" || typeof upWbsId === "object")) throw new Error("MONGO // collection_firmaWbs // " + functionName + " // --upWbsId-- sorguya, gönderilmemiş, lütfen Rapor7/24 ile irtibata geçiniz. ")




    // aşağıdaki form verilerinden birinde hata tespit edilmişse
    // alt satırda oluşturulan errorFormObj objesine form verisi ile ilişkilendirilmiş  property oluşturulup, içine yazı yazılıyor
    // property isimleri yukarıda ilk satırda frontend den gelen verileri yakalarken kullanılanlar ile aynı 
    // fonksiyon returnü olarak errorFormObj objesi döndürülüyor, frontenddeki form ekranında form verisine ait ilgili alanda bu yazı gösteriliyor
    // form ile ilişkilendirilmiş ilgili alana ait bir ke hata yazısı yazılmışsa yani null değilse üstüne yazı yazılmıyor, ilk tespit edilen hata değiştirilmmeiş oluyor
    const errorFormObj = {}


    //form verisi -- yukarıda  "" const errorFormObj = {} ""  yazan satırdan önceki açıklamaları oku
    typeof newWbsName != "string" && errorFormObj.newWbsName === null ? errorFormObj.newWbsName = "MONGO // collection_firmaWbs // " + functionName + " --  newWbsName -- sorguya, string formatında gönderilmemiş, lütfen Rapor7/24 ile irtibata geçiniz. " : null
    newWbsName = await context.functions.execute("functions_deleteLastSpace", newWbsName)
    if (!newWbsName.length) !errorFormObj.newWbsName ? errorFormObj.newWbsName = "MONGO // collection_firmaWbs // " + functionName + " --  newWbsName -- sorguya, gönderilmemiş, lütfen Rapor7/24 ile irtibata geçiniz." : null


    //form verisi -- yukarıda  "" const errorFormObj = {} ""  yazan satırdan önceki açıklamaları oku
    typeof newWbsCodeName != "string" && errorFormObj.newWbsCodeName === null ? errorFormObj.newWbsCodeName = "MONGO // collection_firmaWbs // " + functionName + " --  newWbsCodeName -- sorguya, string formatında gönderilmemiş, lütfen Rapor7/24 ile irtibata geçiniz. " : null
    newWbsCodeName = await context.functions.execute("functions_deleteLastSpace", newWbsCodeName)
    !newWbsCodeName.length == 0 && errorFormObj.newWbsCodeName === null ? errorFormObj.newWbsCodeName = "MONGO // collection_firmaWbs // " + functionName + " --  newWbsCodeName -- sorguya, gönderilmemiş, lütfen Rapor7/24 ile irtibata geçiniz." : null


    // form veri girişlerinden en az birinde hata tespit edildiği için form objesi dönderiyoruz, formun ilgili alanlarında gösterilecek
    // errorFormObj - aşağıda tekrar gönderiliyor
    if (Object.keys(errorFormObj).length) return ({ errorFormObj })


    const collection_Firmalar = context.services.get("mongodb-atlas").db("rapor724_v2").collection("firmalar")
    const firma = await collection_Firmalar.findOne({ _id: _firmaId, "kisiler.email": userEmail, isDeleted: false })

return firma
    
    if (!firma) throw new Error("MONGO // collection_firmaWbs // " + functionName + " // _firmaId ile sistemde firma bulunamadı, lütfen sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")




    // 1/4.seçenek - yukarıda bitmemiş
    //ilk defa wbs kaydı yapılacaksa, yani henüz "firma.wbs" yoksa
    if (!firma.wbs || firma.wbs.length === 0) {

      const newWbsItem = {
        _id: BSON.ObjectId(),
        code: "1",
        name: newWbsName,
        codeName: newWbsCodeName,
        includesPoz: false,
        openForPoz: false
      }

      try {

        const resultMongo = await collection_Firmalar.updateOne(
          { _id: _firmaId }, // Query for the user object of the logged in user
          { $set: { wbs: [newWbsItem] } }, // Set the logged in user's favorite color to purple
          // { "$push": { "wbs": newWbsItem  } }
          // { upsert: true }
        );

        if (resultMongo.modifiedCount === 1) {
          // return {...firma, wbs:[...[firma.wbs], newWbsItem]} - firma.wbs null olduğu için bu hata veriyordu, aşağıda kaldırdık, düzeldi
          return { ...firma, wbs: [newWbsItem] }
        }

        // bunu göndermemesi gerekiyor diye düşünüyorum ama koymuşum önceden kaldırmadım (sonraki not)
        return resultMongo

      } catch (err) {

        throw new Error("MONGO // collection_firmaWbs // " + functionName + " // bölüm 1 " + err.message)
      }

    }



    // 2/4.seçenek - yukarıda bitmemiş
    // en üst düzeye kayıt yapılacaksa - aşağıdaki fonksiyonlar en üst seviyeye göre hazırlanmış 
    if (upWbsId === "0") {

      let newNumber = 1
      let number

      firma.wbs.filter(item => !item.code.includes(".")).map(item => {

        item.name === newWbsName && !errorFormObj.newWbsName ? errorFormObj.newWbsName = "Aynı grup içinde kullanılmış" : null
        item.codeName === newWbsCodeName && !errorFormObj.newWbsCodeName ? errorFormObj.newWbsCodeName = "Aynı grup içinde kullanılmış" : null


        number = parseInt(item.code)

        if (number >= newNumber) {
          return newNumber = number + 1
        }

      })

      // açıklamalar yukarıda
      if (Object.keys(errorFormObj).length) return ({ errorFormObj })


      const newWbsItem = {
        _id: BSON.ObjectId(),
        code: newNumber.toString(),
        name: newWbsName,
        codeName: newWbsCodeName,
        includesPoz: false,
        openForPoz: false
      }


      try {

        await collection_Firmalar.updateOne(
          { _id: _firmaId }, // Query for the user object of the logged in user
          // { $set: {wbs:newWbs} }, // Set the logged in user's favorite color to purple
          { "$push": { "wbs": newWbsItem } }
          // { upsert: true }
        );

        // return newWbsItem[0].code
        return { ...firma, wbs: [...firma.wbs, newWbsItem] }

      } catch (err) {

        throw new Error("MONGO // collection_firmaWbs // " + functionName + " // " + err.message)
      }

    }




    // 3/4.seçenek - yukarıda bitmemiş
    // en üst düzey olmayıp mevcut wbs kaydına ekleme yapılacaksa

    let upWbs = firma.wbs.find(item => item._id.toString() == upWbsId.toString())
    if (!upWbs) {
      throw new Error("MONGO // collection_firmaWbs // " + functionName + " // upWbsId sistemde bulunamadı, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
    }

    if (upWbs.code?.split(".").length === 8) {
      throw new Error("MONGO // collection_firmaWbs // " + functionName + " // Daha fazla alt başlık oluşturamazsınız.")
    }

    if (upWbs.openForPoz == true) {
      throw new Error("MONGO // collection_firmaWbs // " + functionName + " // __mesajBaslangic__ Poz eklemeye açmış olduğunuz başlığa alt başlık ekleyemezsiniz. Bu başlık altına hiç poz eklemediyseniz bu başlığı poz eklemeye kapatarak bu işlemi gerçekleştirebilirsiniz. Bu başlık altına poz eklediyseniz, yeni bir başlık hiyerarşisi oluşturup, pozları yeni başlıklara taşıyarak bu işlemi dolaylı olarak gerçekleştirebilirsiniz. __mesajBitis__")
    }

    let upWbsCode = upWbs.code

    let text = upWbsCode + "."
    let level = text.split(".").length - 1
    let newNumber = 1
    let number

    firma.wbs.filter(item => item.code.indexOf(text) == 0 && item.code.split(".").length - 1 == level).map(item => {

      item.name === newWbsName && !errorFormObj.newWbsName ? errorFormObj.newWbsName = "Aynı grup içinde kullanılmış" : null
      item.codeName === newWbsCodeName && !errorFormObj.newWbsCodeName ? errorFormObj.newWbsCodeName = "Aynı grup içinde kullanılmış" : null

      // yeni eklenecek wbs son hane numarasını belirlemek için aynı seviyedeki diğer wbs son numaraları kontrol ediliyor
      number = parseInt(item.code.split(text)[1])
      if (number >= newNumber) {
        return newNumber = number + 1
      }

    })



    // errorFormObj ile ilgili açıklamalar yukarıda - açıklamalar yukarıda (form validation)
    if (Object.keys(errorFormObj).length) return ({ errorFormObj })


    let newWbsItem = {
      _id: BSON.ObjectId(),
      code: text + newNumber,
      name: newWbsName,
      codeName: newWbsCodeName,
      includesPoz: false,
      openForPoz: false
    }

    try {

      await collection_Firmalar.updateOne(
        { _id: _firmaId }, // Query for the user object of the logged in user
        // { $set: {wbs:[newWbsItem]} }, // Set the logged in user's favorite color to purple
        { "$push": { "wbs": newWbsItem } }
        // { upsert: true }
      );

      // return newWbsItem[0].code
      return { ...firma, wbs: [...firma.wbs, newWbsItem] }

    } catch (err) {

      throw new Error("MONGO // collection_firmaWbs // " + functionName + " // " + err.message)
    }

  }



};