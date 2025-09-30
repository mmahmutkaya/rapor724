exports = async function ({ _projeId, baslikName }) {


  const user = context.user
  const _userId = new BSON.ObjectId(user.id)
  const userEmail = context.user.data.email;
  const mailTeyit = user.custom_data.mailTeyit
  if (!mailTeyit) throw new Error("MONGO // create_isPaketBaslik //  // Öncelikle üyeliğinize ait mail adresinin size ait olduğunu doğrulamalısınız, tekrar giriş yapmayı deneyiniz veya bizimle iletişime geçiniz.")


  // yukarıda satırda form içinde gelen verilerde hata tespit edilirse formun ilgili alanlarında gösterim yapılabilsin diye error objesi gönderilir



  if (typeof _projeId != "object") {
    throw new Error("MONGO // create_isPaketBaslik // sorguya gönderilen '_projeId' türü doğru değil, lütfen Rapor7/24 ile irtibata geçiniz. ")
  }

  const collection_Proje = context.services.get("mongodb-atlas").db("rapor724_v2").collection("projeler")
  const proje = await collection_Proje.findOne({ _id: _projeId, isDeleted: false })

  if (!proje) {
    throw new Error("MONGO // create_isPaketBaslik //  // ProjeId bulunamadı, lütfen sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
  }


  if (typeof baslikName != "string") {
    throw new Error("MONGO // create_isPaketBaslik // sorguya gönderilen 'baslikName' türü doğru değil, lütfen Rapor7/24 ile irtibata geçiniz. ")
  }


  const errorFormObj = {}


  //form verisi -- yukarıda  "" const errorFormObj = {} ""  yazan satırdan önceki açıklamaları oku
  typeof baslikName != "string" && errorFormObj.baslikName === null ? errorFormObj.baslikName = "MONGO // create_isPaketBaslik //  --  baslikName -- sorguya, string formatında gönderilmemiş, lütfen Rapor7/24 ile irtibata geçiniz. " : null
  baslikName = await context.functions.execute("functions_deleteLastSpace", baslikName)
  if (!baslikName.length) !errorFormObj.baslikName ? errorFormObj.baslikName = "MONGO // create_isPaketBaslik //  --  baslikName -- sorguya, gönderilmemiş, lütfen Rapor7/24 ile irtibata geçiniz." : null

  if (proje.isPaketBasliklar.find(x => x.name === baslikName && errorFormObj.baslikName === null)) {
    errorFormObj.baslikName = "Bu projede bu başlık ismi kullanılmış."
  }

  // form veri girişlerinden en az birinde hata tespit edildiği için form objesi dönderiyoruz, formun ilgili alanlarında gösterilecek
  // errorFormObj - aşağıda tekrar gönderiliyor
  if (Object.keys(errorFormObj).length) return ({ errorFormObj })



  const currentTime = new Date()

  let newBaslik = {
    _id:new BSON.ObjectId(),
    name:baslikName,
    createdAt:currentTime,
    createdBy:userEmail
  }

  try {

    await collection_Proje.updateOne(
      { _id: _projeId },
      { $push: { "isPaketBasliklar": newBaslik }}
    );

    // return newWbsItem[0].code
    return newBaslik

  } catch (err) {

    throw new Error("MONGO // create_isPaketBaslik //  // " + err.message)
  }



};