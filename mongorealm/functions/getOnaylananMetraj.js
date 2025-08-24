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
    throw new Error("MONGO // getOnaylananMetraj // Öncelikle üyeliğinize ait mail adresinin size ait olduğunu doğrulamalısınız, tekrar giriş yapmayı deneyiniz veya bizimle iletişime geçiniz.");
  }

  if (!_dugumId) {
    throw new Error("MONGO // getOnaylananMetraj // '_dugumId' verisi db sorgusuna gelmedi");
  }


  const collection_Dugumler = context.services.get("mongodb-atlas").db("rapor724_v2").collection("dugumler")


  const result = await collection_Dugumler.aggregate([
    { $match: { _id: _dugumId } },
    {
      $project: {
        metrajOnaylanan: 1,
        hazirlananMetrajlar: 1,
        revizeMetrajlar: 1
      }
    },
    { $limit: 1 }
  ]).toArray()


  let { metrajOnaylanan, hazirlananMetrajlar, revizeMetrajlar } = result[0]


  let satirlar = []
  metrajOnaylanan = 0

  hazirlananMetrajlar?.map(oneHazirlanan => {
    let userEmail = oneHazirlanan.userEmail
    let onayliSatirlar = oneHazirlanan.satirlar.filter(x => x.isSelected || x.hasSelectedCopy).map(oneSatir => {
      oneSatir.userEmail = userEmail
      // metrajOnaylanan += oneSatir.metraj ? Number(oneSatir.metraj) : 0
      return oneSatir
    })
    if (onayliSatirlar.length > 0) {
      satirlar = [...satirlar, ...onayliSatirlar]
    }
  })

  revizeMetrajlar?.map(oneMetraj => {
    if (satirlar.filter(x => x.hasSelectedCopy).find(x => x.satirNo === oneMetraj.satirNo)) {
      oneMetraj.satirlar.map(oneSatir => {
        // metrajOnaylanan += oneSatir.metraj ? Number(oneSatir.metraj) : 0
      })
      if (oneMetraj.satirlar.length > 0) {
        satirlar = [...satirlar, ...oneMetraj.satirlar]
      }
    }
  })


  let onaylananMetraj = {
    metrajOnaylanan,
    satirlar
  }

  return onaylananMetraj


};
