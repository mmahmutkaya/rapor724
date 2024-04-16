exports = async function({groupId, name}){
  
  if(typeof groupId != "string") throw new Error("MONGO // updateGroup_name // sorguya gelen groupId string değil, bizimle iletişime geçiniz")
  if(groupId.length != 24) throw new Error("MONGO // updateGroup_name // sorguya gelen groupId 24 hane değil, bizimle iletişime geçiniz")
  
  const _groupId = new BSON.ObjectId(groupId)
  
  const user = context.user
  const _userId = new BSON.ObjectId(user.id)
  
  const mailTeyit = user.custom_data.mailTeyit
  if(!mailTeyit) throw new Error("MONGO // updateGroup_name // Öncelikle üyeliğinize ait mail adresinin size ait olduğunu doğrulamalısınız, tekrar giriş yapmayı deneyiniz veya bizimle iletişime geçiniz.")

  

  try {

    const collection_Groups = context.services.get("mongodb-atlas").db("rapor724_v2").collection("groups")
    
    const mongoSorgu = await collection_Groups.updateOne(
      { _id:_groupId, membersA:_userId, isDeleted:false }, // Query for the user object of the logged in user
      { $set: {name} }, // Set the logged in user's favorite color to purple
      // { upsert: true }
    );
  
    return mongoSorgu

    
    
    // const group = await collection_Groups.findOne({_id:_groupId})
    // if(!group) throw new Error("MONGO // updateGroup_name // Böyle bir grup bulunamadı")
    
    // if(group.isDelete) throw new Error("MONGO // updateGroup_name // Bu grup silinmiş")
    
    // // talep eden kişi grup üyesi mi ?
    // if(!group.membersA.find(x => x == user.id)) throw new Error("MONGO // updateGroup_name // Sadece grup yöneticileri grup adını değiştirebilir")


    // return group

  } catch(err) {

    throw new Error("MONGO // updateGroup_name // " + err.message)
  }

};