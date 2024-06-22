exports = async function(){
  
  // if(typeof projectName != "string") throw new Error("MONGO // getProjectNames // sorguya gelen projectName string değil, bizimle iletişime geçiniz")
  // if(groupId.length != 24) throw new Error("MONGO // getProjectNames // sorguya gelen groupId 24 hane değil, bizimle iletişime geçiniz")
  
  // const _groupId = new BSON.ObjectId(groupId)
  
  const user = context.user
  const _userId = new BSON.ObjectId(user.id)
  
  const mailTeyit = user.custom_data.mailTeyit
  if(!mailTeyit) throw new Error("MONGO // getProjectNames // Öncelikle üyeliğinize ait mail adresinin size ait olduğunu doğrulamalısınız, tekrar giriş yapmayı deneyiniz veya bizimle iletişime geçiniz.")

  
  try {

    const collection_Projects = context.services.get("mongodb-atlas").db("rapor724_v2").collection("projects")
    const projects = await collection_Projects.find({members:_userId, isDeleted:false}, {name:1}).toArray()
    if(!projects.length) return ({empty:true, message: "MONGO // getProjectNames // Dahil olduğunuz herhangi bir proje bulunamadı, menüler yardımı ile yeni bir proje oluşturabilirsiniz."})
    
    // let projects2 = JSON.parse(JSON.stringify(projects))
    
    
    return projects
    
    
    // if(project.isDelete) throw new Error("MONGO // getProjectNames // Bu proje silinmiş")
    
    // projenin members ları var mı?
    // if(!project.members) throw new Error("MONGO // getProjectNames // herhangi bir proje üyesi bulunamadı, bizimle iletişime geçiniz")

    // return project.members
    
    // talep eden kişi getWbs için yetkili mi?
    // if(!project.members.find(x => x.userId == _userId)) throw new Error("MONGO // getProjectNames // proje üyesi değilsiniz")


    // if(!project?.wbs) throw new Error("MONGO // getProjectNames // Projenin wbs verisi bulunamadı")
    // const {wbs} = project
    // return wbs

  } catch(err) {

    throw new Error("MONGO // getProjectNames // " + err.message)
  }

};