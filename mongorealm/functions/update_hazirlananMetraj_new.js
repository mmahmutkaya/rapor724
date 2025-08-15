exports = async function ({
  _dugumId,
  hazirlananMetraj_new
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

  if (!hazirlananMetraj_new) {
    throw new Error("MONGO // update_hazirlananMetrajlar // 'hazirlananMetraj_new' verisi db sorgusuna gelmedi");
  }


  const currentTime = new Date();

  // const collection_HazirlananMetrajlar = context.services.get("mongodb-atlas").db("rapor724_v2").collection("hazirlananMetrajlar")
  // const collection_OnaylananMetrajlar = context.services.get("mongodb-atlas").db("rapor724_v2").collection("onaylananMetrajlar")
  const collection_Dugumler = context.services.get("mongodb-atlas").db("rapor724_v2").collection("dugumler")



  let hazirlananMetraj_db
  let isSilinecek = true
  let readyMetraj = 0
  let metraj = 0




  // db'deki verinin alınması
  try {

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
    hazirlananMetraj_db = hazirlananMetrajlar_filtered[0]

  } catch (error) {
    throw new Error("MONGO // update_hazirlananMetrajlar_new // db'deki verinin alınması " + error.message);
  }




  // silinecekse - fonksiyon burada bitiyor - ya siliniyor - onaylıya taşınmış varsa da silme niyeti geri çeviriliyor
  try {

    hazirlananMetraj_new.satirlar.map(oneSatir => {
      if (!(oneSatir.aciklama === "" && Number(oneSatir.carpan1) === 0 && Number(oneSatir.carpan2) === 0 && Number(oneSatir.carpan3) === 0 && Number(oneSatir.carpan4) === 0 && Number(oneSatir.carpan5) === 0)) {
        isSilinecek = false
      }
      // ready'ye satır eklemişse de silmeyelim, belki revize etmek için boş satır göndermek istiyor, onaylı tarafa onaylayıcının kendisi
      if (oneSatir.isReady) {
        isSilinecek = false
      }
    })

    // db de isSelected varsa da biri ready lerden onaylı tarafa çekmiş belki, kullanıcı bütün satırları boşaltmadan 
    if (isSilinecek) {

      if (!hazirlananMetraj_db) {

        // zaten yokmuş fonksiyonu sonlandıralım
        return

      } else {

        if (hazirlananMetraj_db.satirlar.find(x => x.isSelected)) {

          // silme işleminden önce ready varmış ve seçilmiş demekki onaylı tarafa
          isSilinecek = false
        }
      }

    }


    // hala true ise ve db'de de varsa artık silebilir ve fonksiyonu sonlandırabiliriz
    if (isSilinecek) {
      await collection_Dugumler.updateOne({ _id: _dugumId },
        [
          {
            $set: {
              hazirlananMetrajlar: {
                $filter: {
                  input: "$hazirlananMetrajlar",
                  as: "hazirlananMetraj",
                  cond: { $ne: ["$$hazirlananMetraj.userEmail", userEmail] }
                }
              },
              readyMetrajlar: {
                $filter: {
                  input: "$readyMetrajlar",
                  as: "readyMetraj",
                  cond: { $ne: ["$$readyMetraj.userEmail", userEmail] }
                }
              }
            }
          }
        ]
      )
      return
    }



  } catch (error) {
    throw new Error("MONGO // update_hazirlananMetrajlar_new // silinecekse " + error.message);
  }





  // mevcut veri güncel veri ile değiştirilecekse veya yeni eklenecekse
  try {

    // gelen veriden isSelected olmayıp db'de isSelected olan, yani muhtemelen az önce başka kullanıcı tarafından onaylıya taşınmış olan satırlar mevcut
    let selectedSatirlar = hazirlananMetraj_db?.satirlar?.filter(x => x.isSelected)
    let unSelectedSatirlar = hazirlananMetraj_new.satirlar?.filter(x => !x.isSelected)
    selectedSatirlar?.map(oneSatir => {
      if (unSelectedSatirlar.find(x => x.satirNo === oneSatir.satirNo)) {
        throw new Error(`__mesajBaslangic__Kaydetmeye çalıştığınız bazı satırlar, siz işlem yaparken, başa kullanıcı tarafından onaylı tarafa alınmış. Kayıt işleminiz gerçekleşmedi. Kontrol edip tekrar deneyiniz.__mesajBitis__`)
      }
    })

    // gelen veride sıkıntı görülmedi olduğu gibi kaydedilecek ama önce metraj verisi alma ve temizlik
    hazirlananMetraj_new.satirlar = hazirlananMetraj_new.satirlar.map(oneSatir => {
      metraj += Number(oneSatir.metraj)
      readyMetraj += oneSatir.isReady ? Number(oneSatir.metraj) : 0
      delete oneSatir.isKaydedilecek
      return oneSatir
    })
    hazirlananMetraj_new.metraj = metraj
    hazirlananMetraj_new.readyMetraj = readyMetraj


    // sorun olmadığını gördük o zaman önce silelim, bu şekilde eklemek daha kolay, sonra ekleyelim
    await collection_Dugumler.updateOne({ _id: _dugumId },
      [
        {
          $set: {
            hazirlananMetrajlar: {
              $filter: {
                input: "$hazirlananMetrajlar",
                as: "hazirlananMetraj",
                cond: { $ne: ["$$hazirlananMetraj.userEmail", userEmail] }
              }
            },
            readyMetrajlar: {
              $filter: {
                input: "$readyMetrajlar",
                as: "readyMetraj",
                cond: { $ne: ["$$readyMetraj.userEmail", userEmail] }
              }
            }
          }
        },
        {
          $set: {
            hazirlananMetrajlar: {
              $concatArrays: [
                "$hazirlananMetrajlar",
                [hazirlananMetraj_new]
              ]
            },
            readyMetrajlar: {
              $concatArrays: [
                "$readyMetrajlar",
                [{ userEmail: hazirlananMetraj_new.userEmail, metraj: readyMetraj }]
              ]

            }
          }
        }
      ]
    )


  } catch (error) {
    throw new Error("MONGO // update_hazirlananMetrajlar_new // mevcut veri güncel veri ile değiştirilecekse veya yeni eklenecekse " + error.message);
  }


  // // mevcut veriye güncel veri ile değiştirilecekse
  // try {

  //   // db'de yoksa ve yeni eklenecekse
  //   if (!hazirlananMetraj_db) {

  //     hazirlananMetraj_new.satirlar = hazirlananMetraj_new.satirlar.map(oneSatir => {
  //       metraj += Number(oneSatir.metraj)
  //       readyMetraj += oneSatir.isReady ? Number(oneSatir.metraj) : 0
  //       delete oneSatir.isKaydedilecek
  //       return oneSatir
  //     })
  //     hazirlananMetraj_new.metraj = metraj
  //     hazirlananMetraj_new.readyMetraj = readyMetraj

  //     await collection_Dugumler.updateOne({ _id: _dugumId },
  //       [
  //         {
  //           $set: {
  //             hazirlananMetrajlar: {
  //               $concatArrays: [
  //                 "$hazirlananMetrajlar", // The existing array
  //                 [hazirlananMetraj_new] // The new object as an array
  //               ]
  //             }
  //           }
  //         },
  //         {
  //           $set: {
  //             readyMetrajlar: {
  //               $map: {
  //                 input: "$hazirlananMetrajlar",
  //                 as: "hazirlananMetraj",
  //                 in: {
  //                   $cond: {
  //                     if: { $eq: ["$$hazirlananMetraj.userEmail", userEmail] },
  //                     then: { userEmail, metraj: readyMetraj },
  //                     else: "$$hazirlananMetraj"
  //                   }
  //                 }
  //               }
  //             }
  //           }
  //         },
  //       ]
  //     )

  //   }
  // } catch (error) {
  //   throw new Error("MONGO // update_hazirlananMetrajlar_new // yeni eklenecekse " + error.message);
  // }



  // db'de varsa ve güncellenecekse
  // try {

  //   if (hazirlananMetraj_db) {

  //     // gelen veriden isSelected olmayıp db'de isSelected olan, yani muhtemelen az önce başka kullanıcı tarafından onaylıya taşınmış olan satırlar mevcut
  //     let selectedSatirlar = hazirlananMetraj_db?.satirlar?.filter(x => x.isSelected)
  //     let unSelectedSatirlar = hazirlananMetraj_new.satirlar?.filter(x => !x.isSelected)
  //     selectedSatirlar?.map(oneSatir => {
  //       if (unSelectedSatirlar.find(x => x.satirNo === oneSatir.satirNo)) {
  //         throw new Error(`__mesajBaslangic__Kaydetmeye çalıştığınız bazı satırlar, siz işlem yaparken, başa kullanıcı tarafından onaylı tarafa alınmış. Kayıt işleminiz gerçekleşmedi. Kontrol edip tekrar deneyiniz.__mesajBitis__`)
  //       }
  //     })

  //     // gelen veride sıkıntı görülmedi olduğu gibi kaydedilecek ama önce metraj verisi alma ve temizlik
  //     // isKaydedilecek, frontend'de değişim olan satırları takip etmek için, değişimlileri kaldırınca kaydetme tuşu pasif oluyor 
  //     hazirlananMetraj_new.satirlar = hazirlananMetraj_new.satirlar.map(oneSatir => {
  //       metraj += Number(oneSatir.metraj)
  //       readyMetraj += oneSatir.isReady ? Number(oneSatir.metraj) : 0
  //       delete oneSatir.isKaydedilecek
  //       return oneSatir
  //     })
  //     hazirlananMetraj_new.metraj = metraj
  //     hazirlananMetraj_new.readyMetraj = readyMetraj

  //     await collection_Dugumler.updateOne({ _id: _dugumId },
  //       [
  //         {
  //           $set: {
  //             hazirlananMetrajlar: {
  //               $map: {
  //                 input: "$hazirlananMetrajlar",
  //                 as: "hazirlananMetraj",
  //                 in: {
  //                   $cond: {
  //                     if: { $eq: ["$$hazirlananMetraj.userEmail", userEmail] },
  //                     then: hazirlananMetraj_new,
  //                     else: "$$hazirlananMetraj"
  //                   }
  //                 }
  //               }
  //             }
  //           }
  //         },
  //         {
  //           $set: {
  //             readyMetrajlar: {
  //               $map: {
  //                 input: "$hazirlananMetrajlar",
  //                 as: "hazirlananMetraj",
  //                 in: {
  //                   $cond: {
  //                     if: { $eq: ["$$hazirlananMetraj.userEmail", userEmail] },
  //                     then: { userEmail, metraj: readyMetraj },
  //                     else: "$$hazirlananMetraj"
  //                   }
  //                 }
  //               }
  //             }
  //           }
  //         },
  //         // {
  //         //   $set: {
  //         //     readyMetrajlar: {
  //         //       $map: {
  //         //         input: "$hazirlananMetrajlar",
  //         //         as: "hazirlananMetraj",
  //         //         in: {
  //         //           userEmail: "$$hazirlananMetraj.userEmail",
  //         //           metraj: {
  //         //             $reduce: {
  //         //               input: "$$hazirlananMetraj.satirlar",
  //         //               initialValue: 0,
  //         //               in: {
  //         //                 $add: ["$$value",
  //         //                   {
  //         //                     $cond: {
  //         //                       if: { $eq: ["$$this.isReady", true] },
  //         //                       then:  "$$this.metraj",
  //         //                       else: 0
  //         //                     }
  //         //                   }
  //         //                 ]
  //         //               }
  //         //             }
  //         //           }
  //         //         }
  //         //       }
  //         //     }
  //         //   }
  //         // }
  //       ]
  //     )

  //   }


  // } catch (error) {
  //   throw new Error("MONGO // update_hazirlananMetrajlar_new // güncellenecekse " + error.message);
  // }


};
