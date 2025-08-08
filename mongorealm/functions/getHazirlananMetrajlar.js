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
    throw new Error("MONGO // getHazirlananMetrajlar // Öncelikle üyeliğinize ait mail adresinin size ait olduğunu doğrulamalısınız, tekrar giriş yapmayı deneyiniz veya bizimle iletişime geçiniz.");
  }

  if (!_dugumId) {
    throw new Error("MONGO // getHazirlananMetrajlar // '_dugumId' verisi db sorgusuna gelmedi");
  }



  const collection_hazirlananMetrajlar = context.services.get("mongodb-atlas").db("rapor724_v2").collection("hazirlananMetrajlar")
  const collection_onaylananMetrajlar = context.services.get("mongodb-atlas").db("rapor724_v2").collection("onaylananMetrajlar")

  
  try {
    
    let hazirlananMetrajlar = await collection_hazirlananMetrajlar.find({_dugumId})
    let onaylananMetraj = await collection_hazirlananMetrajlar.findOne({_dugumId})
    let onaylananMetraj_versionId = new BSON.ObjectId
    
    // if(onaylananMetraj){
    //   onaylananMetraj_versionId = onaylananMetraj._versionId
    // } else {
    //   onaylananMetraj_versionId = new BSON.ObjectId()
    //   const result = collection_onaylananMetrajlar.insertOne({_dugumId,_versionId:onaylananMetraj_versionId})
    //   if(!result.insertedId){
    //     throw new Error("versiyonId işlemi için onaylananMetraj oluşturulurken hata oluştu");
    //   }
    // }

     const result = await collection_onaylananMetrajlar.updateOne({_dugumId},{_versionId:onaylananMetraj_versionId},{upsert:true})
      if(!result.modifiedCount){
        throw new Error("versiyonId işlemi için onaylananMetraj oluşturulurken hata oluştu");
      }
    
    hazirlananMetrajlar.onaylananMetraj_versionId = onaylananMetraj_versionId
    return hazirlananMetrajlar
    
  } catch (error) {
    throw new Error({hatayeri:"MONGO // getHazirlananMetrajlar // ", error});
  }



};
