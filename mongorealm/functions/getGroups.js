exports = async function(){
  
  const user = context.user
  
  const _userId = new BSON.ObjectId(user.id)
  
  const mailTeyit = user.custom_data.mailTeyit
  if(!mailTeyit) throw new Error("MONGO // getGroups // Öncelikle üyeliğinize ait mail adresinin size ait olduğunu doğrulamalısınız, tekrar giriş yapmayı deneyiniz veya bizimle iletişime geçiniz.")


  try {

    const collection_Groups = context.services.get("mongodb-atlas").db("rapor724_v2").collection("groups")
    
    const result = collection_Groups.find({members:_userId, isDeleted:false})
    
    return result

  } catch(err) {

    return { error: err.message };
  }

};