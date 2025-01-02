
exports = async ({ token, tokenId, username, password, currentPasswordValid }, {mailCode}) => {

  // bu fonksiyon private yani kullanıcılar tarafından direk çağırılamıyor, aşağıdaki şekilde çağırılıyor, {email.password} sonrasındaki değişkenler isteğe bağlı ve burada istenilen şekilde değerlendiriliyorlar
  // RealmApp.emailPasswordAuth.callResetPasswordFunction({ email, password }, { mailCode: "1234567" })
  // return {status:"fail"} - return {status:"pending"} veya throw new Error() - haricindeki dönüşlerde email ve password sistemde otomatik olarak anında güncelleniyor, otomatikmen return {status:"success"} muamelesi görüyor yani


  let email = username
  
  // // BU DOĞRULAMAYA GEREK YOK - çünkü mail adresinin doğru olup olmadığına bakılmaksızın sistemde kayıtlı değilse bu kullanıcı sistemde kayıtlı değil diyor, biz de baştan zaten email adresi doğru olmayanı kaydetmiyorduk ve mail adresi doğrulama kodu istiyorduk felan
  // const isMailValid = String(email)
  //   .toLowerCase()
  //   .match(
  //     /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  //   );
      
  // if(!isMailValid) {
  //   throw new Error("Mail adresi hatalı (backend2)")
  // }


  const dbData = await context.services.get("mongodb-atlas").db("rapor724_v2").collection("mailConfirmationCodes").findOne({ email:userEmail })
  
  if(dbData.code_PasswordReset !== mailCode ) {
    return {status:"fail"}
  }


  await context.services.get("mongodb-atlas").db("rapor724_v2").collection("users").updateOne(
    { email:userEmail },
    [
      { $set: { "mailTeyit": true} }
    ]
  )
  

  // password ulaaşbiliyoruz güvenlik problemi gibi
  // if (!password.length) {
  //   return("Şifre giriniz")
  // }
  
  // //  Password kontrolü
  // if (password.length < 8) {
  //   setPasswordError("En az 8 karakter kullanmalısınız")
  // }

 
  // // password db ye kaydetme
  // let resultdbKayit
  // try {
  //   const collection_Users = context.services.get("mongodb-atlas").db("rapor724_v2").collection("users")
  //   resultMongo = await collection_Users.updateOne(
  //     { email },
  //     { $set: { 
  //       resetlenenSifre:password
  //     }}
  //   );
  // } catch (err) {
  //   throw new Error("Mail adresine gidecek kod database e kaydedilirken hata oluştu (backend)")
  // }


  return {status:"success"} //aslında gerek yok ama, yukarıda bir yere takılmamış ise otomatik bu dönüyor çünkü
  
  


  
}
