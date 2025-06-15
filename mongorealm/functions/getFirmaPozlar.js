exports = async function ({
  functionName, _firmaId, newPoz
}) {


  const user = context.user
  const _userId = new BSON.ObjectId(user.id)
  const userEmail = context.user.data.email
  const mailTeyit = user.custom_data.mailTeyit
  if (!mailTeyit) throw new Error("MONGO // collection_firmaPozlar // Öncelikle üyeliğinize ait mail adresinin size ait olduğunu doğrulamalısınız, tekrar giriş yapmayı deneyiniz veya bizimle iletişime geçiniz.")

  const dateNow = new Date()
  const collection_firmaPozlar = context.services.get("mongodb-atlas").db("rapor724_v2").collection("firmapozlar")

  
  if (!_firmaId) throw new Error("MONGO // getFirmaPozlar // -- sorguya gönderilen --firmaId-- türü doğru değil, lütfen Rapor7/24 ile irtibata geçiniz. ")

  
  const result = await collection_firmaPozlar.aggregate([
    {
      $project: {
        wbsId:1,
        pozNo:1,
        pozName:1,
        pozBirimId:1,
        pozMetrajTipId:1,
        isDeleted:1
      }
    },       
    {
      $match: {
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