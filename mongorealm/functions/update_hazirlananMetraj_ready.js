import { result } from "lodash";

exports = async function ({
  _dugumId,
  hazirlananMetraj_state
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

  if (!hazirlananMetraj_state) {
    throw new Error("MONGO // update_hazirlananMetrajlar // 'hazirlananMetraj_state' verisi db sorgusuna gelmedi");
  }


  const currentTime = new Date();

  // const collection_HazirlananMetrajlar = context.services.get("mongodb-atlas").db("rapor724_v2").collection("hazirlananMetrajlar")
  // const collection_OnaylananMetrajlar = context.services.get("mongodb-atlas").db("rapor724_v2").collection("onaylananMetrajlar")
  const collection_Dugumler = context.services.get("mongodb-atlas").db("rapor724_v2").collection("dugumler")



  try {

    let oneHazirlanan_ready_satirNolar = hazirlananMetraj_state.satirlar.filter(x => x.isReady && x.newSelected).map(oneSatir => {
      return oneSatir.satirNo
    })

    await collection_Dugumler.updateOne(
      { _id: _dugumId },
      {
        $set: {
          "hazirlananMetrajlar.$[oneHazirlanan].satirlar.$[oneSatir].isReady": true,
          "hazirlananMetrajlar.$[oneHazirlanan].satirlar.$[oneSatir].isReadyUnSeen": true,
          "revizeMetrajlar.$[oneMetraj].isReady": true,
        },
        $unset: {
          "hazirlananMetrajlar.$[oneHazirlanan].satirlar.$[oneSatir].isPreparing": "",
          "hazirlananMetrajlar.revizeMetrajlar.$[oneSatir].isPreparing": "",
        }
      },
      {
        arrayFilters: [
          {
            "oneHazirlanan.userEmail": userEmail
          },
          {
            "oneSatir.satirNo": { $in: oneHazirlanan_ready_satirNolar },
            "oneSatir.isPreparing": true 
          },
          {
            "oneMetraj": { $in: oneHazirlanan_ready_satirNolar },
            "oneMetraj.isPreparing": true 
          }
        ]
      }
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
                      metrajPreparing: {
                        $sum: {
                          "$map": {
                            "input": "$$oneHazirlanan.satirlar",
                            "as": "oneSatir",
                            "in": {
                              "$cond": {
                                "if": {
                                  $eq: [
                                    "$$oneSatir.isPreparing",
                                    true
                                  ]
                                },
                                "then": "$$oneSatir.metraj",
                                "else": 0
                              }
                            }
                          }
                        }
                      }
                    },
                    {
                      metrajReady: {
                        $sum: {
                          "$map": {
                            "input": "$$oneHazirlanan.satirlar",
                            "as": "oneSatir",
                            "in": {
                              "$cond": {
                                "if": {
                                  $or: [
                                    {$eq:["$$oneSatir.isReady",true]},
                                    {$eq:["$$oneSatir.isSelected",true]},
                                    {$eq:["$$oneSatir.hasSelectedCopy",true]}
                                  ]
                                },
                                "then": "$$oneSatir.metraj",
                                "else": 0
                              }
                            }
                          }
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
            "metrajPreparing": {
              $sum: {
                "$map": {
                  "input": "$hazirlananMetrajlar",
                  "as": "oneHazirlanan",
                  "in": "$$oneHazirlanan.metrajPreparing"
                }
              }
            },
            "metrajReady": {
              $sum: {
                "$map": {
                  "input": "$hazirlananMetrajlar",
                  "as": "oneHazirlanan",
                  "in": "$$oneHazirlanan.metrajReady"
                }
              }
            }
          }
        },

      ]
    )

  } catch (error) {
    throw new Error("MONGO // update_hazirlananMetrajlar_unReady // metraj güncelleme" + error);
  }




  // try {F


  //   let bulkArray = []
  //   hazirlananMetrajlar_state.map(oneHazirlanan => {

  //     let azalacakMetraj = 0
  //     let oneHazirlanan_ready_satirNolar = oneHazirlanan.satirlar.filter(x => !x.isReady).map(oneSatir => {
  //       azalacakMetraj += Number(oneSatir.metraj)
  //       return oneSatir.satirNo
  //     })
  //     azalacakMetraj = azalacakMetraj * -1

  //     oneBulk = {
  //       updateOne: {
  //         filter: { _id: _dugumId },
  //         update: { $set: { "hazirlananMetrajlar.$[oneHazirlanan].satirlar.$[oneSatir].isReady": false }, $inc: { "hazirlananMetrajlar.$[oneHazirlanan].readyMetraj": azalacakMetraj } },
  //         arrayFilters: [{ "oneHazirlanan.userEmail": oneHazirlanan.userEmail }, { "oneSatir.satirNo": { $in: oneHazirlanan_ready_satirNolar } }]
  //       }
  //     }
  //     bulkArray = [...bulkArray, oneBulk]

  //   })

  //   const result = await collection_Dugumler.bulkWrite(
  //     bulkArray,
  //     { ordered: false }
  //   )

  //   return result


  // } catch (error) {
  //   throw new Error("MONGO // update_hazirlananMetraj_ready // " + error);
  // }






};
