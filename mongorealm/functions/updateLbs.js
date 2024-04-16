exports = async function({projectId, lbsId, newLbsName, newLbsCodeName}){

  
  // aşağıdaki form verilerinden birinde hata tespit edilmişse
  // alt satırda oluşturulan errorFormObj objesine form verisi ile ilişkilendirilmiş  property oluşturulup, içine yazı yazılıyor
  // property isimleri yukarıda ilk satırda frontend den gelen verileri yakalarken kullanılanlar ile aynı 
  // fonksiyon returnü olarak errorFormObj objesi döndürülüyor, frontenddeki form ekranında form verisine ait ilgili alanda bu yazı gösteriliyor
  // form ile ilişkilendirilmiş ilgili alana ait bir ke hata yazısı yazılmışsa yani null değilse üstüne yazı yazılmıyor, ilk tespit edilen hata değiştirilmmeiş oluyor
  
  
  // form verileri sorgulamaları - aşağıda sistemde isim benzerliği var mı kontrolleri de yapılıyor, yine errorObject gönderiliyor
  
  const errorFormObj = {}
  
  
  //form verisi -- yukarıda  "" const errorFormObj = {} ""  yazan satırdan önceki açıklamaları oku
  typeof newLbsName != "string" && errorFormObj.newLbsName === null ?  errorFormObj.newLbsName = "MONGO // updateLbs --  newLbsName -- sorguya, string formatında gönderilmemiş, lütfen Rapor7/24 ile irtibata geçiniz. " : null
  newLbsName = await context.functions.execute("functions_deleteLastSpace", newLbsName)
  if(!newLbsName.length) !errorFormObj.newLbsName ?  errorFormObj.newLbsName = "MONGO // updateLbs --  newLbsName -- sorguya, gönderilmemiş, lütfen Rapor7/24 ile irtibata geçiniz." : null

  
  //form verisi -- yukarıda  "" const errorFormObj = {} ""  yazan satırdan önceki açıklamaları oku
  typeof newLbsCodeName != "string" && errorFormObj.newLbsCodeName === null ?  errorFormObj.newLbsCodeName = "MONGO // updateLbs --  newLbsCodeName -- sorguya, string formatında gönderilmemiş, lütfen Rapor7/24 ile irtibata geçiniz. " : null
  newLbsCodeName = await context.functions.execute("functions_deleteLastSpace", newLbsCodeName)
  !newLbsCodeName.length == 0 && errorFormObj.newLbsCodeName === null ?  errorFormObj.newLbsCodeName = "MONGO // updateLbs --  newLbsCodeName -- sorguya, gönderilmemiş, lütfen Rapor7/24 ile irtibata geçiniz." : null

  
  // form veri girişlerinden en az birinde hata tespit edildiği için form objesi dönderiyoruz, formun ilgili alanlarında gösterilecek
  // errorFormObj - aşağıda tekrar gönderiliyor
  if(Object.keys(errorFormObj).length) return ({errorFormObj})
  
  
  
  
  const user = context.user
  const _userId = new BSON.ObjectId(user.id)
  const mailTeyit = user.custom_data.mailTeyit
  if(!mailTeyit) throw new Error("MONGO // deleteLbs // Öncelikle üyeliğinize ait mail adresinin size ait olduğunu doğrulamalısınız, tekrar giriş yapmayı deneyiniz veya bizimle iletişime geçiniz.")
  
  
  // const _projectId = new BSON.ObjectId(projectId)
  let _projectId
  try {
    _projectId = new BSON.ObjectId(projectId)
  } catch(err){
    _projectId = projectId
  }
  
  const collection_Projects = context.services.get("mongodb-atlas").db("rapor724_v2").collection("projects")
  const project = await collection_Projects.findOne({_id:_projectId, members:_userId, isDeleted:false})
  
  if(!project) throw new Error("MONGO // deleteLbs // Proje bulunamadı")
  if(!project.lbs) throw new Error("MONGO // deleteLbs // Projeye ait Lbs bulunamadı")
  
  
  let selectedLbs = project.lbs.find(item => item._id.toString() == lbsId.toString())
  
  if(!selectedLbs) {
    throw new Error("MONGO // deleteLbs // lbsId sistemde bulunamadı, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
  }
  
  
  let _lbs = project.lbs
  let _selectedLbs = selectedLbs


  let leftPart = _selectedLbs.code.substring(0, _selectedLbs.code.lastIndexOf("."))
  let level = _selectedLbs.code.split(".").length - 1
  let sortNumber = Number(_selectedLbs.code.split(".")[level])
  let longText = _selectedLbs.code


  
  // benzerlikler kontrolü
  _lbs.map(item => {
    let leftPart2 = item.code.substring(0, item.code.lastIndexOf("."))
    let level2 = item.code.split(".").length - 1
    let sortNumber2 = Number(item.code.split(".")[level2])
    let longText2 = item.code
    // aynı seviyede 
    if(leftPart2 === leftPart && level2 == level && sortNumber2 != sortNumber){
      item.name === newLbsName && !errorFormObj.newLbsName ? errorFormObj.newLbsName = "Aynı seviyede bu isim mevcut" : null
      item.codeName === newLbsCodeName && !errorFormObj.newLbsCodeName ? errorFormObj.newLbsCodeName = "Aynı seviyede bu kod ismi mevcut" : null
    }
  })
  // açıklamalar yukarıda
  if(Object.keys(errorFormObj).length) {
    return ({errorFormObj})
  }
    
  
  let newLbsArray = await project.lbs.map(item => {
    if(item._id.toString() === lbsId.toString()) {
      return {...item, name:newLbsName, codeName:newLbsCodeName}
    } else {
      return item
    }
  })
  
  const result = await collection_Projects.updateOne(
    { _id:_projectId }, // Query for the user object of the logged in user
    { $set: {lbs:newLbsArray} }, // Set the logged in user's favorite color to purple
    // { "$push": { "lbs": newLbsItem  } }
    // { upsert: true }
  );
    
  return {project:{...project, lbs:newLbsArray},bilgi:null}
    
    

};