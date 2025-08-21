exports = async function ({
  dugumler_byPoz_state
}) {



  const user = context.user;
  const _userId = new BSON.ObjectId(user.id)
  const userEmail = context.user.data.email
  const userIsim = user.custom_data.isim
  const userSoyisim = user.custom_data.soyisim

  const mailTeyit = user.custom_data.mailTeyit;
  if (!mailTeyit) {
    throw new Error("MONGO // update_hazirlananMetrajlar_selectedFull // Öncelikle üyeliğinize ait mail adresinin size ait olduğunu doğrulamalısınız, tekrar giriş yapmayı deneyiniz veya bizimle iletişime geçiniz.");
  }


  if (!dugumler_byPoz_state) {
    throw new Error("MONGO // update_hazirlananMetrajlar_selectedFull // 'dugumler_byPoz_state' verisi db sorgusuna gelmedi");
  }


  const currentTime = new Date();

  // const collection_Projeler = context.services.get("mongodb-atlas").db("rapor724_v2").collection("projeler")
  // const collection_HazirlananMetrajlar = context.services.get("mongodb-atlas").db("rapor724_v2").collection("hazirlananMetrajlar")
  // const collection_OnaylananMetrajlar = context.services.get("mongodb-atlas").db("rapor724_v2").collection("onaylananMetrajlar")
  const collection_Dugumler = context.services.get("mongodb-atlas").db("rapor724_v2").collection("dugumler")

  // const proje = await collection_Projeler.findOne({ _id: _projeId })
  // const {metrajYapabilenler} = proje.yetki




  try {

    let bulkArray = []
    dugumler_byPoz_state.map(oneDugum => {

      oneDugum.hazirlananMetrajlar.map(oneHazirlanan => {

        if (oneHazirlanan.hasSelectedFull_aday) {

          oneBulk = {
            updateOne: {
              filter: { _id: oneDugum._id },
              update: {
                $set: {
                  "hazirlananMetrajlar.$[oneHazirlanan].satirlar.$[oneSatir].isSelected": true,
                  "hazirlananMetrajlar.$[oneHazirlanan].satirlar.$[oneSatir].hasSelectedCopy": false,
                  "hazirlananMetrajlar.$[oneHazirlanan].metrajOnaylanan": { $inc: "hazirlananMetrajlar.$[oneHazirlanan].satirlar.$[oneSatir].metraj" }
                },
                $unset: {
                  "hazirlananMetrajlar.$[oneHazirlanan].satirlar.$[oneSatir].isReady": "",
                  "hazirlananMetrajlar.$[oneHazirlanan].satirlar.$[oneSatir].isReadyUnSeen": ""
                }
              },
              arrayFilters: [
                {
                  "oneHazirlanan.userEmail": oneHazirlanan.userEmail
                },
                {
                  "oneSatir.isReady": true
                }
              ]
            }
          }

          bulkArray = [...bulkArray, oneBulk]
        }

      })




    })


    await collection_Dugumler.bulkWrite(
      bulkArray,
      { ordered: false }
    )


  } catch (error) {
    throw new Error("MONGO // update_hazirlananMetraj_ready // " + error);
  }





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
  //                         "$map": {
  //                           "input": "$$oneHazirlanan.satirlar",
  //                           "as": "oneSatir",
  //                           "in": {
  //                             "$cond": {
  //                               "if": {
  //                                 $or: [
  //                                   { $and: [{ $eq: ["$$oneSatir.isSelected", true] }, { $eq: ["$$oneSatir.hasSelectedCopy", false] }] },
  //                                   { $eq: ["$$oneSatir.isSelectedCopy", true] }
  //                                 ]
  //                               },
  //                               "then": "$$oneSatir.metraj",
  //                               "else": 0
  //                             }
  //                           }
  //                         }
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
  //   throw new Error("MONGO // update_hazirlananMetrajlar_unReady // metraj güncelleme" + error);
  // }



};
