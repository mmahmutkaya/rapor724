exports = async function ({
  _firmaId,
  projeName
}) {

  const user = context.user;
  const _userId = new BSON.ObjectId(user.id);
  const userEmail = context.user.data.email;

  const mailTeyit = user.custom_data.mailTeyit;
  if (!mailTeyit) {
    throw new Error(
      "MONGO // createProje // Öncelikle üyeliğinize ait mail adresinin size ait olduğunu doğrulamalısınız, tekrar giriş yapmayı deneyiniz veya bizimle iletişime geçiniz."
    );
  }



  const currentTime = new Date()
  const collection_Projeler = context.services.get("mongodb-atlas").db("rapor724_v2").collection("projeler")



  try {

    if (!_firmaId) {
      throw new Error(
        "MONGO // createProje // Projenin oluşturulacağı firma sorguya gönderilmemiş, sayfayı yenileyiniz, sorun devam ederse Rapor724 ile iletişime geçiniz."
      );
    }

    let errorObject = {}

    if (typeof projeName != "string" && !errorObject.projeNameError) {
      errorObject.projeNameError = "Proje adı verisi 'yazı' türünde değil"
    }

    if (projeName.length == 0 && !errorObject.projeNameError) {
      errorObject.projeNameError = "Proje adı girilmemiş"
    }

    if (projeName.length < 3 && !errorObject.projeNameError) {
      errorObject.projeNameError = "Proje adı çok kısa"

    }

    // ARA VALIDATE KONTROL - VALIDATE HATA VARSA BOŞUNA DEVAM EDİP AŞAĞIDAKİ SORGUYU YAPMASIN
    if (Object.keys(errorObject).length > 0) return { errorObject }


    const isExist = await collection_Projeler.findOne({ name: projeName, _firmaId })
    if (isExist && !errorObject.projeNameError) {
      errorObject.projeNameError = "Firmanın bu isimde projesi mevcut"
    }

    // VALIDATE KONTROL
    if (Object.keys(errorObject).length > 0) return { errorObject }



    const pozMetrajTipleri = [
      { id: "standartMetrajSayfasi", name: "Standart Metraj Sayfası", birimId: "" },
      { id: "insaatDemiri", name: "İnşaat Demiri", birimId: "ton" },
    ]



    const pozBasliklari = [
      { _id: new BSON.ObjectId(), platform: "web", sira: 1, referans: "pozNo", goster: true, sabit: true, genislik: 7, paddingInfo: "0px 1rem 0px 0px", yatayHiza: "center", name: "Poz No", dataType: "metin" },
      { _id: new BSON.ObjectId(), platform: "web", sira: 2, referans: "pozName", goster: true, sabit: true, genislik: 20, paddingInfo: "0px 1rem 0px 0px", yatayHiza: "center", name: "Poz İsmi", dataType: "metin" },
    ]


    const yetki =  {
      yetkililer: [
        { userEmail: "mmahmutkaya@gmail.com", userCode: "MaKA", isim: "Mahmut", soyisim: "KAYA" },
        { userEmail: "mbrkhncr@gmail.com", userCode: "BuHA", isim: "Burak", soyisim: "HANÇER" },
        { userEmail: "mahmutkaya999@gmail.com", userCode: "MaKA1", isim: "Mahir", soyisim: "KARADAĞ" }
      ],
      owners: [
        { userEmail: "mmahmutkaya@gmail.com" },
        { userEmail: "mbrkhncr@gmail.com" },
        { userEmail: "mahmutkaya999@gmail.com" }
      ],
      metrajYapabilenler: [
        { userEmail: "mahmutkaya999@gmail.com" },
        { userEmail: "mmahmutkaya@gmail.com" },
        { userEmail: "mbrkhncr@gmail.com" }
      ]
    }


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
      { _id: new BSON.ObjectId(), sira: 1, referans: "mahalNo", goster: true, sabit: true, genislik: 7, paddingInfo: "0px 1rem 0px 0px", yatayHiza: "center", name: "Mahal Kod", dataType: "metin" },
      { _id: new BSON.ObjectId(), sira: 2, referans: "mahalName", goster: true, sabit: true, genislik: 20, paddingInfo: "0px 1rem 0px 0px", yatayHiza: "center", name: "Mahal İsmi", dataType: "metin" },
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


    let newProje = {
      _firmaId,
      name: projeName,
      // wbs: [], // henüz herhangi bir başlık yok fakat yok ama bu property şimdi olmazsa ilk wbs kaydında bir hata yaşıyoruz
      // lbs: [], // henüz herhangi bir başlık yok fakat yok ama bu property şimdi olmazsa ilk wbs kaydında bir hata yaşıyoruz
      pozBasliklari,
      mahalBasliklari,
      yetki,
      pozMetrajTipleri,
      pozBirimleri,
      yetkiliKisiler: [{ email: userEmail, yetki: "owner" }],
      yetkiliFirmalar: [{ _firmaId, yetki: "owner" }],
      createdBy: userEmail,
      createdAt: currentTime,
      isDeleted: false
    }

    const result_newProje = await collection_Projeler.insertOne(newProje)

    // tüm proje verileri gönderilmiyor, gerekli veriler gönderiliyor
    newProje = {
      _id: result_newProje.insertedId,
      _firmaId,
      name: projeName,
      yetkiliFirmalar: [{ _firmaId, yetki: "owner" }]
    }

    return newProje;

  } catch (err) {
    throw new Error("MONGO // createProje // " + err.message);
  }


};