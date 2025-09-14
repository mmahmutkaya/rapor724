exports = async function ({
  _firmaId,
  paraBirimiId,
  showValue 
}) {
  const user = await context.user;
  const userEmail = context.user.data.email;

  const _userId = new BSON.ObjectId(user.id);
  const mailTeyit = user.custom_data.mailTeyit;
  if (!mailTeyit){
    throw new Error(
      "MONGO // customSettings_update --  Öncelikle üyeliğinize ait mail adresinin size ait olduğunu doğrulamalısınız, tekrar giriş yapmayı deneyiniz veya bizimle iletişime geçiniz."
    )
  }


  const collection_Firmalar = context.services.get("mongodb-atlas").db("rapor724_v2").collection("firmalar");


  if (!(showValue === true || showValue === false)) {
    throw new Error(
      "MONGO // customSettings_update --  Para birimini aktif ya da pasif etmek istediniz fakat db ye 'showValue' gelmedi, sayfayı yenileyiniz, sorun devam ederse lütfen Rapor 724 ile iletişime geçiniz."
    );
  }


  await collection_Firmalar.updateOne(
    { _id: _firmaId },
    { "$set": { "paraBirimleri.$[oneBirim].isActive": showValue } },
    { arrayFilters: [ { "oneBirim.id":paraBirimiId } ] }
  )


};
