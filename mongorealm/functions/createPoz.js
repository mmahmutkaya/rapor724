exports = async function (newPoz) {

  return {newPoz}


  const newPozError = {}

  // form validation - backend
  // hata varsa "isFormError" true olacak ve form verileri işlemi duracak
  let isFormError = false

  // form alanına değil - direkt ekrana uyarı veren hata - (fonksiyon da durduruluyor)
  if (typeof newPoz.projectId !== "object") {
    throw new Error("Poz kaydı için gerekli olan  'projectId' verisinde hata tespit edildi, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
  }

  // form alanına uyarı veren hatalar

  if (typeof newPoz.wbsId !== "object") {
    newPozError.wbsId = "Zorunlu"
  }

  if (typeof newPoz.pozNo !== "string") {
    newPozError.pozNo = "Zorunlu"
  }

  if (typeof newPoz.pozNo === "string") {
    if (newPoz.pozNo.length === 0) {
      newPozError.pozNo = "Zorunlu"
    }
  }

  if (typeof newPoz.pozNo === "string") {
    let minimumHaneSayisi = 1
    if (newPoz.pozNo.length > 0 && newPoz.pozNo.length < minimumHaneSayisi) {
      newPozError.pozNo = `${minimumHaneSayisi} haneden az olamaz`
    }
  }
  

  if (typeof newPoz.pozName !== "string") {
    newPozError.pozName = "Zorunlu"
  }

  if (typeof newPoz.pozName === "string") {
    if (newPoz.pozName.length === 0) {
      newPozError.pozName = "Zorunlu"
    }
  }

  if (typeof newPoz.pozName === "string") {
    let minimumHaneSayisi = 3
    if (newPoz.pozName.length > 0 && newPoz.pozName.length < minimumHaneSayisi) {
      newPozError.pozName = `${minimumHaneSayisi} haneden az olamaz`
    }
  }


  if (typeof newPoz.pozBirimId !== "string") {
    newPozError.pozBirimId = "Zorunlu"
  }

  // verilerde hata varsa
  if (Object.keys(newPozError).length) return ({ newPozError })



  const user = context.user
  const _userId = new BSON.ObjectId(user.id)
  const mailTeyit = user.custom_data.mailTeyit
  if (!mailTeyit) throw new Error("MONGO // createPoz --  Öncelikle üyeliğinize ait mail adresinin size ait olduğunu doğrulamalısınız, tekrar giriş yapmayı deneyiniz veya bizimle iletişime geçiniz.")


  const collection_Projects = context.services.get("mongodb-atlas").db("rapor724_v2").collection("projects")

  let project = await collection_Projects.findOne({ _id: newPoz.projectId, members: _userId, isDeleted: false })
  if (!project) throw new Error("MONGO // createPoz // Poz eklemek istediğiniz proje sistemde bulunamadı, lütfen sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ileirtibata geçiniz.")


  const collection_Pozlar = context.services.get("mongodb-atlas").db("rapor724_v2").collection("pozlar")
  let pozFinded = collection_Pozlar.findOne({$or: [{'pozNo': newPoz.pozNo}, {'name': newPoz.name}]})
  if (pozFinded.name == newPoz.name) {
    newPozError.pozName = `${pozFinded.name} isimli poz'da kullanılmış`
  }
  if (pozFinded.pozNo == newPoz.pozNo) {
    newPozError.pozNo = `${pozFinded.name} isimli poz'da kullanılmış`
  }
      
  if (Object.keys(newPozError).length) return ({ newPozError })



  let theWbs = project.wbs.find(item => item._id.toString() === newPoz.wbsId.toString())
  if (!theWbs) throw new Error("MONGO // createPoz // Poz eklemek istediğiniz poz başlığı sistemde bulunamadı, lütfen sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ileirtibata geçiniz.")
  if (!theWbs.openForPoz) throw new Error("MONGO // createPoz // Poz eklemek istediğiniz poz başlığı poz eklemeye açık değil, lütfen sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ileirtibata geçiniz.")


  // poz create
  const currentTime = new Date()

  // let newPoz
  newPoz = {
    _projectId: newPoz.projectId,
    _wbsId: newPoz.wbsId,
    pozNo:newPoz.pozNo,
    name: newPoz.pozName,
    birimId: newPoz.pozBirimId,
    createdBy: _userId,
    createdAt: currentTime,
    ilaveBilgiler:[],
    isDeleted: false
  }

  const result = await collection_Pozlar.insertOne(newPoz)

  newPoz._id = result.insertedId

  // wbs / poz başlığı "includesPoz:true" key.value değerine sahip değilse gerekli işlemi yapıyoruz

  return {newPoz}

  let newProject = project
  {}
  if (!theWbs.includesPoz) {

    await collection_Projects.updateOne(
      { _id: newPoz._projectId, "wbs._id": newPoz._wbsId },
      { $set: { "wbs.$.includesPoz": true } },
    );

    let newWbsArray = project.wbs.map(oneWbs => {

      if (oneWbs._id.toString() === newPoz._wbsId.toString()) {
        return { ...oneWbs, includesPoz: true }
      } else {
        return oneWbs
      }

    })

    newProject = { ...project, wbs: newWbsArray }

  }

  return ({ newPoz, newProject })

};


