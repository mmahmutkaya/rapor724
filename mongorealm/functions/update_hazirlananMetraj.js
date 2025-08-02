exports = async function ({
  _dugumId,
  hazirlananMetraj_state
}) {



  const user = context.user;
  const _userId = new BSON.ObjectId(user.id)
  const userEmail = context.user.data.email
  const userIsim = user.custom_data.isim
  const userSoyisim = user.custom_data.soyisim

  const mailTeyit = user.custom_data.mailTeyit;
  if (!mailTeyit) {
    throw new Error("MONGO // update_hazirlananMetrajlar // Öncelikle üyeliğinize ait mail adresinin size ait olduğunu doğrulamalısınız, tekrar giriş yapmayı deneyiniz veya bizimle iletişime geçiniz.");
  }

  if (!_dugumId) {
    throw new Error("MONGO // update_hazirlananMetrajlar // '_dugumId' verisi db sorgusuna gelmedi");
  }

  if (!hazirlananMetraj_state) {
    throw new Error("MONGO // update_hazirlananMetrajlar // 'hazirlananMetraj_state' verisi db sorgusuna gelmedi");
  }


  const currentTime = new Date();

  const collection_hazirlananMetrajlar = context.services.get("mongodb-atlas").db("rapor724_v2").collection("hazirlananMetrajlar")
  const collection_Dugumler = context.services.get("mongodb-atlas").db("rapor724_v2").collection("dugumler")




  let { metraj: newMetraj } = hazirlananMetraj_state


  try {

    let { satirlar: newSatirlar } = hazirlananMetraj_state
    // frontend kısmında isUsed revize edilemez ama ilave güvenlik önlemi
    newSatirlar = newSatirlar.filter(x => !x.isUsed)


    const hazirlananMetraj = await collection_hazirlananMetrajlar.findOne({ _dugumId, userEmail })

    if (hazirlananMetraj) {

      let { satirlar } = hazirlananMetraj

      if (satirlar) {

        // onayliMetrajlarda kullanılmış olanları koruyalım, yukaroda filtre ettik çünkü gelen verilerden
        usedSatirlar = satirlar.filter(x => x.isUsed)
        newSatirlar.map(x => {
          if(usedSatirlar.find(y => y.satirNo === x.satirNo)){
             throw new Error("MONGO // update_hazirlananMetrajlar // __mesajBaslangic__Önceden oluşturmuş olduğunuz bazı satırlar onaylı tarafa alınmış ve değerlendiriliyor, değişiklikleriniz kaydedilmedi, yeni satırlar ekleyerek devam edebilirsiniz.__mesajBitis__ ");
          }
        })
        
        newSatirlar = [...usedSatirlar, ...newSatirlar]

      }

    }

    await collection_hazirlananMetrajlar.updateOne(
      { _dugumId, userEmail },
      { $set: { satirlar: newSatirlar, metraj: newMetraj } },
      { upsert: true }
    )


  } catch (error) {
    throw new Error({ hatayeri: "MONGO // update_hazirlananMetrajlar // hazirlanan metrajlar güncelleme", error });
  }





  try {

    let dugum = await collection_Dugumler.findOne({ _id: _dugumId })

    let { hazirlananMetrajlar } = dugum

    let isUpdated

    if (hazirlananMetrajlar) {

      hazirlananMetrajlar = hazirlananMetrajlar.map(x => {
        if (x.userEmail === userEmail) {
          x.metraj = newMetraj
          isUpdated = true
        }
        return x
      })

      if (!isUpdated) {
        hazirlananMetrajlar = [...hazirlananMetrajlar, { userEmail, metraj: newMetraj }]
      }

    } else {

      hazirlananMetrajlar = [{ userEmail, metraj: newMetraj }]

    }

    await collection_Dugumler.updateOne(
      { _id: _dugumId },
      { $set: { hazirlananMetrajlar } },
      { upsert: true }
    )


  } catch (error) {
    throw new Error({ hatayeri: "MONGO // update_hazirlananMetrajlar // dugum guncelleme ", error });
  }

  return

};
