exports = async function({projectId, upLbsId, newLbsName, newLbsCodeName}){
  
  // yukarıda satırda form içinde gelen verilerde hata tespit edilirse formun ilgili alanlarında gösterim yapılabilsin diye error objesi gönderilir


  
  if(!projectId) throw new Error("MONGO // createLbs // --Proje Id-- sorguya, gönderilmemiş, lütfen Rapor7/24 ile irtibata geçiniz. ")
  
  
  let _projectId
  try {
    if(typeof projectId == "string"){
      _projectId = new BSON.ObjectId(projectId)
    } else {
      _projectId = projectId
    }
  } catch(err){
    throw new Error("MONGO // createLbs --  " + "MONGO // createLbs -- sorguya gönderilen --projectId-- türü doğru değil, lütfen Rapor7/24 ile irtibata geçiniz.")
  }
  if(typeof _projectId != "object") throw new Error("MONGO // createLbs --  " + "MONGO // createLbs -- sorguya gönderilen --projectId-- türü doğru değil, lütfen Rapor7/24 ile irtibata geçiniz. ")


  if( !(upLbsId === "0" || typeof upLbsId === "object") ) throw new Error("MONGO // createLbs // --upLbsId-- sorguya, gönderilmemiş, lütfen Rapor7/24 ile irtibata geçiniz. ")
  
  
  
  
  // aşağıdaki form verilerinden birinde hata tespit edilmişse
  // alt satırda oluşturulan errorFormObj objesine form verisi ile ilişkilendirilmiş  property oluşturulup, içine yazı yazılıyor
  // property isimleri yukarıda ilk satırda frontend den gelen verileri yakalarken kullanılanlar ile aynı 
  // fonksiyon returnü olarak errorFormObj objesi döndürülüyor, frontenddeki form ekranında form verisine ait ilgili alanda bu yazı gösteriliyor
  // form ile ilişkilendirilmiş ilgili alana ait bir ke hata yazısı yazılmışsa yani null değilse üstüne yazı yazılmıyor, ilk tespit edilen hata değiştirilmmeiş oluyor
  const errorFormObj = {}
  
  
  //form verisi -- yukarıda  "" const errorFormObj = {} ""  yazan satırdan önceki açıklamaları oku
  typeof newLbsName != "string" && errorFormObj.newLbsName === null ?  errorFormObj.newLbsName = "MONGO // createLbs --  newLbsName -- sorguya, string formatında gönderilmemiş, lütfen Rapor7/24 ile irtibata geçiniz. " : null
  newLbsName = await context.functions.execute("functions_deleteLastSpace", newLbsName)
  if(!newLbsName.length) !errorFormObj.newLbsName ?  errorFormObj.newLbsName = "MONGO // createLbs --  newLbsName -- sorguya, gönderilmemiş, lütfen Rapor7/24 ile irtibata geçiniz." : null

  
  //form verisi -- yukarıda  "" const errorFormObj = {} ""  yazan satırdan önceki açıklamaları oku
  typeof newLbsCodeName != "string" && errorFormObj.newLbsCodeName === null ?  errorFormObj.newLbsCodeName = "MONGO // createLbs --  newLbsCodeName -- sorguya, string formatında gönderilmemiş, lütfen Rapor7/24 ile irtibata geçiniz. " : null
  newLbsCodeName = await context.functions.execute("functions_deleteLastSpace", newLbsCodeName)
  !newLbsCodeName.length == 0 && errorFormObj.newLbsCodeName === null ?  errorFormObj.newLbsCodeName = "MONGO // createLbs --  newLbsCodeName -- sorguya, gönderilmemiş, lütfen Rapor7/24 ile irtibata geçiniz." : null

  
  // form veri girişlerinden en az birinde hata tespit edildiği için form objesi dönderiyoruz, formun ilgili alanlarında gösterilecek
  // errorFormObj - aşağıda tekrar gönderiliyor
  if(Object.keys(errorFormObj).length) return ({errorFormObj})

  
  const user = context.user
  const _userId = new BSON.ObjectId(user.id)
  const mailTeyit = user.custom_data.mailTeyit
  if(!mailTeyit) throw new Error("MONGO // createLbs // Öncelikle üyeliğinize ait mail adresinin size ait olduğunu doğrulamalısınız, tekrar giriş yapmayı deneyiniz veya bizimle iletişime geçiniz.")


  const collection_Projects = context.services.get("mongodb-atlas").db("rapor724_v2").collection("projects")
  const project = await collection_Projects.findOne({_id:_projectId, members:_userId, isDeleted:false})
  
  if(!project) throw new Error("MONGO // createLbs // ProjectId bulunamadı, lütfen sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
  
  
  //ilk defa lbs kaydı yapılacaksa, yani henüz "project.lbs" yoksa
  if(!project.lbs || project.lbs.length === 0) {
    
    const newLbsItem = {
      _id:BSON.ObjectId(),
      code:"1",
      name:newLbsName,
      codeName:newLbsCodeName,
      openForMahal:false,
      includesMahal:false
    }
  
    try {
  
      const resultMongo = await collection_Projects.updateOne(
        { _id:_projectId }, // Query for the user object of the logged in user
        { $set: {lbs:[newLbsItem]} }, // Set the logged in user's favorite color to purple
        // { "$push": { "lbs": newLbsItem  } }
        // { upsert: true }
      );
      
      if(resultMongo.modifiedCount === 1)  {
        // return {...project, lbs:[...[project.lbs], newLbsItem]} - project.lbs null olduğu için bu hata veriyordu, aşağıda kaldırdık, düzeldi
        return {...project, lbs:[newLbsItem]}
      }
      
      return resultMongo

    } catch(err) {
  
      throw new Error("MONGO // createLbs // 1 " + err.message)
    }
    
  }
  
  


  // en üst düzeye kayıt yapılacaksa - aşağıdaki fonksiyonlar en üst seviyeye göre hazırlanmış 
  if(upLbsId === "0") {
    
    let newNumber = 1
    let number
    
    project.lbs.filter(item => !item.code.includes(".")).map(item => {
      
      item.name === newLbsName && !errorFormObj.newLbsName ? errorFormObj.newLbsName = "Aynı grup içinde kullanılmış" : null
      item.codeName === newLbsCodeName && !errorFormObj.newLbsCodeName ? errorFormObj.newLbsCodeName = "Aynı grup içinde kullanılmış" : null
      
      
      number = parseInt(item.code)
      
      if(number >= newNumber) {
        return newNumber = number +1
      }
      
    })
    
    // açıklamalar yukarıda
    if(Object.keys(errorFormObj).length) return ({errorFormObj})
    

    const newLbsItem = {
      _id:BSON.ObjectId(),
      code:newNumber.toString(),
      name:newLbsName,
      codeName:newLbsCodeName,
      openForMahal:false,
      includesMahal:false
    }
    
    
    try {
  
      await collection_Projects.updateOne(
        { _id:_projectId }, // Query for the user object of the logged in user
        // { $set: {lbs:newLbs} }, // Set the logged in user's favorite color to purple
        { "$push": { "lbs": newLbsItem  } }
        // { upsert: true }
      );
    
      // return newLbsItem[0].code
      return {...project, lbs:[...project.lbs, newLbsItem]}

    } catch(err) {
  
      throw new Error("MONGO // createLbs // " + err.message)
    }
    
  }





  //en üst düzey olmayıp mevcut lbs kaydına ekleme yapılacaksa

  let upLbs = project.lbs.find(item => item._id.toString() == upLbsId.toString())
  if(!upLbs) {
    throw new Error("MONGO // createLbs // upLbsId sistemde bulunamadı, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
  }
  
  if(upLbs.code?.split(".").length === 8) {
    throw new Error("MONGO // createLbs // Daha fazla alt başlık oluşturamazsınız.")
  }
  
  if(upLbs.openForMahal == true) {
    throw new Error("MONGO // createLbs // __mesajBaslangic__ Mahal eklemeye açmış olduğunuz başlığa alt başlık ekleyemezsiniz. Bu başlık altına hiç mahal eklemediyseniz bu başlığı mahal eklemeye kapatarak bu işlemi gerçekleştirebilirsiniz. Bu başlık altına mahal eklediyseniz, yeni bir başlık hiyerarşisi oluşturup, mahalleri yeni başlıklara taşıyarak bu işlemi dolaylı olarak gerçekleştirebilirsiniz. __mesajBitis__")
  }
  
  let upLbsCode = upLbs.code
    
  let text = upLbsCode + "."
  let level = text.split(".").length -1 
  let newNumber = 1
  let number
  
  project.lbs.filter(item => item.code.indexOf(text) == 0 && item.code.split(".").length - 1  == level).map(item => {
    
      item.name === newLbsName && !errorFormObj.newLbsName ? errorFormObj.newLbsName = "Aynı grup içinde kullanılmış" : null
      item.codeName === newLbsCodeName && !errorFormObj.newLbsCodeName ? errorFormObj.newLbsCodeName = "Aynı grup içinde kullanılmış" : null
      
      // yeni eklenecek lbs son hane numarasını belirlemek için aynı seviyedeki diğer lbs son numaraları kontrol ediliyor
      number = parseInt(item.code.split(text)[1])
      if(number >= newNumber) {
        return newNumber = number +1
      }
    
  })
  
  
    
  // açıklamalar yukarıda
  if(Object.keys(errorFormObj).length) return ({errorFormObj})
  
  
  let newLbsItem = {
    _id:BSON.ObjectId(),
    code:text + newNumber,
    name:newLbsName,
    codeName:newLbsCodeName,
    openForMahal:false,
    includesMahal:false
  }

  try {

    await collection_Projects.updateOne(
      { _id:_projectId }, // Query for the user object of the logged in user
      // { $set: {lbs:[newLbsItem]} }, // Set the logged in user's favorite color to purple
      { "$push": { "lbs": newLbsItem  } }
      // { upsert: true }
    );
  
    // return newLbsItem[0].code
    return {...project, lbs:[...project.lbs, newLbsItem]}

  } catch(err) {

    throw new Error("MONGO // createLbs // " + err.message)
  }
  


};