exports = async function ({ projectId }) {
  
  const user = context.user
  const _userId = new BSON.ObjectId(user.id)
  const mailTeyit = user.custom_data.mailTeyit
  if (!mailTeyit) throw new Error("MONGO // getMahalListesi //  Öncelikle üyeliğinize ait mail adresinin size ait olduğunu doğrulamalısınız, tekrar giriş yapmayı deneyiniz veya bizimle iletişime geçiniz.")


  if (!projectId) throw new Error("MONGO // getMahalListesi //  \"projectId\" sorguya, gönderilmemiş, lütfen Rapor7/24 ile irtibata geçiniz. ")
  let _projectId
  try {
    if (typeof projectId == "string") {
      _projectId = new BSON.ObjectId(projectId)
    } else {
      _projectId = projectId
    }
  } catch (err) {
    throw new Error("MONGO // getMahalListesi //  " + "MONGO // getMahalListesi // sorguya gönderilen \"projectId\" türü doğru değil, lütfen Rapor7/24 ile irtibata geçiniz. ")
  }
  if (typeof _projectId != "object") throw new Error("MONGO // getMahalListesi //  " + "MONGO // getMahalListesi // sorguya gönderilen \"projectId\" türü doğru değil, lütfen Rapor7/24 ile irtibata geçiniz. ")


  const collection_Metrajlar = context.services.get("mongodb-atlas").db("rapor724_v2").collection("metrajlar")

  const result = await collection_Metrajlar.find({ _projectId, open: true }, { _mahalId: 1, _pozId: 1, open: 1, metraj:1 }).toArray()

  return result



};



