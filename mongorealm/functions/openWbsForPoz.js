exports = async function({projectId,wbsId}){
  
  const user = context.user
  const _userId = new BSON.ObjectId(user.id)
  const mailTeyit = user.custom_data.mailTeyit
  if(!mailTeyit) throw new Error("MONGO // openWbsForPoz // Öncelikle üyeliğinize ait mail adresinin size ait olduğunu doğrulamalısınız, tekrar giriş yapmayı deneyiniz veya bizimle iletişime geçiniz.")


  // const _projectId = new BSON.ObjectId(projectId)
  let _projectId
  try {
    _projectId = new BSON.ObjectId(projectId)
  } catch(err){
    _projectId = projectId
  }
  
  const collection_Projects = context.services.get("mongodb-atlas").db("rapor724_v2").collection("projects")
  const project = await collection_Projects.findOne({_id:_projectId, members:_userId, isDeleted:false})
  
  
  if(!project) throw new Error("MONGO // openWbsForPoz // Proje bulunamadı")
  if(!project.wbs) throw new Error("MONGO // openWbsForPoz // Projeye ait WBS bulunamadı")

  
  let wbs = project.wbs.find(item => item._id.toString() == wbsId.toString())
  if(!wbs) {
    throw new Error("MONGO // openWbsForPoz // wbsId sistemde bulunamadı, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
  }

  // wbsCode un alt seviyeleri mevcutsa direk poz eklenemesin
  // burada includes kullanamayız çünkü içinde değil başında arıyoruz
  let text = wbs.code + "."
  if(project.wbs.find(item => item.code.indexOf(text) === 0)) {
    throw new Error("MONGO // openWbsForPoz // __mesajBaslangic__ Alt başlığı bulunan başlıklar poz eklemeye açılamaz. __mesajBitis__") 
  }
  


  try {
  
    const newWbsArray = project.wbs.map(item => {
      if(item.code === wbs.code) {
        return {...item, openForPoz:true}
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
    return {error: err.message}
  }
    


};