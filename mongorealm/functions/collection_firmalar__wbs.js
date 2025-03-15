exports = async function ({
  _firmaId, upWbsId, newWbsName, newWbsCodeName, functionName, _wbsId
}) {


  const user = context.user
  const _userId = new BSON.ObjectId(user.id)
  const userEmail = context.user.data.email
  const mailTeyit = user.custom_data.mailTeyit
  if (!mailTeyit) throw new Error("MONGO // collection_firmalar__wbs // Öncelikle üyeliğinize ait mail adresinin size ait olduğunu doğrulamalısınız, tekrar giriş yapmayı deneyiniz veya bizimle iletişime geçiniz.")



  if (functionName == "createFirmaWbs") {

    if (typeof _firmaId !== "object") throw new Error("MONGO // collection_firmalar__wbs // " + functionName + " // -- sorguya gönderilen --firmaId-- türü doğru değil, lütfen Rapor7/24 ile irtibata geçiniz. ")

    if (!(upWbsId === "0" || typeof upWbsId === "object")) throw new Error("MONGO // collection_firmalar__wbs // " + functionName + " // --upWbsId-- sorguya, gönderilmemiş, sayfayı yenileyiniz, sorun deva ederse Rapor7/24 ile irtibata geçiniz. ")


    // aşağıdaki form verilerinden birinde hata tespit edilmişse
    // alt satırda oluşturulan errorFormObj objesine form verisi ile ilişkilendirilmiş  property oluşturulup, içine yazı yazılıyor
    // property isimleri yukarıda ilk satırda frontend den gelen verileri yakalarken kullanılanlar ile aynı 
    // fonksiyon returnü olarak errorFormObj objesi döndürülüyor, frontenddeki form ekranında form verisine ait ilgili alanda bu yazı gösteriliyor
    // form ile ilişkilendirilmiş ilgili alana ait bir ke hata yazısı yazılmışsa yani null değilse üstüne yazı yazılmıyor, ilk tespit edilen hata değiştirilmmeiş oluyor

    const errorObject = {}

    // newWbsName
    if (typeof newWbsName !== "string") {
      throw new Error("MONGO // collection_firmalar__wbs // " + functionName + " / db ye gelen wbsName türü 'string' türünde değil, sayfayı yenileyiniz, sorun devam ederse Rapor724 ile iritbata geçiniz.")
    }

    if (newWbsName.length < 1) {
      errorObject.wbsNameError = "Boş bırakılamaz"
    }


    // newWbsCodeName
    if (typeof newWbsCodeName !== "string") {
      throw new Error("MONGO // collection_firmalar__wbs // " + functionName + " / db ye gelen wbsCodeName türü 'string' türünde değil, sayfayı yenileyiniz, sorun devam ederse Rapor724 ile iritbata geçiniz.")
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
    if (!firma) throw new Error("MONGO // collection_firmalar__wbs // " + functionName + " // _firmaId ile sistemde firma bulunamadı, lütfen sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")




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
          { _id: _firmaId },
          [
            { $set: { wbs: [newWbsItem] } }
          ]
        );

        if (resultMongo.modifiedCount === 1) {
          // return {...firma, wbs:[...[firma.wbs], newWbsItem]} - firma.wbs null olduğu için bu hata veriyordu, aşağıda kaldırdık, düzeldi
          return { wbs: [newWbsItem] }
        }

        // beklenen sonuç değil ama gelen sonuç frontend de yorumlansın
        return resultMongo

      } catch (err) {

        throw new Error("MONGO // collection_firmalar__wbs // " + functionName + " // bölüm 1 " + err.message)
      }

    }



    // 2/4.seçenek - yukarıda bitmemiş
    // en üst düzeye kayıt yapılacaksa - aşağıdaki fonksiyonlar en üst seviyeye göre hazırlanmış 
    if (upWbsId === "0") {

      let newNumber = 1
      let number

      firma.wbs.filter(item => !item.code.includes(".")).map(item => {

        item.name === newWbsName ? errorFormObj.newWbsName = "Aynı grup içinde kullanılmış" : null
        item.codeName === newWbsCodeName ? errorFormObj.newWbsCodeName = "Aynı grup içinde kullanılmış" : null

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

        // await collection_Firmalar.updateOne(
        //   { _id: _firmaId },
        //   // { $set: {wbs:newWbs} }, // Set the logged in user's favorite color to purple
        //   { "$push": { "wbs": newWbsItem } }
        //   // { upsert: true }
        // );       

        const result = await collection_Firmalar.updateOne(
          { _id: _firmaId },
          [
            { $set: { wbs: { $concatArrays: ["$wbs", [newWbsItem]] } } }
          ]
        );

        // return newWbsItem[0].code
        return { wbs: [...firma.wbs, newWbsItem] }

      } catch (err) {

        throw new Error("MONGO // collection_firmalar__wbs // " + functionName + " // " + err.message)
      }

    }




    // 3/4.seçenek - yukarıda bitmemiş
    // en üst düzey olmayıp mevcut wbs kaydına ekleme yapılacaksa

    let upWbs = firma.wbs.find(item => item._id.toString() == upWbsId.toString())
    if (!upWbs) {
      throw new Error("MONGO // collection_firmalar__wbs // " + functionName + " // upWbsId sistemde bulunamadı, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
    }

    if (upWbs.code?.split(".").length === 8) {
      throw new Error("MONGO // collection_firmalar__wbs // " + functionName + " // Daha fazla alt başlık oluşturamazsınız.")
    }

    if (upWbs.openForPoz == true) {
      throw new Error("MONGO // collection_firmalar__wbs // " + functionName + " // __mesajBaslangic__ Poz eklemeye açmış olduğunuz başlığa alt başlık ekleyemezsiniz. Bu başlık altına hiç poz eklemediyseniz bu başlığı poz eklemeye kapatarak bu işlemi gerçekleştirebilirsiniz. Bu başlık altına poz eklediyseniz, yeni bir başlık hiyerarşisi oluşturup, pozları yeni başlıklara taşıyarak bu işlemi dolaylı olarak gerçekleştirebilirsiniz. __mesajBitis__")
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

      throw new Error("MONGO // collection_firmalar__wbs // " + functionName + " // " + err.message)
    }

  }


  if (functionName == "openWbsForPoz") {

    if (typeof _firmaId != "object") throw new Error("MONGO // collection_firmalar__wbs // " + functionName + " // -- sorguya gönderilen --firmaId-- türü doğru değil, lütfen Rapor7/24 ile irtibata geçiniz. ")
    if (typeof _wbsId != "object") throw new Error("MONGO // collection_firmalar__wbs // " + functionName + " // -- sorguya gönderilen --_wbsId-- türü doğru değil, lütfen Rapor7/24 ile irtibata geçiniz. ")

    const collection_Firmalar = context.services.get("mongodb-atlas").db("rapor724_v2").collection("firmalar")
    const firma = await collection_Firmalar.findOne({ _id: _firmaId, "kisiler.email": userEmail, isDeleted: false })
    if (!firma) throw new Error("MONGO // collection_firmalar__wbs // " + functionName + " // _firmaId ile sistemde firma bulunamadı, lütfen sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")

    if (!firma.wbs) throw new Error("MONGO // collection_firmalar__wbs // " + functionName + " // Firmaya ait WBS bulunamadı")

    let wbs = firma.wbs.find(item => item._id.toString() == _wbsId.toString())
    if (!wbs) {
      throw new Error("MONGO // collection_firmalar__wbs // " + functionName + " // _wbsId sistemde bulunamadı, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
    }

    // wbsCode un alt seviyeleri mevcutsa direk poz eklenemesin
    // burada includes kullanamayız çünkü içinde değil başında arıyoruz
    let text = wbs.code + "."
    if (firma.wbs.find(item => item.code.indexOf(text) === 0)) {
      throw new Error("MONGO // collection_firmalar__wbs // " + functionName + " //  __mesajBaslangic__ Alt başlığı bulunan başlıklar poz eklemeye açılamaz. __mesajBitis__")
    }



    try {

      const newWbsArray = firma.wbs.map(item => {
        if (item.code === wbs.code) {
          return { ...item, openForPoz: true }
        } else {
          return item
        }
      })

      const result = await collection_Firmalar.updateOne(
        { _id: _firmaId }, // Query for the user object of the logged in user
        { $set: { wbs: newWbsArray } }, // Set the logged in user's favorite color to purple
        // { "$push": { "wbs": newWbsItem  } }
        // { upsert: true }
      );

      return { ...firma, wbs: newWbsArray }

    } catch (err) {
      return { error: err.message }
    }

  }



  if (functionName == "closeWbsForPoz") {

    if (typeof _firmaId != "object") throw new Error("MONGO // collection_firmalar__wbs // " + functionName + " // -- sorguya gönderilen --firmaId-- türü doğru değil, lütfen Rapor7/24 ile irtibata geçiniz. ")
    if (typeof _wbsId != "object") throw new Error("MONGO // collection_firmalar__wbs // " + functionName + " // -- sorguya gönderilen --_wbsId-- türü doğru değil, lütfen Rapor7/24 ile irtibata geçiniz. ")

    const collection_Firmalar = context.services.get("mongodb-atlas").db("rapor724_v2").collection("firmalar")
    const firma = await collection_Firmalar.findOne({ _id: _firmaId, "kisiler.email": userEmail, isDeleted: false })
    if (!firma) throw new Error("MONGO // collection_firmalar__wbs // " + functionName + " // _firmaId ile sistemde firma bulunamadı, lütfen sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")

    if (!firma.wbs) throw new Error("MONGO // collection_firmalar__wbs // " + functionName + " // Firmaya ait WBS bulunamadı")

    let theWbs = firma.wbs.find(item => item._id.toString() == _wbsId.toString())
    if (!theWbs) throw new Error("MONGO // collection_firmalar__wbs // Sorguya gönderilen wbsId sistemde bulunamadı, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")

    // aşağıda pozlar collection da poz var mı diye sorgulama yapmaya gerek kalmadı
    if (theWbs.includesPoz) throw new Error("MONGO // collection_firmalar__wbs // Seçili başlık altında kayıtlı pozlar mevcut olduğu için silinemez, öncelikle pozları silmeli ya da başka başlık altına taşımalısınız.")

    const collection_FirmaPozlar = context.services.get("mongodb-atlas").db("rapor724_v2_firmaPozlar").collection(_firmaId.toString())
    const poz = await collection_FirmaPozlar.findOne({ _wbsId, isDeleted: false })

    // wbs altına poz eklenmişse silinmesin, pozlara ulaşamayız
    if (poz) throw new Error("MONGO // collection_firmalar__wbs // Seçili başlık altında kayıtlı pozlar mevcut olduğu için silinemez, öncelikle pozları silmeli ya da başka başlık altına taşımalısınız.")


    try {

      const newWbsArray = firma.wbs.map(item => {
        if (item.code === theWbs.code) {
          return { ...item, openForPoz: false }
        } else {
          return item
        }
      })

      const result = await collection_Firmalar.updateOne(
        { _id: _firmaId }, // Query for the user object of the logged in user
        { $set: { wbs: newWbsArray } }, // Set the logged in user's favorite color to purple
        // { "$push": { "wbs": newWbsItem  } }
        // { upsert: true }
      );

      return { ...firma, wbs: newWbsArray }

    } catch (err) {
      throw new Error({ error: err.message })
    }


  }




  throw new Error("MONGO // collection_firmalar__wbs // " + functionName + " // " + "Herhangi bir fonksiyona uğramadı, 'functionName' eşleşmedi ya da boş gönderildi ")


};