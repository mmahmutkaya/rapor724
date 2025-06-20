exports = async function ({
  _firmaId, upWbsId, newWbsName, newWbsCodeName, functionName, _wbsId
}) {


  const user = context.user
  const _userId = new BSON.ObjectId(user.id)
  const userEmail = context.user.data.email
  const mailTeyit = user.custom_data.mailTeyit
  if (!mailTeyit) throw new Error("MONGO // collection_firmalar__wbs // Öncelikle üyeliğinize ait mail adresinin size ait olduğunu doğrulamalısınız, tekrar giriş yapmayı deneyiniz veya bizimle iletişime geçiniz.")



  if (functionName == "createWbs") {

    if (typeof _firmaId !== "object") throw new Error("MONGO // collection_firmalar__wbs // " + functionName + " // -- sorguya gönderilen --firmaId-- türü doğru değil, lütfen Rapor7/24 ile irtibata geçiniz. ")

    if (!(upWbsId === "0" || typeof upWbsId === "object")) throw new Error("MONGO // collection_firmalar__wbs // " + functionName + " // --upWbsId-- sorguya, gönderilmemiş, sayfayı yenileyiniz, sorun deva ederse Rapor7/24 ile irtibata geçiniz. ")


    // aşağıdaki form verilerinden birinde hata tespit edilmişse
    // alt satırda oluşturulan errorObject objesine form verisi ile ilişkilendirilmiş  property oluşturulup, içine yazı yazılıyor
    // property isimleri yukarıda ilk satırda frontend den gelen verileri yakalarken kullanılanlar ile aynı 
    // fonksiyon returnü olarak errorObject objesi döndürülüyor, frontenddeki form ekranında form verisine ait ilgili alanda bu yazı gösteriliyor
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
    const firma = await collection_Firmalar.findOne({ _id: _firmaId, "yetkiliKisiler.email": userEmail, isDeleted: false })
    if (!firma) throw new Error("MONGO // collection_firmalar__wbs // " + functionName + " // _firmaId ile sistemde firma bulunamadı, lütfen sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")




    // 1/3.seçenek - yukarıda bitmemiş
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

        const result = await collection_Firmalar.updateOne(
          { _id: _firmaId },
          [
            { $set: { wbs: [newWbsItem] } }
          ]
        );

        return { result, wbs: [newWbsItem] }

      } catch (err) {

        throw new Error("MONGO // collection_firmalar__wbs // " + functionName + " // bölüm 1/3 " + err.message)
      }

    }



    // 2/3.seçenek - yukarıda bitmemiş
    // en üst düzeye kayıt yapılacaksa - aşağıdaki fonksiyonlar en üst seviyeye göre hazırlanmış 
    if (upWbsId === "0") {

      let newNumber = 1
      let number

      firma.wbs.filter(item => !item.code.includes(".")).map(item => {

        item.name === newWbsName ? errorObject.wbsNameError = "Aynı grup içinde kullanılmış" : null
        item.codeName === newWbsCodeName ? errorObject.wbsCodeNameError = "Aynı grup içinde kullanılmış" : null

        number = parseInt(item.code)

        if (number >= newNumber) {
          return newNumber = number + 1
        }

      })

      if (Object.keys(errorObject).length) return ({ errorObject })


      const newWbsItem = {
        _id: BSON.ObjectId(),
        code: newNumber.toString(),
        name: newWbsName,
        codeName: newWbsCodeName,
        includesPoz: false,
        openForPoz: false
      }


      try {

        const result = await collection_Firmalar.updateOne(
          { _id: _firmaId },
          [
            { $set: { wbs: { $concatArrays: ["$wbs", [newWbsItem]] } } }
          ]
        );

        let currentWbsArray = firma.wbs
        let newWbsArray = [...currentWbsArray, newWbsItem]

        return { result, wbs: newWbsArray }

      } catch (err) {

        throw new Error("MONGO // collection_firmalar__wbs // " + functionName + " // bölüm 2/3 " + err.message)
      }

    }




    // 3/3.seçenek - yukarıda bitmemiş
    // en üst düzey olmayıp mevcut wbs kaydına ekleme yapılacaksa

    let upWbs = firma.wbs.find(item => item._id.toString() == upWbsId.toString())
    if (!upWbs) {
      throw new Error("MONGO // collection_firmalar__wbs // " + functionName + " // upWbsId sistemde bulunamadı, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
    }

    if (upWbs.code?.split(".").length === 8) {
      throw new Error("MONGO // collection_firmalar__wbs // " + functionName + " // __mesajBaslangic__ Daha fazla alt başlık oluşturamazsınız. __mesajBitis__")
    }

    if (upWbs.openForPoz == true) {
      throw new Error("MONGO // collection_firmalar__wbs // " + functionName + " // __mesajBaslangic__ Poz eklemeye açmış olduğunuz başlığa alt başlık ekleyemezsiniz. __mesajBitis__")
    }

    let upWbsCode = upWbs.code

    let text = upWbsCode + "."
    let level = text.split(".").length - 1
    let newNumber = 1
    let number

    firma.wbs.filter(item => item.code.indexOf(text) == 0 && item.code.split(".").length - 1 == level).map(item => {

      item.name === newWbsName ? errorObject.wbsNameError = "Aynı grup içinde kullanılmış" : null
      item.codeName === newWbsCodeName ? errorObject.wbsCodeNameError = "Aynı grup içinde kullanılmış" : null

      // yeni eklenecek wbs son hane numarasını belirlemek için aynı seviyedeki diğer wbs son numaraları kontrol ediliyor
      number = parseInt(item.code.split(text)[1])
      if (number >= newNumber) {
        return newNumber = number + 1
      }

    })

    if (Object.keys(errorObject).length) return ({ errorObject })


    let newWbsItem = {
      _id: BSON.ObjectId(),
      code: text + newNumber,
      name: newWbsName,
      codeName: newWbsCodeName,
      includesPoz: false,
      openForPoz: false
    }

    try {

      const result = await collection_Firmalar.updateOne(
        { _id: _firmaId },
        [
          { $set: { wbs: { $concatArrays: ["$wbs", [newWbsItem]] } } }
        ]
      );

      let currentWbsArray = firma.wbs
      let newWbsArray = [...currentWbsArray, newWbsItem]

      return { result, wbs: newWbsArray }

    } catch (err) {

      throw new Error("MONGO // collection_firmalar__wbs // " + functionName + " // bölüm 3/3 " + err.message)
    }

  }


  if (functionName == "updateWbs") {

    if (typeof _firmaId !== "object") throw new Error("MONGO // collection_firmalar__wbs // " + functionName + " // -- sorguya gönderilen --firmaId-- türü doğru değil, lütfen Rapor7/24 ile irtibata geçiniz. ")

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
    const firma = await collection_Firmalar.findOne({ _id: _firmaId, isDeleted: false })
    if (!firma) throw new Error("MONGO // collection_firmalar__wbs // " + functionName + " // _firmaId ile sistemde firma bulunamadı, lütfen sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
    if (!firma.wbs.find(x => x._id.toString() === _wbsId)) throw new Error("MONGO // collection_firmalar__wbs // " + functionName + " // güncellenmek istenen _wbsId sistemde bulunamadı, lütfen sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")


    try {

      const newWbsArray = firma.wbs.map(item => {
        if (item._id.toString() === _wbsId.toString()) {
          return { ...item, newWbsName, newWbsCodeName }
        } else {
          return item
        }
      })

      const result = await collection_Firmalar.updateOne(
        { _id: _firmaId },
        [
          { $set: { wbs: newWbsArray } }
        ]
      );

      return { result, wbs: newWbsArray }

    } catch (err) {
      throw new Error("MONGO // collection_firmalar__wbs // " + functionName + " // " + err.message)
    }

  }



  if (functionName == "openWbsForPoz") {

    if (typeof _firmaId != "object") throw new Error("MONGO // collection_firmalar__wbs // " + functionName + " // -- sorguya gönderilen --firmaId-- türü doğru değil, lütfen Rapor7/24 ile irtibata geçiniz. ")
    if (typeof _wbsId != "object") throw new Error("MONGO // collection_firmalar__wbs // " + functionName + " // -- sorguya gönderilen --_wbsId-- türü doğru değil, lütfen Rapor7/24 ile irtibata geçiniz. ")

    const collection_Firmalar = context.services.get("mongodb-atlas").db("rapor724_v2").collection("firmalar")
    const firma = await collection_Firmalar.findOne({ _id: _firmaId, "yetkiliKisiler.email": userEmail, isDeleted: false })
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
        { _id: _firmaId },
        [
          { $set: { wbs: newWbsArray } }
        ]
      );

      return { result, wbs: newWbsArray }

    } catch (err) {
      throw new Error("MONGO // collection_firmalar__wbs // " + functionName + " // " + err.message)
    }

  }



  if (functionName == "closeWbsForPoz") {

    if (typeof _firmaId != "object") throw new Error("MONGO // collection_firmalar__wbs // " + functionName + " // -- sorguya gönderilen --firmaId-- türü doğru değil, lütfen Rapor7/24 ile irtibata geçiniz. ")
    if (typeof _wbsId != "object") throw new Error("MONGO // collection_firmalar__wbs // " + functionName + " // -- sorguya gönderilen --_wbsId-- türü doğru değil, lütfen Rapor7/24 ile irtibata geçiniz. ")

    const collection_Firmalar = context.services.get("mongodb-atlas").db("rapor724_v2").collection("firmalar")
    const firma = await collection_Firmalar.findOne({ _id: _firmaId, "yetkiliKisiler.email": userEmail, isDeleted: false })
    if (!firma) throw new Error("MONGO // collection_firmalar__wbs // " + functionName + " // _firmaId ile sistemde firma bulunamadı, lütfen sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")

    if (!firma.wbs) throw new Error("MONGO // collection_firmalar__wbs // " + functionName + " // Firmaya ait WBS bulunamadı")

    let theWbs = firma.wbs.find(item => item._id.toString() == _wbsId.toString())
    if (!theWbs) throw new Error("MONGO // collection_firmalar__wbs // " + functionName + " // " + "Sorguya gönderilen wbsId sistemde bulunamadı, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")

    // aşağıda pozlar collection da poz var mı diye sorgulama yapmaya gerek kalmadı
    if (theWbs.includesPoz) throw new Error("MONGO // collection_firmalar__wbs // " + functionName + " // " + "__mesajBaslangic__ Seçili başlık altında kayıtlı pozlar mevcut, öncelikle pozları silmeli ya da başka başlık altına taşımalısınız. __mesajBitis__")

    const collection_FirmaPozlar = context.services.get("mongodb-atlas").db("rapor724_v2_firmaPozlar").collection(_firmaId.toString())
    const poz = await collection_FirmaPozlar.findOne({ _wbsId, isDeleted: false })

    // wbs altına poz eklenmişse silinmesin, pozlara ulaşamayız
    if (poz) throw new Error("MONGO // collection_firmalar__wbs // " + functionName + " // " + "__mesajBaslangic__ Seçili başlık altında kayıtlı pozlar mevcut, öncelikle pozları silmeli ya da başka başlık altına taşımalısınız. __mesajBitis__")


    try {

      const newWbsArray = firma.wbs.map(item => {
        if (item.code === theWbs.code) {
          return { ...item, openForPoz: false }
        } else {
          return item
        }
      })

      const result = await collection_Firmalar.updateOne(
        { _id: _firmaId },
        [
          { $set: { wbs: newWbsArray } }
        ]
      );

      return { result, wbs: newWbsArray }

    } catch (err) {
      throw new Error("MONGO // collection_firmalar__wbs // " + functionName + " // " + err.message)
    }


  }




  if (functionName == "deleteWbs") {

    if (typeof _firmaId != "object") throw new Error("MONGO // collection_firmalar__wbs // " + functionName + " // -- sorguya gönderilen --firmaId-- türü doğru değil, lütfen Rapor7/24 ile irtibata geçiniz. ")
    if (typeof _wbsId != "object") throw new Error("MONGO // collection_firmalar__wbs // " + functionName + " // -- sorguya gönderilen --_wbsId-- türü doğru değil, lütfen Rapor7/24 ile irtibata geçiniz. ")

    const collection_Firmalar = context.services.get("mongodb-atlas").db("rapor724_v2").collection("firmalar")
    const firma = await collection_Firmalar.findOne({ _id: _firmaId, "yetkiliKisiler.email": userEmail, isDeleted: false })
    if (!firma) throw new Error("MONGO // collection_firmalar__wbs // " + functionName + " // _firmaId ile sistemde firma bulunamadı, lütfen sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")

    let { wbs: currentWbsArray } = firma
    if (!currentWbsArray) throw new Error("MONGO // collection_firmalar__wbs // " + functionName + " // Firmaya ait WBS bulunamadı")

    let oneWbs = currentWbsArray.find(item => item._id.toString() == _wbsId.toString())
    if (!oneWbs) throw new Error("MONGO // collection_firmalar__wbs // " + functionName + " // Sorguya gönderilen wbsId sistemde bulunamadı, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")

    // aşağıda pozlar collection da poz var mı diye sorgulama yapmaya gerek kalmadı
    if (oneWbs.openForPoz) throw new Error("MONGO // collection_firmalar__wbs // " + functionName + " // __mesajBaslangic__ Poz eklemeye açık başlıklar silinemez. __mesajBitis__")

    // wbs in alt seviyeleri mevcutsa silinmesin
    // burada includes kullanamayız çünkü içinde değil başında arıyoruz
    let { code: oneWbsCode } = oneWbs
    if (currentWbsArray.find(item => item.code.indexOf(oneWbsCode + ".") === 0)) {
      throw new Error("MONGO // collection_firmalar__wbs // " + functionName + " // " + "Silmek istediğiniz  WBS'in alt seviyeleri mevcut, öncelikle onları silmelisiniz.")
    }

    const collection_FirmaPozlar = context.services.get("mongodb-atlas").db("rapor724_v2_firmaPozlar").collection(_firmaId.toString())
    const poz = await collection_FirmaPozlar.findOne({ _wbsId, isDeleted: false })

    // wbs altına poz eklenmişse silinmesin, pozlara ulaşamayız
    if (poz) throw new Error("MONGO // collection_firmalar__wbs // " + functionName + " // " + "__mesajBaslangic__ Altında poz bulunan başlıklar silinemez. __mesajBitis__")




    // 1/2. seçenek -- en üst seviyede silme yapılacaksa
    if (!oneWbsCode.includes(".")) {

      try {

        const willBeDeletedWbsCode = oneWbsCode
        // const leftPart = willBeDeletedWbsCode.substring(0, willBeDeletedWbsCode.lastIndexOf("."))

        // seçili wbs i listeden çıkarma
        const newWbsArray = currentWbsArray.filter(item => {
          if (item.code != willBeDeletedWbsCode) {
            return item
          }
        })


        // silinme işleminden sonra komşu wbs lerin code numarasını düzenleme, silinenden sonrakilerin code numarasında ilgili kısmı 1 azaltma
        // değişecek wbs code ların alt wbs leri de olabilir, alt wbs lerinde ilgili haneleri 1 azalmalı
        // unutma bu kısım en üst wbs ler için aşağıdan farklı

        // en üst (0) seviye olduğu için tek hane ve kendisi silinecek sayı zaten
        let willBeDeletedNumber = parseInt(willBeDeletedWbsCode)
        let longText
        let rightPart
        let theNumberText
        let theNumber

        const newWbsArray2 = newWbsArray.map(item => {

          longText = item.code

          if (longText.includes(".")) {
            theNumberText = longText.split(".")[0]
            theNumber = parseInt(theNumberText)
            // rightPart 11.23.45 --> 23.45
            rightPart = longText.substring(theNumberText.length + 1, longText.length)
            if (theNumber > willBeDeletedNumber) {
              return { ...item, code: (theNumber - 1) + "." + rightPart }
            } else {
              return item
            }
          }

          if (!longText.includes(".")) {
            // theNumberText = longText.split(".")[0]
            // theNumberText = longText
            // theNumber = parseInt(theNumberText)
            theNumber = parseInt(longText)

            if (theNumber > willBeDeletedNumber) {
              return { ...item, code: (theNumber - 1).toString() }
            } else {
              return item
            }
          }


        })

        // return newWbsArray2

        const result = await collection_Firmalar.updateOne(
          { _id: _firmaId },
          [
            { $set: { wbs: newWbsArray2 } }
          ]
        );

        return { result, wbs: newWbsArray2 }

      } catch (err) {
        throw new Error("MONGO // collection_firmalar__wbs // " + functionName + " // bölüm 1/2 " + err.message)
      }

    }





    // 2/2. seçenek -- en üst seviye değilse
    if (oneWbsCode.includes(".")) {

      try {

        const willBeDeletedWbsCode = oneWbsCode

        // seçili wbs i listeden çıkarma
        const newWbsArray = currentWbsArray.filter(item => {
          if (item.code != willBeDeletedWbsCode) {
            return item
          }
        })



        let level = willBeDeletedWbsCode.split(".").length - 1
        // silinecek wbs numarasının en son hanede olduğunu biliyoruz çünkü son haneden önceki hanesi silinecek olsa alt seviyesi olmuş olurdu, yukarıdaki kontrolden geçmezdi
        let willBeDeletedNumber = parseInt(willBeDeletedWbsCode.split(".")[level])

        // leftPart - değişecek hane son hane demiştik, sabit baş kısmını alıyoruz, aşağıda işlem yapacağız -- 11.23.45 --> 11.23
        const leftPart = willBeDeletedWbsCode.substring(0, willBeDeletedWbsCode.lastIndexOf("."))
        let longText
        let rightPartWithTheNumber
        let rightPart
        let theNumberText
        let theNumber
        //
        const newWbsArray2 = newWbsArray.map(item => {

          if (item.code.indexOf(leftPart) === 0) {
            longText = item.code
            rightPartWithTheNumber = longText.substring(leftPart.length + 1, longText.length)
            theNumberText = rightPartWithTheNumber.split(".")[0]
            theNumber = parseInt(theNumberText)
            rightPart = rightPartWithTheNumber.substring(theNumberText.length + 1, rightPartWithTheNumber.length)

            if (theNumber > willBeDeletedNumber) {
              if (rightPart.length) {
                return { ...item, code: leftPart + "." + (theNumber - 1) + "." + rightPart }
              } else {
                return { ...item, code: leftPart + "." + (theNumber - 1) }
              }
            } else {
              return item
            }

          } else {
            return item
          }
        })

        // return newWbsArray2

        const result = await collection_Firmalar.updateOne(
          { _id: _firmaId },
          [
            { $set: { wbs: newWbsArray2 } }
          ]
        );

        return { result, wbs: newWbsArray2 }

      } catch (err) {
        throw new Error("MONGO // collection_firmalar__wbs // " + functionName + " // bölüm 1/2 " + err.message)
      }


    }

  }






  if (functionName == "moveWbsUp") {

    if (typeof _firmaId != "object") throw new Error("MONGO // collection_firmalar__wbs // " + functionName + " // -- sorguya gönderilen --firmaId-- türü doğru değil, lütfen Rapor7/24 ile irtibata geçiniz. ")
    if (typeof _wbsId != "object") throw new Error("MONGO // collection_firmalar__wbs // " + functionName + " // -- sorguya gönderilen --_wbsId-- türü doğru değil, lütfen Rapor7/24 ile irtibata geçiniz. ")

    const collection_Firmalar = context.services.get("mongodb-atlas").db("rapor724_v2").collection("firmalar")
    const firma = await collection_Firmalar.findOne({ _id: _firmaId, "yetkiliKisiler.email": userEmail, isDeleted: false })
    if (!firma) throw new Error("MONGO // collection_firmalar__wbs // " + functionName + " // _firmaId ile sistemde firma bulunamadı, lütfen sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")

    let { wbs: currentWbsArray } = firma
    if (!currentWbsArray) throw new Error("MONGO // collection_firmalar__wbs // " + functionName + " // Firmaya ait WBS bulunamadı")

    let oneWbs = currentWbsArray.find(item => item._id.toString() == _wbsId.toString())
    if (!oneWbs) throw new Error("MONGO // collection_firmalar__wbs // " + functionName + " // Sorguya gönderilen wbsId sistemde bulunamadı, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")


    let _wbs = currentWbsArray
    let _selectedWbs = oneWbs
    let _wbs2



    let leftPart
    let level
    let sortNumber
    let longText

    leftPart = _selectedWbs.code.substring(0, _selectedWbs.code.lastIndexOf("."))
    level = _selectedWbs.code.split(".").length - 1
    sortNumber = Number(_selectedWbs.code.split(".")[level])
    longText = _selectedWbs.code

    // bu kontrol fromtend de ayrıca yapılmalı - kontrol
    if (sortNumber == 1) {
      throw new Error("Zaten en üstte")
    }

    let switch1 = false


    // taşınacak başlık en üst seviyede ise
    if (!leftPart) {

      _wbs2 = _wbs.map(item => {

        let leftPart2
        let level2
        let sortNumber2
        let longText2
        let rightPartWithTheNumber2
        let rightPart2
        let theNumberText2
        let theNumber2

        longText2 = item.code


        level2 = longText2.split(".").length - 1
        rightPartWithTheNumber2 = longText2
        theNumberText2 = rightPartWithTheNumber2.split(".")[0]
        theNumber2 = parseInt(theNumberText2)
        rightPart2 = rightPartWithTheNumber2.substring(theNumberText2.length + 1, rightPartWithTheNumber2.length)

        // aynı seviyede bir üstünde varsa onu alta alma işlemi, switch kontrolü yapılıyor, üstünde yoksa işlem yok diye
        if (level2 == level && theNumber2 == sortNumber - 1) {
          let deneme = { ...item, code: (theNumber2 + 1).toString() }
          // console.log("deneme", deneme)
          switch1 = true
          return deneme
        }

        // aynı seviyede bir üstünde varsa onun alt başlıklarını alta alma işlemi, switch kontrlüne gerek yok, zaten üst başlığında yapıldı
        if (level2 > level && theNumber2 == sortNumber - 1) {
          let deneme2 = { ...item, code: (theNumber2 + 1) + "." + rightPart2 }
          // console.log("deneme2", deneme2)
          return deneme2
        }

        // taşınacak wbs i bir üste alma işlemi, switch kontrlüne gerek yok, zaten bu var kendisi
        if (level2 == level && theNumber2 == sortNumber) {
          let deneme3 = { ...item, code: (theNumber2 - 1).toString() }
          // console.log("deneme3", deneme3)
          return deneme3
        }

        // taşınacak wbs in alt başlıklarını bir üste alma işlemi, switch kontrlüne gerek yok, zaten üst başlığında yapıldı
        if (level2 > level && theNumber2 == sortNumber) {
          let deneme4 = { ...item, code: (theNumber2 - 1) + "." + rightPart2 }
          // console.log("deneme4", deneme4)
          return deneme4
        }

        return item

      })
    }


    // taşınacak başlık en üst seviyede değilse
    if (leftPart) {

      _wbs2 = _wbs.map(item => {

        let leftPart2
        let level2
        let sortNumber2
        let longText2
        let rightPartWithTheNumber2
        let rightPart2
        let theNumberText2
        let theNumber2

        longText2 = item.code

        if (longText2.indexOf(leftPart + ".") === 0) {

          level2 = longText2.split(".").length - 1
          rightPartWithTheNumber2 = longText2.substring(leftPart.length + 1, longText2.length)
          theNumberText2 = rightPartWithTheNumber2.split(".")[0]
          theNumber2 = parseInt(theNumberText2)
          rightPart2 = rightPartWithTheNumber2.substring(theNumberText2.length + 1, rightPartWithTheNumber2.length)
          // console.log("rightPartWithTheNumber2", rightPartWithTheNumber2)
          // console.log("theNumber2", theNumber2)
          // console.log("rightPart2", rightPart2)
          // console.log("---")

          // aynı seviyede bir üstünde varsa onu alta alma işlemi, switch kontrolü yapılıyor, üstünde yoksa işlem yok diye
          if (level2 == level && theNumber2 == sortNumber - 1) {
            let deneme = { ...item, code: leftPart + "." + (theNumber2 + 1) }
            // console.log("deneme", deneme)
            switch1 = true
            return deneme
          }

          // aynı seviyede bir üstünde varsa onun alt başlıklarını alta alma işlemi, switch kontrlüne gerek yok, zaten üst başlığında yapıldı
          if (level2 > level && theNumber2 == sortNumber - 1) {
            let deneme2 = { ...item, code: leftPart + "." + (theNumber2 + 1) + "." + rightPart2 }
            // console.log("deneme2", deneme2)
            return deneme2
          }

          // taşınacak wbs i bir üste alma işlemi, switch kontrlüne gerek yok, zaten bu var kendisi
          if (level2 == level && theNumber2 == sortNumber) {
            let deneme3 = { ...item, code: leftPart + "." + (theNumber2 - 1) }
            // console.log("deneme3", deneme3)
            return deneme3
          }

          // taşınacak wbs in alt başlıklarını bir üste alma işlemi, switch kontrlüne gerek yok, zaten üst başlığında yapıldı
          if (level2 > level && theNumber2 == sortNumber) {
            let deneme4 = { ...item, code: leftPart + "." + (theNumber2 - 1) + "." + rightPart2 }
            // console.log("deneme4", deneme4)
            return deneme4
          }

        }

        return item

      })

    }

    try {

      if (switch1) {

        const result = await collection_Firmalar.updateOne(
          { _id: _firmaId },
          [
            { $set: { wbs: _wbs2 } }
          ]
        );

        return { result, wbs: _wbs2 }

      } else {

        // ya da bu döner
        return { wbs: currentWbsArray }

      }

    } catch (error) {
      throw new Error("MONGO // collection_firmalar__wbs // " + functionName + " // " + err.message)
    }

  }







  if (functionName == "moveWbsDown") {

    if (typeof _firmaId != "object") throw new Error("MONGO // collection_firmalar__wbs // " + functionName + " // -- sorguya gönderilen --firmaId-- türü doğru değil, lütfen Rapor7/24 ile irtibata geçiniz. ")
    if (typeof _wbsId != "object") throw new Error("MONGO // collection_firmalar__wbs // " + functionName + " // -- sorguya gönderilen --_wbsId-- türü doğru değil, lütfen Rapor7/24 ile irtibata geçiniz. ")

    const collection_Firmalar = context.services.get("mongodb-atlas").db("rapor724_v2").collection("firmalar")
    const firma = await collection_Firmalar.findOne({ _id: _firmaId, "yetkiliKisiler.email": userEmail, isDeleted: false })
    if (!firma) throw new Error("MONGO // collection_firmalar__wbs // " + functionName + " // _firmaId ile sistemde firma bulunamadı, lütfen sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")

    let { wbs: currentWbsArray } = firma
    if (!currentWbsArray) throw new Error("MONGO // collection_firmalar__wbs // " + functionName + " // Firmaya ait WBS bulunamadı")

    let oneWbs = currentWbsArray.find(item => item._id.toString() == _wbsId.toString())
    if (!oneWbs) throw new Error("MONGO // collection_firmalar__wbs // " + functionName + " // Sorguya gönderilen wbsId sistemde bulunamadı, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")


    let _wbs = currentWbsArray
    let _selectedWbs = oneWbs
    let _wbs2


    let leftPart
    let level
    let sortNumber
    let longText

    leftPart = _selectedWbs.code.substring(0, _selectedWbs.code.lastIndexOf("."))
    level = _selectedWbs.code.split(".").length - 1
    sortNumber = Number(_selectedWbs.code.split(".")[level])
    longText = _selectedWbs.code

    let switch1 = false


    // taşınacak başlık en üst seviyede ise
    if (!leftPart) {

      _wbs2 = _wbs.map(item => {

        let leftPart2
        let level2
        let longText2
        let rightPartWithTheNumber2
        let rightPart2
        let theNumberText2
        let theNumber2

        longText2 = item.code


        level2 = longText2.split(".").length - 1
        rightPartWithTheNumber2 = longText2
        theNumberText2 = rightPartWithTheNumber2.split(".")[0]
        theNumber2 = parseInt(theNumberText2)
        rightPart2 = rightPartWithTheNumber2.substring(theNumberText2.length + 1, rightPartWithTheNumber2.length)


        // aynı seviyede bir altında varsa onu üste alma işlemi, switch kontrlün yapılıyor, altında yoksa işlem yok diye
        if (level2 == level && theNumber2 == sortNumber + 1) {
          let deneme = { ...item, code: (sortNumber).toString() }
          // console.log("deneme", deneme)
          switch1 = true
          return deneme
        }

        // aynı seviyede bir altında varsa onun alt başlıklarını üste alma işlemi, switch kontrlüne gerek yok, zaten üst başlığında yapıldı
        if (level2 > level && theNumber2 == sortNumber + 1) {
          let deneme2 = { ...item, code: (sortNumber) + "." + rightPart2 }
          // console.log("deneme2", deneme2)
          return deneme2
        }

        // taşınacak wbs i bir alta alma işlemi, switch kontrlüne gerek yok, zaten bu var kendisi
        if (level2 == level && theNumber2 == sortNumber) {
          let deneme3 = { ...item, code: (sortNumber + 1).toString() }
          // console.log("deneme3", deneme3)
          return deneme3
        }

        // taşınacak wbs in alt başlıklarını bir alta alma işlemi, switch kontrlüne gerek yok, zaten üst başlığında yapıldı
        if (level2 > level && theNumber2 == sortNumber) {
          let deneme4 = { ...item, code: (sortNumber + 1) + "." + rightPart2 }
          // console.log("deneme4", deneme4)
          return deneme4
        }

        return item

      })
    }


    // taşınacak başlık en üst seviyede değilse
    if (leftPart) {

      _wbs2 = _wbs.map(item => {

        let leftPart2
        let level2
        let longText2
        let rightPartWithTheNumber2
        let rightPart2
        let theNumberText2
        let theNumber2

        longText2 = item.code

        if (longText2.indexOf(leftPart + ".") === 0) {

          level2 = longText2.split(".").length - 1
          rightPartWithTheNumber2 = longText2.substring(leftPart.length + 1, longText2.length)
          theNumberText2 = rightPartWithTheNumber2.split(".")[0]
          theNumber2 = parseInt(theNumberText2)
          rightPart2 = rightPartWithTheNumber2.substring(theNumberText2.length + 1, rightPartWithTheNumber2.length)
          // console.log("rightPartWithTheNumber2", rightPartWithTheNumber2)
          // console.log("theNumber2", theNumber2)
          // console.log("rightPart2", rightPart2)
          // console.log("---")

          // aynı seviyede bir altında varsa onu üste alma işlemi, switch kontrlün yapılıyor, altında yoksa işlem yok diye
          if (level2 == level && theNumber2 == sortNumber + 1) {
            let deneme = { ...item, code: leftPart + "." + (sortNumber) }
            // console.log("deneme", deneme)
            switch1 = true
            return deneme
          }

          // aynı seviyede bir altında varsa onun alt başlıklarını üste alma işlemi, switch kontrlüne gerek yok, zaten üst başlığında yapıldı
          if (level2 > level && theNumber2 == sortNumber + 1) {
            let deneme2 = { ...item, code: leftPart + "." + (sortNumber) + "." + rightPart2 }
            // console.log("deneme2", deneme2)
            return deneme2
          }

          // taşınacak wbs i bir alta alma işlemi, switch kontrlüne gerek yok, zaten bu var kendisi
          if (level2 == level && theNumber2 == sortNumber) {
            let deneme3 = { ...item, code: leftPart + "." + (sortNumber + 1) }
            // console.log("deneme3", deneme3)
            return deneme3
          }

          // taşınacak wbs in alt başlıklarını bir alta alma işlemi, switch kontrlüne gerek yok, zaten üst başlığında yapıldı
          if (level2 > level && theNumber2 == sortNumber) {
            let deneme4 = { ...item, code: leftPart + "." + (sortNumber + 1) + "." + rightPart2 }
            // console.log("deneme4", deneme4)
            return deneme4
          }

        }

        return item

      })

    }



    try {

      if (switch1) {

        const result = await collection_Firmalar.updateOne(
          { _id: _firmaId },
          [
            { $set: { wbs: _wbs2 } }
          ]
        );

        return { result, wbs: _wbs2 }

      } else {

        // ya da bu döner
        return { wbs: currentWbsArray }

      }

    } catch (error) {
      throw new Error("MONGO // collection_firmalar__wbs // " + functionName + " // " + err.message)
    }

  }







  if (functionName == "moveWbsDown") {

    if (typeof _firmaId != "object") throw new Error("MONGO // collection_firmalar__wbs // " + functionName + " // -- sorguya gönderilen --firmaId-- türü doğru değil, lütfen Rapor7/24 ile irtibata geçiniz. ")
    if (typeof _wbsId != "object") throw new Error("MONGO // collection_firmalar__wbs // " + functionName + " // -- sorguya gönderilen --_wbsId-- türü doğru değil, lütfen Rapor7/24 ile irtibata geçiniz. ")

    const collection_Firmalar = context.services.get("mongodb-atlas").db("rapor724_v2").collection("firmalar")
    const firma = await collection_Firmalar.findOne({ _id: _firmaId, "yetkiliKisiler.email": userEmail, isDeleted: false })
    if (!firma) throw new Error("MONGO // collection_firmalar__wbs // " + functionName + " // _firmaId ile sistemde firma bulunamadı, lütfen sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")

    let { wbs: currentWbsArray } = firma
    if (!currentWbsArray) throw new Error("MONGO // collection_firmalar__wbs // " + functionName + " // Firmaya ait WBS bulunamadı")

    let oneWbs = currentWbsArray.find(item => item._id.toString() == _wbsId.toString())
    if (!oneWbs) throw new Error("MONGO // collection_firmalar__wbs // " + functionName + " // Sorguya gönderilen wbsId sistemde bulunamadı, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")


    let _wbs = currentWbsArray
    let _selectedWbs = oneWbs
    let _wbs2


    let leftPart
    let level
    let sortNumber
    let longText

    leftPart = _selectedWbs.code.substring(0, _selectedWbs.code.lastIndexOf("."))
    level = _selectedWbs.code.split(".").length - 1
    sortNumber = Number(_selectedWbs.code.split(".")[level])
    longText = _selectedWbs.code

    let switch1 = false


    // taşınacak başlık en üst seviyede ise
    if (!leftPart) {

      _wbs2 = _wbs.map(item => {

        let leftPart2
        let level2
        let longText2
        let rightPartWithTheNumber2
        let rightPart2
        let theNumberText2
        let theNumber2

        longText2 = item.code


        level2 = longText2.split(".").length - 1
        rightPartWithTheNumber2 = longText2
        theNumberText2 = rightPartWithTheNumber2.split(".")[0]
        theNumber2 = parseInt(theNumberText2)
        rightPart2 = rightPartWithTheNumber2.substring(theNumberText2.length + 1, rightPartWithTheNumber2.length)


        // aynı seviyede bir altında varsa onu üste alma işlemi, switch kontrlün yapılıyor, altında yoksa işlem yok diye
        if (level2 == level && theNumber2 == sortNumber + 1) {
          let deneme = { ...item, code: (sortNumber).toString() }
          // console.log("deneme", deneme)
          switch1 = true
          return deneme
        }

        // aynı seviyede bir altında varsa onun alt başlıklarını üste alma işlemi, switch kontrlüne gerek yok, zaten üst başlığında yapıldı
        if (level2 > level && theNumber2 == sortNumber + 1) {
          let deneme2 = { ...item, code: (sortNumber) + "." + rightPart2 }
          // console.log("deneme2", deneme2)
          return deneme2
        }

        // taşınacak wbs i bir alta alma işlemi, switch kontrlüne gerek yok, zaten bu var kendisi
        if (level2 == level && theNumber2 == sortNumber) {
          let deneme3 = { ...item, code: (sortNumber + 1).toString() }
          // console.log("deneme3", deneme3)
          return deneme3
        }

        // taşınacak wbs in alt başlıklarını bir alta alma işlemi, switch kontrlüne gerek yok, zaten üst başlığında yapıldı
        if (level2 > level && theNumber2 == sortNumber) {
          let deneme4 = { ...item, code: (sortNumber + 1) + "." + rightPart2 }
          // console.log("deneme4", deneme4)
          return deneme4
        }

        return item

      })
    }


    // taşınacak başlık en üst seviyede değilse
    if (leftPart) {

      _wbs2 = _wbs.map(item => {

        let leftPart2
        let level2
        let longText2
        let rightPartWithTheNumber2
        let rightPart2
        let theNumberText2
        let theNumber2

        longText2 = item.code

        if (longText2.indexOf(leftPart + ".") === 0) {

          level2 = longText2.split(".").length - 1
          rightPartWithTheNumber2 = longText2.substring(leftPart.length + 1, longText2.length)
          theNumberText2 = rightPartWithTheNumber2.split(".")[0]
          theNumber2 = parseInt(theNumberText2)
          rightPart2 = rightPartWithTheNumber2.substring(theNumberText2.length + 1, rightPartWithTheNumber2.length)
          // console.log("rightPartWithTheNumber2", rightPartWithTheNumber2)
          // console.log("theNumber2", theNumber2)
          // console.log("rightPart2", rightPart2)
          // console.log("---")

          // aynı seviyede bir altında varsa onu üste alma işlemi, switch kontrlün yapılıyor, altında yoksa işlem yok diye
          if (level2 == level && theNumber2 == sortNumber + 1) {
            let deneme = { ...item, code: leftPart + "." + (sortNumber) }
            // console.log("deneme", deneme)
            switch1 = true
            return deneme
          }

          // aynı seviyede bir altında varsa onun alt başlıklarını üste alma işlemi, switch kontrlüne gerek yok, zaten üst başlığında yapıldı
          if (level2 > level && theNumber2 == sortNumber + 1) {
            let deneme2 = { ...item, code: leftPart + "." + (sortNumber) + "." + rightPart2 }
            // console.log("deneme2", deneme2)
            return deneme2
          }

          // taşınacak wbs i bir alta alma işlemi, switch kontrlüne gerek yok, zaten bu var kendisi
          if (level2 == level && theNumber2 == sortNumber) {
            let deneme3 = { ...item, code: leftPart + "." + (sortNumber + 1) }
            // console.log("deneme3", deneme3)
            return deneme3
          }

          // taşınacak wbs in alt başlıklarını bir alta alma işlemi, switch kontrlüne gerek yok, zaten üst başlığında yapıldı
          if (level2 > level && theNumber2 == sortNumber) {
            let deneme4 = { ...item, code: leftPart + "." + (sortNumber + 1) + "." + rightPart2 }
            // console.log("deneme4", deneme4)
            return deneme4
          }

        }

        return item

      })

    }



    try {

      if (switch1) {

        const result = await collection_Firmalar.updateOne(
          { _id: _firmaId },
          [
            { $set: { wbs: _wbs2 } }
          ]
        );

        return { result, wbs: _wbs2 }

      } else {

        // ya da bu döner
        return { wbs: currentWbsArray }

      }

    } catch (error) {
      throw new Error("MONGO // collection_firmalar__wbs // " + functionName + " // " + err.message)
    }

  }







  if (functionName == "moveWbsLeft") {

    if (typeof _firmaId != "object") throw new Error("MONGO // collection_firmalar__wbs // " + functionName + " // -- sorguya gönderilen --firmaId-- türü doğru değil, lütfen Rapor7/24 ile irtibata geçiniz. ")
    if (typeof _wbsId != "object") throw new Error("MONGO // collection_firmalar__wbs // " + functionName + " // -- sorguya gönderilen --_wbsId-- türü doğru değil, lütfen Rapor7/24 ile irtibata geçiniz. ")

    const collection_Firmalar = context.services.get("mongodb-atlas").db("rapor724_v2").collection("firmalar")
    const firma = await collection_Firmalar.findOne({ _id: _firmaId, "yetkiliKisiler.email": userEmail, isDeleted: false })
    if (!firma) throw new Error("MONGO // collection_firmalar__wbs // " + functionName + " // _firmaId ile sistemde firma bulunamadı, lütfen sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")

    let { wbs: currentWbsArray } = firma
    if (!currentWbsArray) throw new Error("MONGO // collection_firmalar__wbs // " + functionName + " // Firmaya ait WBS bulunamadı")

    let oneWbs = currentWbsArray.find(item => item._id.toString() == _wbsId.toString())
    if (!oneWbs) throw new Error("MONGO // collection_firmalar__wbs // " + functionName + " // Sorguya gönderilen wbsId sistemde bulunamadı, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")


    let _wbs = currentWbsArray
    let _selectedWbs = oneWbs
    let _wbs2


    let leftPart = _selectedWbs.code.substring(0, _selectedWbs.code.lastIndexOf("."))
    let level = _selectedWbs.code.split(".").length - 1
    let sortNumber = Number(_selectedWbs.code.split(".")[level])
    let longText = _selectedWbs.code

    let leftPartB = leftPart.substring(0, leftPart.lastIndexOf("."))
    let levelB = leftPart.split(".").length - 1
    let sortNumberB = Number(leftPart.split(".")[levelB])
    let longTextB = leftPart

    let name_Match = false
    let codeName_Match = false
    let codeName_Match_name

    // zaten en üst seviyede ise daha fazla sola alınamaz
    if (!leftPart) {
      throw new Error("MONGO // moveWbsLeft // __mesajBaslangic__ zaten en üst seviyede __mesajBitis__")
    }


    let switch1 = false


    _wbs2 = _wbs.map(item => {

      let leftPart2
      let level2
      let longText2
      let rightPartWithTheNumber2
      let rightPart2
      let theNumberText2
      let theNumber2

      longText2 = item.code





      // taşınacağı seviyede isim benzerliği varsa - taşınacak seviye en üst ise
      if (!leftPartB) {

        let level2 = longText2.split(".").length - 1

        if (level2 == 0) {

          if (item.name === _selectedWbs.name) {
            name_Match = true
          }

          if (item.codeName === _selectedWbs.codeName) {
            codeName_Match = true
            codeName_Match_name = item.name
          }

        }

      }


      // taşınacağı seviyede isim benzerliği varsa - taşınacak seviye en üst değil ise
      if (leftPartB) {

        let level2 = longText2.split(".").length - 1

        if (longText2.indexOf(leftPartB + ".") === 0 && level2 == level - 1) {

          if (item.name === _selectedWbs.name) {
            name_Match = true
          }

          if (item.codeName === _selectedWbs.codeName) {
            codeName_Match = true
            codeName_Match_name = item.name
          }

        }

      }



      if (name_Match) {
        throw new Error("MONGO // moveWbsLeft // __mesajBaslangic__ Taşınmak istenen seviyede --" + _selectedWbs.name + "-- ismi mevcut, aynı seviyede iki aynı başlık kullanılamaz. __mesajBitis__")
      }

      if (codeName_Match) {
        throw new Error("MONGO // moveWbsLeft // __mesajBaslangic__ Taşınmak istenen seviyede --" + codeName_Match_name + "-- isimli başlığın kod ismi --" + _selectedWbs.codeName + "-- ve taşınmak istenen başlığın kod ismi ile aynı. Aynı seviyede iki aynı kod ismi kullanılamaz. __mesajBitis__")
      }




      // taşınacak başlığın kendi seviyesindekiler ve onların alt başlıkları - bu kısmın aşağısında sadece kendi ve onun alt başlıklarını ayırıyoruz ve onlara işlem yapıyoruz
      if (longText2.indexOf(leftPart + ".") === 0) {

        level2 = longText2.split(".").length - 1
        rightPartWithTheNumber2 = longText2.substring(leftPart.length + 1, longText2.length)
        theNumberText2 = rightPartWithTheNumber2.split(".")[0]
        theNumber2 = parseInt(theNumberText2)
        rightPart2 = rightPartWithTheNumber2.substring(theNumberText2.length + 1, rightPartWithTheNumber2.length)

        // taşınacak başlığın kendisinin bir üst seviyeye alınması
        if (level2 == level && theNumber2 == sortNumber) {
          let deneme = { ...item, code: leftPartB ? leftPartB + "." + (sortNumberB + 1) : (sortNumberB + 1).toString() }
          // console.log("deneme", deneme)
          switch1 = true
          return deneme
        }

        // taşınacak başlığın alt başlıklarının taşınması
        if (longText2.indexOf(longText + ".") === 0) {
          let rightPartWithTheNumber = longText2.substring(longText.length + 1, longText2.length)
          let deneme = { ...item, code: leftPartB ? leftPartB + "." + (sortNumberB + 1) + "." + rightPartWithTheNumber : (sortNumberB + 1).toString() + "." + rightPartWithTheNumber }
          switch1 = true
          return deneme
        }

      }


      // taşınacak başlığın kendi seviyesindeki başlıkların ve onların alt başlıklarının bir üste taşınması
      if (longText2.indexOf(leftPart + ".") === 0) {
        let rightPartWithTheNumber = longText2.substring(leftPart.length + 1, longText2.length)
        let theNumberText = rightPartWithTheNumber.split(".")[0]
        let theNumber = parseInt(theNumberText)
        // rightPart 11.23.45 --> 23.45
        let rightPart = rightPartWithTheNumber.substring(theNumberText.length + 1, rightPartWithTheNumber.length)
        if (theNumber > sortNumber) {
          return { ...item, code: rightPart ? leftPart + "." + (theNumber - 1) + "." + rightPart : leftPart + "." + (theNumber - 1) }
        } else {
          return item
        }
      }

      // taşınacak başlığın taşındığı seviyedeki başlıkların ve onların alt başlıklarının bir alta taşınması - (taşınacak seviye en üst seviye ise)
      if (!leftPartB) {

        let rightPartWithTheNumber = longText2
        let theNumberText = rightPartWithTheNumber.split(".")[0]
        let theNumber = parseInt(theNumberText)
        // rightPart 11.23.45 --> 23.45
        let rightPart = rightPartWithTheNumber.substring(theNumberText.length + 1, rightPartWithTheNumber.length)
        if (theNumber >= sortNumberB + 1) {
          return { ...item, code: rightPart ? (theNumber + 1) + "." + rightPart : (theNumber + 1).toString() }
        } else {
          return item
        }
      }


      // taşınacak başlığın taşındığı seviyedeki kendinden küçük kodların bir alt seviyelere taşınması - (taşınacak seviye en üst seviye değilse)
      if (leftPartB && longText2.indexOf(leftPartB + ".") === 0) {

        let rightPartWithTheNumber = longText2.substring(leftPartB.length + 1, longText2.length)
        let theNumberText = rightPartWithTheNumber.split(".")[0]
        let theNumber = parseInt(theNumberText)
        // rightPart 11.23.45 --> 23.45
        let rightPart = rightPartWithTheNumber.substring(theNumberText.length + 1, rightPartWithTheNumber.length)
        if (theNumber >= sortNumberB + 1) {
          return { ...item, code: rightPart ? leftPartB + "." + (theNumber + 1) + "." + rightPart : leftPartB + "." + (theNumber + 1) }
        } else {
          return item
        }
      }

      return item

    })



    try {

      if (switch1) {

        const result = await collection_Firmalar.updateOne(
          { _id: _firmaId },
          [
            { $set: { wbs: _wbs2 } }
          ]
        );

        return { result, wbs: _wbs2 }

      } else {

        // ya da bu döner
        return { wbs: currentWbsArray }

      }

    } catch (error) {
      throw new Error("MONGO // collection_firmalar__wbs // " + functionName + " // " + err.message)
    }

  }







  if (functionName == "moveWbsRight") {

    if (typeof _firmaId != "object") throw new Error("MONGO // collection_firmalar__wbs // " + functionName + " // -- sorguya gönderilen --firmaId-- türü doğru değil, lütfen Rapor7/24 ile irtibata geçiniz. ")
    if (typeof _wbsId != "object") throw new Error("MONGO // collection_firmalar__wbs // " + functionName + " // -- sorguya gönderilen --_wbsId-- türü doğru değil, lütfen Rapor7/24 ile irtibata geçiniz. ")

    const collection_Firmalar = context.services.get("mongodb-atlas").db("rapor724_v2").collection("firmalar")
    const firma = await collection_Firmalar.findOne({ _id: _firmaId, "yetkiliKisiler.email": userEmail, isDeleted: false })
    if (!firma) throw new Error("MONGO // collection_firmalar__wbs // " + functionName + " // _firmaId ile sistemde firma bulunamadı, lütfen sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")

    let { wbs: currentWbsArray } = firma
    if (!currentWbsArray) throw new Error("MONGO // collection_firmalar__wbs // " + functionName + " // Firmaya ait WBS bulunamadı")

    let oneWbs = currentWbsArray.find(item => item._id.toString() == _wbsId.toString())
    if (!oneWbs) throw new Error("MONGO // collection_firmalar__wbs // " + functionName + " // Sorguya gönderilen wbsId sistemde bulunamadı, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")


    let _wbs = currentWbsArray
    let _selectedWbs = oneWbs
    let _wbs2


    let leftPart = _selectedWbs.code.substring(0, _selectedWbs.code.lastIndexOf("."))
    let level = _selectedWbs.code.split(".").length - 1
    let sortNumber = Number(_selectedWbs.code.split(".")[level])
    let longText = _selectedWbs.code

    let leftPartB = leftPart.substring(0, leftPart.lastIndexOf("."))
    let levelB = leftPart.split(".").length - 1
    let sortNumberB = Number(leftPart.split(".")[levelB])
    let longTextB = leftPart


    let name_Match = false
    let codeName_Match = false
    let codeName_Match_name

    // zaten en üst seviyede ise daha fazla sağa alınamaz
    if (sortNumber == 1) {
      throw new Error("MONGO // moveWbsRight // __mesajBaslangic__ bu başlık zaten bir üstteki başlığın alt başlığı, daha fazla sağa alınamaz __mesajBitis__")
    }


    // seçilen başlığın en alt seviyede alt başlığı varsa daha fazla sağa kaydırma yapılamaz - işlem iptal
    let maxLevel = level
    _wbs.map(item => {
      let leftPart2 = item.code.substring(0, item.code.lastIndexOf("."))
      let level2 = item.code.split(".").length - 1
      let sortNumber2 = Number(item.code.split(".")[level2])
      let longText2 = item.code
      if (longText2.indexOf(longText + ".") === 0 && level2 > maxLevel) {
        maxLevel = level2
      }
    })
    if (maxLevel == 7) {
      throw new Error("MONGO // moveWbsRight // __mesajBaslangic__ maksimum seviyede alt başlık oluşturulmuş __mesajBitis__")
    }


    // seçilen başlığın üst başlığını tespit etme
    let upWbs = {}
    _wbs.map(item => {
      let leftPart2 = item.code.substring(0, item.code.lastIndexOf("."))
      let level2 = item.code.split(".").length - 1
      let sortNumber2 = Number(item.code.split(".")[level2])
      let longText2 = item.code
      if (leftPart2 === leftPart && sortNumber2 === sortNumber - 1) {
        upWbs = item
      }
    })

    // isim benzerliği kontrol - taşınacak seviyede
    _wbs.map(item => {
      let leftPart2 = item.code.substring(0, item.code.lastIndexOf("."))
      let level2 = item.code.split(".").length - 1
      let sortNumber2 = Number(item.code.split(".")[level2])
      let longText2 = item.code
      if (leftPart2 === upWbs.code) {
        if (item.name === _selectedWbs.name) {
          name_Match = true
        }
        if (item.codeName === _selectedWbs.codeName) {
          codeName_Match = true
          codeName_Match_name = item.name
        }
      }
    })


    if (name_Match) {
      throw new Error("MONGO // moveWbsRight // __mesajBaslangic__ Taşınmak istenen seviyede --" + _selectedWbs.name + "-- ismi mevcut, aynı seviyede iki aynı başlık kullanılamaz. __mesajBitis__")
    }

    if (codeName_Match) {
      throw new Error("MONGO // moveWbsRight // __mesajBaslangic__ Taşınmak istenen seviyede --" + codeName_Match_name + "-- isimli başlığın kod ismi --" + _selectedWbs.codeName + "-- ve taşınmak istenen başlığın kod ismi ile aynı. Aynı seviyede iki aynı kod ismi kullanılamaz. __mesajBitis__")
    }



    // üst başlık poza açıksa iptal
    if (upWbs.openForPoz) {
      throw new Error("MONGO // moveWbsRight // __mesajBaslangic__ poza açık başlıkların alt başlığı olamaz. __mesajBitis__")
    }

    // tespit edilen üst başlığın mevcut alt başlıkları varsa en sonuncusunu bulma
    let maxNumber = 0
    _wbs.map(item => {
      let leftPart2 = item.code.substring(0, item.code.lastIndexOf("."))
      let level2 = item.code.split(".").length - 1
      let sortNumber2 = Number(item.code.split(".")[level2])
      let longText2 = item.code

      if (longText2.indexOf((upWbs.code + ".")) === 0 && level2 === level + 1) {
        if (maxNumber < sortNumber2) {
          maxNumber = sortNumber2
        }
      }
    })


    // 1 artırıp newCode numaramızı bulma
    const newCode = upWbs.code + "." + (maxNumber + 1)


    // _wbs içinde kullanıcı tarafından seçilen başlığın kodunu değiştirerek yeni yerine taşıyoruz
    _wbs = _wbs.map(item => {
      if (item._id.toString() === _selectedWbs._id.toString()) {
        return { ...item, code: newCode }
      } else {
        return item
      }
    })


    // seçilen başlığın varsa alt başlıklarının da kodunu değiştirerek onları da beraberinde taşıyoruz
    _wbs = _wbs.map(item => {
      if (item.code.indexOf(_selectedWbs.code + ".") === 0) {
        let rightPartWithTheNumber = item.code.substring(_selectedWbs.code.length + 1, item.code.length)
        // console.log("rightPartWithTheNumber", rightPartWithTheNumber)
        return { ...item, code: newCode + "." + rightPartWithTheNumber }
      } else {
        return item
      }
    })


    // seçilen başlık taşındıığ için altındaki başlıkların numaralarını bir azaltıyoruz
    _wbs = _wbs.map(item => {


      // taşınmak istenen, seçilen başlık - en üst seviyede ise
      if (!leftPart) {
        let rightPartWithTheNumber = item.code
        let theNumberText = rightPartWithTheNumber.split(".")[0]
        let theNumber = parseInt(theNumberText)
        // rightPart 11.23.45 --> 23.45
        let rightPart = rightPartWithTheNumber.substring(theNumberText.length + 1, rightPartWithTheNumber.length)

        if (theNumber > sortNumber) {
          let newCode = rightPart ? (theNumber - 1) + "." + rightPart : (theNumber - 1).toString()
          return { ...item, code: newCode }
        }
      }

      // taşınmak istenen, seçilen başlık - en üst seviyede değilse
      if (leftPart) {
        let rightPartWithTheNumber = item.code.substring(leftPart.length + 1, item.code.length)
        let theNumberText = rightPartWithTheNumber.split(".")[0]
        let theNumber = parseInt(theNumberText)
        // rightPart 11.23.45 --> 23.45
        let rightPart = rightPartWithTheNumber.substring(theNumberText.length + 1, rightPartWithTheNumber.length)

        if (leftPart && item.code.indexOf(leftPart + ".") === 0 && theNumber > sortNumber) {
          let newCode = rightPart ? leftPart + "." + (theNumber - 1) + "." + rightPart : leftPart + "." + (theNumber - 1).toString()
          return { ...item, code: newCode }
        }
      }

      // yukarıdaki hiç bir if den dönmediyse burada değişiklik yapmadan item gönderiyoruz
      return item


    })

    try {

      const result = await collection_Firmalar.updateOne(
        { _id: _firmaId },
        [
          { $set: { wbs: _wbs } }
        ]
      );

      return { result, wbs: _wbs }

    } catch (error) {
      throw new Error("MONGO // collection_firmalar__wbs // " + functionName + " // " + err.message)
    }

  }




  throw new Error("MONGO // collection_firmalar__wbs // " + functionName + " // " + "Herhangi bir fonksiyona uğramadı, 'functionName' eşleşmedi ya da boş gönderildi ")


};