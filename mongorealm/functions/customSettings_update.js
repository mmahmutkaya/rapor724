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


  return { message: "Herhangi bir functionName ile eşleşmedi" };
};
