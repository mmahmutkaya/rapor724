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
    const firma = await collection_Firmalar.findOne({ _id: _firmaId, "kisiler.email": userEmail, isDeleted: false })
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
    const firma = await collection_Firmalar.findOne({ _id: _firmaId, "kisiler.email": userEmail, isDeleted: false })
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
    const firma = await collection_Firmalar.findOne({ _id: _firmaId, "kisiler.email": userEmail, isDeleted: false })
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
    const firma = await collection_Firmalar.findOne({ _id: _firmaId, "kisiler.email": userEmail, isDeleted: false })
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
    const firma = await collection_Firmalar.findOne({ _id: _firmaId, "kisiler.email": userEmail, isDeleted: false })
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






  throw new Error("MONGO // collection_firmalar__wbs // " + functionName + " // " + "Herhangi bir fonksiyona uğramadı, 'functionName' eşleşmedi ya da boş gönderildi ")


};