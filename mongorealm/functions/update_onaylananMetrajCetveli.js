exports = async function ({
  _dugumId,
  onaylananMetraj_state,
  revizeEdilenler
}) {



  const user = context.user;
  const _userId = new BSON.ObjectId(user.id)
  const userEmail = context.user.data.email
  const userIsim = user.custom_data.isim
  const userSoyisim = user.custom_data.soyisim

  const mailTeyit = user.custom_data.mailTeyit;
  if (!mailTeyit) {
    throw new Error("MONGO // updateDugumler_onaylananMetraj // Öncelikle üyeliğinize ait mail adresinin size ait olduğunu doğrulamalısınız, tekrar giriş yapmayı deneyiniz veya bizimle iletişime geçiniz.");
  }

  if (!_dugumId) {
    throw new Error("MONGO // updateDugumler_onaylananMetraj // '_dugumId' verisi db sorgusuna gelmedi");
  }

  if (!onaylananMetraj_state) {
    throw new Error("MONGO // updateDugumler_onaylananMetraj // 'onaylananMetraj_state' verisi db sorgusuna gelmedi");
  }

  if (!revizeEdilenler) {
    throw new Error("MONGO // updateDugumler_onaylananMetraj // 'revizeEdilenler' verisi db sorgusuna gelmedi");
  }


  const currentTime = new Date();

  // hazirlanan metrajlar burada revize olmuyor, içeri alırken oluyor
  // const collection_hazirlananMetrajlar = context.services.get("mongodb-atlas").db("rapor724_v2").collection("hazirlananMetrajlar")
  const collection_onaylananMetrajlar = context.services.get("mongodb-atlas").db("rapor724_v2").collection("onaylananMetrajlar")
  const collection_Dugumler = context.services.get("mongodb-atlas").db("rapor724_v2").collection("dugumler")




  let { metraj: newMetraj } = onaylananMetraj_state


  try {

    let { satirlar: newSatirlar } = onaylananMetraj_state
    // versiyon yayınlanınca alttaki kullanılacak
    // newSatirlar = newSatirlar.filter(x => !x.onayli)


    // const onaylananMetraj = await collection_onaylananMetrajlar.findOne({ _dugumId })

    // versiyon yayınlanınca alttaki kullanılacak, şu an direk geleni yapıştırıyoruz
    // if (onaylananMetraj) {

    //   let { satirlar } = onaylananMetraj

    //   if (satirlar) {
    //     satirlar = satirlar.filter(x => x.onayli)
    //     newSatirlar = [...satirlar, ...newSatirlar]

    //   }

    // }

    await collection_onaylananMetrajlar.updateOne(
      { _dugumId },
      { $set: { satirlar: newSatirlar, metraj: newMetraj } },
      { upsert: true }
    )


  } catch (error) {
    throw new Error({ hatayeri: "MONGO // updateDugumler_onaylananMetraj // onaylanan metrajlar güncelleme", error });
  }



  try {

    await collection_Dugumler.updateOne(
      { _id: _dugumId },
      { $set: { onaylananMetraj: newMetraj } },
      { upsert: true }
    )

  } catch (error) {
    throw new Error({ hatayeri: "MONGO // updateDugumler_onaylananMetraj // dugumler guncelleme ", error });
  }




  try {

    let bulkArray1
    if (revizeEdilenler) {

      bulkArray1 = revizeEdilenler.map(oneRevizeEdilen => {
        return (
          {
            updateOne: {
              filter: { _dugumId, userEmail: oneRevizeEdilen.userEmail },
              update: { $set: { "satirlar.$[elem].isRevize": true } },
              arrayFilters: [
                { "elem.satirNo": { $in: oneRevizeEdilen.satirNolar } },
              ]
            }
          }
        )
      })

    }

    // let bulkArray2
    // if (hazirlananlar_unUsed) {

    //   bulkArray2 = hazirlananlar_unUsed.map(oneHazirlanan => {
    //     return (
    //       {
    //         updateOne: {
    //           filter: { _dugumId, userEmail: oneHazirlanan.userEmail },
    //           update: { $set: { "satirlar.$[elem].isUsed": false } },
    //           arrayFilters: [
    //             { "elem.satirNo": { $in: oneHazirlanan.satirNolar } },
    //           ]
    //         }
    //       }
    //     )
    //   })

    // }

    let bulkArray = []
    if (bulkArray1) {
      bulkArray = [...bulkArray, ...bulkArray1]
    }
    // if (bulkArray2) {
    //   bulkArray = [...bulkArray, ...bulkArray2]
    // }


    if (bulkArray.length > 0) {
      await collection_hazirlananMetrajlar.bulkWrite(
        bulkArray,
        { ordered: false }
      )
    }

  } catch (error) {
    throw new Error({ hatayeri: "MONGO // update_onaylananMetraj // hazirlanan metrajlar isUsed guncelleme //", error });
  }



  return

};
