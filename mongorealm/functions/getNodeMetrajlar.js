exports = async function ({ _projectId, _mahalId, _pozId }) {

  // return {_projectId, _mahalId, _pozId}

  const user = context.user
  const _userId = new BSON.ObjectId(user.id)

  const mailTeyit = user.custom_data.mailTeyit
  if (!mailTeyit) throw new Error("MONGO // getNodeMetrajlar // Öncelikle üyeliğinize ait mail adresinin size ait olduğunu doğrulamalısınız, tekrar giriş yapmayı deneyiniz veya bizimle iletişime geçiniz.")

  const collection_Projects = context.services.get("mongodb-atlas").db("rapor724_v2").collection("projects")
  const project = await collection_Projects.findOne({ _id: _projectId, members: _userId, isDeleted: false })
  if (!project) throw new Error("MONGO // getNodeMetrajlar // Proje sistemde bulunamadı, sayfayı yenileyiniz, sorun devam ederse Rapor7/25 ile iletişime geçiniz.")

  collection_Metrajlar = context.services.get("mongodb-atlas").db("rapor724_v2").collection("metrajlar")

  // return project

  const result = collection_Metrajlar.findOne(
    { _projectId, _mahalId, _pozId }
  )

  if (result.metrajSatirlari) {
    return result.metrajSatirlari
  }

  const metrajSatirlari = {
    guncel: {
      satirlar: [
         { satirNo:1, metin1: "", metin2: "", carpan1:"" , carpan2: "", carpan3: "", carpan4: "", carpan5: "", metraj: "" },
         { satirNo:2, metin1: "", metin2: "", carpan1: "", carpan2: "", carpan3: "", carpan4: "", carpan5: "", metraj: "" },
         { satirNo:3, metin1: "", metin2: "", carpan1:"" , carpan2: "", carpan3: "", carpan4: "", carpan5: "", metraj: "" },
         { satirNo:4, metin1: "", metin2: "", carpan1: "", carpan2: "", carpan3: "", carpan4: "", carpan5: "", metraj: "" },
         { satirNo:5, metin1: "", metin2: "", carpan1: "", carpan2: "", carpan3: "", carpan4: "", carpan5: "", metraj: "" },
      ]
    }
  }

  return metrajSatirlari

}

