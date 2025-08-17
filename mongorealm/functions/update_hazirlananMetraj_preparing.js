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
    throw new Error("MONGO // update_hazirlananMetraj_peparing // Öncelikle üyeliğinize ait mail adresinin size ait olduğunu doğrulamalısınız, tekrar giriş yapmayı deneyiniz veya bizimle iletişime geçiniz.");
  }

  if (!_dugumId) {
    throw new Error("MONGO // update_hazirlananMetraj_peparing // '_dugumId' verisi db sorgusuna gelmedi");
  }

  if (!hazirlananMetraj_state) {
    throw new Error("MONGO // update_hazirlananMetraj_peparing // 'hazirlananMetraj_state' verisi db sorgusuna gelmedi");
  }


  const currentTime = new Date();

  // const collection_HazirlananMetrajlar = context.services.get("mongodb-atlas").db("rapor724_v2").collection("hazirlananMetrajlar")
  // const collection_OnaylananMetrajlar = context.services.get("mongodb-atlas").db("rapor724_v2").collection("onaylananMetrajlar")
  const collection_Dugumler = context.services.get("mongodb-atlas").db("rapor724_v2").collection("dugumler")



  let hazirlananMetraj_db
  let isSilinecek = true
  let readyMetraj = 0
  let metrajPre = 0


  hazirlananMetraj_state.satirlar.filter(x => x.isPreparing).map(oneSatir => {
    metrajPre += Number(oneSatir.metraj)
  })
  hazirlananMetraj_state.metrajPre = metrajPre
  hazirlananMetraj_state.satirlar = hazirlananMetraj_state.satirlar.map(oneSatir => {
    delete oneSatir.newSelected
    return oneSatir
  })




  // isReady varsa yoksa - isReady property false olmuş olsa bile satırı kaybetmeyeceğiz
  // bu false olmuş satırın yeniden kazanılması önemli önce sarı nokta ile kalacak öyle sonra isPreparing yapacağız onu

  if (hazirlananMetraj_state.satirlar.find(x => x.isReady)) {

    try {

      const result = await collection_Dugumler.updateOne({ _id: _dugumId },
        [
          {
            $set: {
              hazirlananMetrajlar: {
                $map: {
                  input: "$hazirlananMetrajlar",
                  as: "oneHazirlanan",
                  in: {
                    $cond: {
                      if: { $ne: ["$$oneHazirlanan.userEmail", userEmail] },
                      then: "$$oneHazirlanan",
                      else: {
                        $mergeObjects: [
                          "$$oneHazirlanan",
                          {
                            satirlar: {
                              $concatArrays: [
                                {
                                  $filter: {
                                    input: "$$oneHazirlanan.satirlar",
                                    as: "oneSatir",
                                    cond: { $ne: ["$$oneSatir.isPreparing", true] }
                                  }
                                },
                                [hazirlananMetraj_state.satirlar.filter(x => x.isPreparing)]
                              ]
                            },
                          },
                          {metrajPre}
                        ]
                      }
                    }
                  }
                }
              }
            }
          }
        ]
      )
      return result

    } catch (error) {
      throw new Error("MONGO // update_hazirlananMetraj_peparing_new // ready varken preparing eklenecekse " + error.message);
    }


    // isReady yoksa sıkıntı yok toptan yenileyelim ya da boşsa silelim
  } else {


    hazirlananMetraj_state.satirlar.map(oneSatir => {
      if (!(oneSatir.aciklama === "" && Number(oneSatir.carpan1) === 0 && Number(oneSatir.carpan2) === 0 && Number(oneSatir.carpan3) === 0 && Number(oneSatir.carpan4) === 0 && Number(oneSatir.carpan5) === 0)) {
        isSilinecek = false
      }
    })


    if (isSilinecek) {

      try {

        const result = await collection_Dugumler.updateOne({ _id: _dugumId },
          [
            {
              $set: {
                hazirlananMetrajlar: {
                  $filter: {
                    input: "$hazirlananMetrajlar",
                    as: "oneHazirlanan",
                    cond: { $ne: ["$$oneHazirlanan.userEmail", userEmail] }
                  }
                }
              }
            }
          ]
        )
        return result

      } catch (error) {
        throw new Error("MONGO // update_hazirlananMetraj_peparing_new // silinecekse " + error.message);
      }

      return result


      // güncellenecekse
    } else {

      try {

        const result = await collection_Dugumler.updateOne({ _id: _dugumId },
          [
            {
              $set: {
                hazirlananMetrajlar: {
                  $concatArrays: [
                    {
                      $filter: {
                        input: "$hazirlananMetrajlar",
                        as: "oneHazirlanan",
                        cond: { $ne: ["$$oneHazirlanan.userEmail", userEmail] }
                      }
                    },
                    [hazirlananMetraj_state]
                  ]
                }
              }
            }
          ]
        )
        return result

      } catch (error) {
        throw new Error("MONGO // update_hazirlananMetraj_peparing_new // güncellenecekse " + error.message);
      }


    }


  }











  // // db'deki verinin alınması
  // try {

  //   const result = await collection_Dugumler.aggregate([
  //     { $match: { _id: _dugumId } },
  //     {
  //       $project: {
  //         hazirlananMetrajlar_filtered: {
  //           $filter: {
  //             input: "$hazirlananMetrajlar",
  //             as: "hazirlananMetraj",
  //             cond: { $eq: ["$$hazirlananMetraj.userEmail", userEmail] }
  //           }
  //         }
  //       }
  //     },
  //     { $limit: 1 }
  //   ]).toArray()

  //   let { hazirlananMetrajlar_filtered } = result[0]
  //   hazirlananMetraj_db = hazirlananMetrajlar_filtered[0]

  // } catch (error) {
  //   throw new Error("MONGO // update_hazirlananMetraj_peparing_new // db'deki verinin alınması " + error.message);
  // }




  // // silinecekse - fonksiyon burada bitiyor - ya siliniyor - onaylıya taşınmış varsa da silme niyeti geri çeviriliyor
  // try {

  //   hazirlananMetraj_state.satirlar.map(oneSatir => {
  //     if (!(oneSatir.aciklama === "" && Number(oneSatir.carpan1) === 0 && Number(oneSatir.carpan2) === 0 && Number(oneSatir.carpan3) === 0 && Number(oneSatir.carpan4) === 0 && Number(oneSatir.carpan5) === 0)) {
  //       isSilinecek = false
  //     }
  //     // ready'ye satır eklemişse de silmeyelim, belki revize etmek için boş satır göndermek istiyor, onaylı tarafa onaylayıcının kendisi
  //     if (oneSatir.isReady) {
  //       isSilinecek = false
  //     }
  //   })

  //   // db de isSelected varsa da biri ready lerden onaylı tarafa çekmiş belki, kullanıcı bütün satırları boşaltmadan 
  //   if (isSilinecek) {

  //     if (!hazirlananMetraj_db) {

  //       // zaten yokmuş fonksiyonu sonlandıralım
  //       return

  //     } else {

  //       if (hazirlananMetraj_db.satirlar.find(x => x.isSelected)) {

  //         // silme işleminden önce ready varmış ve seçilmiş demekki onaylı tarafa
  //         isSilinecek = false
  //       }
  //     }

  //   }


  //   // hala true ise ve db'de de varsa artık silebilir ve fonksiyonu sonlandırabiliriz
  //   if (isSilinecek) {
  //     await collection_Dugumler.updateOne({ _id: _dugumId },
  //       [
  //         {
  //           $set: {
  //             hazirlananMetrajlar: {
  //               $filter: {
  //                 input: "$hazirlananMetrajlar",
  //                 as: "hazirlananMetraj",
  //                 cond: { $ne: ["$$hazirlananMetraj.userEmail", userEmail] }
  //               }
  //             }
  //           }
  //         }
  //       ]
  //     )
  //     return
  //   }



  // } catch (error) {
  //   throw new Error("MONGO // update_hazirlananMetraj_peparing_new // silinecekse " + error.message);
  // }





  // // mevcut veri güncel veri ile değiştirilecekse veya yeni eklenecekse - önce siliniyor sonra ekleniyor
  // try {

  //   // gelen veriden isSelected olmayıp db'de isSelected olan, yani muhtemelen az önce başka kullanıcı tarafından onaylıya taşınmış olan satırlar mevcut
  //   let selectedSatirlar = hazirlananMetraj_db?.satirlar?.filter(x => x.isSelected)
  //   let unSelectedSatirlar = hazirlananMetraj_state.satirlar?.filter(x => !x.isSelected)
  //   selectedSatirlar?.map(oneSatir => {
  //     if (unSelectedSatirlar.find(x => x.satirNo === oneSatir.satirNo)) {
  //       throw new Error(`__mesajBaslangic__Kaydetmeye çalıştığınız bazı satırlar, siz işlem yaparken, başa kullanıcı tarafından onaylı tarafa alınmış. Kayıt işleminiz gerçekleşmedi. Kontrol edip tekrar deneyiniz.__mesajBitis__`)
  //     }
  //   })

  //   // gelen veride sıkıntı görülmedi olduğu gibi kaydedilecek ama önce metraj verisi alma ve temizlik
  //   hazirlananMetraj_state.satirlar = hazirlananMetraj_state.satirlar.map(oneSatir => {
  //     metraj += Number(oneSatir.metraj)
  //     readyMetraj += oneSatir.isReady ? Number(oneSatir.metraj) : 0
  //     delete oneSatir.isKaydedilecek
  //     return oneSatir
  //   })
  //   hazirlananMetraj_state.metraj = metraj
  //   hazirlananMetraj_state.readyMetraj = readyMetraj


  //   // sorun olmadığını gördük o zaman önce silelim, bu şekilde eklemek daha kolay, sonra ekleyelim
  //   await collection_Dugumler.updateOne({ _id: _dugumId },
  //     [
  //       {
  //         $set: {
  //           hazirlananMetrajlar: {
  //             $filter: {
  //               input: "$hazirlananMetrajlar",
  //               as: "hazirlananMetraj",
  //               cond: { $ne: ["$$hazirlananMetraj.userEmail", userEmail] }
  //             }
  //           }
  //         }
  //       },
  //       {
  //         $set: {
  //           hazirlananMetrajlar: {
  //             $concatArrays: [
  //               "$hazirlananMetrajlar",
  //               [hazirlananMetraj_state]
  //             ]
  //           }
  //         }
  //       }
  //     ]
  //   )


  // } catch (error) {
  //   throw new Error("MONGO // update_hazirlananMetraj_peparing_new // mevcut veri güncel veri ile değiştirilecekse veya yeni eklenecekse " + error.message);
  // }



};
