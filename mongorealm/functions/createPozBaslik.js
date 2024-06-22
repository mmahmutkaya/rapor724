exports = async function (newPozBaslik, _projectId) {


  const user = context.user
  const _userId = new BSON.ObjectId(user.id)
  const mailTeyit = user.custom_data.mailTeyit
  if (!mailTeyit) throw new Error("MONGO // createPozBaslik --  Öncelikle üyeliğinize ait mail adresinin size ait olduğunu doğrulamalısınız, tekrar giriş yapmayı deneyiniz veya bizimle iletişime geçiniz.")


  const collection_Projects = context.services.get("mongodb-atlas").db("rapor724_v2").collection("projects")

  let isProject = await collection_Projects.findOne({ _id: _projectId, members: _userId, isDeleted: false })
  isProject = { ...isProject }
  if (!isProject) throw new Error("MONGO // createPozBaslik // Poz başlığı eklemek istediğiniz proje sistemde bulunamadı, lütfen sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ileirtibata geçiniz.")



  // veri düzeltme
  if (newPozBaslik.veriTuruId !== "sayi") {
    delete newPozBaslik["haneSayisiId"]
    delete newPozBaslik["birim"]
  }


  // form validation - backend

  const errorObj = {}


  // validation control - poz başlık - projeId bilgisi
  // form alanına değil - direkt ekrana uyarı veren hata - (fonksiyon da durduruluyor)
  if (typeof _projectId !== "object") {
    throw new Error("Poz kaydı için gerekli olan  'projectId' verisinde hata tespit edildi, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
  }



  // validation control - poz başlık - isim

  if (typeof newPozBaslik.name !== "string") {
    errorObj.name = "Zorunlu"
  }

  if (typeof newPozBaslik.name === "string") {
    if (newPozBaslik.name.length === 0) {
      errorObj.name = "Zorunlu"
    }
  }

  if (typeof newPozBaslik.name === "string") {
    let minimumHaneSayisi = 3
    if (newPozBaslik.name.length > 0 && newPozBaslik.name.length < minimumHaneSayisi) {
      errorObj.name = `${minimumHaneSayisi} haneden az olamaz`
    }
  }

  if (typeof newPozBaslik.name === "string") {
    if (isProject.pozBasliklari.find(item => item.name == newPozBaslik.name)) {
      errorObj.name = `Bu başlık kullanılmış`
    }
  }





  // validation control - poz başlık - veriTuruId

  if (typeof newPozBaslik.veriTuruId !== "string") {
    throw new Error("Poz başlık kaydı için gerekli olan 'veriTuruId' 'metin' ('string') değil, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
  }

  // validation control - poz başlık - veriTuruId
  if (!isProject.veriTurleri.find(item => item.id == newPozBaslik.veriTuruId)) {
    throw new Error("Poz başlık kaydı için gerekli olan 'veriTuruId' projede kayıtlı bulunamadı, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
  }


  // validation control - poz başlık - birim

  if (!(!newPozBaslik.birim || typeof newPozBaslik.birim == "string")) {
    throw new Error("Poz başlık kaydı için gerekli olan 'birim' verisi 'tanımsız' ('undefined') veya 'metin' ('string') değil, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
  }
  //
  if (typeof newPozBaslik.birim === "string") {
    let maksimumHaneSayisi = 10
    if (newPozBaslik.haneSayisiId.length > 0 && newPozBaslik.haneSayisiId.length > maksimumHaneSayisi) {
      errorObj.birim = `${maksimumHaneSayisi} haneden fazla olamaz`
    }
  }





  // validation control - poz başlık - haneSayisiId

  if (!(!newPozBaslik.haneSayisiId || typeof newPozBaslik.haneSayisiId == "string")) {
    throw new Error("Poz başlık kaydı için gerekli olan 'haneSayisiId' verisi 'tanımsız' ('undefined') olmalı veya 'metin' ('string') olmalı, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
  }

  if (typeof newPozBaslik.haneSayisiId === "string") {
    if (newPozBaslik.haneSayisiId.length > 0) {
      if (!isProject.haneSayilari.find(item => item.id == newPozBaslik.haneSayisiId)) {
        throw new Error("Poz başlık kaydı için gerekli olan 'haneSayisiId' projede kayıtlı bulunamadı, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
      }
    }
  }




  // gelen form verilerinde hata varsa durdur ve error object gönder - frontend tarafında formun ilgili alanında hata göstermek için
  if (Object.keys(errorObj).length) return ({ errorObj })



  // poz create
  const currentTime = new Date()
  

  // let maxId = 0
  let maxSira = 0
  isProject.pozBasliklari.map(item => {
    // item.id > maxId ? maxId = item.id : null
    item.sira > maxSira ? maxSira = item.sira : null
  })

  // let newPozBaslik
  newPozBaslik = {
    ...newPozBaslik,
    id: new BSON.ObjectId(),
    sira: maxSira + 1,
    createdBy: _userId,
    createdAt: currentTime,
    isDeleted: false,
    goster: false,
    sabit: false,
    genislik: 10,
    paddingInfo: "0px 1rem 0px 0px",
    yatayHiza: newPozBaslik.veriTuruId == "sayi" ? "end" : "center",
  }



  const result = await collection_Projects.updateOne(
    { _id: _projectId },
    { $push: { pozBasliklari: { ...newPozBaslik } } }
  )

  return newPozBaslik


  return ({ newPoz, newProject })

};


