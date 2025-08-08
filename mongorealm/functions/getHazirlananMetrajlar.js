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
    throw new Error("MONGO // getHazirlananVeOnaylananMetrajlar // Öncelikle üyeliğinize ait mail adresinin size ait olduğunu doğrulamalısınız, tekrar giriş yapmayı deneyiniz veya bizimle iletişime geçiniz.");
  }

  if (!_dugumId) {
    throw new Error("MONGO // getHazirlananVeOnaylananMetrajlar // '_dugumId' verisi db sorgusuna gelmedi");
  }

  
  const collection_HazirlananMetrajlar = context.services.get("mongodb-atlas").db("rapor724_v2").collection("hazirlananMetrajlar")
  const collection_OnaylananMetrajlar = context.services.get("mongodb-atlas").db("rapor724_v2").collection("onaylananMetrajlar")


  let _versionId = new BSON.ObjectId()

  try {
    await collection_HazirlananMetrajlar.updateMany({ _dugumId }, { $set: { _versionId } })
  } catch (error) {
    throw new Error({ hatayeri: "MONGO // getHazirlananVeOnaylananMetrajlar // hazirlananMetrajlar _versionId güncelleme sırasında hata oluştu", error });
  }


  let result_updateVersiyonId_onaylanan
  try {
    result_updateVersiyonId_onaylanan = await collection_OnaylananMetrajlar.updateOne({ _dugumId }, { $set: { _versionId } })
  } catch (error) {
    throw new Error({ hatayeri: "MONGO // getHazirlananVeOnaylananMetrajlar // onaylananMetraj _versionId güncelleme sırasında hata oluştu", error });
  }


  try {
    if (!result_updateVersiyonId_onaylanan.matchedCount) {
      await collection_OnaylananMetrajlar.insertOne({ _dugumId, _versionId, satirlar:[], metraj:0 })
    }
  } catch (error) {
    throw new Error({ hatayeri: "MONGO // getHazirlananVeOnaylananMetrajlar // onaylananMetraj oluşturma sırasında hata oluştu", error });
  }


  let hazirlananMetrajlar
  try {
    hazirlananMetrajlar = await collection_HazirlananMetrajlar.find({ _dugumId })
  } catch (error) {
    throw new Error({ hatayeri: "MONGO // getHazirlananVeOnaylananMetrajlar // get hazirlananMetrajlar sırasında hata oluştu", error });
  }


  // let onaylananMetraj
  // try {
  //   onaylananMetraj = await collection_OnaylananMetrajlar.findOne({ _dugumId })
  // } catch (error) {
  //   throw new Error({ hatayeri: "MONGO // getHazirlananVeOnaylananMetrajlar // get onaylananMetraj sırasında hata oluştu", error });
  // }
  
  return hazirlananMetrajlar


};
