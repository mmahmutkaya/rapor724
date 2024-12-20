exports = async function(user){

  const userId = user.id
  const email = user.data.email

  
  // maile gidecek kodu db ye kaydetme
  let resultdbKayit
  try {
    const collection_Users = context.services.get("mongodb-atlas").db("rapor724_v2").collection("users")
    resultMongo = await collection_Users.updateOne(
      { email },
      { $set: { userId } },
      { upsert: true }
    );
    resultdbKayit = {ok:true, yer:"maile gidecek kodu db ye kaydetme", mesaj:"kod db ye kaydedildi", resultMongo }
  } catch (err) {
    throw new Error({ok:false, hataYeri:"maile gidecek kodu db ye kaydetme", hataMesaj:err.message})
  }

  return resultdbKayit
  
};