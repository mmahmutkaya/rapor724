
exports = async ({ token, tokenId, username, password, mailCode}) => {
  
  
  if (!context.functions.execute("validateEmail", username)) {
    return {status:"fail", hata:"mail adresi hatalı"}
  }

  
  if (password.length < 6) {
    return {status:"fail", hata:"şifre en az 6 hane olmalı"}
  }

  
  const mailConfirmationKod = context.services.get("mongodb-atlas").db("rapor724_v2").collection("mailConfirmationCodes").findOne({email:username}).mailConfirmationKod
  if(mailConfirmationKod !== mailCode) {
    return {status:"fail", hata:"mail adresine giden kod doğru girilmedi"}
  }

  return {status:"success", ok:true, mesaj:"kullanıcı kaydedildi"}
  
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


}
