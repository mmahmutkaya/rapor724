exports = async function () {

  const user = context.user;
  const _userId = new BSON.ObjectId(user.id);
  const userEmail = context.user.data.email;

  const mailTeyit = user.custom_data.mailTeyit;
  if (!mailTeyit) {
    throw new Error(
      "MONGO // collection_firmalar // Öncelikle üyeliğinize ait mail adresinin size ait olduğunu doğrulamalısınız, tekrar giriş yapmayı deneyiniz veya bizimle iletişime geçiniz."
    );
  }


  const collection_Firmalar = context.services.get("mongodb-atlas").db("rapor724_v2").collection("firmalar");

  const firmalarNames_byUser = await collection_Firmalar.find({ "yetkiliKisiler.email": userEmail }, { name: 1, yetkiliKisiler: 1 }).toArray();
  return firmalarNames_byUser;

  

};