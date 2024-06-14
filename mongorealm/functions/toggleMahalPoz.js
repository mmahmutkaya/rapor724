exports = async function ({ _projectId, _mahalId, _pozId, open }) {

  // gelen verileri ikiye ayırabiliriz, 1-form verisinden önceki ana veriler  2-form verileri

  // 1 de hata varsa hata ile durdurulur
  // 1 tamam - 2 de hata varsa - form hata objesi gönderilir, formun ilgili alanlarında hata gösterilebilir

  // 2 - yukarıda açıklandı

  if (!_projectId) throw new Error("MONGO // openMetraj // Proje Id -- sorguya gönderilmemiş, lütfen Rapor7/24 ile irtibata geçiniz. ")
  try {
    if (typeof _projectId == "string") {
      _projectId = new BSON.ObjectId(projectId)
    }
  } catch (err) {
    throw new Error("MONGO // openMetraj --  " + "MONGO // openMetraj -- sorguya gönderilen --projectId-- türü doğru değil, lütfen Rapor7/24 ile irtibata geçiniz.")
  }
  if (typeof _projectId != "object") throw new Error("MONGO // openMetraj --  " + "MONGO // openMetraj -- sorguya gönderilen --projectId-- türü doğru değil, lütfen Rapor7/24 ile irtibata geçiniz. ")



  if (!_mahalId) throw new Error("MONGO // openMetraj // Proje Id -- sorguya gönderilmemiş, lütfen Rapor7/24 ile irtibata geçiniz. ")
  try {
    if (typeof mahalId == "string") {
      _mahalId = new BSON.ObjectId(mahalId)
    }
  } catch (err) {
    throw new Error("MONGO // openMetraj --  " + "MONGO // openMetraj -- sorguya gönderilen --mahalId-- türü doğru değil, lütfen Rapor7/24 ile irtibata geçiniz.")
  }
  if (typeof _mahalId != "object") throw new Error("MONGO // openMetraj --  " + "MONGO // openMetraj -- sorguya gönderilen --mahalId-- türü doğru değil, lütfen Rapor7/24 ile irtibata geçiniz. ")



  if (!_pozId) throw new Error("MONGO // openMetraj // Proje Id -- sorguya gönderilmemiş, lütfen Rapor7/24 ile irtibata geçiniz. ")
  try {
    if (typeof pozId == "string") {
      _pozId = new BSON.ObjectId(pozId)
    } 
  } catch (err) {
    throw new Error("MONGO // openMetraj --  " + "MONGO // openMetraj -- sorguya gönderilen --pozId-- türü doğru değil, lütfen Rapor7/24 ile irtibata geçiniz.")
  }
  if (typeof _pozId != "object") throw new Error("MONGO // openMetraj --  " + "MONGO // openMetraj -- sorguya gönderilen --pozId-- türü doğru değil, lütfen Rapor7/24 ile irtibata geçiniz. ")




  const user = context.user
  const _userId = new BSON.ObjectId(user.id)
  const mailTeyit = user.custom_data.mailTeyit
  if (!mailTeyit) throw new Error("MONGO // openMetraj --  Öncelikle üyeliğinize ait mail adresinin size ait olduğunu doğrulamalısınız, tekrar giriş yapmayı deneyiniz veya bizimle iletişime geçiniz.")



  // poz create
  const currentTime = new Date()

  const collection_Metrajlar = context.services.get("mongodb-atlas").db("rapor724_v2").collection("metrajlar")
  

  // const pozMahal= await collection_Metrajlar.find({_mahalId,_pozId})
  
   let result = await collection_Metrajlar.updateOne(
    { _projectId, _mahalId, _pozId }, // Query for the user object of the logged in user
    {
      $set: {
        open: open,
        createdBy: _userId,
        createdAt: currentTime,
      }
    },
    { upsert: true }
  );
    
    
  resultMahalPoz = {
    _mahalId,
    _pozId,
    open: open,
  }
  

  return (resultMahalPoz)

};


