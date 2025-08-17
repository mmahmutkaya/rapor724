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


  if (!_projeId) throw new Error("MONGO // getPozlar_metraj // -- sorguya gönderilen --projeId-- türü doğru değil, lütfen Rapor7/24 ile irtibata geçiniz. ")

  const proje = await collection_Projeler.findOne({ _id: _projeId })


  try {

    let pozlar = await collection_Pozlar.aggregate([
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
          onaylananMetraj: 1,
          hazirlananMetrajlar: {
            $map: {
              input: "$hazirlananMetrajlar",  
              as: "oneHazirlanan",
              in: {
                userEmail: "$$oneHazirlanan.userEmail",
                metraj: "$$oneHazirlanan.readyMetraj",
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
                            {
                              $eq: [
                                "$$this.isSelected",
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
                hasSelectedFull: {
                  "$reduce": {
                    "input": "$$oneHazirlanan.satirlar",
                    "initialValue": true,
                    "in": {
                      "$cond": {
                        "if": {
                          "$and": [
                            {
                              $eq: [
                                "$$value",
                                true
                              ]
                            },
                            {
                              "$and": [
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
                        "then": false,
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
          onaylananMetraj: { $sum: "$onaylananMetraj" }
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

        onePoz.onaylananMetraj = onePoz2.onaylananMetraj
        // return onePoz2.hazirlanan
        onePoz.hazirlananMetrajlar = metrajYapabilenler.map(oneYapabilen => {

          let metraj = 0
          let hasSelected_Array = []
          let hasSelectedFull_Array = []
          let hasMetraj

          onePoz2.hazirlananMetrajlar.map(oneArray => {

            let oneHazirlanan = oneArray.find(x => x.userEmail === oneYapabilen.userEmail)

            if (oneHazirlanan) {
              hasMetraj = true
              let metraj2 = oneHazirlanan?.metraj ? Number(oneHazirlanan?.metraj) : 0
              metraj += metraj2
              hasSelected_Array = [...hasSelected_Array, oneHazirlanan?.hasSelected]
              hasSelectedFull_Array = [...hasSelectedFull_Array, oneHazirlanan?.hasSelectedFull]
            }

          })

          let hasSelected = hasSelected_Array.find(x => x === true)
          let hasSelectedFull = hasSelectedFull_Array.length > 0 && hasSelectedFull_Array.length === hasSelectedFull_Array.filter(x => x === true).length ? true : false

          return ({
            userEmail: oneYapabilen.userEmail,
            metraj,
            hasSelected,
            hasSelectedFull,
            hasMetraj
          })

        })

      }

      return onePoz

    })

    return pozlar


  } catch (error) {
    throw new Error({ hatayeri: "MONGO // getPozlar_metraj // ", error });
  }


};