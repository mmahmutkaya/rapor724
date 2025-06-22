exports = async function ({
  _projeId
}) {


  const user = context.user
  const _userId = new BSON.ObjectId(user.id)
  const userEmail = context.user.data.email
  const mailTeyit = user.custom_data.mailTeyit
  if (!mailTeyit) throw new Error("MONGO // getMahaller // Öncelikle üyeliğinize ait mail adresinin size ait olduğunu doğrulamalısınız, tekrar giriş yapmayı deneyiniz veya bizimle iletişime geçiniz.")

  const collection_mahaller = context.services.get("mongodb-atlas").db("rapor724_v2").collection("mahaller")

  
  if (!_projeId) throw new Error("MONGO // getMahaller // -- sorguya gönderilen --projeId-- türü doğru değil, lütfen Rapor7/24 ile irtibata geçiniz. ")

  
  const result = await collection_mahaller.aggregate([
    {
      $project: {
        _projeId:1,
        _lbsId:1,
        mahalNo:1,
        mahalName:1,
        mahalBirimId:1,
        mahalMetrajTipId:1,
        isDeleted:1
      }
    },       
    {
      $match: {
        _projeId,
        isDeleted:false
      }
    },
    {
      $project: {
        isDeleted:0
      }
    }     
  ])

  return result


};