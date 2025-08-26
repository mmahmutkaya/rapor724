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


  try {

    let bulkArray = []
    let oneBulk
    onaylananMetraj_state.satirlar.filter(x => x.hasSelectedCopy && x.newSelected).map(oneSatir => {

      let userEmail = oneSatir.userEmail
      let originalSatirNo = oneSatir.satirNo

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
              "oneHazirlanan.userEmail": userEmail
            },
            {
              "oneSatir.satirNo": originalSatirNo,
              "oneSatir.hasSelectedCopy": true
            }
          ]
        }
      }
      bulkArray = [...bulkArray, oneBulk]

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
      bulkArray = [...bulkArray, oneBulk]

    })

    if (bulkArray.length > 0) {
      await collection_Dugumler.bulkWrite(
        bulkArray,
        { ordered: false }
      )
    }


  } catch (error) {
    throw new Error("MONGO // update_onaylananMetraj_sil // ana satır ve revizelerinin silinmesi ");
  }




  // let emails = []
  // onaylananMetraj_state.satirlar.filter(x => x.newSelected).map(oneSatir => {
  //   if (!emails.find(x => x === oneSatir.userEmail)) (
  //     emails = [...emails, oneSatir.userEmail]
  //   )
  // })

  // let revizeMetrajSatirNolar_silinecek = []

  // try {

  //   let bulkArray = []
  //   emails.map(oneEmail => {

  //     let hasSelectedCopySatirNolar_silinecek = onaylananMetraj_state.satirlar.filter(x => x.hasSelectedCopy && x.newSelected && x.userEmail === oneEmail).map(oneSatir => {
  //       return oneSatir.satirNo
  //     })

  //     if (hasSelectedCopySatirNolar_silinecek.length > 0) {

  //       revizeMetrajSatirNolar_silinecek = [...revizeMetrajSatirNolar_silinecek, ...hasSelectedCopySatirNolar_silinecek]

  //       oneBulk = {
  //         updateOne: {
  //           filter: { _id: _dugumId },
  //           update: {
  //             $set: {
  //               "hazirlananMetrajlar.$[oneHazirlanan].satirlar.$[oneSatir].isReady": true,
  //               "revizeMetrajlar.$[oneMetraj].isAktif": false,
  //               "revizeMetrajlar.$[oneMetraj].satirlar": [],
  //             },
  //             $unset: {
  //               "hazirlananMetrajlar.$[oneHazirlanan].satirlar.$[oneSatir].hasSelectedCopy": ""
  //             }
  //           },
  //           arrayFilters: [
  //             {
  //               "oneHazirlanan.userEmail": oneEmail
  //             },
  //             {
  //               "oneSatir.satirNo": { $in: hasSelectedCopySatirNolar_silinecek },
  //               "oneSatir.hasSelectedCopy": true
  //             },
  //             {
  //               "oneMetraj.satirNo": { $in: hasSelectedCopySatirNolar_silinecek }
  //             }
  //           ]
  //         }
  //       }
  //       bulkArray = [...bulkArray, oneBulk]
  //     }


  //     let isSelectedSatirNolar_silinecek = onaylananMetraj_state.satirlar.filter(x => x.isSelected && x.newSelected && x.userEmail === oneEmail).map(oneSatir => {
  //       return oneSatir.satirNo
  //     })

  //     if (isSelectedSatirNolar_silinecek.length > 0) {

  //       oneBulk = {
  //         updateOne: {
  //           filter: { _id: _dugumId },
  //           update: {
  //             $set: {
  //               "hazirlananMetrajlar.$[oneHazirlanan].satirlar.$[oneSatir].isReady": true,
  //               "revizeMetrajlar.$[oneMetraj].isAktif": false,
  //               "revizeMetrajlar.$[oneMetraj].satirlar": [],
  //             },
  //             $unset: {
  //               "hazirlananMetrajlar.$[oneHazirlanan].satirlar.$[oneSatir].hasSelectedCopy": "",
  //               "hazirlananMetrajlar.$[oneHazirlanan].satirlar.$[oneSatir].isSelected": ""
  //             }
  //           },
  //           arrayFilters: [
  //             {
  //               "oneHazirlanan.userEmail": oneEmail
  //             },
  //             {
  //               "oneSatir.satirNo": { $in: isSelectedSatirNolar_silinecek },
  //               "oneSatir.isSelected": true
  //             },
  //             {
  //               "oneMetraj.satirNo": { $in: isSelectedSatirNolar_silinecek }
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
  //   throw new Error({ hatayeri: "MONGO // update_onaylananMetraj_sil // ilk aşama //", error });
  // }



  // try {

  //   let bulkArray = []

  //   // yukarıda silinecekleri ele aldık, slinmeyecek olanları bir ele alalım, belki içinde silinecek revize satırlar vardır
  //   onaylananMetraj_state.satirlar.filter(x => x.hasSelectedCopy && !x.newSelected).map(oneSatir => {

  //     let originalSatirNo = oneSatir.satirNo
  //     // revize satırlarında silinecek olan var mı bakalım
  //     let silinecekBirSatir = onaylananMetraj_state.satirlar.find(x => x.originalSatirNo === originalSatirNo && x.newSelected)

  //     if (silinecekBirSatir) {

  //       let userEmail = silinecekBirSatir.userEmail

  //       let silinmeyecekSatirlar = onaylananMetraj_state.satirlar.filter(x => x.originalSatirNo === originalSatirNo && !x.newSelected)

  //       // revize satırların bir kısmı duruyorsa
  //       if (silinmeyecekSatirlar.length > 0) {

  //         let siraNo = 1
  //         silinmeyecekSatirlar = silinmeyecekSatirlar.map(oneSatir => {
  //           oneSatir.satirNo = originalSatirNo + "." + siraNo
  //           siraNo += 1
  //           return oneSatir
  //         })


  //         oneBulk = {
  //           updateOne: {
  //             filter: { _id: _dugumId },
  //             update: {
  //               $set: {
  //                 "revizeMetrajlar.$[oneMetraj].satirlar": silinmeyecekSatirlar,
  //                 "revizeMetrajlar.$[oneMetraj].satirNo": originalSatirNo,
  //               }
  //             },
  //             arrayFilters: [
  //               {
  //                 "oneMetraj.satirNo": originalSatirNo,
  //               }
  //             ]
  //           }
  //         }
  //         bulkArray = [...bulkArray, oneBulk]

  //         // revize satırların tamamı silinecek, ana satır devreye alınacaksa
  //       } else {

  //         oneBulk = {
  //           updateOne: {
  //             filter: { _id: _dugumId },
  //             update: {
  //               $set: {
  //                 "hazirlananMetrajlar.$[oneHazirlanan].satirlar.$[oneSatir].isSelected": true,
  //                 "hazirlananMetrajlar.$[oneHazirlanan].satirlar.$[oneSatir].hasSelectedCopy": false,
  //                 "revizeMetrajlar.$[oneMetraj].satirlar": []
  //               }
  //             },
  //             arrayFilters: [
  //               {
  //                 "oneHazirlanan.userEmail": userEmail
  //               },
  //               {
  //                 "oneSatir.satirNo": originalSatirNo
  //               },
  //               {
  //                 "oneMetraj.satirNo": originalSatirNo
  //               }
  //             ]
  //           }
  //         }
  //         bulkArray = [...bulkArray, oneBulk]

  //       }

  //     }


  //   })


  //   if (bulkArray.length > 0) {
  //     await collection_Dugumler.bulkWrite(
  //       bulkArray,
  //       { ordered: false }
  //     )
  //   }

  // } catch (error) {
  //   throw new Error({ hatayeri: "MONGO // update_onaylananMetraj_sil // ikinci aşama //", error });
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
    throw new Error("MONGO // update_onaylananMetraj_revize // metraj güncelleme" + error);
  }







};
