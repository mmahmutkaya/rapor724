exports = async function({groupId}){
  
  if(typeof groupId != "string") throw new Error("MONGO // getGroup // sorguya gelen groupId string değil, bizimle iletişime geçiniz")
  if(groupId.length != 24) throw new Error("MONGO // getGroup // sorguya gelen groupId 24 hane değil, bizimle iletişime geçiniz")
  
  const _groupId = new BSON.ObjectId(groupId)
  
  const user = context.user
  const _userId = new BSON.ObjectId(user.id)
  
  const mailTeyit = user.custom_data.mailTeyit
  if(!mailTeyit) throw new Error("MONGO // getGroup // Öncelikle üyeliğinize ait mail adresinin size ait olduğunu doğrulamalısınız, tekrar giriş yapmayı deneyiniz veya bizimle iletişime geçiniz.")

  

  try {

    const collection_Groups = context.services.get("mongodb-atlas").db("rapor724_v2").collection("groups")
    const group = await collection_Groups.findOne({_id:_groupId})
    if(!group) throw new Error("MONGO // getGroup // Böyle bir grup bulunamadı")
    
    if(group.isDelete) throw new Error("MONGO // getGroup // Bu grup silinmiş")
    
    return group
    
    // // talep eden kişi grup üyesi mi ?
    // if(group.membersA.filter != false) throw new Error("MONGO // getGroup // Filtrede sıkıntı")

    // return group

  } catch(err) {

    throw new Error("MONGO // getGroup // " + err.message)
  }

};