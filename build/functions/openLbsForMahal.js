exports = async function({projectId,lbsId}){
  
  const user = context.user
  const _userId = new BSON.ObjectId(user.id)
  const mailTeyit = user.custom_data.mailTeyit
  if(!mailTeyit) throw new Error("MONGO // openLbsForMahal // Öncelikle üyeliğinize ait mail adresinin size ait olduğunu doğrulamalısınız, tekrar giriş yapmayı deneyiniz veya bizimle iletişime geçiniz.")


  // const _projectId = new BSON.ObjectId(projectId)
  let _projectId
  try {
    _projectId = new BSON.ObjectId(projectId)
  } catch(err){
    _projectId = projectId
  }
  
  const collection_Projects = context.services.get("mongodb-atlas").db("rapor724_v2").collection("projects")
  const project = await collection_Projects.findOne({_id:_projectId, members:_userId, isDeleted:false})
  
  
  if(!project) throw new Error("MONGO // openLbsForMahal // Proje bulunamadı")
  if(!project.lbs) throw new Error("MONGO // openLbsForMahal // Projeye ait Lbs bulunamadı")

  
  let lbs = project.lbs.find(item => item._id.toString() == lbsId.toString())
  if(!lbs) {
    throw new Error("MONGO // openLbsForMahal // lbsId sistemde bulunamadı, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
  }

  // lbsCode un alt seviyeleri mevcutsa direk mahal eklenemesin
  // burada includes kullanamayız çünkü içinde değil başında arıyoruz
  let text = lbs.code + "."
  if(project.lbs.find(item => item.code.indexOf(text) === 0)) {
    throw new Error("MONGO // openLbsForMahal // __mesajBaslangic__ Alt başlığı bulunan başlıklar mahal eklemeye açılamaz. __mesajBitis__") 
  }
  


  try {
  
    const newLbsArray = project.lbs.map(item => {
      if(item.code === lbs.code) {
        return {...item, openForMahal:true}
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
    return {error: err.message}
  }
    


};