exports = async function ({ _projectId, functionName, baslikId }) {

  const user = context.user
  const _userId = new BSON.ObjectId(user.id)
  const mailTeyit = user.custom_data.mailTeyit
  if (!mailTeyit) throw new Error("MONGO // updateCustomSettings --  Öncelikle üyeliğinize ait mail adresinin size ait olduğunu doğrulamalısınız, tekrar giriş yapmayı deneyiniz veya bizimle iletişime geçiniz.")



  // validation control - poz başlık - projeId bilgisi
  // form alanına değil - direkt ekrana uyarı veren hata - (fonksiyon da durduruluyor)
  if (typeof _projectId !== "object") {
    throw new Error("Poz kaydı için gerekli olan  'projectId' verisinde hata tespit edildi, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
  }

  // const collection_Projects = context.services.get("mongodb-atlas").db("rapor724_v2").collection("projects")

  // let isProject = await collection_Projects.findOne({ _id: _projectId, members: _userId, isDeleted: false })
  // isProject = { ...isProject }
  // if (!isProject) throw new Error("MONGO // updateCustomSettings // Poz başlığı eklemek istediğiniz proje sistemde bulunamadı, lütfen sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ileirtibata geçiniz.")




  const collection_Users = context.services.get("mongodb-atlas").db("rapor724_v2").collection("users")
  let result = "boş"

  const data = { _projectId, pozBasliklari: [{ baslikId, show: ["webPage_pozlar"] }] }

  if (functionName == "webPage_pozlar_show") {
    result = await collection_Users.updateOne(
      { userId: user.id },
      [
        {
          $set: {
            customProjectSettings: { $cond: [{ "$eq": ["$customProjectSettings", null] }, data, "başka"] }
          }
        }
      ],
    )
  }

  // if (functionName == "webPage_pozlar_show") {
  //   result = await collection_Users.updateOne(
  //     { userId: user.id },
  //     { $set:{

  //       $cond:[
  //         false,
  //         { $addToSet: { "customSettings.isProject.pozBasliklari.$[oneBaslik].show": "webPage_pozlar" } },
  //         {"customSettings.isProject.pozBasliklari":[{ "oneBaslik._projectId":_projectId,"oneBaslik.id": baslikId,"show":["webPage_pozlar"]}]}
  //       ]

  //     }
  //     },
  //     {
  //       arrayFilters: [{$and: [{ "oneBaslik._projectId":_projectId}, { "oneBaslik.id": baslikId }]}],
  //       upsert:true
  //     }
  //   )
  // }

  if (functionName == "webPage_pozlar_hide") {
    result = await collection_Users.updateOne(
      { _id: _userId },
      { $pull: { "customSettings.isProject.pozBasliklari.$[oneBaslik].show": "webPage_pozlar" } },
      { arrayFilters: [{ $and: [{ "oneBaslik._projectId": _projectId }, { "oneBaslik.id": baslikId }] }] }
      // { arrayFilters: [{ "oneBaslik.id": baslikId }]}
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


