
exports = async ({ token, tokenId, username, password }) => {


  const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  if (!validateEmail(username)) {
    return {status:"fail", hata:"mail adresi hatalı"}
  }


  if(!password) {
    return {status:"fail", hata:"şifre 8 karakterden fazla olamaz"}
  }
  
  // try {
    // if (password.length < 6) {
    //   return {status:"fail", hata:"şifre en az 6 hane olmalı"}
    // }
  // } catch (err) {
  //   return {status:"fail", hataYeri:"passwordHane", errMessage:err.message}
  // }

  
  // try {
    // const mailConfirmationKod = await context.services.get("mongodb-atlas").db("rapor724_v2").collection("mailConfirmationCodes").findOne({email:username}).mailConfirmationKod
    // if(mailConfirmationKod !== "4923744") {
    //   return {status:"fail", hata:"mail adresine giden kod doğru girilmedi"}
    // }
  // } catch (err) {
  //   return {status:"fail", hataYeri:"mailConfirmationKod", errMessage:err.message}
  // }

  
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
