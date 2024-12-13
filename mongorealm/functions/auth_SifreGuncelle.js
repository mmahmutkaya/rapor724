
exports = async ({ token, tokenId, username, password}) => {
  
  
  try {
    const validateEmail = context.functions.execute("validateEmail", username)
    if (!validateEmail) {
      return {status:"mail adresi hatalı"}
    }
  } catch (err) {
    return ({status:"MONGO // userRegester // validateEmail //" + err.message})
  }



  // // burada database e kaydedilecek ve aşağıda mail adresine gönderilecek, bu sebeple try catch dışına aldım
  // const mailTeyitKod = context.functions.execute("generateKod", 6);
  // try {
  //   const zaman = new Date(Date.now())
  //   const collectionUsers = context.services.get("mongodb-atlas").db("rapor724_v2").collection("users")
  //   collectionUsers.updateOne(
  //     { userId : username,  },
  //     { $set: {  "email" : username, mailTeyitKod, createdAt:zaman, mailTeyit:Date.now() } },
  //     { upsert: true }
  //   )
  // } catch (err) {
  //   return ({status:"MONGO // userRegester // collectionUsers.updateOne //" + err.message})
  // }

  
  

  // yukarıdaki herhangi bir try catch bloğuna takılmadı
  return { status: 'success', username, password }

}
