// exports = async function(user){

//   const userId = user.id
//   const email = user.data.email

  
//   // maile gidecek kodu db ye kaydetme
//   let resultdbKayit
//   try {
//     const collection_Users = context.services.get("mongodb-atlas").db("rapor724_v2").collection("users")
//     resultMongo = await collection_Users.updateOne(
//       { email },
//       { $set: { userId } },
//       { upsert: true }
//     );
//     resultdbKayit = {ok:true, yer:"maile gidecek kodu db ye kaydetme", mesaj:"kod db ye kaydedildi", resultMongo }
//   } catch (err) {
//     throw new Error({ok:false, hataYeri:"maile gidecek kodu db ye kaydetme", hataMesaj:err.message})
//   }

//   return resultdbKayit
  
// };


exports = async function(user) {
  const customUserDataCollection = context.services
    .get("mongodb-atlas")
    .db("myapp")
    .collection("users");
  try {
    await customUserDataCollection.insertOne({
      // Save the user's account ID to your configured user_id_field
      user_account_id: user.id,
      // Store any other user data you want
      favorite_color: "blue",
    });
  } catch (e) {
    console.error(`Failed to create custom user data document for user:${user.id}`);
    throw e
  }
}