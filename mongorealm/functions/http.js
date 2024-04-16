
exports = async function (request, response) {
  
  // const Realm = require("realm-web");
  // const app = Realm.getApp("rapor724_v2-cykom")
  
  const token = "b0875c6651f12a64ae5b54db12ae280e3c94d50114a9004dfe27f39552c6bcaae82f6ce06dc2e6471c1468a5c0bc885c1f38615417e677b6bf37d87b8341ce6b"
  const tokenId = "640448cd160f99e882ff6039"
  
  
  
  try {
    await app.emailPasswordAuth.confirmUser(token, tokenId)
    return ({ok:true, message:"kullanıcı kayıt edildi"})
  } catch (err){
    return ({ok:false,hataYeri:"FONK // context.app.emailPasswordAuth", message:err.message})
  }
  

  // ayrı ------------
  
  // objHeader = request.headers
  
  // // let firma;
  // let kullaniciMail;
  // let sifre;
  // let sifre2;
  
  // // 1 - gelen sorguda kontroller yapıyoruz varsa hata dönüyoruz
  // try {
  //   // if(!objHeader.hasOwnProperty('Firma')) return ({hata:true,hataYeri:"FONK // userRegester",hataMesaj:"Firma ismi girilmemiş"})
  //   if(!objHeader.hasOwnProperty('Kullanici-Mail')) return ({hata:true,hataYeri:"FONK // userRegester",hataMesaj:"Mail adresi girilmemiş"})
  //   if(!objHeader.hasOwnProperty('Sifre')) return ({hata:true,hataYeri:"FONK // userRegester",hataMesaj:"Şifre girilmemiş"})
  //   if(!objHeader.hasOwnProperty('Sifre2')) return ({hata:true,hataYeri:"FONK // userRegester",hataMesaj:"İkinci şifre girilmemiş"})
  //   // firma = objHeader["Firma"][0]
    
  //   kullaniciMail = objHeader["Kullanici-Mail"][0];
  //   validateEmail = context.functions.execute("validateEmail", kullaniciMail);
  //   if(validateEmail == null) return ({hata:true,hataYeri:"FONK // userRegester",hataMesaj:"Mail adresinin doğruluğunu kontrol ediniz."})
    
  //   sifre = objHeader["Sifre"][0];
  //   sifre2 = objHeader["Sifre2"][0];
  //   if(sifre !== sifre2) return ({hata:true,hataYeri:"FONK // userRegester",hataMesaj:"Girilen şifreler birbirinden farklı."})
  //   sifre2 = sifre.replace(' ','')
  //   if(sifre.split("").length !== sifre2.split("").length) return ({hata:true,hataYeri:"FONK // userRegester",hataMesaj:"Şifre alanında boşluk kullanmayınız"})
  //   if(sifre.split("").length < 6) return ({hata:true,hataYeri:"FONK // userRegester",hataMesaj:"Şifre 6 karakterden az olamaz"})
  //   if(sifre.split("").length > 12) return ({hata:true,hataYeri:"FONK // userRegester",hataMesaj:"Şifre 12 karakterden fazla olamaz"})
    
  // } catch (err){
  //   return ({hata:true,hataYeri:"FONK // userRegester - // MONGO-1",hataMesaj:err.message})
  // }
  
  // mailTeyitKod = context.functions.execute("generateKod", 6);
  // geciciKey = Date.now()
  
  // const newUser = {
  //   kullaniciMail:kullaniciMail,
  //   sifre:sifre,
  //   mailTeyitKod:mailTeyitKod,
  //   mailTeyit:false,
  //   uyelikOnay:false,
  //   geciciKey:geciciKey
  // }
  
  // // 2 - bu kullanıcı kayıtlı mı diye sorgu yapıyoruz, kayıtlı ise hata dönüyoruz, değilse kayıt ediyoruz
  // const collectionUsers = context.services.get("mongodb-atlas").db("excelChat").collection("users")
  // try {
  //   const userArray = await collectionUsers.find({kullaniciMail}).toArray()
  //   if(userArray.length > 0) return ({hata:true,hataYeri:"FONK // userRegester",hataMesaj:"Bu mail adresi sistemde kayıtlı, şifre yenilemek için giriş ekranından şifremi unuttum seçeneğini işaretleyebilirsiniz."})
  //   // if(!userArray.find(user => user.firma === firma)) return ({hata:true,hataYeri:"FONK // userRegester",hataMesaj:"Firma adı hatalı"})
  //   collectionUsers.insertOne( newUser );
  // } catch (err){
  //   return ({hata:true,hataYeri:"FONK // userRegester // MONGO-2 ",hataMesaj:err.message})
  // }
  

  // // 3 - NODEMAİLER - MAİL GÖNDERME
  
  // // const MailMesaj = "Mail adresi doğrulama kodunuz - " + mailTeyitKod.substring(0, 3) +" "+ mailTeyitKod.substring(3,6);
  // const MailMesaj = "Mail adresi doğrulama kodunuz - " + mailTeyitKod
  
  // try {
  //   context.functions.execute('sendMail', kullaniciMail,"Mail Adresi Doğrulama Kodu",MailMesaj);
  //   return ({ok:true,mesaj:'Mail adresinize kod gönderildi, spam kısmını kontrol etmeyi unutmayınız.'})
  // } catch (err){
  //   return ({hata:true,hataYeri:"FONK // userRegester // MONGO-3",hataMesaj:err.message})
  // }

}