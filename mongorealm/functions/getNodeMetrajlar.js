exports = async function({_projectId, _mahalId, _pozId}){
  
  // return {_projectId, _mahalId, _pozId}
  
  const user = context.user
  const _userId = new BSON.ObjectId(user.id)
  
  const mailTeyit = user.custom_data.mailTeyit
  if(!mailTeyit) throw new Error("MONGO // getPozMahalMetrajlar // Öncelikle üyeliğinize ait mail adresinin size ait olduğunu doğrulamalısınız, tekrar giriş yapmayı deneyiniz veya bizimle iletişime geçiniz.")

  const collection_Projects = context.services.get("mongodb-atlas").db("rapor725_v2").collection("projects")
  const project = await collection_Projects.findOne({_id:_projectId, members:_userId, isDeleted:false})
  if(!project) throw new Error("MONGO // getPozMahalMetrajlar // Proje sistemde bulunamadı, sayfayı yenileyiniz, sorun devam ederse Rapor7/25 ile iletişime geçiniz.")

  collection_Metrajlar = context.services.get("mongodb-atlas").db("rapor724_v2").collection("metrajlar")
  
  // return project
  
  const result = collection_Metrajlar.findOne(
    {_projectId,_mahalId, _pozId}
  )
  
  if(result.metrajlar) {
    return result.metrajlar
  }
  
  let guncel = {
    row1:{kisaAciklama:"deneme", aciklama:"deneme uzun", benzer:1, adet:11, en:111, boy:1111, yukseklik:11111},
    row2:{kisaAciklama:"deneme", aciklama:"deneme uzun", benzer:2, adet:22, en:222, boy:2222, yukseklik:22222},
    row3:{kisaAciklama:"deneme", aciklama:"deneme uzun", benzer:3, adet:33, en:333, boy:3333, yukseklik:33333},
    row4:{kisaAciklama:"deneme", aciklama:"deneme uzun", benzer:4, adet:44, en:444, boy:4444, yukseklik:44444},
    row5:{kisaAciklama:"deneme", aciklama:"deneme uzun", benzer:5, adet:55, en:555, boy:5555, yukseklik:55555},
  }
  
  metrajlar.guncel = guncel
  
  return metrajlar
  
}
  
