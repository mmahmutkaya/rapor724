exports = async function({groupId}){
  
  const user = context.user
  
  const _userId = new BSON.ObjectId(user.id)
  
  const mailTeyit = user.custom_data.mailTeyit
  return mailTeyit
  if(!mailTeyit) throw new Error("MONGO // deleteGroup // Öncelikle üyeliğinize ait mail adresinin size ait olduğunu doğrulamalısınız, tekrar giriş yapmayı deneyiniz veya bizimle iletişime geçiniz.")

  
  const currentTime = new Date()
  

  try {
    
    const mongoSorgu = await collectionUsers.updateOne(
      { groupId },
      { $set: { isDeleted:true, deletedAt:currentTime, deletedBy:_userId} },
      { upsert: true }
    );
  
    return ({ok:true, Fonksiyon:"MONGO // FONK // deleteGroup ", mesaj:"grup silindi", mongoSorgu})
    
  } catch (err) {
    return ({ok:false, hataYeri:"MONGO // FONK // deleteGroup ", hataMesaj:err.message})
  }
    

};