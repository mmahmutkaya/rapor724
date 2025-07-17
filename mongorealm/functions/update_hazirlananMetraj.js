exports = async function ({
  _dugumId,
  hazirlananMetraj
}) {



  const user = context.user;
  const _userId = new BSON.ObjectId(user.id)
  const userEmail = context.user.data.email
  const userIsim = user.custom_data.isim
  const userSoyisim = user.custom_data.soyisim

  const mailTeyit = user.custom_data.mailTeyit;
  if (!mailTeyit) {
    throw new Error("MONGO // update_hazirlananMetraj // Öncelikle üyeliğinize ait mail adresinin size ait olduğunu doğrulamalısınız, tekrar giriş yapmayı deneyiniz veya bizimle iletişime geçiniz.");
  }

  if (!_dugumId) {
    throw new Error("MONGO // update_hazirlananMetraj // '_dugumId' verisi db sorgusuna gelmedi");
  }

  if (!hazirlananMetraj) {
    throw new Error("MONGO // update_hazirlananMetraj // 'hazirlananMetraj' verisi db sorgusuna gelmedi");
  }


  const currentTime = new Date();

  const collection_HazirlananMetrajlar = context.services.get("mongodb-atlas").db("rapor724_v2").collection("hazirlananMetrajlar")


  // const bulkArray = dugumler_state_filtered.map(x => {
  //   return (
  //     {
  //       updateOne: {
  //         // filter: { _projeId, _mahalId: new BSON.ObjectId(x._mahalId), _pozId: new BSON.ObjectId(x._pozId) },
  //         filter: { _projeId, _mahalId: x._mahalId, _pozId: x._pozId },
  //         update: { $set: { openMetraj: x.openMetraj } },
  //         upsert: true
  //       }
  //     }
  //   )
  // })


  // try {
  //   await collection_Dugumler.bulkWrite(
  //     bulkArray,
  //     { ordered: false }
  //   )
  // } catch (error) {
  //   throw new Error({hatayeri:"MONGO // update_hazirlananMetraj // collection_Dugumler.bulkWrite // ", error});
  // }


  const hazirlananMetrajlar = await collection_HazirlananMetrajlar.findOne({_dugumId})

  return hazirlananMetrajlar

  // if()

  // let userMetrajlar = hazirlananMetrajlar.hazirlananMetrajlar.find()


  // try {
  //   collection_HazirlananMetrajlar.updateOne(
  //     { _dugumId },
  //     { $set: { "userMetrajlar.$[elem].mean": 100 } },
  //     { arrayFilters: [{ "userEmail": userEmail }] }
  //   )

  //   )
  // } catch (error) {

  // }


  // try {

  //   const dugumler = await collection_Dugumler.aggregate([
  //     { $match: { _projeId, openMetraj: true } },
  //     { $project: { _pozId: 1, _mahalId: 1, openMetraj: 1 } }
  //   ]).toArray()

  //   return { dugumler }

  // } catch (error) {
  //   throw new Error({ hatayeri: "MONGO // update_hazirlananMetraj // getDugumler // ", error });
  // }



};
