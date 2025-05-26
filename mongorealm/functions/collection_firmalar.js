exports = async function ({
  functionName,
  firmaName,
  _firmaId
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

  const currentTime = new Date()
  const collection_Firmalar = context.services.get("mongodb-atlas").db("rapor724_v2").collection("firmalar");
  const collection_Projects = context.services.get("mongodb-atlas").db("rapor724_v2").collection("projects");



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
      if (Object.keys(errorObject).length > 0) return { errorObject }


      let isExist = false
      const foundFirmalar = await collection_Firmalar.find({ name: firmaName, "kisiler.email": userEmail }).toArray()
      foundFirmalar.map(firma => {
        firma.kisiler.find(personel => personel.email == userEmail && personel.yetki == "owner") ? isExist = true : null
      })
      if (isExist && !errorObject.firmaNameError) {
        errorObject.firmaNameError = "Bu isimde firmanız mevcut"
      }

      // VALIDATE KONTROL
      if (Object.keys(errorObject).length > 0) return { errorObject }




      const newFirma = {
        name: firmaName,
        // wbs: [], // henüz herhangi bir başlık yok fakat yok ama bu property şimdi olmazsa ilk wbs kaydında bir hata yaşıyoruz
        // lbs: [], // henüz herhangi bir başlık yok fakat yok ama bu property şimdi olmazsa ilk wbs kaydında bir hata yaşıyoruz
        yetkiliKisiler: [{ email: userEmail, yetki: "owner" }],
        createdBy: userEmail,
        createdAt: currentTime,
        isDeleted: false
      }

      const resultNewFirma = await collection_Firmalar.insertOne(newFirma)

      return resultNewFirma;

    } catch (err) {
      throw new Error("MONGO // collection_firmalar // " + functionName + " // " + err.message);
    }
  }





  if (functionName == "getFirmalarimNames") {
    try {
      const firmalarim = await collection_Firmalar.find({ "yetkiliKisiler.email": userEmail }, { name: 1 }).toArray();
      return firmalarim;
    } catch (err) {
      throw new Error("MONGO // collection_firmalar // " + functionName + " // " + err.message);
    }
  }





  if (functionName == "getUserFirma") {
    try {
      let firma = await collection_Firmalar.findOne({ "_id": _firmaId, "yetkiliKisiler.email": userEmail });
      const firmaProject = await collection_Projects.findOne({ name: firma._id.toString(), isDeleted: false })
      firma.project = firmaProject
      return firma;
    } catch (err) {
      throw new Error("MONGO // collection_firmalar // " + functionName + " // " + err.message);
    }
  }




  return "MONGO // collection_firmalar // Herhangi bir functionName içine düşmedi"

};