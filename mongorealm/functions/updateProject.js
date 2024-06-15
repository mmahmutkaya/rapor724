exports = async function ({ _projectId, functionName, baslikId }) {

  const user = context.user
  const _userId = new BSON.ObjectId(user.id)
  const mailTeyit = user.custom_data.mailTeyit
  if (!mailTeyit) throw new Error("MONGO // updateProjectPozBaslik --  Öncelikle üyeliğinize ait mail adresinin size ait olduğunu doğrulamalısınız, tekrar giriş yapmayı deneyiniz veya bizimle iletişime geçiniz.")



  // validation control - poz başlık - projeId bilgisi
  // form alanına değil - direkt ekrana uyarı veren hata - (fonksiyon da durduruluyor)
  if (typeof _projectId !== "object") {
    throw new Error("Poz kaydı için gerekli olan  'projectId' verisinde hata tespit edildi, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
  }

  const collection_Projects = context.services.get("mongodb-atlas").db("rapor724_v2").collection("projects")

  let isProject = await collection_Projects.findOne({ _id: _projectId, members: _userId, isDeleted: false })
  isProject = { ...isProject }
  if (!isProject) throw new Error("MONGO // updateProjectPozBaslik // Poz başlığı eklemek istediğiniz proje sistemde bulunamadı, lütfen sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ileirtibata geçiniz.")




  let result = "boş"
  
  if (functionName == "webPage_pozlar_show") {
    result = await collection_Projects.updateOne(
      { _id: _projectId },
      { $addToSet: { "pozBasliklari.$[oneBaslik].show": "webPage_pozlar" } },
      { arrayFilters: [{ "oneBaslik.id": baslikId }]}
    )
  }

  return result


  // newPozBaslik._id = result.insertedId

  // // lbs / poz başlığı "includesPoz:true" key.value değerine sahip değilse gerekli işlemi yapıyoruz


  // let newProject = {...isProject}

  // if (!theWbs.includesPoz) {

  //   await collection_Projects.updateOne(
  //     { _id: newPozBaslik._projectId, "lbs._id": newPozBaslik._lbsId },
  //     { $set: { "lbs.$.includesPoz": true } },
  //   );

  //   let newWbsArray = project.lbs.map(oneWbs => {

  //     if (oneWbs._id.toString() === newPoz._lbsId.toString()) {
  //       return { ...oneWbs, includesPoz: true }
  //     } else {
  //       return oneWbs
  //     }

  //   })

  //   newProject = { ...project, lbs: newLbsArray }

  // }

};


