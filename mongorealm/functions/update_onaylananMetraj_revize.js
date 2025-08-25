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


  let emails = []
  onaylananMetraj_state.satirlar.filter(x => x.hasSelectedCopy && x.newSelected).map(oneSatir => {
    if (!emails.find(x => x === oneSatir.userEmail)) (
      emails = [...emails, oneSatir.userEmail]
    )
  })


  let revizeMetrajlar = []
  let revizeMetrajSatirNolar = []


  try {

    let bulkArray = []
    emails.map(oneEmail => {

      let hasSelectedCopySatirNolar = onaylananMetraj_state.satirlar.filter(x => x.hasSelectedCopy && x.newSelected && x.userEmail === oneEmail).map(oneSatir => {

        if (oneSatir) {
          let oneMetraj = {
            satirNo: oneSatir.satirNo,
            satirlar: onaylananMetraj_state.satirlar.filter(x => x.originalSatirNo === oneSatir.satirNo)
          }
          revizeMetrajlar = [...revizeMetrajlar, oneMetraj]
          return oneSatir.satirNo
        }

      })

      if (hasSelectedCopySatirNolar.length > 0) {
        revizeMetrajSatirNolar = [...revizeMetrajSatirNolar, ...hasSelectedCopySatirNolar]
      }

      oneBulk = {
        updateOne: {
          filter: { _id: _dugumId },
          update: {
            $set: {
              "hazirlananMetrajlar.$[oneHazirlanan].satirlar.$[oneSatir].hasSelectedCopy": true
            },
            $unset: {
              "hazirlananMetrajlar.$[oneHazirlanan].satirlar.$[oneSatir].isSelected": ""
            }
          },
          arrayFilters: [
            {
              "oneHazirlanan.userEmail": oneEmail
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

    await collection_Dugumler.bulkWrite(
      bulkArray,
      { ordered: false }
    )

  } catch (error) {
    // throw new Error("MONGO // update_onaylananMetraj_revize // hazirlananMetraj güncelleme " + error);
  }



  if (revizeMetrajSatirNolar.length > 0) {
    try {

      await collection_Dugumler.updateOne({ _id: _dugumId },
        [
          {
            $set: {
              revizeMetrajlar: {
                $concatArrays: [
                  {
                    $filter: {
                      input: "$revizeMetrajlar",
                      as: "oneMetraj",
                      cond: { $not: { $in: ["$$oneMetraj.satirNo", revizeMetrajSatirNolar] } },
                    }
                  },
                  revizeMetrajlar
                ]
              }
            }
          }
        ]
      )

      let bulkArray = []
      oneBulk = {
        updateOne: {
          filter: { _id: _dugumId },
          update: {
            $set: {
              "revizeMetrajlar.$[oneMetraj].isAktif": true
            }
          },
          arrayFilters: [
            {
              "oneMetraj.satirNo": { $in: revizeMetrajSatirNolar }
            }
          ]
        }
      }
      bulkArray = [...bulkArray, oneBulk]

      await collection_Dugumler.bulkWrite(
        bulkArray,
        { ordered: false }
      )

    } catch (error) {
      throw new Error("MONGO // update_onaylananMetraj_revize // " + error.message);
    }

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
