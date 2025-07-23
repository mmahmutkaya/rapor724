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
    throw new Error("MONGO // getMahaller_byPoz // Öncelikle üyeliğinize ait mail adresinin size ait olduğunu doğrulamalısınız, tekrar giriş yapmayı deneyiniz veya bizimle iletişime geçiniz.");
  }

  if (!_projeId) {
    throw new Error("MONGO // getMahaller_byPoz // '_projeId' verisi db sorgusuna gelmedi");
  }

  // if (!_pozId) {
  //   throw new Error("MONGO // getMahaller_byPoz // '_pozId' verisi db sorgusuna gelmedi");
  // }



  const collection_Dugumler = context.services.get("mongodb-atlas").db("rapor724_v2").collection("dugumler")
  const collection_Mahaller = context.services.get("mongodb-atlas").db("rapor724_v2").collection("mahaller")


  try {

    // const dugumler = await collection_Dugumler.aggregate([
    //   { $match: { _pozId, openMetraj: true } },
    //   { $project: { _mahalId: 1, hazirlananMetrajlar: 1, onaylananMetraj: 1 } }
    // ]).toArray()


    let mahaller = await collection_Mahaller.aggregate([
      { $match: { _projeId, isDeleted: false } },
      { $project: { _lbsId: 1, mahalNo: 1, mahalName: 1 } }
    ]).toArray()

    // mahaller = mahaller.map(oneMahal => {
    //   const dugum = dugumler.find(oneDugum => oneDugum._mahalId.toString() === oneMahal._id.toString())
    //   if (!dugum) {
    //     oneMahal.hasDugum = false
    //   } else {
    //     oneMahal.hasDugum = true
    //     oneMahal.onaylananMetraj = dugum.onaylananMetraj
    //     oneMahal.hazirlananMetrajlar = dugum.hazirlananMetrajlar
    //   }
    //   return oneMahal
    // })

    return mahaller

  } catch (error) {
    throw new Error({ hatayeri: "MONGO // getMahaller_byPoz // ", error });
  }



};
