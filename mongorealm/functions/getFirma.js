exports = async function ({
  _firmaId
}) {

  const user = context.user;
  const _userId = new BSON.ObjectId(user.id);
  const userEmail = context.user.data.email;

  const mailTeyit = user.custom_data.mailTeyit;
  if (!mailTeyit) {
    throw new Error(
      "MONGO // getFirma // Öncelikle üyeliğinize ait mail adresinin size ait olduğunu doğrulamalısınız, tekrar giriş yapmayı deneyiniz veya bizimle iletişime geçiniz."
    );
  }


  const collection_Firmalar = context.services.get("mongodb-atlas").db("rapor724_v2").collection("firmalar");


  try {
    let firma = await collection_Firmalar.findOne({ "_id": _firmaId });
    return firma;
  } catch (err) {
    throw new Error("MONGO // getFirma // " + err.message);
  }


};