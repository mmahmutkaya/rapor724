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

  const collection_HazirlananMetrajlar = context.services.get("mongodb-atlas").db("rapor724_v2").collection("hazirlananMetrajlar")
  // const collection_Projeler = context.services.get("mongodb-atlas").db("rapor724_v2").collection("projeler")

  // let proje = await collection_Projeler.findOne({ _id: _projeId }, { yetki: 1 })

  let hazirlananMetrajlar = await collection_HazirlananMetrajlar.find({ _dugumId })

  if (hazirlananMetrajlar.length > 0) {
    hazirlananMetrajlar = hazirlananMetrajlar.map(oneHazirlanan => {
      oneHazirlanan.satirlar = oneHazirlanan.satirlar.filter(x => x.isReady === true)
      return oneHazirlanan
    })
  }


  return { hazirlananMetrajlar }


};
