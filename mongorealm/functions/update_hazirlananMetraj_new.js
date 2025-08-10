exports = async function ({
  _projeId,
  _dugumId,
  hazirlananMetrajlar_state
}) {



  const user = context.user;
  const _userId = new BSON.ObjectId(user.id)
  const userEmail = context.user.data.email
  const userIsim = user.custom_data.isim
  const userSoyisim = user.custom_data.soyisim

  const mailTeyit = user.custom_data.mailTeyit;
  if (!mailTeyit) {
    throw new Error("MONGO // update_hazirlananMetrajlar_selected // Öncelikle üyeliğinize ait mail adresinin size ait olduğunu doğrulamalısınız, tekrar giriş yapmayı deneyiniz veya bizimle iletişime geçiniz.");
  }

  if (!_projeId) {
    throw new Error("MONGO // update_hazirlananMetrajlar_selected // '_projeId' verisi db sorgusuna gelmedi");
  }

  if (!_dugumId) {
    throw new Error("MONGO // update_hazirlananMetrajlar_selected // '_dugumId' verisi db sorgusuna gelmedi");
  }

  if (!hazirlananMetrajlar_state) {
    throw new Error("MONGO // update_hazirlananMetrajlar_selected // 'hazirlananMetrajlar_state' verisi db sorgusuna gelmedi");
  }


  const currentTime = new Date();

  // const collection_Projeler = context.services.get("mongodb-atlas").db("rapor724_v2").collection("projeler")
  const collection_HazirlananMetrajlar = context.services.get("mongodb-atlas").db("rapor724_v2").collection("hazirlananMetrajlar")
  const collection_OnaylananMetrajlar = context.services.get("mongodb-atlas").db("rapor724_v2").collection("onaylananMetrajlar")
  const collection_Dugumler = context.services.get("mongodb-atlas").db("rapor724_v2").collection("dugumler")

  // const proje = await collection_Projeler.findOne({ _id: _projeId })
  // const {metrajYapabilenler} = proje.yetki




  let hasSelected
  let hasSelectedFull

  const _versionId = hazirlananMetrajlar_state._versionId

  let hazirlananMetrajlar
  let onaylananMetraj

  let metrajHazirlanan = 0
  let metrajOnaylanan = 0


  try {

    hazirlananMetrajlar = await collection_HazirlananMetrajlar.find({ _dugumId }).toArray()
    return hazirlananMetrajlar
    // hazirlananMetrajlar.map(oneHazirlanan => {
    //   if (oneHazirlanan._versionId.toString() !== _versionId.toString()) {
    //     throw new Error(`__mesajBaslangic__Kaydetmeye çalıştığınız bazı veriler, siz işlem yaparken, başa kullanıcı tarafından güncellenmiş. Bu sebeple kayıt işleminiz gerçekleşmedi. Kontrol edip tekrar deneyiniz.__mesajBitis__`)
    //   }
    // })

    onaylananMetraj = await collection_OnaylananMetrajlar.findOne({ _dugumId });
    if (onaylananMetraj._versionId.toString() !== _versionId.toString()) {
      throw new Error(`__mesajBaslangic__Kaydetmeye çalıştığınız bazı veriler, siz işlem yaparken, başa kullanıcı tarafından güncellenmiş. Bu sebeple kayıt işleminiz gerçekleşmedi. Kontrol edip tekrar deneyiniz.__mesajBitis__`)
    }

  } catch (error) {
    throw new Error("MONGO // update_hazirlananMetrajlar_selected // versionId " + error);
  }




  try {

    let bulkArray = []
    hazirlananMetrajlar = hazirlananMetrajlar.map(oneHazirlanan => {
      let selectedSatirlar = hazirlananMetrajlar_state.find(x => x.userEmail === oneHazirlanan.userEmail).satirlar.filter(x => x.isSelected && x.newSelected)
      oneHazirlanan.satirlar = oneHazirlanan.satirlar.map(oneSatir => {
        if (selectedSatirlar.find(x => x.satirNo === oneSatir.satirNo)) {
          oneSatir.isSelected = true
        }
        return oneSatir
      })

      oneBulk = {
        updateOne: {
          filter: { _dugumId, userEmail: oneHazirlanan.userEmail },
          update: { $set: { ...oneHazirlanan } }
        }
      }
      bulkArray = [...bulkArray, oneBulk]

      return oneHazirlanan
    })


    collection_HazirlananMetrajlar.bulkWrite(
      bulkArray,
      { ordered: false }
    )

  } catch (error) {
    throw new Error("MONGO // update_hazirlananMetrajlar_selected // hazirlananMetraj güncelleme " + error);
  }



  try {

    let newSiraNo = 1
    onaylananMetraj.satirlar.map(oneSatir => {
      if (oneSatir.siraNo >= newSiraNo) {
        newSiraNo = oneSatir.siraNo + 1
      }
    })

    hazirlananMetrajlar.map(oneHazirlanan => {
      let hazirlayanEmail = oneHazirlanan.userEmail
      oneHazirlanan.satirlar.map(oneSatir => {
        if (!onaylananMetraj.satirlar.find(x => x.satirNo === oneSatir.satirNo)) {
          onaylananMetraj.satirlar = [...onaylananMetraj.satirlar, { ...oneSatir, siraNo: newSiraNo, userEmail: hazirlayanEmail }]
          newSiraNo += 1
        }
      })
    })


    onaylananMetraj.satirlar.map(oneSatir => {
      metrajOnaylanan += Number(oneSatir.metraj)
    })

    await collection_OnaylananMetrajlar.updateOne(
      { _dugumId },
      { $set: { satirlar: onaylananMetraj.satirlar, metraj: metrajOnaylanan } }
    )


  } catch (error) {
    throw new Error("MONGO // update_hazirlananMetrajlar_selected // onaylananMetraj güncelleme " + error);
  }





  // let selectedSatirlar = hazirlananMetraj_selected.satirlar.filter(x => x.isSelected).map(oneSatir => {
  //   delete oneSatir.newSelected
  // })

  // try {

  //   hazirlananMetraj.satirlar = hazirlananMetraj.satirlar.map(oneSatir => {
  //     if (selectedSatirlar.find(x => x.satirNo === oneSatir.satirNo)) {
  //       oneSatir.isSelected = true
  //     }
  //     return oneSatir
  //   })

  //   // db için satirlar
  //   let { satirlar } = hazirlananMetraj
  //   // db için metraj
  //   satirlar.map(oneSatir => {
  //     metrajHazirlanan += Number(oneSatir?.metraj)
  //   })

  //   // aşağıdaki dugumId için veri güncelleme
  //   if (satirlar.find(x => x.isSelected)) {
  //     hasSelected = true
  //     if (satirlar.filter(x => x.isSelected).length === satirlar.length) {
  //       hasSelectedFull = true
  //     }
  //   }

  //   await collection_HazirlananMetrajlar.updateOne(
  //     { _dugumId, userEmail: hazirlayanEmail },
  //     { $set: { satirlar, metraj: metrajHazirlanan } }
  //   )

  // } catch (error) {
  //   throw new Error("MONGO // update_hazirlananMetrajlar_selected // hazirlananMetraj güncelleme " + error);
  // }





  // try {

  //   let newSiraNo = 1
  //   onaylananMetraj.satirlar = onaylananMetraj.satirlar.map(oneSatir => {
  //     if (oneSatir.siraNo >= newSiraNo) {
  //       newSiraNo = oneSatir.siraNo + 1
  //     }
  //     return oneSatir
  //   })


  //   selectedSatirlar.map(oneSatir => {
  //     if (!onaylananMetraj.satirlar.find(x => x.satirNo === oneSatir.satirNo)) {
  //       oneSatir.siraNo = newSiraNo
  //       onaylananMetraj.satirlar = [...onaylananMetraj.satirlar, oneSatir]
  //       newSiraNo += 1
  //     }
  //   })


  //   onaylananMetraj.satirlar.map(oneSatir => {
  //     metrajOnaylanan += Number(oneSatir.metraj)
  //   })

  //   await collection_OnaylananMetrajlar.updateOne(
  //     { _dugumId },
  //     { $set: { satirlar: onaylananMetraj.satirlar, metraj: metrajOnaylanan } }
  //   )

  // } catch (error) {
  //   throw new Error("MONGO // update_hazirlananMetrajlar_selected // onaylananMetraj güncelleme " + error);
  // }



  try {



    // oneBulk = {
    //   updateOne: {
    //     filter: { _dugumId, userEmail: oneHazirlanan.userEmail },
    //     update: { $set: { ...oneHazirlanan } }
    //   }
    // }
    // bulkArray = [...bulkArray, oneBulk]






    await collection_Dugumler.updateOne(
      { _id: _dugumId },
      {
        $set: {
          onaylananMetraj: metrajOnaylanan,
          "hazirlananMetrajlar.$[elem].hasSelected": hasSelected,
          "hazirlananMetrajlar.$[elem].hasSelectedFull": hasSelectedFull,
        }
      },
      { arrayFilters: [{ "elem.userEmail": hazirlayanEmail }] }
    )

  } catch (error) {
    throw new Error("MONGO // update_hazirlananMetrajlar_selected // dugum güncelleme " + error);
  }


};
