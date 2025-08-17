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


  // const result = await collection_Dugumler.aggregate([
  //   { $match: { _id: _dugumId } },
  //   {
  //     $project: {
  //       hazirlananMetrajlar_filtered: {
  //         $filter: {
  //           input: "$hazirlananMetrajlar",
  //           as: "hazirlananMetraj",
  //           cond: { $eq: ["$$hazirlananMetraj.userEmail", userEmail] }
  //         }
  //       }
  //     }
  //   },
  //   { $limit: 1 }
  // ]).toArray()


  // let { hazirlananMetrajlar_filtered } = result[0]
  // hazirlananMetraj = hazirlananMetrajlar_filtered[0]




  const result = await collection_Dugumler.aggregate([
    { $match: { _id: _dugumId } },
    {
      $project: {
        hazirlananMetraj: {
          $reduce: {
            input: "$hazirlananMetrajlar",
            initialValue: null,
            in: {
              $cond: {
                if: { $eq: ["$$this.userEmail", userEmail] },
                then: "$$this",
                else: null
              }
            }
          }
        }
      }
    },
    { $limit: 1 }
  ]).toArray()


  let { hazirlananMetraj } = result[0]


  if (!hazirlananMetraj) {

    hazirlananMetraj = {
      userEmail,
      metraj: 0,
      readyMetraj: 0,
      satirlar: [
        { satirNo: userCode + "-" + 1, aciklama: "", carpan1: "", carpan2: "", carpan3: "", carpan4: "", carpan5: "", metraj: "", isPreparing: true },
        { satirNo: userCode + "-" + 2, aciklama: "", carpan1: "", carpan2: "", carpan3: "", carpan4: "", carpan5: "", metraj: "", isPreparing: true },
        { satirNo: userCode + "-" + 3, aciklama: "", carpan1: "", carpan2: "", carpan3: "", carpan4: "", carpan5: "", metraj: "", isPreparing: true },
        { satirNo: userCode + "-" + 4, aciklama: "", carpan1: "", carpan2: "", carpan3: "", carpan4: "", carpan5: "", metraj: "", isPreparing: true },
        { satirNo: userCode + "-" + 5, aciklama: "", carpan1: "", carpan2: "", carpan3: "", carpan4: "", carpan5: "", metraj: "", isPreparing: true }
      ]
    }

    // await collection_Dugumler.updateOne({ _id: _dugumId },
    //   [
    //     {
    //       $set: {
    //         hazirlananMetrajlar: {
    //           $concatArrays: ["$hazirlananMetrajlar", [hazirlananMetraj]]
    //         }
    //       }
    //     }
    //   ])

  }

  return hazirlananMetraj

};
