
exports = async ({ token, tokenId, username }) => {

  // burada password payload olarak alınamıyor, gayet güvenli, kimse bilmiyor şifre ne ama password resette durum farklı bakıcaz mongo db ye de yazıcaz
  // username email adresi olarak kaydetmek istediğimiz bir değer, zaten mail confirmation felan yapıcaz ama biz önden burada gerçek bir mail adresimi diye bakıyor ve değilse kayıdı "fail" olarak başarısız kılıyoruz 

  let email = username
  
  const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  if (!validateEmail(email)) {
    return {status:"fail", hata:"mail adresi hatalı"}
  }

  const collection_Users = context.services.get("mongodb-atlas").db("rapor724_v2").collection("users")

  try {
    await collection_Users.deleteOne({ email })
  } catch (error) {
    
  }
  
  // buraya geldiyse kullanıcı kaydedildi, return {success:true} - demiş gibiyiz, desekte demesekte aynı
  
}
