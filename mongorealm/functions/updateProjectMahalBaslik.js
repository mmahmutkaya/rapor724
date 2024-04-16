exports = async function ({ _projectId, mahalBaslik }) {

  const user = context.user
  const _userId = new BSON.ObjectId(user.id)
  const mailTeyit = user.custom_data.mailTeyit
  if (!mailTeyit) throw new Error("MONGO // updateProjectMahalBaslik --  Öncelikle üyeliğinize ait mail adresinin size ait olduğunu doğrulamalısınız, tekrar giriş yapmayı deneyiniz veya bizimle iletişime geçiniz.")


  const collection_Projects = context.services.get("mongodb-atlas").db("rapor724_v2").collection("projects")

  let isProject = await collection_Projects.findOne({ _id: _projectId, members: _userId, isDeleted: false })
  isProject = { ...isProject }
  if (!isProject) throw new Error("MONGO // updateProjectMahalBaslik // Mahal başlığı eklemek istediğiniz proje sistemde bulunamadı, lütfen sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ileirtibata geçiniz.")



  // validation control - mahal başlık - projeId bilgisi
  // form alanına değil - direkt ekrana uyarı veren hata - (fonksiyon da durduruluyor)
  if (typeof _projectId !== "object") {
    throw new Error("Mahal kaydı için gerekli olan  'projectId' verisinde hata tespit edildi, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
  }



  const result = await collection_Projects.updateOne(
    { _id: _projectId },
    { $set: { "mahalBasliklari.$[oneBaslik]": { ...mahalBaslik } } },
    { arrayFilters: [{ "oneBaslik.id": mahalBaslik.id }], upsert: true }
  )

  return result


  // newMahalBaslik._id = result.insertedId

  // // lbs / mahal başlığı "includesMahal:true" key.value değerine sahip değilse gerekli işlemi yapıyoruz


  // let newProject = {...isProject}

  // if (!theWbs.includesMahal) {

  //   await collection_Projects.updateOne(
  //     { _id: newMahalBaslik._projectId, "lbs._id": newMahalBaslik._lbsId },
  //     { $set: { "lbs.$.includesMahal": true } },
  //   );

  //   let newWbsArray = project.lbs.map(oneWbs => {

  //     if (oneWbs._id.toString() === newMahal._lbsId.toString()) {
  //       return { ...oneWbs, includesMahal: true }
  //     } else {
  //       return oneWbs
  //     }

  //   })

  //   newProject = { ...project, lbs: newLbsArray }

  // }

};


