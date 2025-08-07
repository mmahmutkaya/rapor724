exports = async function ({
  _dugumId,
  hazirlananMetraj_new
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

  if (!hazirlananMetraj_new) {
    throw new Error("MONGO // update_hazirlananMetrajlar // 'hazirlananMetraj_new' verisi db sorgusuna gelmedi");
  }


  const currentTime = new Date();

  const collection_HazirlananMetrajlar = context.services.get("mongodb-atlas").db("rapor724_v2").collection("hazirlananMetrajlar")
  const collection_Dugumler = context.services.get("mongodb-atlas").db("rapor724_v2").collection("dugumler")




  let metraj = 0


  // try {

  //   let { satirlar: newSatirlar } = hazirlananMetraj_new

  //   newSatirlar = newSatirlar.filter(x => !x.isSelected)
  //   newSatirlar = newSatirlar.map(newSatir => {
  //     newSatir.userEmail = userEmail
  //     newSatir._id = new BSON.ObjectId()
  //     return newSatir
  //   })



  //   const hazirlananMetraj = await collection_hazirlananMetrajlar.findOne({ _dugumId, userEmail })

  //   if (hazirlananMetraj) {

  //     let { satirlar } = hazirlananMetraj

  //     if (satirlar) {

  //       // onayliMetrajlarda kullanılmış olanları koruyalım, yukaroda filtre ettik çünkü gelen verilerden
  //       selectedSatirlar = satirlar.filter(x => x.isSelected)
  //       let hataMesaj
  //       newSatirlar = newSatirlar.map(newSatir => {
  //         if (selectedSatirlar?.find(y => y.satirNo === newSatir.satirNo)) {
  //           hataMesaj = "MONGO // update_hazirlananMetrajlar // __mesajBaslangic__Önceden oluşturmuş olduğunuz bazı satırlar onaylı tarafa alınmış ve değerlendiriliyor, değişiklikleriniz kaydedilmedi.__mesajBitis__ "
  //         }
  //         return newSatir
  //       })

  //       if (hataMesaj) {
  //         throw new Error(hataMesaj);
  //       }

  //       newSatirlar = [...selectedSatirlar, ...newSatirlar]

  //     }

  //   }

  //   newSatirlar.map(oneSatir => {
  //     metraj = metraj + oneSatir?.metraj
  //   })


  //   await collection_hazirlananMetrajlar.updateOne(
  //     { _dugumId, userEmail },
  //     { $set: { satirlar: newSatirlar, metraj } },
  //     { upsert: true }
  //   )


  // } catch (error) {
  //   throw new Error({ hatayeri: "MONGO // update_hazirlananMetrajlar // hazirlanan metrajlar güncelleme", error });
  // }






  try {

    let hazirlananMetraj = await collection_HazirlananMetrajlar.findOne({ _dugumId, userEmail: hazirlananMetraj_new.userEmail })
    let satirlar_selected = hazirlananMetraj?.satirlar.filter(x => x.isSelected)


    let hataMesaj
    if (satirlar_selected) {
      hazirlananMetraj_new.satirlar.map(oneSatir => {
        if (satirlar_selected.find(x => x._id.toString() === oneSatir._id.toString())) {
          hataMesaj = `__mesajBaslangic__Kaydetmeye çalıştığınız bazı satırlar, siz işlem yaparken, sizden önce onaylı kısma alınmış ve değerlendiriliyor. Bu sebeple kayıt işleminiz gerçekleşmedi.__mesajBitis__`
        }
      })
    }

    // return { satirlar_selected, newSatirlar: hazirlananMetraj_new.satirlar }

    if (hataMesaj) {
      throw new Error(hataMesaj);
    }

    hazirlananMetraj_new.satirlar = hazirlananMetraj_new.satirlar.map(oneSatir => {
      oneSatir.userEmail = userEmail
      oneSatir._id = new BSON.ObjectId()
      return oneSatir
    })

    let satirlar = satirlar_selected ? [...satirlar_selected, ...hazirlananMetraj_new.satirlar] : hazirlananMetraj_new.satirlar

    // return {satirlar}

    satirlar.map(oneSatir => {
      metraj = metraj + Number(oneSatir?.metraj)
    })


    await collection_HazirlananMetrajlar.updateOne(
      { _dugumId, userEmail },
      { $set: { satirlar, metraj } },
      { upsert: true }
    )


  } catch (err) {
    throw new Error("MONGO // update_hazirlananMetrajlar_new // " + err.message);
  }






  try {

    let dugum = await collection_Dugumler.findOne({ _id: _dugumId })

    let { hazirlananMetrajlar } = dugum

    let isUpdated

    if (hazirlananMetrajlar) {

      hazirlananMetrajlar = hazirlananMetrajlar.map(x => {
        if (x.userEmail === userEmail) {
          x.metraj = metraj
          isUpdated = true
        }
        return x
      })

      if (!isUpdated) {
        hazirlananMetrajlar = [...hazirlananMetrajlar, { userEmail, metraj }]
      }

    } else {

      hazirlananMetrajlar = [{ userEmail, metraj }]

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
