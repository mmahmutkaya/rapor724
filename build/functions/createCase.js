exports = async function({groupId, name, responsible, deadline }){
  
  const user = context.user
  const _userId = new BSON.ObjectId(user.id)
  
  const mailTeyit = user.custom_data.mailTeyit
  if(!mailTeyit) throw new Error("MONGO // createCase // Öncelikle üyeliğinize ait mail adresinin size ait olduğunu doğrulamalısınız, tekrar giriş yapmayı deneyiniz veya bizimle iletişime geçiniz.")

  const _groupId = new BSON.ObjectId(groupId)
  const currentTime = new Date()
  
  if(typeof name != "string") throw new Error("MONGO // createCase // Vaka adı yazılmamış")
  if(name.length < 3) throw new Error("MONGO // createCase // Vaka adı çok kısa")
  
  
  const group = {
    name,
    groupId:[_userId],
    membersA:[_userId],
    createdBy:_userId,
    createdAt:currentTime,
    isDeleted:false
  }
  
  try {

    const collection_Groups = context.services.get("mongodb-atlas").db("rapor724_v2").collection("groups");
    
    const result = collection_Groups.insertOne(group)
    
    return result

  } catch(err) {

    return { error: err.message };
  }

};