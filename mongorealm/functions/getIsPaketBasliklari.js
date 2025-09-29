exports = async function ({_firmaId}) {

  const user = context.user;
  const _userId = new BSON.ObjectId(user.id);
  const userEmail = context.user.data.email;

  const mailTeyit = user.custom_data.mailTeyit;
  if (!mailTeyit) {
    throw new Error(
      "MONGO // getProjelerNames_byUser // Öncelikle üyeliğinize ait mail adresinin size ait olduğunu doğrulamalısınız, tekrar giriş yapmayı deneyiniz veya bizimle iletişime geçiniz."
    );
  }


  const collection_Projeler = context.services.get("mongodb-atlas").db("rapor724_v2").collection("projeler");

  const projelerNames_byFirma = await collection_Projeler.find({ _firmaId }, { name: 1, yetkiliKisiler: 1, yetkiliFirmalar:1 }).toArray();
  return projelerNames_byFirma;

  

};