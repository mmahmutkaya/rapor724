exports = async function ({
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

  const currentTime = new Date()
  const collection_Firmalar = context.services.get("mongodb-atlas").db("rapor724_v2").collection("firmalar")



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


    const firmalar_byUser = await collection_Firmalar.find({ name: firmaName, "yetkiliKisiler.email": userEmail }).toArray()
    let isExist
    firmalar_byUser.map(firma => {
      firma.yetkiliKisiler.find(personel => personel.email == userEmail && personel.yetki == "owner") ? isExist = true : null
    })
    if (isExist && !errorObject.firmaNameError) {
      errorObject.firmaNameError = "Bu isimde firmanız mevcut"
    }

    // VALIDATE KONTROL
    if (Object.keys(errorObject).length > 0) return { errorObject }



    const pozMetrajTipleri = [
      { id: "standartMetrajSayfasi", name: "Standart Metraj Sayfası", birimId: "" },
      { id: "insaatDemiri", name: "İnşaat Demiri", birimId: "ton" },
    ]



    // const pozBasliklari = [
    //   { _id: new BSON.ObjectId(), platform: "web", sira: 1, referans: "pozNo", goster: true, sabit: true, genislik: 7, paddingInfo: "0px 1rem 0px 0px", yatayHiza: "center", name: "Poz No", dataType: "metin" },
    //   { _id: new BSON.ObjectId(), platform: "web", sira: 2, referans: "name", goster: true, sabit: true, genislik: 20, paddingInfo: "0px 1rem 0px 0px", yatayHiza: "center", name: "Poz İsmi", dataType: "metin" },
    // ]


    // const metrajYapabilenler = [
    //   {
    //     "harf": "A",
    //     _userId
    //   }
    // ]

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



    // const mahalBasliklari = [
    //   { _id: new BSON.ObjectId(), sira: 1, referans: "kod", goster: true, sabit: true, genislik: 7, paddingInfo: "0px 1rem 0px 0px", yatayHiza: "center", name: "Mahal Kod", dataType: "metin" },
    //   { _id: new BSON.ObjectId(), sira: 2, referans: "name", goster: true, sabit: true, genislik: 20, paddingInfo: "0px 1rem 0px 0px", yatayHiza: "center", name: "Mahal İsmi", dataType: "metin" },
    // ]


    // const mahalBirimleri = [
    //   { id: "mt", name: "mt" },
    //   { id: "m2", name: "m2" },
    //   { id: "m3", name: "m3" },
    //   { id: "ad", name: "ad" },
    //   { id: "set", name: "set" },
    //   { id: "tl", name: "TL" },
    //   { id: "usd", name: "USD" },
    //   { id: "eur", name: "EUR" },
    //   { id: "tarih", name: "TARİH" },
    // ]


    // const veriTurleri = [
    //   {
    //     "id": "sayi",
    //     "name": "SAYI"
    //   },
    //   {
    //     "id": "tarih",
    //     "name": "TARİH"
    //   },
    //   {
    //     "id": "metin",
    //     "name": "METİN"
    //   }
    // ]

    // const haneSayilari = [
    //   {
    //     "id": "0",
    //     "name": "0"
    //   },
    //   {
    //     "id": "0,0",
    //     "name": "0,0"
    //   },
    //   {
    //     "id": "0,00",
    //     "name": "0,00"
    //   },
    //   {
    //     "id": "0,000",
    //     "name": "0,000"
    //   },
    //   {
    //     "id": "0,0000",
    //     "name": "0,0000"
    //   }
    // ]


    const newFirma = {
      name: firmaName,
      // wbs: [], // henüz herhangi bir başlık yok fakat yok ama bu property şimdi olmazsa ilk wbs kaydında bir hata yaşıyoruz
      // lbs: [], // henüz herhangi bir başlık yok fakat yok ama bu property şimdi olmazsa ilk wbs kaydında bir hata yaşıyoruz
      pozMetrajTipleri,
      pozBirimleri,
      "yetkililer.owners":[{email:userEmail}] ,
      createdBy: userEmail,
      createdAt: currentTime,
      isDeleted: false
    }

    const resultNewFirma = await collection_Firmalar.insertOne(newFirma)

    return resultNewFirma;

  } catch (err) {
    throw new Error("MONGO // collection_firmalar // " + functionName + " // " + err.message);
  }


};