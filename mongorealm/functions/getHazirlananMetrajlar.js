exports = async function ({
  _projeId, _dugumId
}) {



  const user = context.user;
  const _userId = new BSON.ObjectId(user.id)
  const userEmail = context.user.data.email
  const userIsim = user.custom_data.isim
  const userSoyisim = user.custom_data.soyisim
  const userCode = user.custom_data.userCode

  const mailTeyit = user.custom_data.mailTeyit;
  if (!mailTeyit) {
    throw new Error("MONGO // getHazirlananMetrajlar // Öncelikle üyeliğinize ait mail adresinin size ait olduğunu doğrulamalısınız, tekrar giriş yapmayı deneyiniz veya bizimle iletişime geçiniz.");
  }

  if (!_dugumId) {
    throw new Error("MONGO // getHazirlananMetrajlar // '_dugumId' verisi db sorgusuna gelmedi");
  }

  const collection_Dugumler = context.services.get("mongodb-atlas").db("rapor724_v2").collection("dugumler")


  const result = await collection_Dugumler.aggregate([
    { $match: { _id: _dugumId } },
    { $project: { _pozId: 1, _mahalId: 1, hazirlananMetrajlar: 1, metrajPreparing: 1, metrajReady: 1, metrajOnaylanan: 1 } },
    { $limit: 1 }
  ]).toArray()

  let dugum = result[0]
  // hazirlananMetraj = hazirlananMetrajlar_filtered[0]

  let { hazirlananMetrajlar } = dugum




  if (hazirlananMetrajlar.length > 0) {

    try {

      let bulkArray = []
      hazirlananMetrajlar.map(oneHazirlanan => {

        let oneHazirlanan_isSeen_satirNolar = oneHazirlanan.satirlar.filter(x => x.isReady).map(oneSatir => {
          return oneSatir.satirNo
        })

        oneBulk = {
          updateOne: {
            filter: { _id: _dugumId },
            update: {
              $set: {
                "hazirlananMetrajlar.$[oneHazirlanan].satirlar.$[oneSatir].isReadySeen": true
              }
            },
            arrayFilters: [
              {
                "oneHazirlanan.userEmail": oneHazirlanan.userEmail
              },
              {
                "oneSatir.satirNo": { $in: oneHazirlanan_isSeen_satirNolar },
                "oneSatir.isReady": true
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
      throw new Error("MONGO // getHazirlananMetrajlar / isSeen // " + error);
    }


  }


  hazirlananMetrajlar = hazirlananMetrajlar.map(oneHazirlanan => {
    oneHazirlanan.satirlar = oneHazirlanan.satirlar.filter(x => x.isReady || x.isSelected)
    oneHazirlanan.metraj = oneHazirlanan.readyMetraj
    return oneHazirlanan
  })

  return { hazirlananMetrajlar }


};
