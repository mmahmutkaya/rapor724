exports = async function ({
  functionName,
  firmaName
}) {

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

  
  
  if (functionName == "createFirma") {
    try {

      const foundFirmalar = await collection_Firmalar.find({ name: firmaName, "kullanicilar.email": userEmail }).toArray()

      let isExist = false
      foundFirmalar.map(firma => {
        firma.kullanicilar.find(kullanici => kullanici.email == userEmail && kullanici.yetki == "owner") ? isExist = true : null
      })
      if (isExist) {
        let errorObject = {
          firmaNameError:"Bu isimde firmanız mevcut"
        }
        let result = {errorObject}
        return result
      }

      const result = await collection_Firmalar.insertOne({ name: firmaName, kullanicilar: [{ email: userEmail, yetki: "owner" }] })
      return result;

    } catch (err) {
      throw new Error("MONGO // collection_firmalar // createFirma // " + err.message);
    }
  }



  if (functionName == "getFirmalarimNames") {
    try {
      const collection_Firmalar = context.services.get("mongodb-atlas").db("rapor724_v2").collection("firmalar");
      const firmalarim = await collection_Firmalar.find({ "kullanicilar.email": userEmail,"kullanicilar.yetki": "owner" }, { name: 1 }).toArray();
      return firmalarim;
    } catch (err) {
      throw new Error("MONGO // collection_firmalar // getFirmalarNames // " + err.message);
    }
  }

  return "MONGO // collection_firmalar // Herhangi bir functionName içine düşmedi"

};