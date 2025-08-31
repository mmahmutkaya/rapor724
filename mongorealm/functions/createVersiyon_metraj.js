exports = async function ({
  _projeId
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


  const currentTime = new Date();

  const collection_Projeler = context.services.get("mongodb-atlas").db("rapor724_v2").collection("projeler")
  const collection_Dugumler = context.services.get("mongodb-atlas").db("rapor724_v2").collection("dugumler")

  const proje = await collection_Projeler.findOne({ _id: _projeId })
  const { metrajVersiyonlar } = proje



  // aşağıda else kısmında değişebiliyor
  let versiyonNumber = 1
  if (!metrajVersiyonlar) {

    collection_Projeler.updateOne({ _id: _projeId }, [
      {
        $set: {
          metrajVersiyonlar: [{ versiyonNumber, createdAt: currentTime }]
        }
      }
    ])

  } else {

    metrajVersiyonlar.map(oneVersiyon => {
      if (oneVersiyon.versiyonNumber >= versiyonNumber) {
        versiyonNumber = oneVersiyon.versiyonNumber + 1
      }
    })

    collection_Projeler.updateOne({ _id: _projeId }, [
      {
        $set: {
          metrajVersiyonlar: {
            $concatArrays: [
              "$metrajVersiyonlar",
              [{ versiyonNumber, createdAt: currentTime }]
            ]
          }
        }
      }
    ])

  }




  // try {

  //   let bulkArray = []
  //   hazirlananMetrajlar_state.map(oneHazirlanan => {

  //     let oneHazirlanan_selected_satirNolar = oneHazirlanan.satirlar.filter(x => x.isSelected && x.newSelected).map(oneSatir => {
  //       return oneSatir.satirNo
  //     })

  //     oneBulk = {
  //       updateOne: {
  //         filter: { _id: _dugumId },
  //         update: {
  //           $set: {
  //             "hazirlananMetrajlar.$[oneHazirlanan].satirlar.$[oneSatir].isSelected": true,
  //             "hazirlananMetrajlar.$[oneHazirlanan].satirlar.$[oneSatir].hasSelectedCopy": false,
  //             "hazirlananMetrajlar.$[oneSatir].satirlar": true,
  //             "revizeMetrajlar.$[oneMetraj].isSelected": true,
  //             "revizeMetrajlar.$[oneMetraj].satirlar": [],
  //           },
  //           $unset: {
  //             "hazirlananMetrajlar.$[oneHazirlanan].satirlar.$[oneSatir].isReady": "",
  //             "hazirlananMetrajlar.$[oneHazirlanan].satirlar.$[oneSatir].isReadyUnSeen": "",
  //             "revizeMetrajlar.$[oneMetraj].isReady": "",
  //           }
  //         },
  //         arrayFilters: [
  //           {
  //             "oneHazirlanan.userEmail": oneHazirlanan.userEmail
  //           },
  //           {
  //             "oneSatir.satirNo": { $in: oneHazirlanan_selected_satirNolar },
  //             "oneSatir.isReady": true
  //           },
  //           {
  //             "oneMetraj.satirNo": { $in: oneHazirlanan_selected_satirNolar },
  //             "oneMetraj.isReady": true
  //           }
  //         ]
  //       }
  //     }
  //     bulkArray = [...bulkArray, oneBulk]

  //   })


  //   await collection_Dugumler.bulkWrite(
  //     bulkArray,
  //     { ordered: false }
  //   )


  // } catch (error) {
  //   throw new Error("MONGO // update_hazirlananMetraj_ready // " + error);
  // }






  // // metraj güncelleme
  // try {
  //   await collection_Dugumler.updateOne({ _id: _dugumId },
  //     [
  //       {
  //         $set: {
  //           "hazirlananMetrajlar": {
  //             $map: {
  //               input: "$hazirlananMetrajlar",
  //               as: "oneHazirlanan",
  //               in: {
  //                 "$mergeObjects": [
  //                   "$$oneHazirlanan",
  //                   {
  //                     metrajOnaylanan: {
  //                       $sum: {
  //                         $concatArrays: [
  //                           {
  //                             "$map": {
  //                               "input": "$$oneHazirlanan.satirlar",
  //                               "as": "oneSatir",
  //                               "in": {
  //                                 "$cond": {
  //                                   "if": { $and: [{ $eq: ["$$oneSatir.isSelected", true] }, { $ne: ["$$oneSatir.hasSelectedCopy", true] }] },
  //                                   "then": "$$oneSatir.metraj",
  //                                   "else": 0
  //                                 }
  //                               }
  //                             }
  //                           },
  //                           {
  //                             "$concatArrays": [
  //                               {
  //                                 "$map": {
  //                                   "input": "$revizeMetrajlar",
  //                                   "as": "oneMetraj",
  //                                   "in": {
  //                                     "$cond": {
  //                                       "if": {
  //                                         $eq: [
  //                                           "$$oneMetraj.isSelected",
  //                                           true
  //                                         ]
  //                                       },
  //                                       "then": {
  //                                         "$reduce": {
  //                                           "input": "$$oneMetraj.satirlar",
  //                                           "initialValue": 0,
  //                                           "in": {
  //                                             $add: [
  //                                               "$$value",
  //                                               {
  //                                                 "$cond": {
  //                                                   "if": { $and: [{ $ne: ["$$this.metraj", ""] }, { $eq: ["$$this.userEmail", "$$oneHazirlanan.userEmail"] }] },
  //                                                   "then": {
  //                                                     "$toDouble": "$$this.metraj"
  //                                                   },
  //                                                   "else": 0
  //                                                 }
  //                                               }
  //                                             ]
  //                                           }
  //                                         }
  //                                       },
  //                                       "else": 0
  //                                     }
  //                                   }
  //                                 }
  //                               }
  //                             ]
  //                           }
  //                         ]
  //                       }
  //                     }
  //                   }
  //                 ]
  //               }
  //             }
  //           }
  //         }
  //       },
  //       {
  //         $set: {
  //           "metrajOnaylanan": {
  //             $sum: {
  //               "$map": {
  //                 "input": "$hazirlananMetrajlar",
  //                 "as": "oneHazirlanan",
  //                 "in": "$$oneHazirlanan.metrajOnaylanan"
  //               }
  //             }
  //           }
  //         }
  //       }
  //     ]
  //   )

  // } catch (error) {
  //   throw new Error("MONGO // update_hazirlananMetrajlar_selected // metraj güncelleme" + error);
  // }



};
