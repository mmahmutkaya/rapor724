exports = async function ({
  _projeId, upLbsId, newLbsName, newLbsCodeName, functionName, _lbsId
}) {

  // deneme
  const user = context.user
  const _userId = new BSON.ObjectId(user.id)
  const userEmail = context.user.data.email
  const mailTeyit = user.custom_data.mailTeyit
  if (!mailTeyit) throw new Error("MONGO // collection_projeler__lbs // Öncelikle üyeliğinize ait mail adresinin size ait olduğunu doğrulamalısınız, tekrar giriş yapmayı deneyiniz veya bizimle iletişime geçiniz.")



  if (functionName == "createLbs") {

    if (typeof _projeId !== "object") throw new Error("MONGO // collection_projeler__lbs // " + functionName + " // -- sorguya gönderilen --projeId-- türü doğru değil, lütfen Rapor7/24 ile irtibata geçiniz. ")

    if (!(upLbsId === "0" || typeof upLbsId === "object")) throw new Error("MONGO // collection_projeler__lbs // " + functionName + " // --upLbsId-- sorguya, gönderilmemiş, sayfayı yenileyiniz, sorun deva ederse Rapor7/24 ile irtibata geçiniz. ")


    // aşağıdaki form verilerinden birinde hata tespit edilmişse
    // alt satırda oluşturulan errorObject objesine form verisi ile ilişkilendirilmiş  property oluşturulup, içine yazı yazılıyor
    // property isimleri yukarıda ilk satırda frontend den gelen verileri yakalarken kullanılanlar ile aynı 
    // fonksiyon returnü olarak errorObject objesi döndürülüyor, frontenddeki form ekranında form verisine ait ilgili alanda bu yazı gösteriliyor
    // form ile ilişkilendirilmiş ilgili alana ait bir ke hata yazısı yazılmışsa yani null değilse üstüne yazı yazılmıyor, ilk tespit edilen hata değiştirilmmeiş oluyor

    const errorObject = {}

    // newLbsName
    if (typeof newLbsName !== "string") {
      throw new Error("MONGO // collection_projeler__lbs // " + functionName + " / db ye gelen lbsName türü 'string' türünde değil, sayfayı yenileyiniz, sorun devam ederse Rapor724 ile iritbata geçiniz.")
    }

    if (newLbsName.length < 1) {
      errorObject.lbsNameError = "Boş bırakılamaz"
    }


    // newLbsCodeName
    if (typeof newLbsCodeName !== "string") {
      throw new Error("MONGO // collection_projeler__lbs // " + functionName + " / db ye gelen lbsCodeName türü 'string' türünde değil, sayfayı yenileyiniz, sorun devam ederse Rapor724 ile iritbata geçiniz.")
    }

    if (newLbsCodeName.length < 1) {
      errorObject.lbsCodeNameError = "Boş bırakılamaz"
    }

    if (newLbsCodeName.includes(" ")) {
      errorObject.lbsCodeNameError = "Boşluk içermemeli"
    }

    // ARA VALIDATE KONTROL - VALIDATE HATA VARSA BOŞUNA DEVAM EDİP AŞAĞIDAKİ SORGUYU YAPMASIN
    if (Object.keys(errorObject).length > 0) return { errorObject }


    const collection_projeler = context.services.get("mongodb-atlas").db("rapor724_v2").collection("projeler")
    const proje = await collection_projeler.findOne({ _id: _projeId, isDeleted: false })
    if (!proje) throw new Error("MONGO // collection_projeler__lbs // " + functionName + " // _projeId ile sistemde proje bulunamadı, lütfen sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")




    // 1/3.seçenek - yukarıda bitmemiş
    //ilk defa lbs kaydı yapılacaksa, yani henüz "proje.lbs" yoksa
    if (!proje.lbs || proje.lbs.length === 0) {

      const newLbsItem = {
        _id: BSON.ObjectId(),
        code: "1",
        name: newLbsName,
        codeName: newLbsCodeName,
        includesMahal: false,
        openForMahal: false
      }

      try {

        const result = await collection_projeler.updateOne(
          { _id: _projeId },
          [
            { $set: { lbs: [newLbsItem] } }
          ]
        );

        return { result, lbs: [newLbsItem] }

      } catch (err) {

        throw new Error("MONGO // collection_projeler__lbs // " + functionName + " // bölüm 1/3 " + err.message)
      }

    }



    // 2/3.seçenek - yukarıda bitmemiş
    // en üst düzeye kayıt yapılacaksa - aşağıdaki fonksiyonlar en üst seviyeye göre hazırlanmış 
    if (upLbsId === "0") {

      let newNumber = 1
      let number

      proje.lbs.filter(item => !item.code.includes(".")).map(item => {

        item.name === newLbsName ? errorObject.lbsNameError = "Aynı grup içinde kullanılmış" : null
        item.codeName === newLbsCodeName ? errorObject.lbsCodeNameError = "Aynı grup içinde kullanılmış" : null

        number = parseInt(item.code)

        if (number >= newNumber) {
          return newNumber = number + 1
        }

      })

      if (Object.keys(errorObject).length) return ({ errorObject })


      const newLbsItem = {
        _id: BSON.ObjectId(),
        code: newNumber.toString(),
        name: newLbsName,
        codeName: newLbsCodeName,
        includesMahal: false,
        openForMahal: false
      }


      try {

        const result = await collection_projeler.updateOne(
          { _id: _projeId },
          [
            { $set: { lbs: { $concatArrays: ["$lbs", [newLbsItem]] } } }
          ]
        );

        let currentLbsArray = proje.lbs
        let newLbsArray = [...currentLbsArray, newLbsItem]

        return { result, lbs: newLbsArray }

      } catch (err) {

        throw new Error("MONGO // collection_projeler__lbs // " + functionName + " // bölüm 2/3 " + err.message)
      }

    }




    // 3/3.seçenek - yukarıda bitmemiş
    // en üst düzey olmayıp mevcut lbs kaydına ekleme yapılacaksa

    let upLbs = proje.lbs.find(item => item._id.toString() == upLbsId.toString())
    if (!upLbs) {
      throw new Error("MONGO // collection_projeler__lbs // " + functionName + " // upLbsId sistemde bulunamadı, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
    }

    if (upLbs.code?.split(".").length === 8) {
      throw new Error("MONGO // collection_projeler__lbs // " + functionName + " // __mesajBaslangic__ Daha fazla alt başlık oluşturamazsınız. __mesajBitis__")
    }

    if (upLbs.openForMahal == true) {
      throw new Error("MONGO // collection_projeler__lbs // " + functionName + " // __mesajBaslangic__ Mahal eklemeye açmış olduğunuz başlığa alt başlık ekleyemezsiniz. __mesajBitis__")
    }

    let upLbsCode = upLbs.code

    let text = upLbsCode + "."
    let level = text.split(".").length - 1
    let newNumber = 1
    let number

    proje.lbs.filter(item => item.code.indexOf(text) == 0 && item.code.split(".").length - 1 == level).map(item => {

      item.name === newLbsName ? errorObject.lbsNameError = "Aynı grup içinde kullanılmış" : null
      item.codeName === newLbsCodeName ? errorObject.lbsCodeNameError = "Aynı grup içinde kullanılmış" : null

      // yeni eklenecek lbs son hane numarasını belirlemek için aynı seviyedeki diğer lbs son numaraları kontrol ediliyor
      number = parseInt(item.code.split(text)[1])
      if (number >= newNumber) {
        return newNumber = number + 1
      }

    })

    if (Object.keys(errorObject).length) return ({ errorObject })


    let newLbsItem = {
      _id: BSON.ObjectId(),
      code: text + newNumber,
      name: newLbsName,
      codeName: newLbsCodeName,
      includesMahal: false,
      openForMahal: false
    }

    try {

      const result = await collection_projeler.updateOne(
        { _id: _projeId },
        [
          { $set: { lbs: { $concatArrays: ["$lbs", [newLbsItem]] } } }
        ]
      );

      let currentLbsArray = proje.lbs
      let newLbsArray = [...currentLbsArray, newLbsItem]

      return { result, lbs: newLbsArray }

    } catch (err) {

      throw new Error("MONGO // collection_projeler__lbs // " + functionName + " // bölüm 3/3 " + err.message)
    }

  }


  if (functionName == "updateLbs") {

    if (typeof _projeId !== "object") throw new Error("MONGO // collection_projeler__lbs // " + functionName + " // -- sorguya gönderilen --projeId-- türü doğru değil, lütfen Rapor7/24 ile irtibata geçiniz. ")

    const errorObject = {}

    // newLbsName
    if (typeof newLbsName !== "string") {
      throw new Error("MONGO // collection_projeler__lbs // " + functionName + " / db ye gelen lbsName türü 'string' türünde değil, sayfayı yenileyiniz, sorun devam ederse Rapor724 ile iritbata geçiniz.")
    }

    if (newLbsName.length < 1) {
      errorObject.lbsNameError = "Boş bırakılamaz"
    }


    // newLbsCodeName
    if (typeof newLbsCodeName !== "string") {
      throw new Error("MONGO // collection_projeler__lbs // " + functionName + " / db ye gelen lbsCodeName türü 'string' türünde değil, sayfayı yenileyiniz, sorun devam ederse Rapor724 ile iritbata geçiniz.")
    }

    if (newLbsCodeName.length < 1) {
      errorObject.lbsCodeNameError = "Boş bırakılamaz"
    }

    if (newLbsCodeName.includes(" ")) {
      errorObject.lbsCodeNameError = "Boşluk içermemeli"
    }

    // ARA VALIDATE KONTROL - VALIDATE HATA VARSA BOŞUNA DEVAM EDİP AŞAĞIDAKİ SORGUYU YAPMASIN
    if (Object.keys(errorObject).length > 0) return { errorObject }


    const collection_projeler = context.services.get("mongodb-atlas").db("rapor724_v2").collection("projeler")
    const proje = await collection_projeler.findOne({ _id: _projeId, isDeleted: false })
    if (!proje) throw new Error("MONGO // collection_projeler__lbs // " + functionName + " // _projeId ile sistemde proje bulunamadı, lütfen sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
    if (!proje.lbs.find(x => x._id.toString() == _lbsId.toString())) throw new Error("MONGO // collection_projeler__lbs // " + functionName + " // güncellenmek istenen _lbsId sistemde bulunamadı, lütfen sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")


    try {

      const newLbsArray = proje.lbs.map(item => {
        if (item._id.toString() === _lbsId.toString()) {
          return { ...item, name: newLbsName, codeName: newLbsCodeName }
        } else {
          return item
        }
      })

      const result = await collection_projeler.updateOne(
        { _id: _projeId },
        [
          { $set: { lbs: newLbsArray } }
        ]
      );

      return { result, lbs: newLbsArray }

    } catch (err) {
      throw new Error("MONGO // collection_projeler__lbs // " + functionName + " // " + err.message)
    }

  }


  if (functionName == "openLbsForMahal") {

    if (typeof _projeId != "object") throw new Error("MONGO // collection_projeler__lbs // " + functionName + " // -- sorguya gönderilen --projeId-- türü doğru değil, lütfen Rapor7/24 ile irtibata geçiniz. ")
    if (typeof _lbsId != "object") throw new Error("MONGO // collection_projeler__lbs // " + functionName + " // -- sorguya gönderilen --_lbsId-- türü doğru değil, lütfen Rapor7/24 ile irtibata geçiniz. ")

    const collection_projeler = context.services.get("mongodb-atlas").db("rapor724_v2").collection("projeler")
    const proje = await collection_projeler.findOne({ _id: _projeId, isDeleted: false })
    if (!proje) throw new Error("MONGO // collection_projeler__lbs // " + functionName + " // _projeId ile sistemde proje bulunamadı, lütfen sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")

    if (!proje.lbs) throw new Error("MONGO // collection_projeler__lbs // " + functionName + " // Projeye ait LBS bulunamadı")

    let lbs = proje.lbs.find(item => item._id.toString() == _lbsId.toString())
    if (!lbs) {
      throw new Error("MONGO // collection_projeler__lbs // " + functionName + " // _lbsId sistemde bulunamadı, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
    }

    // lbsCode un alt seviyeleri mevcutsa direk mahal eklenemesin
    // burada includes kullanamayız çünkü içinde değil başında arıyoruz
    let text = lbs.code + "."
    if (proje.lbs.find(item => item.code.indexOf(text) === 0)) {
      throw new Error("MONGO // collection_projeler__lbs // " + functionName + " //  __mesajBaslangic__ Alt başlığı bulunan başlıklar mahal eklemeye açılamaz. __mesajBitis__")
    }



    try {

      const newLbsArray = proje.lbs.map(item => {
        if (item.code === lbs.code) {
          return { ...item, openForMahal: true }
        } else {
          return item
        }
      })

      const result = await collection_projeler.updateOne(
        { _id: _projeId },
        [
          { $set: { lbs: newLbsArray } }
        ]
      );

      return { result, lbs: newLbsArray }

    } catch (err) {
      throw new Error("MONGO // collection_projeler__lbs // " + functionName + " // " + err.message)
    }

  }


  if (functionName == "closeLbsForMahal") {

    if (typeof _projeId != "object") throw new Error("MONGO // collection_projeler__lbs // " + functionName + " // -- sorguya gönderilen --projeId-- türü doğru değil, lütfen Rapor7/24 ile irtibata geçiniz. ")
    if (typeof _lbsId != "object") throw new Error("MONGO // collection_projeler__lbs // " + functionName + " // -- sorguya gönderilen --_lbsId-- türü doğru değil, lütfen Rapor7/24 ile irtibata geçiniz. ")

    const collection_projeler = context.services.get("mongodb-atlas").db("rapor724_v2").collection("projeler")
    const proje = await collection_projeler.findOne({ _id: _projeId, isDeleted: false })
    if (!proje) throw new Error("MONGO // collection_projeler__lbs // " + functionName + " // _projeId ile sistemde proje bulunamadı, lütfen sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")

    if (!proje.lbs) throw new Error("MONGO // collection_projeler__lbs // " + functionName + " // Projeye ait LBS bulunamadı")

    let theLbs = proje.lbs.find(item => item._id.toString() == _lbsId.toString())
    if (!theLbs) throw new Error("MONGO // collection_projeler__lbs // " + functionName + " // " + "__mesajBaslangic__ Sorguya gönderilen lbsId sistemde bulunamadı, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz. __mesajBitis__")

    // aşağıda mahaller collection da mahal var mı diye sorgulama yapmaya gerek kalmadı
    if (theLbs.includesMahal) throw new Error("MONGO // collection_projeler__lbs // " + functionName + " // " + "__mesajBaslangic__ Seçili başlık altında kayıtlı mahaller varken bu işlem yapılamaz. __mesajBitis__")

    const collection_mahaller = context.services.get("mongodb-atlas").db("rapor724_v2").collection("mahaller")
    const mahal = await collection_mahaller.findOne({ _lbsId, isDeleted: false })

    // lbs altına mahal eklenmişse silinmesin, mahallera ulaşamayız
    if (mahal) throw new Error("MONGO // collection_projeler__lbs // " + functionName + " // " + "__mesajBaslangic__ Seçili başlık altında kayıtlı mahaller varken bu işlem yapılamaz. __mesajBitis__")


    try {

      const newLbsArray = proje.lbs.map(item => {
        if (item.code === theLbs.code) {
          return { ...item, openForMahal: false }
        } else {
          return item
        }
      })

      const result = await collection_projeler.updateOne(
        { _id: _projeId },
        [
          { $set: { lbs: newLbsArray } }
        ]
      );

      return { result, lbs: newLbsArray }

    } catch (err) {
      throw new Error("MONGO // collection_projeler__lbs // " + functionName + " // " + err.message)
    }


  }


  if (functionName == "deleteLbs") {

    if (typeof _projeId != "object") throw new Error("MONGO // collection_projeler__lbs // " + functionName + " // -- sorguya gönderilen --projeId-- türü doğru değil, lütfen Rapor7/24 ile irtibata geçiniz. ")
    if (typeof _lbsId != "object") throw new Error("MONGO // collection_projeler__lbs // " + functionName + " // -- sorguya gönderilen --_lbsId-- türü doğru değil, lütfen Rapor7/24 ile irtibata geçiniz. ")

    const collection_projeler = context.services.get("mongodb-atlas").db("rapor724_v2").collection("projeler")
    const proje = await collection_projeler.findOne({ _id: _projeId, isDeleted: false })
    if (!proje) throw new Error("MONGO // collection_projeler__lbs // " + functionName + " // _projeId ile sistemde proje bulunamadı, lütfen sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")

    let { lbs: currentLbsArray } = proje
    if (!currentLbsArray) throw new Error("MONGO // collection_projeler__lbs // " + functionName + " // Projeye ait LBS bulunamadı")

    // return {currentLbsArray, _lbsId}

    let oneLbs = await currentLbsArray.find(item => item._id.toString() == _lbsId.toString())

    if (!oneLbs) throw new Error("MONGO // collection_projeler__lbs // " + functionName + " // Sorguya gönderilen _lbsId sistemde bulunamadı, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")

    // aşağıda mahaller collection da mahal var mı diye sorgulama yapmaya gerek kalmadı
    if (oneLbs.openForMahal) throw new Error("MONGO // collection_projeler__lbs // " + functionName + " // __mesajBaslangic__ Mahal eklemeye açık başlıklar silinemez. __mesajBitis__")

    // lbs in alt seviyeleri mevcutsa silinmesin
    // burada includes kullanamayız çünkü içinde değil başında arıyoruz
    let { code: oneLbsCode } = oneLbs
    if (currentLbsArray.find(item => item.code.indexOf(oneLbsCode + ".") === 0)) {
      throw new Error("MONGO // collection_projeler__lbs // " + functionName + " // " + "__mesajBaslangic__ Silmek istediğiniz  LBS'in alt seviyeleri mevcut, öncelikle onları silmelisiniz. __mesajBitis__")
    }

    const collection_mahaller = context.services.get("mongodb-atlas").db("rapor724_v2").collection("mahaller")
    const mahal = await collection_mahaller.findOne({ _lbsId, isDeleted: false })

    // lbs altına mahal eklenmişse silinmesin, mahallera ulaşamayız
    if (mahal) throw new Error("MONGO // collection_projeler__lbs // " + functionName + " // " + "__mesajBaslangic__ Altında mahal bulunan başlıklar silinemez. __mesajBitis__")




    // 1/2. seçenek -- en üst seviyede silme yapılacaksa
    if (!oneLbsCode.includes(".")) {

      try {

        const willBeDeletedLbsCode = oneLbsCode
        // const leftPart = willBeDeletedLbsCode.substring(0, willBeDeletedLbsCode.lastIndexOf("."))

        // seçili lbs i listeden çıkarma
        const newLbsArray = currentLbsArray.filter(item => {
          if (item.code != willBeDeletedLbsCode) {
            return item
          }
        })


        // silinme işleminden sonra komşu lbs lerin code numarasını düzenleme, silinenden sonrakilerin code numarasında ilgili kısmı 1 azaltma
        // değişecek lbs code ların alt lbs leri de olabilir, alt lbs lerinde ilgili haneleri 1 azalmalı
        // unutma bu kısım en üst lbs ler için aşağıdan farklı

        // en üst (0) seviye olduğu için tek hane ve kendisi silinecek sayı zaten
        let willBeDeletedNumber = parseInt(willBeDeletedLbsCode)
        let longText
        let rightPart
        let theNumberText
        let theNumber

        const newLbsArray2 = newLbsArray.map(item => {

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

        // return newLbsArray2

        const result = await collection_projeler.updateOne(
          { _id: _projeId },
          [
            { $set: { lbs: newLbsArray2 } }
          ]
        );

        return { result, lbs: newLbsArray2 }

      } catch (err) {
        throw new Error("MONGO // collection_projeler__lbs // " + functionName + " // bölüm 1/2 " + err.message)
      }

    }





    // 2/2. seçenek -- en üst seviye değilse
    if (oneLbsCode.includes(".")) {

      try {

        const willBeDeletedLbsCode = oneLbsCode

        // seçili lbs i listeden çıkarma
        const newLbsArray = currentLbsArray.filter(item => {
          if (item.code != willBeDeletedLbsCode) {
            return item
          }
        })



        let level = willBeDeletedLbsCode.split(".").length - 1
        // silinecek lbs numarasının en son hanede olduğunu biliyoruz çünkü son haneden önceki hanesi silinecek olsa alt seviyesi olmuş olurdu, yukarıdaki kontrolden geçmezdi
        let willBeDeletedNumber = parseInt(willBeDeletedLbsCode.split(".")[level])

        // leftPart - değişecek hane son hane demiştik, sabit baş kısmını alıyoruz, aşağıda işlem yapacağız -- 11.23.45 --> 11.23
        const leftPart = willBeDeletedLbsCode.substring(0, willBeDeletedLbsCode.lastIndexOf("."))
        let longText
        let rightPartWithTheNumber
        let rightPart
        let theNumberText
        let theNumber
        //
        const newLbsArray2 = newLbsArray.map(item => {

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

        // return newLbsArray2

        const result = await collection_projeler.updateOne(
          { _id: _projeId },
          [
            { $set: { lbs: newLbsArray2 } }
          ]
        );

        return { result, lbs: newLbsArray2 }

      } catch (err) {
        throw new Error("MONGO // collection_projeler__lbs // " + functionName + " // bölüm 1/2 " + err.message)
      }


    }

  }






  if (functionName == "moveLbsUp") {

    if (typeof _projeId != "object") throw new Error("MONGO // collection_projeler__lbs // " + functionName + " // -- sorguya gönderilen --projeId-- türü doğru değil, lütfen Rapor7/24 ile irtibata geçiniz. ")
    if (typeof _lbsId != "object") throw new Error("MONGO // collection_projeler__lbs // " + functionName + " // -- sorguya gönderilen --_lbsId-- türü doğru değil, lütfen Rapor7/24 ile irtibata geçiniz. ")

    const collection_projeler = context.services.get("mongodb-atlas").db("rapor724_v2").collection("projeler")
    const proje = await collection_projeler.findOne({ _id: _projeId, isDeleted: false })
    if (!proje) throw new Error("MONGO // collection_projeler__lbs // " + functionName + " // _projeId ile sistemde proje bulunamadı, lütfen sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")

    let { lbs: currentLbsArray } = proje
    if (!currentLbsArray) throw new Error("MONGO // collection_projeler__lbs // " + functionName + " // Projeye ait LBS bulunamadı")

    let oneLbs = currentLbsArray.find(item => item._id.toString() == _lbsId.toString())
    if (!oneLbs) throw new Error("MONGO // collection_projeler__lbs // " + functionName + " // Sorguya gönderilen lbsId sistemde bulunamadı, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")


    let _lbs = currentLbsArray
    let _selectedLbs = oneLbs
    let _lbs2



    let leftPart
    let level
    let sortNumber
    let longText

    leftPart = _selectedLbs.code.substring(0, _selectedLbs.code.lastIndexOf("."))
    level = _selectedLbs.code.split(".").length - 1
    sortNumber = Number(_selectedLbs.code.split(".")[level])
    longText = _selectedLbs.code

    // bu kontrol fromtend de ayrıca yapılmalı - kontrol
    if (sortNumber == 1) {
      throw new Error("Zaten en üstte")
    }

    let switch1 = false


    // taşınacak başlık en üst seviyede ise
    if (!leftPart) {

      _lbs2 = _lbs.map(item => {

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

        // taşınacak lbs i bir üste alma işlemi, switch kontrlüne gerek yok, zaten bu var kendisi
        if (level2 == level && theNumber2 == sortNumber) {
          let deneme3 = { ...item, code: (theNumber2 - 1).toString() }
          // console.log("deneme3", deneme3)
          return deneme3
        }

        // taşınacak lbs in alt başlıklarını bir üste alma işlemi, switch kontrlüne gerek yok, zaten üst başlığında yapıldı
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

      _lbs2 = _lbs.map(item => {

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

          // taşınacak lbs i bir üste alma işlemi, switch kontrlüne gerek yok, zaten bu var kendisi
          if (level2 == level && theNumber2 == sortNumber) {
            let deneme3 = { ...item, code: leftPart + "." + (theNumber2 - 1) }
            // console.log("deneme3", deneme3)
            return deneme3
          }

          // taşınacak lbs in alt başlıklarını bir üste alma işlemi, switch kontrlüne gerek yok, zaten üst başlığında yapıldı
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

        const result = await collection_projeler.updateOne(
          { _id: _projeId },
          [
            { $set: { lbs: _lbs2 } }
          ]
        );

        return { result, lbs: _lbs2 }

      } else {

        // ya da bu döner
        return { lbs: currentLbsArray }

      }

    } catch (error) {
      throw new Error("MONGO // collection_projeler__lbs // " + functionName + " // " + err.message)
    }

  }







  if (functionName == "moveLbsDown") {

    if (typeof _projeId != "object") throw new Error("MONGO // collection_projeler__lbs // " + functionName + " // -- sorguya gönderilen --projeId-- türü doğru değil, lütfen Rapor7/24 ile irtibata geçiniz. ")
    if (typeof _lbsId != "object") throw new Error("MONGO // collection_projeler__lbs // " + functionName + " // -- sorguya gönderilen --_lbsId-- türü doğru değil, lütfen Rapor7/24 ile irtibata geçiniz. ")

    const collection_projeler = context.services.get("mongodb-atlas").db("rapor724_v2").collection("projeler")
    const proje = await collection_projeler.findOne({ _id: _projeId, isDeleted: false })
    if (!proje) throw new Error("MONGO // collection_projeler__lbs // " + functionName + " // _projeId ile sistemde proje bulunamadı, lütfen sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")

    let { lbs: currentLbsArray } = proje
    if (!currentLbsArray) throw new Error("MONGO // collection_projeler__lbs // " + functionName + " // Projeye ait LBS bulunamadı")

    let oneLbs = currentLbsArray.find(item => item._id.toString() == _lbsId.toString())
    if (!oneLbs) throw new Error("MONGO // collection_projeler__lbs // " + functionName + " // Sorguya gönderilen lbsId sistemde bulunamadı, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")


    let _lbs = currentLbsArray
    let _selectedLbs = oneLbs
    let _lbs2


    let leftPart
    let level
    let sortNumber
    let longText

    leftPart = _selectedLbs.code.substring(0, _selectedLbs.code.lastIndexOf("."))
    level = _selectedLbs.code.split(".").length - 1
    sortNumber = Number(_selectedLbs.code.split(".")[level])
    longText = _selectedLbs.code

    let switch1 = false


    // taşınacak başlık en üst seviyede ise
    if (!leftPart) {

      _lbs2 = _lbs.map(item => {

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

        // taşınacak lbs i bir alta alma işlemi, switch kontrlüne gerek yok, zaten bu var kendisi
        if (level2 == level && theNumber2 == sortNumber) {
          let deneme3 = { ...item, code: (sortNumber + 1).toString() }
          // console.log("deneme3", deneme3)
          return deneme3
        }

        // taşınacak lbs in alt başlıklarını bir alta alma işlemi, switch kontrlüne gerek yok, zaten üst başlığında yapıldı
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

      _lbs2 = _lbs.map(item => {

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

          // taşınacak lbs i bir alta alma işlemi, switch kontrlüne gerek yok, zaten bu var kendisi
          if (level2 == level && theNumber2 == sortNumber) {
            let deneme3 = { ...item, code: leftPart + "." + (sortNumber + 1) }
            // console.log("deneme3", deneme3)
            return deneme3
          }

          // taşınacak lbs in alt başlıklarını bir alta alma işlemi, switch kontrlüne gerek yok, zaten üst başlığında yapıldı
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

        const result = await collection_projeler.updateOne(
          { _id: _projeId },
          [
            { $set: { lbs: _lbs2 } }
          ]
        );

        return { result, lbs: _lbs2 }

      } else {

        // ya da bu döner
        return { lbs: currentLbsArray }

      }

    } catch (error) {
      throw new Error("MONGO // collection_projeler__lbs // " + functionName + " // " + err.message)
    }

  }







  if (functionName == "moveLbsDown") {

    if (typeof _projeId != "object") throw new Error("MONGO // collection_projeler__lbs // " + functionName + " // -- sorguya gönderilen --projeId-- türü doğru değil, lütfen Rapor7/24 ile irtibata geçiniz. ")
    if (typeof _lbsId != "object") throw new Error("MONGO // collection_projeler__lbs // " + functionName + " // -- sorguya gönderilen --_lbsId-- türü doğru değil, lütfen Rapor7/24 ile irtibata geçiniz. ")

    const collection_projeler = context.services.get("mongodb-atlas").db("rapor724_v2").collection("projeler")
    const proje = await collection_projeler.findOne({ _id: _projeId, isDeleted: false })
    if (!proje) throw new Error("MONGO // collection_projeler__lbs // " + functionName + " // _projeId ile sistemde proje bulunamadı, lütfen sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")

    let { lbs: currentLbsArray } = proje
    if (!currentLbsArray) throw new Error("MONGO // collection_projeler__lbs // " + functionName + " // Projeye ait LBS bulunamadı")

    let oneLbs = currentLbsArray.find(item => item._id.toString() == _lbsId.toString())
    if (!oneLbs) throw new Error("MONGO // collection_projeler__lbs // " + functionName + " // Sorguya gönderilen lbsId sistemde bulunamadı, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")


    let _lbs = currentLbsArray
    let _selectedLbs = oneLbs
    let _lbs2


    let leftPart
    let level
    let sortNumber
    let longText

    leftPart = _selectedLbs.code.substring(0, _selectedLbs.code.lastIndexOf("."))
    level = _selectedLbs.code.split(".").length - 1
    sortNumber = Number(_selectedLbs.code.split(".")[level])
    longText = _selectedLbs.code

    let switch1 = false


    // taşınacak başlık en üst seviyede ise
    if (!leftPart) {

      _lbs2 = _lbs.map(item => {

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

        // taşınacak lbs i bir alta alma işlemi, switch kontrlüne gerek yok, zaten bu var kendisi
        if (level2 == level && theNumber2 == sortNumber) {
          let deneme3 = { ...item, code: (sortNumber + 1).toString() }
          // console.log("deneme3", deneme3)
          return deneme3
        }

        // taşınacak lbs in alt başlıklarını bir alta alma işlemi, switch kontrlüne gerek yok, zaten üst başlığında yapıldı
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

      _lbs2 = _lbs.map(item => {

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

          // taşınacak lbs i bir alta alma işlemi, switch kontrlüne gerek yok, zaten bu var kendisi
          if (level2 == level && theNumber2 == sortNumber) {
            let deneme3 = { ...item, code: leftPart + "." + (sortNumber + 1) }
            // console.log("deneme3", deneme3)
            return deneme3
          }

          // taşınacak lbs in alt başlıklarını bir alta alma işlemi, switch kontrlüne gerek yok, zaten üst başlığında yapıldı
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

        const result = await collection_projeler.updateOne(
          { _id: _projeId },
          [
            { $set: { lbs: _lbs2 } }
          ]
        );

        return { result, lbs: _lbs2 }

      } else {

        // ya da bu döner
        return { lbs: currentLbsArray }

      }

    } catch (error) {
      throw new Error("MONGO // collection_projeler__lbs // " + functionName + " // " + err.message)
    }

  }







  if (functionName == "moveLbsLeft") {

    if (typeof _projeId != "object") throw new Error("MONGO // collection_projeler__lbs // " + functionName + " // -- sorguya gönderilen --projeId-- türü doğru değil, lütfen Rapor7/24 ile irtibata geçiniz. ")
    if (typeof _lbsId != "object") throw new Error("MONGO // collection_projeler__lbs // " + functionName + " // -- sorguya gönderilen --_lbsId-- türü doğru değil, lütfen Rapor7/24 ile irtibata geçiniz. ")

    const collection_projeler = context.services.get("mongodb-atlas").db("rapor724_v2").collection("projeler")
    const proje = await collection_projeler.findOne({ _id: _projeId, isDeleted: false })
    if (!proje) throw new Error("MONGO // collection_projeler__lbs // " + functionName + " // _projeId ile sistemde proje bulunamadı, lütfen sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")

    let { lbs: currentLbsArray } = proje
    if (!currentLbsArray) throw new Error("MONGO // collection_projeler__lbs // " + functionName + " // Projeye ait LBS bulunamadı")

    let oneLbs = currentLbsArray.find(item => item._id.toString() == _lbsId.toString())
    if (!oneLbs) throw new Error("MONGO // collection_projeler__lbs // " + functionName + " // Sorguya gönderilen lbsId sistemde bulunamadı, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")


    let _lbs = currentLbsArray
    let _selectedLbs = oneLbs
    let _lbs2


    let leftPart = _selectedLbs.code.substring(0, _selectedLbs.code.lastIndexOf("."))
    let level = _selectedLbs.code.split(".").length - 1
    let sortNumber = Number(_selectedLbs.code.split(".")[level])
    let longText = _selectedLbs.code

    let leftPartB = leftPart.substring(0, leftPart.lastIndexOf("."))
    let levelB = leftPart.split(".").length - 1
    let sortNumberB = Number(leftPart.split(".")[levelB])
    let longTextB = leftPart

    let name_Match = false
    let codeName_Match = false
    let codeName_Match_name

    // zaten en üst seviyede ise daha fazla sola alınamaz
    if (!leftPart) {
      throw new Error("MONGO // moveLbsLeft // __mesajBaslangic__ zaten en üst seviyede __mesajBitis__")
    }


    let switch1 = false


    _lbs2 = _lbs.map(item => {

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

          if (item.name === _selectedLbs.name) {
            name_Match = true
          }

          if (item.codeName === _selectedLbs.codeName) {
            codeName_Match = true
            codeName_Match_name = item.name
          }

        }

      }


      // taşınacağı seviyede isim benzerliği varsa - taşınacak seviye en üst değil ise
      if (leftPartB) {

        let level2 = longText2.split(".").length - 1

        if (longText2.indexOf(leftPartB + ".") === 0 && level2 == level - 1) {

          if (item.name === _selectedLbs.name) {
            name_Match = true
          }

          if (item.codeName === _selectedLbs.codeName) {
            codeName_Match = true
            codeName_Match_name = item.name
          }

        }

      }



      if (name_Match) {
        throw new Error("MONGO // moveLbsLeft // __mesajBaslangic__ Eşit seviyede bir başlık ismi birden fazla kullanılamaz. Başlık ismini değiştirerek tekrar deneyiniz.  __mesajBitis__")
      }

      if (codeName_Match) {
        throw new Error("MONGO // moveLbsLeft // __mesajBaslangic__ Eşit seviyede bir kod ismi birden fazla kullanılamaz. Kod ismini değiştirerek tekrar deneyiniz.  __mesajBitis__")
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

        const result = await collection_projeler.updateOne(
          { _id: _projeId },
          [
            { $set: { lbs: _lbs2 } }
          ]
        );

        return { result, lbs: _lbs2 }

      } else {

        // ya da bu döner
        return { lbs: currentLbsArray }

      }

    } catch (error) {
      throw new Error("MONGO // collection_projeler__lbs // " + functionName + " // " + err.message)
    }

  }







  if (functionName == "moveLbsRight") {

    if (typeof _projeId != "object") throw new Error("MONGO // collection_projeler__lbs // " + functionName + " // -- sorguya gönderilen --projeId-- türü doğru değil, lütfen Rapor7/24 ile irtibata geçiniz. ")
    if (typeof _lbsId != "object") throw new Error("MONGO // collection_projeler__lbs // " + functionName + " // -- sorguya gönderilen --_lbsId-- türü doğru değil, lütfen Rapor7/24 ile irtibata geçiniz. ")

    const collection_projeler = context.services.get("mongodb-atlas").db("rapor724_v2").collection("projeler")
    const proje = await collection_projeler.findOne({ _id: _projeId, isDeleted: false })
    if (!proje) throw new Error("MONGO // collection_projeler__lbs // " + functionName + " // _projeId ile sistemde proje bulunamadı, lütfen sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")

    let { lbs: currentLbsArray } = proje
    if (!currentLbsArray) throw new Error("MONGO // collection_projeler__lbs // " + functionName + " // Projeye ait LBS bulunamadı")

    let oneLbs = currentLbsArray.find(item => item._id.toString() == _lbsId.toString())
    if (!oneLbs) throw new Error("MONGO // collection_projeler__lbs // " + functionName + " // Sorguya gönderilen lbsId sistemde bulunamadı, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")


    let _lbs = currentLbsArray
    let _selectedLbs = oneLbs
    let _lbs2


    let leftPart = _selectedLbs.code.substring(0, _selectedLbs.code.lastIndexOf("."))
    let level = _selectedLbs.code.split(".").length - 1
    let sortNumber = Number(_selectedLbs.code.split(".")[level])
    let longText = _selectedLbs.code

    let leftPartB = leftPart.substring(0, leftPart.lastIndexOf("."))
    let levelB = leftPart.split(".").length - 1
    let sortNumberB = Number(leftPart.split(".")[levelB])
    let longTextB = leftPart


    let name_Match = false
    let codeName_Match = false
    let codeName_Match_name

    // zaten en üst seviyede ise daha fazla sağa alınamaz
    if (sortNumber == 1) {
      throw new Error("MONGO // moveLbsRight // __mesajBaslangic__ bu başlık zaten bir üstteki başlığın alt başlığı, daha fazla sağa alınamaz __mesajBitis__")
    }


    // seçilen başlığın en alt seviyede alt başlığı varsa daha fazla sağa kaydırma yapılamaz - işlem iptal
    let maxLevel = level
    _lbs.map(item => {
      let leftPart2 = item.code.substring(0, item.code.lastIndexOf("."))
      let level2 = item.code.split(".").length - 1
      let sortNumber2 = Number(item.code.split(".")[level2])
      let longText2 = item.code
      if (longText2.indexOf(longText + ".") === 0 && level2 > maxLevel) {
        maxLevel = level2
      }
    })
    if (maxLevel == 7) {
      throw new Error("MONGO // moveLbsRight // __mesajBaslangic__ maksimum seviyede alt başlık oluşturulmuş __mesajBitis__")
    }


    // seçilen başlığın üst başlığını tespit etme
    let upLbs = {}
    _lbs.map(item => {
      let leftPart2 = item.code.substring(0, item.code.lastIndexOf("."))
      let level2 = item.code.split(".").length - 1
      let sortNumber2 = Number(item.code.split(".")[level2])
      let longText2 = item.code
      if (leftPart2 === leftPart && sortNumber2 === sortNumber - 1) {
        upLbs = item
      }
    })

    // isim benzerliği kontrol - taşınacak seviyede
    _lbs.map(item => {
      let leftPart2 = item.code.substring(0, item.code.lastIndexOf("."))
      let level2 = item.code.split(".").length - 1
      let sortNumber2 = Number(item.code.split(".")[level2])
      let longText2 = item.code
      if (leftPart2 === upLbs.code) {
        if (item.name === _selectedLbs.name) {
          name_Match = true
        }
        if (item.codeName === _selectedLbs.codeName) {
          codeName_Match = true
          codeName_Match_name = item.name
        }
      }
    })


      if (name_Match) {
        throw new Error("MONGO // moveLbsLeft // __mesajBaslangic__ Eşit seviyede bir başlık ismi birden fazla kullanılamaz. Başlık ismini değiştirerek tekrar deneyiniz.  __mesajBitis__")
      }

      if (codeName_Match) {
        throw new Error("MONGO // moveLbsLeft // __mesajBaslangic__ Eşit seviyede bir kod ismi birden fazla kullanılamaz. Kod ismini değiştirerek tekrar deneyiniz.  __mesajBitis__")
      }




    // üst başlık mahale açıksa iptal
    if (upLbs.openForMahal) {
      throw new Error("MONGO // moveLbsRight // __mesajBaslangic__ Mahale açık başlıkların alt başlığı olamaz. __mesajBitis__")
    }

    // tespit edilen üst başlığın mevcut alt başlıkları varsa en sonuncusunu bulma
    let maxNumber = 0
    _lbs.map(item => {
      let leftPart2 = item.code.substring(0, item.code.lastIndexOf("."))
      let level2 = item.code.split(".").length - 1
      let sortNumber2 = Number(item.code.split(".")[level2])
      let longText2 = item.code

      if (longText2.indexOf((upLbs.code + ".")) === 0 && level2 === level + 1) {
        if (maxNumber < sortNumber2) {
          maxNumber = sortNumber2
        }
      }
    })


    // 1 artırıp newCode numaramızı bulma
    const newCode = upLbs.code + "." + (maxNumber + 1)


    // _lbs içinde kullanıcı tarafından seçilen başlığın kodunu değiştirerek yeni yerine taşıyoruz
    _lbs = _lbs.map(item => {
      if (item._id.toString() === _selectedLbs._id.toString()) {
        return { ...item, code: newCode }
      } else {
        return item
      }
    })


    // seçilen başlığın varsa alt başlıklarının da kodunu değiştirerek onları da beraberinde taşıyoruz
    _lbs = _lbs.map(item => {
      if (item.code.indexOf(_selectedLbs.code + ".") === 0) {
        let rightPartWithTheNumber = item.code.substring(_selectedLbs.code.length + 1, item.code.length)
        // console.log("rightPartWithTheNumber", rightPartWithTheNumber)
        return { ...item, code: newCode + "." + rightPartWithTheNumber }
      } else {
        return item
      }
    })


    // seçilen başlık taşındıığ için altındaki başlıkların numaralarını bir azaltıyoruz
    _lbs = _lbs.map(item => {


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

      const result = await collection_projeler.updateOne(
        { _id: _projeId },
        [
          { $set: { lbs: _lbs } }
        ]
      );

      return { result, lbs: _lbs }

    } catch (error) {
      throw new Error("MONGO // collection_projeler__lbs // " + functionName + " // " + err.message)
    }

  }




  throw new Error("MONGO // collection_projeler__lbs // " + functionName + " // " + "Herhangi bir fonksiyona uğramadı, 'functionName' eşleşmedi ya da boş gönderildi ")


};