exports = async function ({
  _projeId,
  dugumler_state_filtered
}) {



  const user = context.user;
  const _userId = new BSON.ObjectId(user.id)
  const userEmail = context.user.data.email
  const userIsim = user.custom_data.isim
  const userSoyisim = user.custom_data.soyisim

  const mailTeyit = user.custom_data.mailTeyit;
  if (!mailTeyit) {
    throw new Error("MONGO // updateDugumler_openMetraj // Öncelikle üyeliğinize ait mail adresinin size ait olduğunu doğrulamalısınız, tekrar giriş yapmayı deneyiniz veya bizimle iletişime geçiniz.");
  }

  if (!_projeId) {
    throw new Error("MONGO // updateDugumler_openMetraj // '_projeId' verisi db sorgusuna gelmedi");
  }

  if (!dugumler_state_filtered) {
    throw new Error("MONGO // updateDugumler_openMetraj // 'dugumler_state_filtered' verisi db sorgusuna gelmedi");
  }


  const currentTime = new Date();

  const collection_Dugumler = context.services.get("mongodb-atlas").db("rapor724_v2").collection("dugumler")

  
  const bulkArray = dugumler_state_filtered.map(x => {
    return (
      {
        updateOne: {
          filter: { _projeId, _mahalId: new BSON.ObjectId(x._mahalId), _pozId: new BSON.ObjectId(x._pozId) },
          update: { $set: { openMetraj: x.openMetraj } },
          upsert: true
        }
      }
    )
  })

  try {
    await collection_Dugumler.bulkWrite(
      bulkArray,
      { ordered: false }
    )
  } catch (error) {
    throw new Error({hatayeri:"MONGO // updateDugumler_openMetraj // collection_Dugumler.bulkWrite // ", error});
  }


  
  try {
    
    const dugumler = await collection_Dugumler.aggregate([
      { $match: { _projeId } },
      { $project: { _pozId: 1, _mahalId: 1, openMetraj: 1 } }
    ]).toArray()
  
    return {dugumler}
    
  } catch (error) {
    throw new Error({hatayeri:"MONGO // updateDugumler_openMetraj // getDugumler // ", error});
  }



};
