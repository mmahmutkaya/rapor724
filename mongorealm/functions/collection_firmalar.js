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

      let errorObject = {}
      
      if (typeof firmaName != "string" && !errorObject.firmaNameError) {
         errorObject.firmaNameError = "Firma adı verisi 'yazı' türünde değil"
      }
      
      if (firmaName.length == 0 && !errorObject.firmaNameError) {
        errorObject.firmaNameError = "Firma adı girilmemiş"
      }
      
      if (firmaName.length < 3 && !errorObject.firmaNameError) {
        errorObject.firmaNameError = "Firma adı çok kısa"
      }
      
      // ARA VALIDATE KONTROL - VALIDATE HATA VARSA BOŞUNA DEVAM EDİP AŞAĞIDAKİ SORGUYU YAPMASIN
      if(Object.keys(errorObject).length > 0) return {errorObject}
      
      
      let isExist = false
      const foundFirmalar = await collection_Firmalar.find({ name: firmaName, "personeller.email": userEmail }).toArray()
      foundFirmalar.map(firma => {
        firma.personeller.find(personel => personel.email == userEmail && personel.yetki == "owner") ? isExist = true : null
      })
      if (isExist && !errorObject.firmaNameError) {
        errorObject.firmaNameError = "Bu isimde firmanız mevcut"
      }
      
      // VALIDATE KONTROL
      if(Object.keys(errorObject).length > 0) return {errorObject}
          
      const result = await collection_Firmalar.insertOne({ name: firmaName, personeller: [{ email: userEmail, yetki: "owner" }] })
      return result;

    } catch (err) {
      throw new Error("MONGO // collection_firmalar // createFirma // " + err.message);
    }
  }



  if (functionName == "getFirmalarimNames") {
    try {
      const firmalarim = await collection_Firmalar.find({ "personeller.email": userEmail,"personeller.yetki": "owner" }, { name: 1 }).toArray();
      return firmalarim;
    } catch (err) {
      throw new Error("MONGO // collection_firmalar // getFirmalarNames // " + err.message);
    }
  }

  return "MONGO // collection_firmalar // Herhangi bir functionName içine düşmedi"

};