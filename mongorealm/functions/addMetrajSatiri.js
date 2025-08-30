exports = async function ({
  _dugumId,
}) {

  const user = context.user;
  const _userId = new BSON.ObjectId(user.id)
  const userEmail = context.user.data.email
  const userIsim = user.custom_data.isim
  const userSoyisim = user.custom_data.soyisim
  const userCode = user.custom_data.userCode

  const mailTeyit = user.custom_data.mailTeyit;
  if (!mailTeyit) {
    throw new Error("MONGO // getHazirlananMetraj // Öncelikle üyeliğinize ait mail adresinin size ait olduğunu doğrulamalısınız, tekrar giriş yapmayı deneyiniz veya bizimle iletişime geçiniz.");
  }

  if (!_dugumId) {
    throw new Error("MONGO // getHazirlananMetraj // '_dugumId' verisi db sorgusuna gelmedi");
  }

  const collection_Dugumler = context.services.get("mongodb-atlas").db("rapor724_v2").collection("dugumler")


  const result = await collection_Dugumler.aggregate([
    { $match: { _id: _dugumId } },
    {
      $project: {
        hazirlananMetrajlar_filtered: {
          $filter: {
            input: "$hazirlananMetrajlar",
            as: "hazirlananMetraj",
            cond: { $eq: ["$$hazirlananMetraj.userEmail", userEmail] }
          }
        }
      }
    },
    { $limit: 1 }
  ]).toArray()


  let { hazirlananMetrajlar_filtered } = result[0]
  hazirlananMetraj = hazirlananMetrajlar_filtered[0]

  let siraNo = 1
  hazirlananMetraj.satirlar.map(oneSatir => {
    let satirNo = oneSatir.satirNo
    let siraNo2 = satirNo.substring(satirNo.indexOf("-") + 1, satirNo.length)
    if (Number(siraNo2) >= siraNo) {
      siraNo = siraNo2 + 1
    }
  })

  return siraNo



  let satirlar = [
    { satirNo: userCode + "-" + siraNo, aciklama: "", carpan1: "", carpan2: "", carpan3: "", carpan4: "", carpan5: "", metraj: "", isPreparing: true },
    { satirNo: userCode + "-" + (siraNo + 1), aciklama: "", carpan1: "", carpan2: "", carpan3: "", carpan4: "", carpan5: "", metraj: "", isPreparing: true },
    { satirNo: userCode + "-" + (siraNo + 2), aciklama: "", carpan1: "", carpan2: "", carpan3: "", carpan4: "", carpan5: "", metraj: "", isPreparing: true }
  ]

  let revizeMetrajlar = [
    { satirNo: userCode + "-" + siraNo, isPreparing: true, satirlar: [] },
    { satirNo: userCode + "-" + (siraNo + 1), isPreparing: true, satirlar: [] },
    { satirNo: userCode + "-" + (siraNo + 2), isPreparing: true, satirlar: [] }
  ]


  await collection_Dugumler.updateOne({ _id: _dugumId },
    [
      {
        $set: {
          hazirlananMetrajlar: {
            $map: {
              input: "$hazirlananMetrajlar",
              as: "oneHazirlanan",
              in: {
                $cond: {
                  if: { $eq: ["$$oneHazirlanan.userEmail", userEmail] },
                  else: "$$oneHazirlanan",
                  then: {
                    $mergeObjects: [
                      "$$oneHazirlanan",
                      {
                        satirlar: {
                          $concatArrays: [
                            "$$oneHazirlanan.satirlar",
                            satirlar
                          ]
                        }
                      }
                    ]
                  }
                }
              }
            }
          },
          revizeMetrajlar: {
            $concatArrays: [
              "$revizeMetrajlar",
              revizeMetrajlar
            ]
          }
        }
      }
    ]
  )


};
