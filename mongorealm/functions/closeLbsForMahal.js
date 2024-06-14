exports = async function({projectId,lbsId}){
  
  const user = context.user
  const _userId = new BSON.ObjectId(user.id)
  const mailTeyit = user.custom_data.mailTeyit
  if(!mailTeyit) throw new Error("MONGO // closeForLbs // Öncelikle üyeliğinize ait mail adresinin size ait olduğunu doğrulamalısınız, tekrar giriş yapmayı deneyiniz veya bizimle iletişime geçiniz.")


  // const _projectId = new BSON.ObjectId(projectId)
  let _projectId
  try {
    _projectId = new BSON.ObjectId(projectId)
  } catch(err){
    _projectId = projectId
  }
  
  if(typeof _project === "object") throw new Error("MONGO // closeForLbs // Proje bulunamadı")
  
  
  const collection_Projects = context.services.get("mongodb-atlas").db("rapor724_v2").collection("projects")
  const project = await collection_Projects.findOne({_id:_projectId, isDeleted:false})
  
  if(!project) throw new Error("MONGO // closeForLbs // Proje bulunamadı")
  if(!project.lbs) throw new Error("MONGO // closeForLbs // Projeye ait Lbs bulunamadı")



  let _lbsId
  try {
    _lbsId = new BSON.ObjectId(lbsId)
  } catch(err){
    _lbsId = lbsId
  }

  if(typeof _lbsId !== "object") throw new Error("MONGO // closeForLbs // -LbsId- Mongo Bson objectId formatında gönderilmemiş.")
  
  let theLbs = project.lbs.find(item => item._id.toString() == _lbsId.toString())
  if(!theLbs) throw new Error("MONGO // closeForLbs // Sorguya gönderilen lbsId sistemde bulunamadı, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
  
  // aşağıda mahaller collection da mahal var mı diye sorgulama yapmaya gerek kalmadı
  if(theLbs.includesMahal) throw new Error("MONGO // closeForLbs // Seçili başlık altında kayıtlı mahaller mevcut olduğu için silinemez, öncelikle mahalleri silmeli ya da başka başlık altına taşımalısınız.")

  const collection_Mahaller = context.services.get("mongodb-atlas").db("rapor724_v2").collection("mahaller")
  const mahal = await collection_Mahaller.findOne({_projectId, _lbsId, isDeleted:false})
  
  // lbs altına mahal eklenmişse silinmesin, mahallere ulaşamayız
  if (mahal) throw new Error("MONGO // closeForLbs // Seçili başlık altında kayıtlı mahaller mevcut olduğu için silinemez, öncelikle mahalleri silmeli ya da başka başlık altına taşımalısınız.")


  try {
  
    const newLbsArray = project.lbs.map(item => {
      if(item.code === theLbs.code) {
        return {...item, openForMahal:false}
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
    
    return {...project, lbs:newLbsArray}
    
  } catch (err) {
    throw new Error({error: err.message})
  }
    


};