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
  // const collection_HazirlananMetrajlar = context.services.get("mongodb-atlas").db("rapor724_v2").collection("hazirlananMetrajlar")
  // const collection_OnaylananMetrajlar = context.services.get("mongodb-atlas").db("rapor724_v2").collection("onaylananMetrajlar")
  const collection_Dugumler = context.services.get("mongodb-atlas").db("rapor724_v2").collection("dugumler")

  // const proje = await collection_Projeler.findOne({ _id: _projeId })
  // const {metrajYapabilenler} = proje.yetki




  try {

    let bulkArray = []
    hazirlananMetrajlar_state.map(oneHazirlanan => {

      let oneHazirlanan_selected_satirNolar = oneHazirlanan.satirlar.filter(x => x.isSelected && x.newSelected).map(oneSatir => {
        return oneSatir.satirNo
      })

      oneBulk = {
        updateOne: {
          filter: { _id: _dugumId },
          update: {
            $set: {
              "hazirlananMetrajlar.$[oneHazirlanan].satirlar.$[oneSatir].isSelected": true,
              "hazirlananMetrajlar.$[oneHazirlanan].satirlar.$[oneSatir].hasSelectedCopy": false
            },
            $unset: {
              "hazirlananMetrajlar.$[oneHazirlanan].satirlar.$[oneSatir].isReady": "",
              "hazirlananMetrajlar.$[oneHazirlanan].satirlar.$[oneSatir].isReadyUnSeen": ""
            }
          },
          arrayFilters: [
            {
              "oneHazirlanan.userEmail": oneHazirlanan.userEmail
            },
            {
              "oneSatir.satirNo": { $in: oneHazirlanan_selected_satirNolar },
              "oneSatir.isReady": true
            }
          ]
        }
      }
      bulkArray = [...bulkArray, oneBulk]

    })


    await collection_Dugumler.bulkWrite(
      bulkArray,
      { ordered: false }
    )


  } catch (error) {
    throw new Error("MONGO // update_hazirlananMetraj_ready // " + error);
  }






  // metraj güncelleme
  try {
    await collection_Dugumler.updateOne({ _id: _dugumId },
      [
        {
          $set: {
            "hazirlananMetrajlar": {
              $map: {
                input: "$hazirlananMetrajlar",
                as: "oneHazirlanan",
                in: {
                  "$mergeObjects": [
                    "$$oneHazirlanan",
                    {
                      metrajOnaylanan: {
                        $sum: {
                          $concatArrays: [
                            {
                              "$map": {
                                "input": "$$oneHazirlanan.satirlar",
                                "as": "oneSatir",
                                "in": {
                                  "$cond": {
                                    "if": { $and: [{ $eq: ["$$oneSatir.isSelected", true] }, { $ne: ["$$oneSatir.hasSelectedCopy", true] }] },
                                    "then": "$$oneSatir.metraj",
                                    "else": 0
                                  }
                                }
                              }
                            },
                            {
                              "$concatArrays": [
                                {
                                  "$map": {
                                    "input": "$revizeMetrajlar",
                                    "as": "oneMetraj",
                                    "in": {
                                      "$cond": {
                                        "if": {
                                          $ne: [
                                            "$$oneMetraj.isPasif",
                                            true
                                          ]
                                        },
                                        "then": {
                                          "$reduce": {
                                            "input": "$$oneMetraj.satirlar",
                                            "initialValue": 0,
                                            "in": {
                                              $add: [
                                                "$$value",
                                                {
                                                  "$cond": {
                                                    "if": {
                                                      $ne: [
                                                        "$$this.metraj",
                                                        ""
                                                      ]
                                                    },
                                                    "then": {
                                                      "$toDouble": "$$this.metraj"
                                                    },
                                                    "else": 0
                                                  }
                                                }
                                              ]
                                            }
                                          }
                                        },
                                        "else": 0
                                      }
                                    }
                                  }
                                }
                              ]
                            }
                          ]
                        }
                      }
                    }
                  ]
                }
              }
            }
          }
        },
        {
          $set: {
            "metrajOnaylanan": {
              $sum: {
                "$map": {
                  "input": "$hazirlananMetrajlar",
                  "as": "oneHazirlanan",
                  "in": "$$oneHazirlanan.metrajOnaylanan"
                }
              }
            }
          }
        }
      ]
    )

  } catch (error) {
    throw new Error("MONGO // update_hazirlananMetrajlar_selected // metraj güncelleme" + error);
  }






























  // let dugum

  // let hasSelected
  // let hasSelectedFull

  // let hazirlananMetrajlar
  // let onaylananMetraj

  // let metrajHazirlanan = 0
  // let metrajOnaylanan = 0




  // try {
  //   dugum = await collection_Dugumler.findOne({ _id: _dugumId })
  //   hazirlananMetrajlar = dugum.hazirlananMetrajlar
  // } catch (error) {
  //   throw new Error("MONGO // update_hazirlananMetrajlar_selected // db'den veri çekme" + error);
  // }





  // try {

  //   // let bulkArray = []
  //   let newSiraNo = 1
  //   hazirlananMetrajlar.map(oneHazirlanan => {
  //     oneHazirlanan.satirlar.filter(x => x.isSelected && !x.newSelected).map(oneSatir => {
  //       if (oneSatir?.siraNo >= newSiraNo) {
  //         newSiraNo = oneSatir?.siraNo + 1
  //       }
  //     })
  //   })


  //   hazirlananMetrajlar = hazirlananMetrajlar.map(oneHazirlanan => {
  //     let newSelectedSatirlar = hazirlananMetrajlar_state.find(x => x.userEmail === oneHazirlanan.userEmail).satirlar.filter(x => x.isSelected && x.newSelected)
  //     oneHazirlanan.satirlar = oneHazirlanan.satirlar.map(oneSatir => {
  //       if (newSelectedSatirlar.find(x => x.satirNo === oneSatir.satirNo)) {
  //         oneSatir.isSelected = true
  //         oneSatir.siraNo = newSiraNo
  //         newSiraNo += 1
  //       }
  //       return oneSatir
  //     })

  //     return oneHazirlanan
  //   })

  //   hazirlananMetrajlar = hazirlananMetrajlar.map(oneHazirlanan => {

  //     oneHazirlanan.hasSelected = false
  //     oneHazirlanan.hasSelectedFull = false

  //     let metrajSatirlari = oneHazirlanan.satirlar.filter(x => (x.isSelected && !x.hasSelected) || (x.isSelectedCopy))
  //     metrajSatirlari.map(oneSatir => {
  //       metrajOnaylanan += oneSatir.metraj
  //     })

  //     let selectedSatirlar = oneHazirlanan.satirlar.filter(x => x.isSelected)
  //     if(selectedSatirlar.length > 0){
  //       oneHazirlanan.hasSelected = true
  //     }

  //     if(selectedSatirlar.length === oneHazirlanan.satirlar.filter(x => x.isReady).length){
  //       oneHazirlanan.hasSelectedFull = true
  //     }
  //     return oneHazirlanan
  //   })

  //   // oneBulk = {
  //   //   updateOne: {
  //   //     filter: { _dugumId, userEmail: oneHazirlanan.userEmail },
  //   //     update: { $set: { ...oneHazirlanan } }
  //   //   }
  //   // }
  //   // bulkArray = [...bulkArray, oneBulk]


  //   // collection_HazirlananMetrajlar.bulkWrite(
  //   //   bulkArray,
  //   //   { ordered: false }
  //   // )

  //   await collection_Dugumler.updateOne({ _id: _dugumId }, { $set: { hazirlananMetrajlar, onaylananMetraj: metrajOnaylanan } })

  // } catch (error) {
  //   throw new Error("MONGO // update_hazirlananMetrajlar_selected // hazirlananMetraj güncelleme " + error);
  // }



  // try {

  // let newSiraNo = 1
  // onaylananMetraj.satirlar.map(oneSatir => {
  //   if (oneSatir.siraNo >= newSiraNo) {
  //     newSiraNo = oneSatir.siraNo + 1
  //   }
  // })

  // hazirlananMetrajlar.map(oneHazirlanan => {

  //   let hazirlayanEmail = oneHazirlanan.userEmail

  //   oneHazirlanan.satirlar.filter(x => x.isSelected).map(oneSatir => {
  //     if (!onaylananMetraj.satirlar.find(x => x.satirNo === oneSatir.satirNo)) {
  //       onaylananMetraj.satirlar = [...onaylananMetraj.satirlar, { ...oneSatir, siraNo: newSiraNo, userEmail: hazirlayanEmail }]
  //       newSiraNo += 1
  //     }
  //   })
  // })


  // onaylananMetraj.satirlar.filter(x => x.isSelected && !x.hasSelectedCopy).map(oneSatir => {
  //   metrajOnaylanan += Number(oneSatir.metraj)
  // })
  // onaylananMetraj.satirlar.filter(x => x.isSelectedCopy).map(oneSatir => {
  //   metrajOnaylanan += Number(oneSatir.metraj)
  // })

  // await collection_OnaylananMetrajlar.updateOne(
  //   { _dugumId },
  //   { $set: { satirlar: onaylananMetraj.satirlar, metraj: metrajOnaylanan } }
  // )


  // } catch (error) {
  //   throw new Error("MONGO // update_hazirlananMetrajlar_selected // onaylananMetraj güncelleme " + error);
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
  //   throw new Error("MONGO // update_hazirlananMetrajlar_selected // dugum güncelleme " + error);
  // }


};
