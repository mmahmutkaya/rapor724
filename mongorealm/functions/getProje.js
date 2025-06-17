exports = async function ({
  _projeId
}) {

  const user = context.user;
  const _userId = new BSON.ObjectId(user.id);
  const userEmail = context.user.data.email;

  const mailTeyit = user.custom_data.mailTeyit;
  if (!mailTeyit) {
    throw new Error(
      "MONGO // getProje // Öncelikle üyeliğinize ait mail adresinin size ait olduğunu doğrulamalısınız, tekrar giriş yapmayı deneyiniz veya bizimle iletişime geçiniz."
    );
  }


  const collection_Projeler = context.services.get("mongodb-atlas").db("rapor724_v2").collection("projeler");


  try {
    let proje = await collection_Projeler.findOne({ "_id": _projeId });
    return proje;
  } catch (err) {
    throw new Error("MONGO // getProje // " + err.message);
  }


};