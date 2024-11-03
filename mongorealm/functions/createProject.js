exports = async function ({ name }) {

  const user = context.user
  const _userId = new BSON.ObjectId(user.id)

  const mailTeyit = user.custom_data.mailTeyit
  if (!mailTeyit) throw new Error("MONGO // createProject // Öncelikle üyeliğinize ait mail adresinin size ait olduğunu doğrulamalısınız, tekrar giriş yapmayı deneyiniz veya bizimle iletişime geçiniz.")


  const currentTime = new Date()

  if (typeof name != "string") throw new Error("MONGO // createProject // Proje adı yazılmamış")

  if (name.length < 3) throw new Error("MONGO // createProject // Proje adı çok kısa")


  const pozMetrajTipleri = [
    { id: "standartMetrajSayfasi", name: "Standart Metraj Sayfası", birimId: "" },
    { id: "insaatDemiri", name: "İnşaat Demiri", birimId: "ton" },
  ]


  
  const pozBasliklari = [
    { _id: new BSON.ObjectId(), platform:"web", sira: 1, referans: "pozNo", goster: true, sabit: true, genislik: 7, paddingInfo: "0px 1rem 0px 0px", yatayHiza: "center", name: "Poz No", dataType: "metin" },
    { _id: new BSON.ObjectId(), platform:"web", sira: 2, referans: "name", goster: true, sabit: true, genislik: 20, paddingInfo: "0px 1rem 0px 0px", yatayHiza: "center", name: "Poz İsmi", dataType: "metin" },
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
    { id:  new BSON.ObjectId() , sira: 1, referans: "kod", goster: true, sabit: true, genislik: 7, paddingInfo: "0px 1rem 0px 0px", yatayHiza: "end", name: "Mahal Kod", dataType: "metin" },
    { id:  new BSON.ObjectId() , sira: 2, referans: "name", goster: true, sabit: true, genislik: 20, paddingInfo: "0px 1rem 0px 0px", yatayHiza: "end", name: "Mahal İsmi", dataType: "metin" },
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
      "id": new BSON.ObjectId(),
      "sira": 1,
      "referans": "miktar",
      "goster": true,
      "sabit": false,
      "genislik": 10,
      "paddingInfo": "0px 1rem 0px 0px",
      "yatayHiza": "end",
      "name": "Miktar",
      "veriTuruId": "metin"
    },
    {
      "id": new BSON.ObjectId(),
      "sira": 2,
      "referans": "birim",
      "goster": true,
      "sabit": false,
      "genislik": 7,
      "paddingInfo": "0px 1rem 0px 0px",
      "yatayHiza": "center",
      "name": "Birim",
      "veriTuruId": "metin"
    }
  ]



  const project = {
    name,
    // wbs: [], // henüz herhangi bir başlık yok fakat yok ama bu property şimdi olmazsa ilk wbs kaydında bir hata yaşıyoruz
    // lbs: [], // henüz herhangi bir başlık yok fakat yok ama bu property şimdi olmazsa ilk wbs kaydında bir hata yaşıyoruz
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

  try {

    const collection_Projects = context.services.get("mongodb-atlas").db("rapor724_v2").collection("projects");

    const result = collection_Projects.insertOne(project)

    return result

  } catch (err) {

    return { error: err.message };
  }

};

