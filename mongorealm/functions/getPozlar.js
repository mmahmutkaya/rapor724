exports = async function ({
  _projeId
}) {


  const user = context.user
  const _userId = new BSON.ObjectId(user.id)
  const userEmail = context.user.data.email
  const mailTeyit = user.custom_data.mailTeyit
  if (!mailTeyit) throw new Error("MONGO // collection_firmaPozlar // Öncelikle üyeliğinize ait mail adresinin size ait olduğunu doğrulamalısınız, tekrar giriş yapmayı deneyiniz veya bizimle iletişime geçiniz.")

  const collection_pozlar = context.services.get("mongodb-atlas").db("rapor724_v2").collection("pozlar")

  
  if (!_projeId) throw new Error("MONGO // getPozlar // -- sorguya gönderilen --projeId-- türü doğru değil, lütfen Rapor7/24 ile irtibata geçiniz. ")

  
  const result = await collection_pozlar.aggregate([
    {
      $project: {
        _projeId:1,
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