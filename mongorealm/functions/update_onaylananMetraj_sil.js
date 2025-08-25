exports = async function ({
  _dugumId,
  onaylananMetraj_state
}) {



  const user = context.user;
  const _userId = new BSON.ObjectId(user.id)
  const userEmail = context.user.data.email
  const userIsim = user.custom_data.isim
  const userSoyisim = user.custom_data.soyisim

  const mailTeyit = user.custom_data.mailTeyit;
  if (!mailTeyit) {
    throw new Error("MONGO // update_onaylananMetraj_sil // Öncelikle üyeliğinize ait mail adresinin size ait olduğunu doğrulamalısınız, tekrar giriş yapmayı deneyiniz veya bizimle iletişime geçiniz.");
  }

  if (!_dugumId) {
    throw new Error("MONGO // update_onaylananMetraj_sil // '_dugumId' verisi db sorgusuna gelmedi");
  }

  if (!onaylananMetraj_state) {
    throw new Error("MONGO // update_onaylananMetraj_sil // 'onaylananMetraj_state' verisi db sorgusuna gelmedi");
  }


  const currentTime = new Date();

  // hazirlanan metrajlar burada revize olmuyor, içeri alırken oluyor
  const collection_Dugumler = context.services.get("mongodb-atlas").db("rapor724_v2").collection("dugumler")


  let emails = []
  onaylananMetraj_state.satirlar.filter(x => x.hasSelectedCopy && x.newSelected).map(oneSatir => {
    if (!emails.find(x => x === oneSatir.userEmail)) (
      emails = [...emails, oneSatir.userEmail]
    )
  })

  let revizeMetrajlar_silinecek = []

  try {

    let bulkArray = []
    emails.map(oneEmail => {

      let hasSelectedCopySatirNolar_silinecek = onaylananMetraj_state.satirlar.filter(x => x.hasSelectedCopy && x.newSelected && x.userEmail === oneEmail).map(oneSatir => {
        return oneSatir.satirNo
      })

      if (hasSelectedCopySatirNolar_silinecek.length > 0) {

        revizeMetrajlar_silinecek = [...revizeMetrajlar_silinecek, ...hasSelectedCopySatirNolar_silinecek]

        oneBulk = {
          updateOne: {
            filter: { _id: _dugumId },
            update: {
              $set: {
                "hazirlananMetrajlar.$[oneHazirlanan].satirlar.$[oneSatir].isReady": true,
                "revizeMetrajlar.$[oneMetraj].isPasif": true,
              },
              $unset: {
                "hazirlananMetrajlar.$[oneHazirlanan].satirlar.$[oneSatir].hasSelectedCopy": ""
              }
            },
            arrayFilters: [
              {
                "oneHazirlanan.userEmail": oneEmail
              },
              {
                "oneSatir.satirNo": { $in: hasSelectedCopySatirNolar_silinecek },
                "oneSatir.hasSelectedCopy": true
              },
              {
                "oneMetraj.satirNo": { $in: hasSelectedCopySatirNolar_silinecek },e
              }
            ]
          }
        }
        bulkArray = [...bulkArray, oneBulk]
      }


      let isSelectedSatirNolar_silinecek = onaylananMetraj_state.satirlar.filter(x => x.isSelected && x.newSelected && x.userEmail === oneEmail).map(oneSatir => {
        return oneSatir.satirNo
      })

      if (isSelectedSatirNolar_silinecek.length > 0) {

        oneBulk = {
          updateOne: {
            filter: { _id: _dugumId },
            update: {
              $set: {
                "hazirlananMetrajlar.$[oneHazirlanan].satirlar.$[oneSatir].isReady": true
              },
              $unset: {
                "hazirlananMetrajlar.$[oneHazirlanan].satirlar.$[oneSatir].hasSelectedCopy": ""
              }
            },
            arrayFilters: [
              {
                "oneHazirlanan.userEmail": oneEmail
              },
              {
                "oneSatir.satirNo": { $in: hasSelectedCopySatirNolar_silinecek },
                "oneSatir.hasSelectedCopy": true
              }
            ]
          }
        }
        bulkArray = [...bulkArray, oneBulk]
      }

    })


  } catch (error) {
    throw new Error({ hatayeri: "MONGO // update_onaylananMetraj_sil // hazirlanan metrajlar isUsed guncelleme //", error });
  }



  // try {

  //   let bulkArray1
  //   if (revizeEdilenler) {

  //     bulkArray1 = revizeEdilenler.map(oneRevizeEdilen => {
  //       return (
  //         {
  //           updateOne: {
  //             filter: { _dugumId, userEmail: oneRevizeEdilen.userEmail },
  //             update: { $set: { "satirlar.$[elem].isRevize": false } },
  //             arrayFilters: [
  //               { "elem.satirNo": { $in: oneRevizeEdilen.satirNolar } },
  //             ]
  //           }
  //         }
  //       )
  //     })

  //   }

  //   // let bulkArray2
  //   // if (hazirlananlar_unUsed) {

  //   //   bulkArray2 = hazirlananlar_unUsed.map(oneHazirlanan => {
  //   //     return (
  //   //       {
  //   //         updateOne: {
  //   //           filter: { _dugumId, userEmail: oneHazirlanan.userEmail },
  //   //           update: { $set: { "satirlar.$[elem].isUsed": false } },
  //   //           arrayFilters: [
  //   //             { "elem.satirNo": { $in: oneHazirlanan.satirNolar } },
  //   //           ]
  //   //         }
  //   //       }
  //   //     )
  //   //   })

  //   // }

  //   let bulkArray = []
  //   if (bulkArray1) {
  //     bulkArray = [...bulkArray, ...bulkArray1]
  //   }
  //   // if (bulkArray2) {
  //   //   bulkArray = [...bulkArray, ...bulkArray2]
  //   // }


  //   if (bulkArray.length > 0) {
  //     await collection_hazirlananMetrajlar.bulkWrite(
  //       bulkArray,
  //       { ordered: false }
  //     )
  //   }

  // } catch (error) {
  //   throw new Error({ hatayeri: "MONGO // update_onaylananMetraj_sil // hazirlanan metrajlar isUsed guncelleme //", error });
  // }



};
