exports = async function (newMahal) {


  // veri düzeltme


  const newMahalError = {}

  // form validation - backend
  // hata varsa "isFormError" true olacak ve form verileri işlemi duracak
  let isFormError = false

  // form alanına değil - direkt ekrana uyarı veren hata - (fonksiyon da durduruluyor)
  if (typeof newMahal.projectId !== "object") {
    throw new Error("Mahal kaydı için gerekli olan  'projectId' verisinde hata tespit edildi, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
  }

  // form alanına uyarı veren hatalar

  if (typeof newMahal.lbsId !== "object") {
    newMahalError.lbsId = "Zorunlu"
  }


  if (typeof newMahal.mahalName !== "string") {
    newMahalError.mahalName = "Zorunlu"
  }

  if (typeof newMahal.mahalName === "string") {
    if (newMahal.mahalName.length === 0) {
      newMahalError.mahalName = "Zorunlu"
    }
  }

  if (typeof newMahal.mahalName === "string") {
    let minimumHaneSayisi = 3
    if (newMahal.mahalName.length > 0 && newMahal.mahalName.length < minimumHaneSayisi) {
      newMahalError.mahalName = `${minimumHaneSayisi} haneden az olamaz`
    }
  }


  // verilerde hata varsa
  if (Object.keys(newMahalError).length) return ({ newMahalError })



  const user = context.user
  const _userId = new BSON.ObjectId(user.id)
  const mailTeyit = user.custom_data.mailTeyit
  if (!mailTeyit) throw new Error("MONGO // createMahal --  Öncelikle üyeliğinize ait mail adresinin size ait olduğunu doğrulamalısınız, tekrar giriş yapmayı deneyiniz veya bizimle iletişime geçiniz.")


  const collection_Projects = context.services.get("mongodb-atlas").db("rapor724_v2").collection("projects")

  let project = await collection_Projects.findOne({ _id: newMahal.projectId, members: _userId, isDeleted: false })
  if (!project) throw new Error("MONGO // createMahal // Mahal eklemek istediğiniz proje sistemde bulunamadı, lütfen sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ileirtibata geçiniz.")

  let theLbs = project.lbs.find(item => item._id.toString() === newMahal.lbsId.toString())
  if (!theLbs) throw new Error("MONGO // createMahal // Mahal eklemek istediğiniz mahal başlığı sistemde bulunamadı, lütfen sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ileirtibata geçiniz.")
  if (!theLbs.openForMahal) throw new Error("MONGO // createMahal // Mahal eklemek istediğiniz mahal başlığı mahal eklemeye açık değil, lütfen sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ileirtibata geçiniz.")


  // mahal create
  const currentTime = new Date()

  // let newMahal
  newMahal = {
    _projectId: newMahal.projectId,
    _lbsId: newMahal.lbsId,
    name: newMahal.mahalName,
    kod: newMahal.mahalKod,
    ilaveBilgiler: [],
    createdBy: _userId,
    createdAt: currentTime,
    isDeleted: false
  }

  const collection_Mahaller = context.services.get("mongodb-atlas").db("rapor724_v2").collection("mahaller")
  const result = await collection_Mahaller.insertOne(newMahal)

  newMahal._id = result.insertedId

  // lbs / mahal başlığı "includesMahal:true" key.value değerine sahip değilse gerekli işlemi yapıyoruz


  let newProject = project

  if (!theLbs.includesMahal) {

    await collection_Projects.updateOne(
      { _id: newMahal._projectId, "lbs._id": newMahal._lbsId },
      { $set: { "lbs.$.includesMahal": true } },
    );

    let newLbsArray = project.lbs.map(oneLbs => {

      if (oneLbs._id.toString() === newMahal._lbsId.toString()) {
        return { ...oneLbs, includesMahal: true }
      } else {
        return oneLbs
      }

    })

    newProject = { ...project, lbs: newLbsArray }

  }

  return ({ newMahal, newProject })

};


