exports = async function(mailCode){

  const userId = context.user.id
  const collection_Users = context.services.get("mongodb-atlas").db("rapor724_v2").collection("users")
  const currentTime = new Date()

 
  const result = await collection_Users.updateOne(
    { userId },
    [
      {
        $set: {
          "mailTeyit": {
            $cond: {
              if: {$eq:["$mailConfirmationKod", mailCode]},
              then: true,
              else: false
            }
          }
        },
      },
    ]
  )

  return result.modifiedCount ? "teyit edildi" : "mail kodu doğru girilmedi" // bu ifadeleri değiştirmeyelim, fronend de bu metinlere göre işlem yapılıyor

    
};