exports = async function ({
  functionName,
  sayfaName,
  baslikId,
  showValue
}) {
  const user = await context.user;
  const userEmail = context.user.data.email;

  const _userId = new BSON.ObjectId(user.id);
  const mailTeyit = user.custom_data.mailTeyit;
  if (!mailTeyit)
    throw new Error(
      "MONGO // updateCustomSettings --  Öncelikle üyeliğinize ait mail adresinin size ait olduğunu doğrulamalısınız, tekrar giriş yapmayı deneyiniz veya bizimle iletişime geçiniz."
    );



  
  const collection_Users = context.services
    .get("mongodb-atlas")
    .db("rapor724_v2")
    .collection("users");


  if (functionName == "sayfaBasliklari") {

    if(!sayfaName) {
      throw new Error(
        "MONGO // updateCustomSettings --  Başlık güncellemesi yapmak istediniz fakat 'sayfaName' göndermediniz, sayfayı yenileyiniz, sorun devam ederse lütfen iletişime geçiniz."
      );
    }
  
   if(!baslikId) {
      throw new Error(
        "MONGO // updateCustomSettings --  Başlık güncellemesi yapmak istediniz fakat 'başlıkId' göndermediniz, sayfayı yenileyiniz, sorun devam ederse lütfen iletişime geçiniz."
      );
    }
  
   if(!(showValue === true || showValue === false)) {
      throw new Error(
        "MONGO // updateCustomSettings --  Başlık güncellemesi yapmak istediniz fakat 'showValue' göndermediniz, sayfayı yenileyiniz, sorun devam ederse lütfen iletişime geçiniz."
      );
    }

   const pages = context.values.get("pages")
   if(sayfaName && !pages.find(x => x.name === sayfaName)) {
    throw new Error(
      "MONGO // updateCustomSettings --  Başlık güncellemesi yapmak isdeğiniz sayfa ismi mongodb atlas app context values verileri içinde mevcut değil"
    );
   }
  
  const result = await collection_Users.findOneAndUpdate(
    {email:userEmail},
    {$set:{["customSettings.pages." + sayfaName + '.basliklar.$[baslik].show']:showValue}},
    { arrayFilters: [{ 'baslik.id': baslikId }] , new:true }
  )
  
  return {result}
    
  }
  

  return { situation: "empty" };
};
