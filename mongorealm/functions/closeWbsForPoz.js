exports = async function({projectId,wbsId}){
  
  const user = context.user
  const _userId = new BSON.ObjectId(user.id)
  const mailTeyit = user.custom_data.mailTeyit
  if(!mailTeyit) throw new Error("MONGO // closeForWbs // Öncelikle üyeliğinize ait mail adresinin size ait olduğunu doğrulamalısınız, tekrar giriş yapmayı deneyiniz veya bizimle iletişime geçiniz.")


  // const _projectId = new BSON.ObjectId(projectId)
  let _projectId
  try {
    _projectId = new BSON.ObjectId(projectId)
  } catch(err){
    _projectId = projectId
  }
  
  if(typeof _project === "object") throw new Error("MONGO // closeForWbs // Proje bulunamadı")
  
  
  const collection_Projects = context.services.get("mongodb-atlas").db("rapor724_v2").collection("projects")
  const project = await collection_Projects.findOne({_id:_projectId, isDeleted:false})
  
  if(!project) throw new Error("MONGO // closeForWbs // Proje bulunamadı")
  if(!project.wbs) throw new Error("MONGO // closeForWbs // Projeye ait WBS bulunamadı")



  let _wbsId
  try {
    _wbsId = new BSON.ObjectId(wbsId)
  } catch(err){
    _wbsId = wbsId
  }

  if(typeof _wbsId !== "object") throw new Error("MONGO // closeForWbs // -WbsId- Mongo Bson objectId formatında gönderilmemiş.")
  
  let theWbs = project.wbs.find(item => item._id.toString() == _wbsId.toString())
  if(!theWbs) throw new Error("MONGO // closeForWbs // Sorguya gönderilen wbsId sistemde bulunamadı, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
  
  // aşağıda pozlar collection da poz var mı diye sorgulama yapmaya gerek kalmadı
  if(theWbs.includesPoz) throw new Error("MONGO // closeForWbs // Seçili başlık altında kayıtlı pozlar mevcut olduğu için silinemez, öncelikle pozları silmeli ya da başka başlık altına taşımalısınız.")

  const collection_Pozlar = context.services.get("mongodb-atlas").db("rapor724_v2").collection("pozlar")
  const poz = await collection_Pozlar.findOne({_projectId, _wbsId, isDeleted:false})
  
  // wbs altına poz eklenmişse silinmesin, pozlara ulaşamayız
  if (poz) throw new Error("MONGO // closeForWbs // Seçili başlık altında kayıtlı pozlar mevcut olduğu için silinemez, öncelikle pozları silmeli ya da başka başlık altına taşımalısınız.")


  try {
  
    const newWbsArray = project.wbs.map(item => {
      if(item.code === theWbs.code) {
        return {...item, openForPoz:false}
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
    
    return {...project, wbs:newWbsArray}
    
  } catch (err) {
    throw new Error({error: err.message})
  }
    


};