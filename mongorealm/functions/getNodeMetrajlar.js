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
         { satirNo:1, metin1: "deneme", metin2: "deneme uzun", carpan1: 1, carpan2: 11, carpan3: 111, carpan4: 1111, carpan5: 11111, carpan6: 0 },
         { satirNo:2, metin1: "deneme", metin2: "deneme uzun", carpan1: 2, carpan2: 22, carpan3: 222, carpan4: 2222, carpan5: 22222, carpan6: 0 },
         { satirNo:3, metin1: "deneme", metin2: "deneme uzun", carpan1: 3, carpan2: 33, carpan3: 333, carpan4: 3333, carpan5: 33333, carpan6: 0 },
         { satirNo:4, metin1: "deneme", metin2: "deneme uzun", carpan1: 4, carpan2: 44, carpan3: 444, carpan4: 4444, carpan5: 44444, carpan6: 0 },
         { satirNo:5, metin1: "deneme", metin2: "deneme uzun", carpan1: 5, carpan2: 55, carpan3: 555, carpan4: 5555, carpan5: 55555, carpan6: 0 },
      ]
    }
  }

  return metrajSatirlari

}

