exports = async function({_projectId}){
  
  // kullanıcı
  const user = context.user
  _userId = new BSON.ObjectId(user.id)
  const userEmail = context.user.data.email
  
  const mailTeyit = user.custom_data.mailTeyit
  if(!mailTeyit) throw new Error("MONGO // getProject // Öncelikle üyeliğinize ait mail adresinin size ait olduğunu doğrulamalısınız, tekrar giriş yapmayı deneyiniz veya bizimle iletişime geçiniz.")

  if(typeof _projectId != "object") {
    throw new Error("MONGO // getProject // sorguya '_projeId' gönderilemedi 'backend' ")
  }
 
  // proje bulma
  const collection_Projects = context.services.get("mongodb-atlas").db("rapor724_v2").collection("projects")
  const project = await collection_Projects.findOne({_id:_projectId, "personeller":_userId, isDeleted:false})
  if(!project) throw new Error("MONGO // getProject // Aradığınız proje sistemde yok ya da üyesi değilsiniz.")
  return project
  
  // // bu sorguyu çalıştıramadım, null olarak dönüyor, ben de yukarıdaki ilk sorguya ekledim, üyesi değilse proje hiç dönmesin
  // if(!project.members.find(item => item == _userId)) throw new Error("MONGO // getProject // Bu işlem için yetki gerekmektedir.")

  
  // let newWbsItem
  
  
  // //ilk defa wbs kaydı yapılacaksa
  // if(!project.wbs) {
  //   newWbsItem = [{
  //     _id:BSON.ObjectId(),
  //     code:"1",
  //     name:"Taksim 362"
  //   }]
  
  //   try {
  
  //     const mongoSorgu = await collection_Projects.updateOne(
  //       { _id:_projectId }, // Query for the user object of the logged in user
  //       { $set: {wbs:newWbsItem} }, // Set the logged in user's favorite color to purple
  //       // { "$push": { "wbs": newWbsItem  } }
  //       // { upsert: true }
  //     );
    
  //     return newWbsItem[0].code
  
  //   } catch(err) {
  
  //     throw new Error("MONGO // getProject // " + err.message)
  //   }
    
  // }




  
  // //en üst düzeye kayıt yapılacaksa
  // if(upWbs == 0) {
    
  //   let newNumber = 1
  //   let number
    
  //   project.wbs.map(item => {
  //     //if --> nokta içermiyorsa yani en üst seviye ise 
  //     if(!item.code.includes(".")) {
  //       number = parseInt(item.code)
  //       if(number >= newNumber) {
  //         return newNumber = number +1
  //       }
  //     }
  //   })
    
  //   newWbsItem = {
  //     _id:BSON.ObjectId(),
  //     code:newNumber.toString(),
  //     name:"Taksim 362"
  //   }
  
  //   try {
  
  //     const mongoSorgu = await collection_Projects.updateOne(
  //       { _id:_projectId }, // Query for the user object of the logged in user
  //       // { $set: {wbs:newWbs} }, // Set the logged in user's favorite color to purple
  //       { "$push": { "wbs": newWbsItem  } }
  //       // { upsert: true }
  //     );
    
  //     return newWbsItem.code
  
  //   } catch(err) {
  
  //     throw new Error("MONGO // getProject // " + err.message)
  //   }
    
  // }





  
  // //en üst düzey olmayıp mevcut wbs kaydına ekleme yapılacaksa
  // if(project.wbs) {
    
  //   let text = upWbs + "."
  //   let level = text.split(".").length
  //   let newNumber = 1
  //   let number
    
  //   project.wbs.map(item => {
  //     if(item.code.includes(text) && item.code.split(".").length == level) {
  //       number = parseInt(item.code.split(text)[1])
  //       if(number >= newNumber) {
  //         return newNumber = number +1
  //       }
  //     }
  //   })
    
  //   newWbsItem = {
  //     _id:BSON.ObjectId(),
  //     code:text + newNumber,
  //     name:"Taksim 362"
  //   }
  
  //   try {
  
  //     const mongoSorgu = await collection_Projects.updateOne(
  //       { _id:_projectId }, // Query for the user object of the logged in user
  //       // { $set: {wbs:newWbs} }, // Set the logged in user's favorite color to purple
  //       { "$push": { "wbs": newWbsItem  } }
  //       // { upsert: true }
  //     );
    
  //     return newWbsItem.code
  
  //   } catch(err) {
  
  //     throw new Error("MONGO // getProject // " + err.message)
  //   }
    
  // }
  
  
  
  // try {

  //   // const mongoSorgu = await collection_Projects.updateOne(
  //   //   { _id:_projectId }, // Query for the user object of the logged in user
  //   //   { $set: {wbs:newWbs} }, // Set the logged in user's favorite color to purple
  //   //   // { upsert: true }
  //   // );
  
  //   // return mongoSorgu

    
    
  //   // const group = await collection_Groups.findOne({_id:_groupId})
  //   // if(!group) throw new Error("MONGO // getProject // Böyle bir grup bulunamadı")
    
  //   // if(group.isDelete) throw new Error("MONGO // getProject // Bu grup silinmiş")
    
  //   // // talep eden kişi grup üyesi mi ?
  //   // if(!group.membersA.find(x => x == user.id)) throw new Error("MONGO // getProject // Sadece grup yöneticileri grup adını değiştirebilir")


  //   // return group

  // } catch(err) {

  //   throw new Error("MONGO // getProject // " + err.message)
  // }


  // ilk seviyeye eklenecekse
  // if (!upWbs.includes(".")) {
    
  // }
  // let willBeSearched = project.wbs.map,(item => {
  //   willBeSearched
  // })
  // prevWbs = project.wbs

  // const maxWbs = upWbs + "." + 
  

  
  
  // return project
  
  // if(typeof name != "string") throw new Error("MONGO // getProject // Wbs adı yazılmamış")
  // // if(name.length < 3) throw new Error("MONGO // getProject // Wbs adı çok kısa")
  
  // const currentTime = new Date()
  
  
  
  // try {

    
  //   const mongoSorgu = await collection_Projects.updateOne(
  //     { _id:_groupId, membersA:_userId, isDeleted:false }, // Query for the user object of the logged in user
  //     { $set: {name} }, // Set the logged in user's favorite color to purple
  //     // { upsert: true }
  //   );
  
  //   return mongoSorgu

    
    
  //   // const group = await collection_Groups.findOne({_id:_groupId})
  //   // if(!group) throw new Error("MONGO // updateGroup_name // Böyle bir grup bulunamadı")
    
  //   // if(group.isDelete) throw new Error("MONGO // updateGroup_name // Bu grup silinmiş")
    
  //   // // talep eden kişi grup üyesi mi ?
  //   // if(!group.membersA.find(x => x == user.id)) throw new Error("MONGO // updateGroup_name // Sadece grup yöneticileri grup adını değiştirebilir")


  //   // return group

  // } catch(err) {

  //   throw new Error("MONGO // updateGroup_name // " + err.message)
  // }
  
  
  // const project = {
  //   name,
  //   members:[_userId],
  //   membersA:[_userId],
  //   createdBy:_userId,
  //   createdAt:currentTime,
  //   isDeleted:false
  // }
  
  // try {

  //   const collection_Projects = context.services.get("mongodb-atlas").db("rapor724_v2").collection("projects");
    
  //   const result = collection_Projects.insertOne(project)
    
  //   return result

  // } catch(err) {

  //   return { error: err.message };
  // }

};