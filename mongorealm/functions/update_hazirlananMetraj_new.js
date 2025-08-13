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
  const collection_OnaylananMetrajlar = context.services.get("mongodb-atlas").db("rapor724_v2").collection("onaylananMetrajlar")
  const collection_Dugumler = context.services.get("mongodb-atlas").db("rapor724_v2").collection("dugumler")




  let isSilinecek = true
  let metraj_ready = 0
  let metraj = 0

  try {

    let hazirlananMetraj_db = await collection_HazirlananMetrajlar.findOne({ _dugumId, userEmail })

    // if (hazirlananMetraj._versionId.toString() !== _versionId.toString()) {
    //   throw new Error(`__mesajBaslangic__Kaydetmeye çalıştığınız bazı satırlar, siz işlem yaparken, başa kullanıcı tarafından güncellenmiş. Bu sebeple kayıt işleminiz gerçekleşmedi. Kontrol edip tekrar deneyiniz.__mesajBitis__`)
    // }

    let selectedSatirlar = hazirlananMetraj_db.satirlar.filter(x => x.isSelected)
    let kaydedilecekSatirlar = hazirlananMetraj_new.satirlar.filter(x => x.isKaydedilecek)
    selectedSatirlar.map(oneSatir => {
      if (kaydedilecekSatirlar.find(x => x.satirNo === oneSatir.satirNo)) {
        throw new Error(`__mesajBaslangic__Kaydetmeye çalıştığınız bazı satırlar, siz işlem yaparken, başa kullanıcı tarafından onaylı tarafa alınmış. Kayıt işleminiz gerçekleşmedi. Kontrol edip tekrar deneyiniz.__mesajBitis__`)
      }
    })




    // db hazirlik - metraj
    hazirlananMetraj_new.satirlar.map(oneSatir => {
      metraj += Number(oneSatir.metraj)
    })
    hazirlananMetraj_new.metraj = metraj
    
    // dugum - db hazirlik - metraj
    hazirlananMetraj_new.satirlar.filter(x => x.isReady).map(oneSatir => {
      metraj_ready += Number(oneSatir.metraj)
    })

    

    hazirlananMetraj_new.satirlar.map(oneSatir => {
      if (!(oneSatir.aciklama === "" && Number(oneSatir.carpan1) === 0 && Number(oneSatir.carpan2) === 0 && Number(oneSatir.carpan3) === 0 && Number(oneSatir.carpan4) === 0 && Number(oneSatir.carpan5) === 0)) {
        isSilinecek = false
      }
      if (oneSatir.isSelected) {
        isSilinecek = false
      }
    })

    if (isSilinecek) {
      await collection_HazirlananMetrajlar.deleteOne(
        { _dugumId, userEmail }
      )
    } else {
      await collection_HazirlananMetrajlar.updateOne(
        { _dugumId, userEmail },
        { $set: { ...hazirlananMetraj_new, isDeleted: false } }
      )
    }



  } catch (err) {
    throw new Error("MONGO // update_hazirlananMetrajlar_new // " + err.message);
  }



  try {
    const result = await collection_OnaylananMetrajlar.findOne({ _dugumId })
    if (!result) {
      await collection_OnaylananMetrajlar.insertOne({ _dugumId, satirlar: [], metraj: 0 })
    }
  } catch (error) {
    throw new Error("MONGO // update_hazirlananMetrajlar_new // ilk onaylananMetraj verisini oluşturma" + err.message);
  }



  try {

    let dugum = await collection_Dugumler.findOne({ _id: _dugumId })

    let { hazirlananMetrajlar } = dugum

    let isUpdated

    if (hazirlananMetrajlar) {

      hazirlananMetrajlar = hazirlananMetrajlar.map(x => {
        if (x.userEmail === userEmail) {
          x.metraj = metraj_ready
          isUpdated = true
        }
        return x
      })

      if (!isUpdated) {
        hazirlananMetrajlar = [...hazirlananMetrajlar, { userEmail, metraj_ready }]
      }

    } else {

      hazirlananMetrajlar = [{ userEmail, metraj_ready }]

    }

    if (isSilinecek) {
      hazirlananMetrajlar = hazirlananMetrajlar.filter(x => !x.userEmail)
    }

    await collection_Dugumler.updateOne(
      { _id: _dugumId },
      { $set: { hazirlananMetrajlar } },
    )


  } catch (error) {
    throw new Error({ hatayeri: "MONGO // update_hazirlananMetrajlar // dugum guncelleme ", error });
  }


  return

};
