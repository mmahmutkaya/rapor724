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

  let proje = await collection_Projeler.findOne({ _id: _projeId })
  const { metrajVersiyonlar } = proje



  // aşağıda else kısmında değişebiliyor
  let versiyonNumber = 1

  try {


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


  } catch (error) {
    throw new Error("MONGO // createVersiyon_metraj // 1 " + error);
  }


  
  try {

    collection_Dugumler.updateMany({ _projeId }, [
      {
        $set: {
          hazirlananMetrajlar: {
            $map: {
              input: "$hazirlananMetrajlar",
              as: "oneHazirlanan",
              in: {
                $mergeObjects: [
                  "$$oneHazirlanan",
                  {
                    satirlar: {
                      $map: {
                        input: "$$oneHazirlanan.satirlar",
                        as: "oneSatir",
                        in: {
                          $cond: {
                            if: { $eq: ["$$oneSatir.versiyon", 0] },
                            else: "$$oneSatir",
                            then: {
                              $mergeObjects: [
                                "$$oneSatir",
                                { versiyon: versiyonNumber }
                              ]
                            }
                          }
                        }
                      }
                    }
                  }
                ]
              }
            }
          },
          revizeMetrajlar: {
            $map: {
              input: "$revizeMetrajlar",
              as: "oneMetraj",
              in: {
                $mergeObjects: [
                  "$$oneMetraj",
                  {
                    satirlar: {
                      $map: {
                        input: "$$oneMetraj.satirlar",
                        as: "oneSatir",
                        in: {
                          $cond: {
                            if: { $eq: ["$$oneSatir.versiyon", 0] },
                            else: "$$oneSatir",
                            then: {
                              $mergeObjects: [
                                "$$oneSatir",
                                { versiyon: versiyonNumber }
                              ]
                            }
                          }
                        }
                      }
                    }
                  }
                ]
              }
            }
          },
          metrajVersiyonlari: {$concatArrays:["$metrajVersiyonlari",[{versiyonNumber,metrajOnaylanan:"$metrajOnaylanan"}]]}
        }
      }
    ])


  } catch (error) {

  }

  proje.metrajVersiyonlar.push({ versiyonNumber, createdAt: currentTime })

  return proje


};
