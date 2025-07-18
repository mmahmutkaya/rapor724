exports = async function ({
  _dugumId,
}) {



  const user = context.user;
  const _userId = new BSON.ObjectId(user.id)
  const userEmail = context.user.data.email
  const userIsim = user.custom_data.isim
  const userSoyisim = user.custom_data.soyisim

  const mailTeyit = user.custom_data.mailTeyit;
  if (!mailTeyit) {
    throw new Error("MONGO // getHazirlananMetraj // Öncelikle üyeliğinize ait mail adresinin size ait olduğunu doğrulamalısınız, tekrar giriş yapmayı deneyiniz veya bizimle iletişime geçiniz.");
  }

  if (!_dugumId) {
    throw new Error("MONGO // getHazirlananMetraj // '_dugumId' verisi db sorgusuna gelmedi");
  }



  const collection_hazirlananMetrajlar = context.services.get("mongodb-atlas").db("rapor724_v2").collection("hazirlananMetrajlar")

  
  try {
    
    const hazirlananMetraj = await collection_hazirlananMetrajlar.findOne({_dugumId})
  
    return hazirlananMetraj
    
  } catch (error) {
    throw new Error({hatayeri:"MONGO // getHazirlananMetraj // ", error});
  }



};
