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
  // const collection_Projects = context.services.get("mongodb-atlas").db("rapor724_v2").collection("projects");



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
      const foundFirmalar = await collection_Firmalar.find({ name: firmaName, "personeller.email": userEmail }).toArray()
      foundFirmalar.map(firma => {
        firma.personeller.find(personel => personel.email == userEmail && personel.yetki == "owner") ? isExist = true : null
      })
      if (isExist && !errorObject.firmaNameError) {
        errorObject.firmaNameError = "Bu isimde firmanız mevcut"
      }

      // VALIDATE KONTROL
      if (Object.keys(errorObject).length > 0) return { errorObject }





      //  BAZI ŞABLON BİLGİLER
      const pozMetrajTipleri = [
        { id: "standartMetrajSayfasi", name: "Standart Metraj Sayfası", birimId: "" },
        { id: "insaatDemiri", name: "İnşaat Demiri", birimId: "ton" },
      ]


      const pozBasliklari = [
        { _id: new BSON.ObjectId(), platform: "web", sira: 1, referans: "pozNo", goster: true, sabit: true, genislik: 7, paddingInfo: "0px 1rem 0px 0px", yatayHiza: "center", name: "Poz No", dataType: "metin" },
        { _id: new BSON.ObjectId(), platform: "web", sira: 2, referans: "name", goster: true, sabit: true, genislik: 20, paddingInfo: "0px 1rem 0px 0px", yatayHiza: "center", name: "Poz İsmi", dataType: "metin" },
      ]

      const metrajYapabilenler = [
        {
          "harf": "A",
          _userId
        }
      ]

      const pozBirimleri = [
        { id: "mt", name: "mt" },
        { id: "m2", name: "m2" },
        { id: "m3", name: "m3" },
        { id: "kg", name: "kg" },
        { id: "ton", name: "ton" },
        { id: "ad", name: "ad" },
        { id: "set", name: "set" },
        { id: "sa", name: "sa" },
        { id: "gun", name: "gün" },
        { id: "hafta", name: "hafta" },
        { id: "ay", name: "ay" },
        { id: "yil", name: "yıl" },
      ]

      const veriTurleri = [
        {
          "id": "sayi",
          "name": "SAYI"
        },
        {
          "id": "tarih",
          "name": "TARİH"
        },
        {
          "id": "metin",
          "name": "METİN"
        }
      ]

      const haneSayilari = [
        {
          "id": "0",
          "name": "0"
        },
        {
          "id": "0,0",
          "name": "0,0"
        },
        {
          "id": "0,00",
          "name": "0,00"
        },
        {
          "id": "0,000",
          "name": "0,000"
        },
        {
          "id": "0,0000",
          "name": "0,0000"
        }
      ]

      //  POZ İÇİN BİLGİLER - BİTİŞ
      

      const newFirma = {
        name: firmaName,
        // wbs: [], // henüz herhangi bir başlık yok fakat yok ama bu property şimdi olmazsa ilk wbs kaydında bir hata yaşıyoruz
        // lbs: [], // henüz herhangi bir başlık yok fakat yok ama bu property şimdi olmazsa ilk wbs kaydında bir hata yaşıyoruz
        firmalar: [{ _id: _firmaId, yetki: "owner" }],
        kisiler: [{ email: userEmail, yetki: "owner" }],
        metrajYapabilenler,
        veriTurleri,
        haneSayilari,
        pozBasliklari,
        pozMetrajTipleri,
        pozBirimleri,
        createdBy: _userId,
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
      const firmalarim = await collection_Firmalar.find({ "personeller.email": userEmail, "personeller.yetki": "owner" }, { name: 1 }).toArray();
      return firmalarim;
    } catch (err) {
      throw new Error("MONGO // collection_firmalar // " + functionName + " // " + err.message);
    }
  }





  if (functionName == "getUserFirma") {
    try {
      let firma = await collection_Firmalar.findOne({ "_id": _firmaId, "personeller.email": userEmail });
      const firmaProject = await collection_Projects.findOne({ name: firma._id.toString(), isDeleted: false })
      firma.project = firmaProject
      return firma;
    } catch (err) {
      throw new Error("MONGO // collection_firmalar // " + functionName + " // " + err.message);
    }
  }




  return "MONGO // collection_firmalar // Herhangi bir functionName içine düşmedi"

};