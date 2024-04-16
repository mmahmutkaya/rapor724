exports = async function({projectId, lbsId, newMahalName, newMahalUnit}){
  
  // gelen verileri ikiye ayırabiliriz, 1-form verisinden önceki ana veriler  2-form verileri
  
  
  // 1 de hata varsa hata ile durdurulur
  // 1 tamam - 2 de hata varsa - form hata objesi gönderilir, formun ilgili alanlarında hata gösterilebilir
  
  // 2 - yukarıda açıklandı
  
  if(!projectId) throw new Error("MONGO // createMahal // Proje Id -- sorguya gönderilmemiş, lütfen Rapor7/24 ile irtibata geçiniz. ")
  
  let _projectId
  try {
    if(typeof projectId == "string"){
      _projectId = new BSON.ObjectId(projectId)
    } else {
      _projectId = projectId
    }
  } catch(err){
    throw new Error("MONGO // createMahal --  " + "MONGO // createMahal -- sorguya gönderilen --projectId-- türü doğru değil, lütfen Rapor7/24 ile irtibata geçiniz.")
  }
  if(typeof _projectId != "object") throw new Error("MONGO // createMahal --  " + "MONGO // createMahal -- sorguya gönderilen --projectId-- türü doğru değil, lütfen Rapor7/24 ile irtibata geçiniz. ")



  const errorFormObj = {}
  
  
  !lbsId && !errorFormObj.lbsId ? errorFormObj.lbsId = "Zorunlu" : null
  
  let _lbsId
  try {
    if(typeof lbsId == "string"){
      _lbsId = new BSON.ObjectId(lbsId)
    } else {
      _lbsId = lbsId
    }
  } catch(err){
    throw new Error("MONGO // createMahal -- sorguya gönderilen --lbsId--  türü doğru değil, lütfen Rapor7/24 ile irtibata geçiniz.")
  }
  
  if(typeof _lbsId !== "object")  throw new Error("MONGO // createMahal -- sorguya gönderilen --lbsId-- türü doğru değil, lütfen Rapor7/24 ile irtibata geçiniz.")

  if(typeof newMahalName != "string") errorFormObj.newMahalName === null ?  errorFormObj.newMahalName = "MONGO // createMahal --  newMahalName -- sorguya, string formatında gönderilmemiş, lütfen Rapor7/24 ile irtibata geçiniz. " : null
  newMahalName = await context.functions.execute("functions_deleteLastSpace", newMahalName)
  // if(!newMahalName.length) throw new Error("MONGO // createMahal --  newMahalName sorguya, gönderilmemiş, lütfen Rapor7/24 ile irtibata geçiniz. ")
  if(!newMahalName.length) !errorFormObj.newMahalName ?  errorFormObj.newMahalName = "MONGO // createMahal --  newMahalName -- sorguya, gönderilmemiş, lütfen Rapor7/24 ile irtibata geçiniz." : null
  if(newMahalName.length && newMahalName.length < 3) !errorFormObj.newMahalName ?  errorFormObj.newMahalName = "MONGO // createMahal --  newMahalName -- 3 haneden az" : null
  
  if(typeof newMahalUnit != "string") !errorFormObj.newMahalUnit ?  errorFormObj.newMahalUnit = "MONGO // createMahal -- newMahalUnit -- sorguya, string formatında gönderilmemiş, lütfen Rapor7/24 ile irtibata geçiniz. " : null
  newMahalUnit = await context.functions.execute("functions_deleteLastSpace", newMahalUnit)
  // if(!newMahalUnit.length) throw new Error("MONGO // createMahal -- newMahalUnit sorguya, gönderilmemiş, lütfen Rapor7/24 ile irtibata geçiniz. ")
  if(!newMahalUnit.length) !errorFormObj.newMahalUnit ?  errorFormObj.newMahalUnit = "MONGO // createMahal -- newMahalUnit -- sorguya, gönderilmemiş, lütfen Rapor7/24 ile irtibata geçiniz." : null

  if(Object.keys(errorFormObj).length) return ({errorFormObj})
  
  
  const user = context.user
  const _userId = new BSON.ObjectId(user.id)
  const mailTeyit = user.custom_data.mailTeyit
  if(!mailTeyit) throw new Error("MONGO // createMahal --  Öncelikle üyeliğinize ait mail adresinin size ait olduğunu doğrulamalısınız, tekrar giriş yapmayı deneyiniz veya bizimle iletişime geçiniz.")

  
  const collection_Projects = context.services.get("mongodb-atlas").db("rapor724_v2").collection("projects")
  
  let project = await collection_Projects.findOne({_id:_projectId, members:_userId, isDeleted:false})
  if(!project) throw new Error("MONGO // createMahal // Mahal eklemek istediğiniz proje sistemde bulunamadı, lütfen sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ileirtibata geçiniz.")
  
  let theLbs = project.lbs.find(item => item._id.toString() === _lbsId.toString())
  if(!theLbs) throw new Error("MONGO // createMahal // Mahal eklemek istediğiniz mahal başlığı sistemde bulunamadı, lütfen sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ileirtibata geçiniz.")
  if(!theLbs.openForMahal) throw new Error("MONGO // createMahal // Mahal eklemek istediğiniz mahal başlığı mahal eklemeye açık değil, lütfen sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ileirtibata geçiniz.")


  // mahal create
  const currentTime = new Date()
  
  let newMahal
  newMahal ={
    _projectId,
    _lbsId,
    name:newMahalName,
    unit:newMahalUnit,
    createdBy:_userId,
    createdAt:currentTime,
    isDeleted:false
  }
  const collection_Mahaller = context.services.get("mongodb-atlas").db("rapor724_v2").collection("mahaller")
  const result = await collection_Mahaller.insertOne(newMahal)
  
  newMahal._id = result.insertedId
  
  // lbs / mahal başlığı "includesMahal:true" key.value değerine sahip değilse gerekli işlemi yapıyoruz
  
  let newProject = project
  
  if(!theLbs.includesMahal) {
    
    let newLbsArray = project.lbs.map(item => {
      
      if(item._id.toString() === _lbsId.toString()) {
        return {...item, includesMahal:true}
      } else {
        return item
      }
    
    })
    
    newProject = {...project,lbs:newLbsArray}
    
    await collection_Projects.updateOne(
      { _id:_projectId }, // Query for the user object of the logged in user
      { $set: {lbs:newLbsArray} },
    );
    
    // await collection_Projects.updateOne(
    //   { _id:_projectId }, // Query for the user object of the logged in user
    //   { $set: {"lbs.$[elem].includesMahal":true} },
    //   { arrayFilters: [ { "elem.lbs": _lbsId } ] , upsert:true }
    // );
    
    
  }
    
  return ({newMahal, newProject})
  
  
};

  
