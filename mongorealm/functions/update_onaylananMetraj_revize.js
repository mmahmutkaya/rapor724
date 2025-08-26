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



  try {

    let bulkArray1 = []
    let bulkArray2 = []
    let oneBulk

    onaylananMetraj_state.satirlar.filter(x => x.hasSelectedCopy && x.newSelected).map(oneSatir => {

      if (oneSatir) {

        let originalSatirNo = oneSatir.satirNo
        let satirlar = onaylananMetraj_state.satirlar.filter(x => x.originalSatirNo === originalSatirNo)
        let userEmail = oneSatir.userEmail

        oneBulk = {
          updateOne: {
            filter: { _id: _dugumId },
            update: {
              $set: {
                "hazirlananMetrajlar.$[oneHazirlanan].satirlar.$[oneSatir].hasSelectedCopy": true
              },
              $unset: {
                "hazirlananMetrajlar.$[oneHazirlanan].satirlar.$[oneSatir].isSelected": "",
              }
            },
            arrayFilters: [
              {
                "oneHazirlanan.userEmail": userEmail
              },
              {
                "oneSatir.satirNo": originalSatirNo,
                "oneSatir.isSelected": true
              }
            ]
          }
        }
        bulkArray1 = [...bulkArray1, oneBulk]

        oneBulk = {
          updateOne: {
            filter: { _id: _dugumId },
            update: {
              $unset: {
                "hazirlananMetrajlar.$[oneHazirlanan].satirlar.$[oneSatir]": "",
              }
            },
            arrayFilters: [
              {
                "oneHazirlanan.userEmail": userEmail
              },
              {
                "oneSatir.originalSatirNo": originalSatirNo
              }
            ]
          }
        }
        bulkArray1 = [...bulkArray1, oneBulk]

        oneBulk = {
          updateOne: {
            filter: { _id: _dugumId },
            update: {
              $pull: {
                "hazirlananMetrajlar.$[oneHazirlanan].satirlar": null,
              }
            },
            arrayFilters: [
              {
                "oneHazirlanan.userEmail": userEmail
              }
            ]
          }
        }
        bulkArray1 = [...bulkArray1, oneBulk]

        oneBulk = {
          updateOne: {
            filter: { _id: _dugumId },
            update: {
              $push: {
                "hazirlananMetrajlar.$[oneHazirlanan].satirlar": { $each: satirlar },
              }
            },
            arrayFilters: [
              {
                "oneHazirlanan.userEmail": userEmail
              }
            ]
          }
        }
        bulkArray2 = [...bulkArray2, oneBulk]

      }
    })


    if (bulkArray1.length > 0) {
      await collection_Dugumler.bulkWrite(
        bulkArray1,
        { ordered: false }
      )
    }

    if (bulkArray2.length > 0) {
      await collection_Dugumler.bulkWrite(
        bulkArray2,
        { ordered: false }
      )
    }


  } catch (error) {
    throw new Error("MONGO // update_onaylananMetraj_revize // 1 " + error);
  }






  // try {

  //   let bulkArray = []

  //   onaylananMetraj_state.satirlar.filter(x => x.hasSelectedCopy && x.newSelected).map(oneSatir => {

  //     if (oneSatir) {

  //       let originalSatirNo = oneSatir.satirNo
  //       let satirlar = onaylananMetraj_state.satirlar.filter(x => x.originalSatirNo === originalSatirNo)
  //       let userEmail = oneSatir.userEmail

  //       oneBulk = {
  //         updateOne: {
  //           filter: { _id: _dugumId },
  //           update: {
  //             $set: {
  //               "hazirlananMetrajlar.$[oneHazirlanan].satirlar.$[oneSatir].hasSelectedCopy": true,
  //               "revizeMetrajlar.$[oneMetraj].satirlar": satirlar,
  //             },
  //             $unset: {
  //               "hazirlananMetrajlar.$[oneHazirlanan].satirlar.$[oneSatir].isSelected": ""
  //             }
  //           },
  //           arrayFilters: [
  //             {
  //               "oneHazirlanan.userEmail": userEmail
  //             },
  //             {
  //               "oneSatir.satirNo": originalSatirNo,
  //               "oneSatir.isSelected": true
  //             },
  //             {
  //               "oneMetraj.satirNo": originalSatirNo
  //             }
  //           ]
  //         }
  //       }

  //       bulkArray = [...bulkArray, oneBulk]

  //     }
  //   })


  //   if (bulkArray.length > 0) {
  //     await collection_Dugumler.bulkWrite(
  //       bulkArray,
  //       { ordered: false }
  //     )
  //   }

  // } catch (error) {
  //   throw new Error("MONGO // update_onaylananMetraj_revize // 1 " + error);
  // }








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
                                          $eq: [
                                            "$$oneMetraj.isAktif",
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
    throw new Error("MONGO // update_onaylananMetraj_revize // metraj güncelleme" + error);
  }



};
