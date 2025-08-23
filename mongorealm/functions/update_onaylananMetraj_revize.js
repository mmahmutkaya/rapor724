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
    throw new Error("MONGO // update_onaylananMetraj_revize // Öncelikle üyeliğinize ait mail adresinin size ait olduğunu doğrulamalısınız, tekrar giriş yapmayı deneyiniz veya bizimle iletişime geçiniz.");
  }

  // if (!_projeId) {
  //   throw new Error("MONGO // update_onaylananMetraj_revize // '_projeId' verisi db sorgusuna gelmedi");
  // }

  if (!_dugumId) {
    throw new Error("MONGO // update_onaylananMetraj_revize // '_dugumId' verisi db sorgusuna gelmedi");
  }

  if (!onaylananMetraj_state) {
    throw new Error("MONGO // update_onaylananMetraj_revize // 'onaylananMetraj_state' verisi db sorgusuna gelmedi");
  }


  const currentTime = new Date();

  // const collection_Projeler = context.services.get("mongodb-atlas").db("rapor724_v2").collection("projeler")
  const collection_Dugumler = context.services.get("mongodb-atlas").db("rapor724_v2").collection("dugumler")

  // const proje = await collection_Projeler.findOne({ _id: _projeId })
  // const {metrajYapabilenler} = proje.yetki



  let revisedSavedButOtherUser

  let hazirlananMetrajlar = await collection_Dugumler.findOne({ _id: _dugumId })


  hazirlananMetrajlar.map(oneHazirlanan => {

    let hasSelectedCopySatirNolar = onaylananMetraj_state.satirlar.filter(x => x.userEmail === oneHazirlanan.userEmail && x.hasSelectedCopy && x.newSelected).map(oneSatir => {
      return oneSatir.satirNo
    })

    oneHazirlanan.satirlar.map(oneSatir => {
      if (hasSelectedCopySatirNolar.find(x => x === oneSatir.satirNo)) {
        if (!oneSatir.isSelected) {
          revisedSavedButOtherUser = true
        }
      }
    })

  })



  try {

    let bulkArray = []
    hazirlananMetrajlar.map(oneHazirlanan => {

      let hasSelectedCopySatirNolar = onaylananMetraj_state.satirlar.filter(x => x.userEmail === oneHazirlanan.userEmail && x.hasSelectedCopy && x.newSelected).map(oneSatir => {
        return oneSatir.satirNo
      })

      let isSelctedCopySatirlar = onaylananMetraj_state.satirlar.filter(x => x.userEmail === oneHazirlanan.userEmail && x.isSelectedCopy)


      oneBulk = {
        updateOne: {
          filter: { _id: _dugumId },
          update: {
            $set: {
              "hazirlananMetrajlar.$[oneHazirlanan].satirlar.$[oneSatir].hasSelectedCopy": true,
              "revizeMetrajlar.$[oneHazirlanan].satirlar": isSelctedCopySatirlar
            },
            $unset: {
              "hazirlananMetrajlar.$[oneHazirlanan].satirlar.$[oneSatir].isSelected": ""
            }
          },
          arrayFilters: [
            {
              "oneHazirlanan.userEmail": userEmail
            },
            {
              "oneSatir.satirNo": { $in: hasSelectedCopySatirNolar },
              "oneSatir.isSelected": true
            },
            {
              "oneSatir.satirNo": { $in: hasSelectedCopySatirNolar },
              "oneSatir.isSelected": true
            }
          ]
        }
      }
      bulkArray = [...bulkArray, oneBulk]

    })


    collection_Dugumler.bulkWrite(
      bulkArray,
      { ordered: false }
    )

  } catch (error) {
    throw new Error("MONGO // update_onaylananMetraj_revize // hazirlananMetraj güncelleme " + error);
  }



  // try {

  //   // let newSiraNo = 1
  //   // onaylananMetraj.satirlar.map(oneSatir => {
  //   //   if (oneSatir.siraNo >= newSiraNo) {
  //   //     newSiraNo = oneSatir.siraNo + 1
  //   //   }
  //   // })

  //   // hazirlananMetrajlar.map(oneHazirlanan => {

  //   //   let hazirlayanEmail = oneHazirlanan.userEmail

  //   //   oneHazirlanan.satirlar.filter(x => x.isSelected).map(oneSatir => {
  //   //     if (!onaylananMetraj.satirlar.find(x => x.satirNo === oneSatir.satirNo)) {
  //   //       onaylananMetraj.satirlar = [...onaylananMetraj.satirlar, { ...oneSatir, siraNo: newSiraNo, userEmail: hazirlayanEmail }]
  //   //       newSiraNo += 1
  //   //     }
  //   //   })
  //   // })


  //   // ö2 aşamada metraj tespiti
  //   onaylananMetraj_state.satirlar.filter(x => x.isSelected && !x.hasSelectedCopy).map(oneSatir => {
  //     metrajOnaylanan += Number(oneSatir.metraj)
  //   })
  //   onaylananMetraj_state.satirlar.filter(x => x.isSelectedCopy).map(oneSatir => {
  //     metrajOnaylanan += Number(oneSatir.metraj)
  //   })

  //   await collection_OnaylananMetrajlar.updateOne(
  //     { _dugumId },
  //     { $set: { satirlar: onaylananMetraj_state.satirlar, metraj: metrajOnaylanan } }
  //   )


  // } catch (error) {
  //   throw new Error("MONGO // update_onaylananMetraj_revize // onaylananMetraj güncelleme " + error);
  // }



  // try {

  //   let bulkArray = []

  //   hazirlananMetrajlar.map(oneHazirlanan => {
  //     let hasSelected
  //     let hasSelectedFull
  //     let userEmail = oneHazirlanan.userEmail
  //     let metraj = 0
  //     oneHazirlanan.satirlar.map(oneSatir => {
  //       metraj += Number(oneSatir.metraj)
  //     })
  //     if (oneHazirlanan.satirlar.find(x => x.isSelected)) {
  //       hasSelected = true
  //       if (oneHazirlanan.satirlar.filter(x => x.isSelected).length === oneHazirlanan.satirlar.length) {
  //         hasSelectedFull = true
  //       }
  //     }

  //     oneBulk = {
  //       updateOne: {
  //         filter: { _id: _dugumId },
  //         update: {
  //           $set: {
  //             onaylananMetraj: metrajOnaylanan,
  //             "hazirlananMetrajlar.$[elem].hasSelected": hasSelected,
  //             "hazirlananMetrajlar.$[elem].hasSelectedFull": hasSelectedFull,
  //           }
  //         },
  //         arrayFilters: [{ "elem.userEmail": userEmail }],
  //       }
  //     }
  //     bulkArray = [...bulkArray, oneBulk]

  //   })

  //   await collection_Dugumler.bulkWrite(
  //     bulkArray,
  //     { ordered: false }
  //   )

  // } catch (error) {
  //   throw new Error("MONGO // update_onaylananMetraj_revize // dugum güncelleme " + error);
  // }


};
