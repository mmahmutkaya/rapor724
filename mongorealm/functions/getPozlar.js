exports = async function ({
  _projeId
}) {


  const user = context.user
  const _userId = new BSON.ObjectId(user.id)
  const userEmail = context.user.data.email
  const mailTeyit = user.custom_data.mailTeyit
  if (!mailTeyit) throw new Error("MONGO // collection_firmaPozlar // Öncelikle üyeliğinize ait mail adresinin size ait olduğunu doğrulamalısınız, tekrar giriş yapmayı deneyiniz veya bizimle iletişime geçiniz.")


  const collection_Pozlar = context.services.get("mongodb-atlas").db("rapor724_v2").collection("pozlar")
  const collection_Dugumler = context.services.get("mongodb-atlas").db("rapor724_v2").collection("dugumler")
  const collection_Projeler = context.services.get("mongodb-atlas").db("rapor724_v2").collection("projeler")


  if (!_projeId) throw new Error("MONGO // getPozlar // -- sorguya gönderilen --projeId-- türü doğru değil, lütfen Rapor7/24 ile irtibata geçiniz. ")

  const proje = await collection_Projeler.findOne({ _id: _projeId })



  let pozlar

  try {

    pozlar = await collection_Pozlar.aggregate([
      {
        $match: {
          _projeId,
          isDeleted: false
        }
      },
      {
        $project: {
          _projeId: 1,
          _wbsId: 1,
          pozNo: 1,
          pozName: 1,
          pozBirimId: 1,
          pozMetrajTipId: 1
        }
      }
    ]).toArray()


    const pozlar2 = await collection_Dugumler.aggregate([
      {
        $match: {
          _projeId,
          openMetraj: true
        }
      },
      {
        $project: {
          _pozId: 1,
          _mahalId: 1,
          openMetraj: 1,
          metrajPreparing: 1,
          metrajReady: 1,
          metrajOnaylanan: 1,
          hazirlananMetrajlar: {
            $map: {
              input: "$hazirlananMetrajlar",
              as: "oneHazirlanan",
              in: {
                userEmail: "$$oneHazirlanan.userEmail",
                metrajPreparing: "$$oneHazirlanan.metrajPreparing",
                metrajReady: "$$oneHazirlanan.metrajReady",
                metrajOnaylanan: "$$oneHazirlanan.metrajOnaylanan",
                hasReadyUnSeen: {
                  "$reduce": {
                    "input": "$$oneHazirlanan.satirlar",
                    "initialValue": false,
                    "in": {
                      "$cond": {
                        "if": {
                          "$and": [
                            {
                              $eq: [
                                "$$value",
                                false
                              ]
                            },
                            {
                              $eq: [
                                "$$this.isReadyUnSeen",
                                true
                              ]
                            }
                          ]
                        },
                        "then": true,
                        "else": "$$value"
                      }
                    }
                  }
                },
                hasReady: {
                  "$reduce": {
                    "input": "$$oneHazirlanan.satirlar",
                    "initialValue": false,
                    "in": {
                      "$cond": {
                        "if": {
                          "$and": [
                            {
                              $eq: [
                                "$$value",
                                false
                              ]
                            },
                            {
                              $eq: [
                                "$$this.isReady",
                                true
                              ]
                            }
                          ]
                        },
                        "then": true,
                        "else": "$$value"
                      }
                    }
                  }
                },
                hasSelected: {
                  "$reduce": {
                    "input": "$$oneHazirlanan.satirlar",
                    "initialValue": false,
                    "in": {
                      "$cond": {
                        "if": {
                          "$and": [
                            {
                              $eq: [
                                "$$value",
                                false
                              ]
                            },
                            { $or: [ { $eq: [ "$$this.isSelected", true] }, { $eq: [ "$$this.hasSelectedCopy", true] }] }
                          ]
                        },
                        "then": true,
                        "else": "$$value"
                      }
                    }
                  }
                },
                hasUnSelected: {
                  "$reduce": {
                    "input": "$$oneHazirlanan.satirlar",
                    "initialValue": false,
                    "in": {
                      "$cond": {
                        "if": {
                          "$and": [
                            {
                              $eq: [
                                "$$value",
                                false
                              ]
                            },
                            {
                              $and: [
                                {
                                  $eq: [
                                    "$$this.isReady",
                                    true
                                  ]
                                },
                                {
                                  $ne: [
                                    "$$this.isSelected",
                                    true
                                  ]
                                }
                              ]
                            }
                          ]
                        },
                        "then": true,
                        "else": "$$value"
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      {
        $group: {
          _id: "$_pozId",
          hazirlananMetrajlar: { $push: "$hazirlananMetrajlar" },
          metrajPreparing: { $sum: "$metrajPreparing" },
          metrajReady: { $sum: "$metrajReady" },
          metrajOnaylanan: { $sum: "$metrajOnaylanan" }
        }
      }
    ]).toArray()



    let { metrajYapabilenler } = proje.yetki


    pozlar = pozlar.map(onePoz => {

      const onePoz2 = pozlar2.find(onePoz2 => onePoz2._id.toString() === onePoz._id.toString())

      if (!onePoz2) {

        onePoz.hasDugum = false

      } else {

        onePoz.hasDugum = true

        onePoz.metrajOnaylanan = onePoz2.metrajOnaylanan
        // return onePoz2.hazirlanan
        onePoz.hazirlananMetrajlar = metrajYapabilenler.map(oneYapabilen => {

          let metrajPreparing = 0
          let metrajReady = 0
          let metrajOnaylanan = 0

          let hasReadyUnSeen_Array = []
          let hasReady_Array = []
          let hasSelected_Array = []
          let hasUnSelected_Array = []


          onePoz2.hazirlananMetrajlar.map(oneArray => {

            let oneHazirlanan = oneArray.find(x => x.userEmail === oneYapabilen.userEmail)

            // if (oneHazirlanan?.satirlar?.filter(x => x.isReady).length > 0) {
            if (oneHazirlanan) {

              let metrajPreparing2 = oneHazirlanan?.metrajPreparing ? Number(oneHazirlanan?.metrajPreparing) : 0
              let metrajReady2 = oneHazirlanan?.metrajReady ? Number(oneHazirlanan?.metrajReady) : 0
              let metrajOnaylanan2 = oneHazirlanan?.metrajOnaylanan ? Number(oneHazirlanan?.metrajOnaylanan) : 0

              metrajPreparing += metrajPreparing2
              metrajReady += metrajReady2
              metrajOnaylanan += metrajOnaylanan2

              hasReadyUnSeen_Array = [...hasReadyUnSeen_Array, oneHazirlanan?.hasReadyUnSeen]
              hasReady_Array = [...hasReady_Array, oneHazirlanan?.hasReady]
              hasSelected_Array = [...hasSelected_Array, oneHazirlanan?.hasSelected]
              hasUnSelected_Array = [...hasUnSelected_Array, oneHazirlanan?.hasUnSelected]
            }

          })

          let hasReadyUnSeen = hasReadyUnSeen_Array.find(x => x === true)
          let hasReady = hasReady_Array.find(x => x === true)
          let hasSelected = hasSelected_Array.find(x => x === true)
          let hasUnSelected = hasUnSelected_Array.find(x => x === true)

          return ({
            userEmail: oneYapabilen.userEmail,
            metrajPreparing,
            metrajReady,
            metrajOnaylanan,
            hasReadyUnSeen,
            hasReady,
            hasSelected,
            hasUnSelected
          })

        })

      }

      return onePoz

    })


  } catch (error) {
    throw new Error({ hatayeri: "MONGO // getPozlar // ", error });
  }



  // let wbsMetrajlar
  // try {

  //   wbsMetrajlar = proje?.wbs.map(oneWbs => {

  //     let pozlar_byWbs = pozlar.filter(x => x._wbsId.toString() === oneWbs._id.toString())
  //     let metrajPreparing = 0
  //     let metrajReady = 0
  //     let metrajOnaylanan = 0
  //     let hazirlananMetrajlar = proje.yetki.metrajYapabilenler.map(oneYapabilen => {
  //       return { userEmail: oneYapabilen.userEmail, metrajPreparing: 0, metrajReady: 0, metrajOnaylanan: 0 }
  //     })

  //     pozlar_byWbs.map(onePoz => {
  //       // let dugum = dugumler_byPoz.find(x => x._mahalId.toString() === onePoz._id.toString())
  //       metrajPreparing += onePoz?.metrajPreparing ? onePoz.metrajPreparing : 0
  //       metrajReady += onePoz?.metrajReady ? onePoz.metrajReady : 0
  //       metrajOnaylanan += onePoz?.metrajOnaylanan ? onePoz.metrajOnaylanan : 0

  //       hazirlananMetrajlar = hazirlananMetrajlar?.map(oneHazirlanan => {
  //         let hazirlananMetraj_user = onePoz?.hazirlananMetrajlar?.find(x => x.userEmail === oneHazirlanan.userEmail)
  //         oneHazirlanan.metrajPreparing += hazirlananMetraj_user?.metrajPreparing ? hazirlananMetraj_user.metrajPreparing : 0
  //         oneHazirlanan.metrajReady += hazirlananMetraj_user?.metrajReady ? hazirlananMetraj_user.metrajReady : 0
  //         oneHazirlanan.metrajOnaylanan += hazirlananMetraj_user?.metrajOnaylanan ? hazirlananMetraj_user.metrajOnaylanan : 0
  //         return oneHazirlanan
  //       })

  //     })
  //     return { _id: oneWbs._id, metrajPreparing, metrajReady, metrajOnaylanan, hazirlananMetrajlar }
  //   })


  // } catch (error) {
  //   throw new Error({ hatayeri: "MONGO // getPozlar // wbsMetrajlar", error });
  // }



  let anySelectable
  try {

    anySelectable
    pozlar.map(onePoz => {
      onePoz?.hazirlananMetrajlar?.map(oneHazirlanan => {
        if (oneHazirlanan) {
          if (oneHazirlanan.hasUnSelected) {
            anySelectable = true
          }
        }
      })
    })

  } catch (error) {
    throw new Error({ hatayeri: "MONGO // getPozlar // anySelectable", error });
  }



  return { pozlar, anySelectable }



};