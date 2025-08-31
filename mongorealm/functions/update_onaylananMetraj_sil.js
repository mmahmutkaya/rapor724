
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
    onaylananMetraj_state.satirlar.filter(x => x.isSelected && x.newSelected).map(oneSatir => {

      let userEmail = oneSatir.userEmail
      let originalSatirNo = oneSatir.satirNo

      oneBulk = {
        updateOne: {
          filter: { _id: _dugumId },
          update: {
            $set: {
              "hazirlananMetrajlar.$[oneHazirlanan].satirlar.$[oneSatir].isReady": true,
              "revizeMetrajlar.$[oneMetraj].isReady": true,
              "revizeMetrajlar.$[oneMetraj].satirlar": [],
            },
            $unset: {
              "hazirlananMetrajlar.$[oneHazirlanan].satirlar.$[oneSatir].hasSelectedCopy": "",
              "hazirlananMetrajlar.$[oneHazirlanan].satirlar.$[oneSatir].versiyonlar": "",
              "hazirlananMetrajlar.$[oneHazirlanan].satirlar.$[oneSatir].isSelected": "",
              "revizeMetrajlar.$[oneMetraj].isSelected": "",
            }
          },
          arrayFilters: [
            {
              "oneHazirlanan.userEmail": userEmail
            },
            {
              "oneSatir.satirNo": originalSatirNo,
              "oneSatir.isSelected": true
            },
            {
              "oneMetraj.satirNo": originalSatirNo,
              "oneMetraj.isSelected": true
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


  try {

    let bulkArray = []
    let oneBulk
    onaylananMetraj_state.satirlar.filter(x => x.hasSelectedCopy && !x.newSelected).map(oneSatir => {

      let originalSatirNo = oneSatir.satirNo
      let userEmail = oneSatir.userEmail
      let silinecekSatir = onaylananMetraj_state.satirlar.find(x => x.originalSatirNo === originalSatirNo && x.newSelected)
      let silinmeyecekSatirlar = onaylananMetraj_state.satirlar.filter(x => x.originalSatirNo === originalSatirNo && !x.newSelected)

      if (silinecekSatir) {

        // revizelerin bazısı siliniyorsa
        if (silinmeyecekSatirlar.length > 0) {

          oneBulk = {
            updateOne: {
              filter: { _id: _dugumId },
              update: {
                $set: {
                  "revizeMetrajlar.$[oneMetraj].satirlar": silinmeyecekSatirlar,
                }
              },
              arrayFilters: [
                {
                  "oneMetraj.satirNo": originalSatirNo,
                  "oneMetraj.isSelected": true
                }
              ]
            }
          }
          bulkArray = [...bulkArray, oneBulk]


          // revizelerin hepsi siliniyorsa
        } else {
          oneBulk = {
            updateOne: {
              filter: { _id: _dugumId },
              update: {
                $set: {
                  "hazirlananMetrajlar.$[oneHazirlanan].satirlar.$[oneSatir].hasSelectedCopy": false,
                  "revizeMetrajlar.$[oneMetraj].satirlar": [],
                }
              },
              arrayFilters: [
                {
                  "oneHazirlanan.userEmail": userEmail
                },
                {
                  "oneSatir.satirNo": originalSatirNo,
                  "oneSatir.isSelected": true
                },
                {
                  "oneMetraj.satirNo": originalSatirNo,
                  "oneMetraj.isSelected": true
                }
              ]
            }
          }
          bulkArray = [...bulkArray, oneBulk]
        }
      }

    })

    if (bulkArray.length > 0) {
      await collection_Dugumler.bulkWrite(
        bulkArray,
        { ordered: false }
      )
    }


  } catch (error) {
    throw new Error("MONGO // update_onaylananMetraj_sil // bazı revizelerin silinmesi ");
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
                                          $eq: [
                                            "$$oneMetraj.isSelected",
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
                                                    "if": { $and: [{ $ne: ["$$this.metraj", ""] }, { $eq: ["$$this.userEmail", "$$oneHazirlanan.userEmail"] }] },
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
