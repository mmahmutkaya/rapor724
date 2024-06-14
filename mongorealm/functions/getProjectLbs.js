exports = async function({projectId}){
  
  
  // if(typeof projectName != "string") throw new Error("MONGO // getprojectLbs // sorguya gelen projectName string değil, bizimle iletişime geçiniz")
  // if(groupId.length != 24) throw new Error("MONGO // getprojectLbs // sorguya gelen groupId 24 hane değil, bizimle iletişime geçiniz")
  
  // const _groupId = new BSON.ObjectId(groupId)
  
  const user = context.user
  const _userId = new BSON.ObjectId(user.id)
  
  
  const mailTeyit = user.custom_data.mailTeyit
  if(!mailTeyit) throw new Error("MONGO // getprojectLbs // Öncelikle üyeliğinize ait mail adresinin size ait olduğunu doğrulamalısınız, tekrar giriş yapmayı deneyiniz veya bizimle iletişime geçiniz.")

  const _projectId = new BSON.ObjectId(projectId)

  try {
    
    const collection_Projects = context.services.get("mongodb-atlas").db("rapor724_v2").collection("projects")
    
    const project = await collection_Projects.findOne({_id:_projectId,  members:_userId, isDeleted:false}, {lbs:1, _id:0})

    const projectLbs = project.lbs
    
    return projectLbs
    
    // if(!projetLbs.length) return ({empty:true, message: "MONGO // getprojectLbs // Dahil olduğunuz herhangi bir proje bulunamadı, menüler yardımı ile yeni bir proje oluşturabilirsiniz."})
    
    // if(project.isDelete) throw new Error("MONGO // getprojectLbs // Bu proje silinmiş")
    
    // projenin members ları var mı?
    // if(!project.members) throw new Error("MONGO // getprojectLbs // herhangi bir proje üyesi bulunamadı, bizimle iletişime geçiniz")

    // return project.members
    
    // talep eden kişi getLbs için yetkili mi?
    // if(!project.members.find(x => x.userId == _userId)) throw new Error("MONGO // getprojectLbs // proje üyesi değilsiniz")


    // if(!project?.lbs) throw new Error("MONGO // getprojectLbs // Projenin lbs verisi bulunamadı")
    // const {lbs} = project
    // return lbs

  } catch(err) {

    throw new Error("MONGO // getprojectLbs // " + err.message)
  }

};