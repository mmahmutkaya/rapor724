exports = async function ({
  functionName,
  pageName,
  basliklar
}) {
  const user = await context.user;
  const userEmail = context.user.data.email;

  const _userId = new BSON.ObjectId(user.id);
  const mailTeyit = user.custom_data.mailTeyit;
  if (!mailTeyit)
    throw new Error(
      "MONGO // updateCustomSettings --  Öncelikle üyeliğinize ait mail adresinin size ait olduğunu doğrulamalısınız, tekrar giriş yapmayı deneyiniz veya bizimle iletişime geçiniz."
    );


  const pages = context.values.get("pages")
  if(pageName && !pages.find(x => x.name === pageName)) 
    throw new Error(
      "MONGO // updateCustomSettings --  Başlık güncellemesi yapmak isdeğiniz sayfa ismi mongodb atlas app context values verileri içinde mevcut değil"
    );
  

  
  const collection_Users = context.services
    .get("mongodb-atlas")
    .db("rapor724_v2")
    .collection("users");


  if (functionName == "sayfaBasliklari") {
    const result = collection_Users.updateOne(
      {email:userEmail},
      {$set:{["customSettings.pages." + pageName + '.basliklar']:basliklar}}
    )
    return {result,basliklar}
  }
  

  return { situation: "empty" };
};
