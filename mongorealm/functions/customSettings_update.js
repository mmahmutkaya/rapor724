exports = async function ({
  functionName,
  sayfaName,
  baslikId,
  showValue,
  showMetrajYapabilenler
  
}) {
  const user = await context.user;
  const userEmail = context.user.data.email;

  const _userId = new BSON.ObjectId(user.id);
  const mailTeyit = user.custom_data.mailTeyit;
  if (!mailTeyit)
    throw new Error(
      "MONGO // customSettings_update --  Öncelikle üyeliğinize ait mail adresinin size ait olduğunu doğrulamalısınız, tekrar giriş yapmayı deneyiniz veya bizimle iletişime geçiniz."
    );



  const collection_Users = context.services.get("mongodb-atlas").db("rapor724_v2").collection("users");


  if (functionName == "sayfaBasliklari") {

    if (!sayfaName) {
      throw new Error(
        "MONGO // customSettings_update --  Başlık güncellemesi yapmak istediniz fakat 'sayfaName' göndermediniz, sayfayı yenileyiniz, sorun devam ederse lütfen iletişime geçiniz."
      );
    }

    if (!baslikId) {
      throw new Error(
        "MONGO // customSettings_update --  Başlık güncellemesi yapmak istediniz fakat db ye 'başlıkId' gelmedi, sayfayı yenileyiniz, sorun devam ederse lütfen Rapor724 ile iletişime geçiniz."
      );
    }

    if (!(showValue === true || showValue === false)) {
      throw new Error(
        "MONGO // customSettings_update --  Başlık güncellemesi yapmak istediniz fakat db ye 'showValue' gelmedi, sayfayı yenileyiniz, sorun devam ederse lütfen Rapor 724 ile iletişime geçiniz."
      );
    }


    const result = await collection_Users.updateOne(
      { email: userEmail },
      { $set: { ["customSettings.pages." + sayfaName + '.basliklar.$[baslik].show']: showValue } },
      { arrayFilters: [{ 'baslik.id': baslikId }], upsert: true }
    )

    return { result }

  }


  if (functionName == "toggle_showHasMahal") {

    if (!sayfaName) {
      throw new Error(
        "MONGO // customSettings_update --  Başlık güncellemesi yapmak istediniz fakat 'sayfaName' göndermediniz, sayfayı yenileyiniz, sorun devam ederse lütfen iletişime geçiniz."
      );
    }

    if (!(showValue === true || showValue === false)) {
      throw new Error(
        "MONGO // customSettings_update --  Mahali olmayan pozları gizlemek/göstermek istediniz fakat db ye 'showValue' gelmedi, sayfayı yenileyiniz, sorun devam ederse lütfen Rapor 724 ile iletişime geçiniz."
      );
    }


    const result = await collection_Users.updateOne(
      { email: userEmail },
      { $set: { ["customSettings.pages." + sayfaName + '.showHasMahal']: showValue } }
    )

    return { result }

  }



  if (functionName == "showMetrajYapabilenler") {


    if (!showMetrajYapabilenler) {
      throw new Error(
        "MONGO // customSettings_update // showMetrajYapabilenler // db ye 'showMetrajYapabilenler' değeri doğru gelmedi, sayfayı yenileyiniz, sorun devam ederse lütfen Rapor 724 ile iletişime geçiniz."
      );
    }


    // // let customData = await collection_Users.findOne({userId:user.id})

    // let showMetrajYapabilenler = user.custom_data.customSettings.showMetrajYapabilenler

    // // return {showMetrajYapabilenler,customData,functionName}

    // if (showValue) {
    //   if (!showMetrajYapabilenler) {
    //     showMetrajYapabilenler = [userEmail2]
    //   } else {
    //     showMetrajYapabilenler = [...showMetrajYapabilenler, userEmail2]
    //   }
    // } else {
    //   if(!showMetrajYapabilenler){
    //     return
    //   } else {
    //     showMetrajYapabilenler = showMetrajYapabilenler.filter(x => x !== userEmail2)
    //   }
    // }


    
    const result = await collection_Users.updateOne(
      { userId:user.id },
      { $set: { ["customSettings.showMetrajYapabilenler"] : showMetrajYapabilenler } }
    )

    return { result }

  }



  return { message: "Herhangi bir functionName ile eşleşmedi" };
};
