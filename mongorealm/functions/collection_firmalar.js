exports = async function ({ functionName }) {
  
  const user = context.user;
  const _userId = new BSON.ObjectId(user.id);
  const userEmail = context.user.data.email;

  const mailTeyit = user.custom_data.mailTeyit;
  if (!mailTeyit)
    throw new Error(
      "MONGO // collection_firmalar // Öncelikle üyeliğinize ait mail adresinin size ait olduğunu doğrulamalısınız, tekrar giriş yapmayı deneyiniz veya bizimle iletişime geçiniz."
    );

  if (functionName == "getFirmalarNames") {
    try {
      const collection_Firmalar = context.services.get("mongodb-atlas").db("rapor724_v2_firmalar").collection(userEmail);
      const firmalar = await collection_Firmalar.find({}, { name: 1 }).toArray();
      return firmalar;
    } catch (err) {
      throw new Error("MONGO // collection_firmalar // " + err.message);
    }
  }

  return "MONGO // collection_firmalar // Herhangi bir functionName içine düşmedi"
  
};
