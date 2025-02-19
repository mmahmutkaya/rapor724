exports = async function ({
  functionName,
  _firmaId,
  projectName
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
  const collection_Projeler = context.services.get("mongodb-atlas").db("rapor724_v2").collection("projeler");



  if (functionName == "createFirmaProject") {
    try {
      
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



      const mahalBasliklari = [
        { _id: new BSON.ObjectId(), sira: 1, referans: "kod", goster: true, sabit: true, genislik: 7, paddingInfo: "0px 1rem 0px 0px", yatayHiza: "center", name: "Mahal Kod", dataType: "metin" },
        { _id: new BSON.ObjectId(), sira: 2, referans: "name", goster: true, sabit: true, genislik: 20, paddingInfo: "0px 1rem 0px 0px", yatayHiza: "center", name: "Mahal İsmi", dataType: "metin" },
      ]


      const mahalBirimleri = [
        { id: "mt", name: "mt" },
        { id: "m2", name: "m2" },
        { id: "m3", name: "m3" },
        { id: "ad", name: "ad" },
        { id: "set", name: "set" },
        { id: "tl", name: "TL" },
        { id: "usd", name: "USD" },
        { id: "eur", name: "EUR" },
        { id: "tarih", name: "TARİH" },
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



      const metrajBasliklari = [
        {
          _id: new BSON.ObjectId(),
          sira: 1,
          referans: "miktar",
          goster: true,
          sabit: false,
          genislik: 10,
          paddingInfo: "0px 1rem 0px 0px",
          yatayHiza: "end",
          name: "Miktar",
          veriTuruId: "metin"
        }, {
          _id: new BSON.ObjectId(),
          sira: 2,
          referans: "birim",
          goster: true,
          sabit: false,
          genislik: 7,
          paddingInfo: "0px 1rem 0px 0px",
          yatayHiza: "center",
          name: "Birim",
          veriTuruId: "metin"
        }
      ]



      const project = {
        name: projectName,
        // wbs: [], // henüz herhangi bir başlık yok fakat yok ama bu property şimdi olmazsa ilk wbs kaydında bir hata yaşıyoruz
        // lbs: [], // henüz herhangi bir başlık yok fakat yok ama bu property şimdi olmazsa ilk wbs kaydında bir hata yaşıyoruz
        firmalar: [{ _id: _firmaId, yetki:"owner" }],
        kadro: [{ email: userEmail, yetki:"owner" }],
        metrajYapabilenler,
        veriTurleri,
        haneSayilari,
        pozBasliklari,
        mahalBasliklari,
        members: [_userId],
        membersA: [_userId],
        pozMetrajTipleri,
        pozBirimleri,
        mahalBirimleri,
        metrajBasliklari,
        createdBy: _userId,
        createdAt: currentTime,
        isDeleted: false
      }


      let errorObject = {}
      
      if (typeof firmaName != "string" && !errorObject.firmaNameError) {
        errorObject.firmaNameError = "Firma adı verisi 'yazı' türünde değil"
      }

      if (firmaName.length == 0 && !errorObject.firmaNameError) {
        errorObject.firmaNameError = "Firma adı verisi 'yazı' türünde değil"
      }

      if (firmaName.length < 3 && !errorObject.firmaNameError) {
        errorObject.firmaNameError = "Firma adı çok kısa"
      }

      // const firmalarimNames = await collection_Projeler.find({"firmalar._id":_firmaId}).toArray()
      // if (firmalarimNames?.length > 0  && !errorObject.firmaNameError) {
      //   firmalarimNames.map(firma => {
      //     if (firma.name == firmaName && !errorObject.firmaNameError) {
      //       errorObject.firmaNameError = "Bu isimde firmanız mevcut"
      //       return
      //     }
      //   })
      // }

     

      // let errorObject = {}
      
      // const currentTime = new Date()

      // if (typeof projectName != "string") {
      //   errorObject.projectNameError = "Proje adı girilmemiş"
      // }

      // if (projectName.length < 3) {
      //   errorObject.projectNameError = "Proje adı çok kısa"
      // }

      // const foundFirmaProjeleri = await collection_Projeler.find({"firmalar._id":_firmaId}).toArray()
      // foundFirmaProjeleri.map(proje => {
      //   if(proje.name == projectName) {
      //     errorObject.projectNameError = "Firmanın bu isimde projesi mevcut"
      //   }
      // })

      
      if(Object.keys(errorObject).length > 0) return {errorObject}
      const result = collection_Projeler.insertOne(project)
      return result

    } catch (err) {
      throw new Error("MONGO // collection_projeler // " + functionName + " // " + err.message);
    }
  }



  if (functionName == "getFirmaProjeleri") {
    try {
      const firmaProjeleri = await collection_Projeler.find({ "firmalar._id":_firmaId }, { name: 1 }).toArray();
      return firmaProjeleri;
    } catch (err) {
      throw new Error("MONGO // collection_projeler // " + functionName + " // " + err.message);
    }
  }

  return "MONGO // collection_firmalar // Herhangi bir functionName içine düşmedi"

};
