exports = async function ({
  _pozId
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

  if (!_pozId) {
    throw new Error("'_pozId' verisi db sorgusuna gelmedi");
  }



  const collection_Dugumler = context.services.get("mongodb-atlas").db("rapor724_v2").collection("dugumler")

  
  try {
    
    const dugumler = await collection_Dugumler.aggregate([
      { $match: { _pozId, openMetraj:true } },
      { $project: { _pozId: 1, _mahalId: 1, openMetraj: 1 } }
    ]).toArray()
  
    return dugumler
    
  } catch (error) {
    throw new Error({hatayeri:"MONGO // getDugumler_byPoz // ", error});
  }



};
