exports = async function ({
  _projeId,
  _mahalId,
  _pozId,
  mahalListesi
}) {



  const user = context.user;
  const _userId = new BSON.ObjectId(user.id)
  const userEmail = context.user.data.email
  const userIsim = user.custom_data.isim
  const userSoyisim = user.custom_data.soyisim

  const mailTeyit = user.custom_data.mailTeyit;
  if (!mailTeyit) {
    throw new Error("Öncelikle üyeliğinize ait mail adresinin size ait olduğunu doğrulamalısınız, tekrar giriş yapmayı deneyiniz veya bizimle iletişime geçiniz.");
  }

  // gelen verileri ikiye ayırabiliriz,
  // 1-form verisinden önceki ana veriler - hata varsa hata döndürülür
  // 2-form verileri - hata varsa form alanlarında gözükmesi için bir obje gönderilir

  // tip2 - (yukarıda açıklandı)
  if (!_projeId) {
    throw new Error(
      "MONGO // collectionDugumler // Proje Id -- sorguya gönderilmemiş, lütfen Rapor7/24 ile irtibata geçiniz. "
    )
  }



  const currentTime = new Date();

  const collection_Projeler = context.services.get("mongodb-atlas").db("rapor724_v2").collection("projeler")
  const collection_Dugumler = context.services.get("mongodb-atlas").db("rapor724_v2").collection("dugumler")
  const collection_HazirlananMetrajlar = context.services.get("mongodb-atlas").db("rapor724_v2").collection("hazirlananMetrajlar")
  const collection_OnaylananMetrajlar = context.services.get("mongodb-atlas").db("rapor724_v2").collection("onaylananMetrajlar")
  const collection_Mahaller = context.services.get("mongodb-atlas").db("rapor724_v2").collection("mahaller")
  const collection_Pozlar = context.services.get("mongodb-atlas").db("rapor724_v2").collection("pozlar")
  const collection_Users = context.services.get("mongodb-atlas").db("rapor724_v2").collection("users")




  const bulkArray = mahalListesi.map(x => {
    return (
      {
        updateOne: {
          filter: { _mahalId, _pozId },
          update: { $set: { openMetraj: x.switchValue } },
          upsert: true
        }
      }
    )
  })

  try {
    const result = collection_Dugumler.bulkWrite(
      bulkArray,
      { ordered: false }
    )
    return result
  } catch (error) {
    print(error)
  }

  // const list = await collection_Dugumler.aggregate([
  //   { $match: { _projeId } },
  //   { $project: { _pozId: 1, _mahalId: 1, openMetraj: 1 } }
  // ]).toArray()

  // return { list }





};
