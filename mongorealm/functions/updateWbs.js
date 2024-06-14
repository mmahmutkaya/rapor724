exports = async function({projectId, wbsId, newWbsName, newWbsCodeName}){

  
  // aşağıdaki form verilerinden birinde hata tespit edilmişse
  // alt satırda oluşturulan errorFormObj objesine form verisi ile ilişkilendirilmiş  property oluşturulup, içine yazı yazılıyor
  // property isimleri yukarıda ilk satırda frontend den gelen verileri yakalarken kullanılanlar ile aynı 
  // fonksiyon returnü olarak errorFormObj objesi döndürülüyor, frontenddeki form ekranında form verisine ait ilgili alanda bu yazı gösteriliyor
  // form ile ilişkilendirilmiş ilgili alana ait bir ke hata yazısı yazılmışsa yani null değilse üstüne yazı yazılmıyor, ilk tespit edilen hata değiştirilmmeiş oluyor
  
  
  // form verileri sorgulamaları - aşağıda sistemde isim benzerliği var mı kontrolleri de yapılıyor, yine errorObject gönderiliyor
  
  const errorFormObj = {}
  
  
  //form verisi -- yukarıda  "" const errorFormObj = {} ""  yazan satırdan önceki açıklamaları oku
  typeof newWbsName != "string" && errorFormObj.newWbsName === null ?  errorFormObj.newWbsName = "MONGO // updateWbs --  newWbsName -- sorguya, string formatında gönderilmemiş, lütfen Rapor7/24 ile irtibata geçiniz. " : null
  newWbsName = await context.functions.execute("functions_deleteLastSpace", newWbsName)
  if(!newWbsName.length) !errorFormObj.newWbsName ?  errorFormObj.newWbsName = "MONGO // updateWbs --  newWbsName -- sorguya, gönderilmemiş, lütfen Rapor7/24 ile irtibata geçiniz." : null

  
  //form verisi -- yukarıda  "" const errorFormObj = {} ""  yazan satırdan önceki açıklamaları oku
  typeof newWbsCodeName != "string" && errorFormObj.newWbsCodeName === null ?  errorFormObj.newWbsCodeName = "MONGO // updateWbs --  newWbsCodeName -- sorguya, string formatında gönderilmemiş, lütfen Rapor7/24 ile irtibata geçiniz. " : null
  newWbsCodeName = await context.functions.execute("functions_deleteLastSpace", newWbsCodeName)
  !newWbsCodeName.length == 0 && errorFormObj.newWbsCodeName === null ?  errorFormObj.newWbsCodeName = "MONGO // updateWbs --  newWbsCodeName -- sorguya, gönderilmemiş, lütfen Rapor7/24 ile irtibata geçiniz." : null

  
  // form veri girişlerinden en az birinde hata tespit edildiği için form objesi dönderiyoruz, formun ilgili alanlarında gösterilecek
  // errorFormObj - aşağıda tekrar gönderiliyor
  if(Object.keys(errorFormObj).length) return ({errorFormObj})
  
  
  
  
  const user = context.user
  const _userId = new BSON.ObjectId(user.id)
  const mailTeyit = user.custom_data.mailTeyit
  if(!mailTeyit) throw new Error("MONGO // deleteWbs // Öncelikle üyeliğinize ait mail adresinin size ait olduğunu doğrulamalısınız, tekrar giriş yapmayı deneyiniz veya bizimle iletişime geçiniz.")
  
  
  // const _projectId = new BSON.ObjectId(projectId)
  let _projectId
  try {
    _projectId = new BSON.ObjectId(projectId)
  } catch(err){
    _projectId = projectId
  }
  
  const collection_Projects = context.services.get("mongodb-atlas").db("rapor724_v2").collection("projects")
  const project = await collection_Projects.findOne({_id:_projectId, members:_userId, isDeleted:false})
  
  if(!project) throw new Error("MONGO // deleteWbs // Proje bulunamadı")
  if(!project.wbs) throw new Error("MONGO // deleteWbs // Projeye ait WBS bulunamadı")
  
  
  let selectedWbs = project.wbs.find(item => item._id.toString() == wbsId.toString())
  
  if(!selectedWbs) {
    throw new Error("MONGO // deleteWbs // wbsId sistemde bulunamadı, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
  }
  
  
  let _wbs = project.wbs
  let _selectedWbs = selectedWbs


  let leftPart = _selectedWbs.code.substring(0, _selectedWbs.code.lastIndexOf("."))
  let level = _selectedWbs.code.split(".").length - 1
  let sortNumber = Number(_selectedWbs.code.split(".")[level])
  let longText = _selectedWbs.code


  
  // benzerlikler kontrolü
  _wbs.map(item => {
    let leftPart2 = item.code.substring(0, item.code.lastIndexOf("."))
    let level2 = item.code.split(".").length - 1
    let sortNumber2 = Number(item.code.split(".")[level2])
    let longText2 = item.code
    // aynı seviyede 
    if(leftPart2 === leftPart && level2 == level && sortNumber2 != sortNumber){
      item.name === newWbsName && !errorFormObj.newWbsName ? errorFormObj.newWbsName = "Aynı seviyede bu isim mevcut" : null
      item.codeName === newWbsCodeName && !errorFormObj.newWbsCodeName ? errorFormObj.newWbsCodeName = "Aynı seviyede bu kod ismi mevcut" : null
    }
  })
  // açıklamalar yukarıda
  if(Object.keys(errorFormObj).length) {
    return ({errorFormObj})
  }
    
  
  let newWbsArray = await project.wbs.map(item => {
    if(item._id.toString() === wbsId.toString()) {
      return {...item, name:newWbsName, codeName:newWbsCodeName}
    } else {
      return item
    }
  })
  
  const result = await collection_Projects.updateOne(
    { _id:_projectId }, // Query for the user object of the logged in user
    { $set: {wbs:newWbsArray} }, // Set the logged in user's favorite color to purple
    // { "$push": { "wbs": newWbsItem  } }
    // { upsert: true }
  );
    
  return {project:{...project, wbs:newWbsArray},bilgi:null}
    
    

};