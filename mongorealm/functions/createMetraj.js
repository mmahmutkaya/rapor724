exports = async function ({ projectId, newMetrajName, newMetrajUnit }) {

  // gelen verileri ikiye ayırabiliriz, 1-form verisinden önceki ana veriler  2-form verileri


  // 1 de hata varsa hata ile durdurulur
  // 1 tamam - 2 de hata varsa - form hata objesi gönderilir, formun ilgili alanlarında hata gösterilebilir

  // 2 - yukarıda açıklandı

  if (!projectId) throw new Error("MONGO // createMetraj // Proje Id -- sorguya gönderilmemiş, lütfen Rapor7/24 ile irtibata geçiniz. ")

  let _projectId
  try {
    if (typeof projectId == "string") {
      _projectId = new BSON.ObjectId(projectId)
    } else {
      _projectId = projectId
    }
  } catch (err) {
    throw new Error("MONGO // createMetraj --  " + "MONGO // createMetraj -- sorguya gönderilen --projectId-- türü doğru değil, lütfen Rapor7/24 ile irtibata geçiniz.")
  }
  if (typeof _projectId != "object") throw new Error("MONGO // createMetraj --  " + "MONGO // createMetraj -- sorguya gönderilen --projectId-- türü doğru değil, lütfen Rapor7/24 ile irtibata geçiniz. ")



  const errorFormObj = {}


  if (typeof newMetrajName != "string") !errorFormObj.newMetrajName ? errorFormObj.newMetrajName = "MONGO // createMetraj --  newMetrajName -- sorguya, string formatında gönderilmemiş, lütfen Rapor7/24 ile irtibata geçiniz. " : null
  newMetrajName = await context.functions.execute("functions_deleteLastSpace", newMetrajName)
  // if(!newMetrajName.length) throw new Error("MONGO // createMetraj --  newMetrajName sorguya, gönderilmemiş, lütfen Rapor7/24 ile irtibata geçiniz. ")
  if (!newMetrajName.length) !errorFormObj.newMetrajName ? errorFormObj.newMetrajName = "MONGO // createMetraj --  newMetrajName -- sorguya, gönderilmemiş, lütfen Rapor7/24 ile irtibata geçiniz." : null
  if (newMetrajName.length && newMetrajName.length < 3) !errorFormObj.newMetrajName ? errorFormObj.newMetrajName = "MONGO // createMetraj --  newMetrajName -- 3 haneden az" : null

  if (typeof newMetrajUnit != "string") !errorFormObj.newMetrajUnit ? errorFormObj.newMetrajUnit = "MONGO // createMetraj -- newMetrajUnit -- sorguya, string formatında gönderilmemiş, lütfen Rapor7/24 ile irtibata geçiniz. " : null
  newMetrajUnit = await context.functions.execute("functions_deleteLastSpace", newMetrajUnit)
  // if(!newMetrajUnit.length) throw new Error("MONGO // createMetraj -- newMetrajUnit sorguya, gönderilmemiş, lütfen Rapor7/24 ile irtibata geçiniz. ")
  if (!newMetrajUnit.length) !errorFormObj.newMetrajUnit ? errorFormObj.newMetrajUnit = "MONGO // createMetraj -- newMetrajUnit -- sorguya, gönderilmemiş, lütfen Rapor7/24 ile irtibata geçiniz." : null

  if (Object.keys(errorFormObj).length) return ({ errorFormObj })


  const user = context.user
  const _userId = new BSON.ObjectId(user.id)
  const mailTeyit = user.custom_data.mailTeyit
  if (!mailTeyit) throw new Error("MONGO // createMetraj --  Öncelikle üyeliğinize ait mail adresinin size ait olduğunu doğrulamalısınız, tekrar giriş yapmayı deneyiniz veya bizimle iletişime geçiniz.")


  const collection_Projects = context.services.get("mongodb-atlas").db("rapor724_v2").collection("projects")

  let project = await collection_Projects.findOne({ _id: _projectId, members: _userId, isDeleted: false })
  if (!project) throw new Error("MONGO // createMetraj // Poz eklemek istediğiniz proje sistemde bulunamadı, lütfen sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ileirtibata geçiniz.")



  // isim benzerliği kontrolü
  if (Object.keys(project).find(key => key === "metrajlar")) {
    if (project.metrajlar.length > 0) {
      if (project.metrajlar.find(metraj => metraj.name === newMetrajName)) {
        !errorFormObj.newMetrajName ? errorFormObj.newMetrajName = "Bu metraj ismi sistemde kayıtlı" : null
      }
    }
  }
  if (Object.keys(errorFormObj).length) return ({ errorFormObj })

  // metraj create

  let newMetraj = {
    _id: BSON.ObjectId(),
    _projectId,
    name: newMetrajName,
    unit: newMetrajUnit,
  }

  let metrajlar = project.metrajlar
  
  let metrajlar2 = metrajlar ? [...metrajlar, newMetraj] : [newMetraj]

  await collection_Projects.updateOne(
    { _id: _projectId }, // Query for the user object of the logged in user
    { $set: { metrajlar: metrajlar2 } },
  );

  // await collection_Projects.updateOne(
  //   { _id:_projectId }, // Query for the user object of the logged in user
  //   { $set: {"wbs.$[elem].includesPoz":true} },
  //   { arrayFilters: [ { "elem.wbs": _wbsId } ] , upsert:true }
  // );

  let newProject = { ...project, metrajlar: metrajlar2 }

  return ({ newMetraj, newProject })

}




