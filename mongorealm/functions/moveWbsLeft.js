exports = async function({projectId,wbsId}){
  
  const user = context.user
  const _userId = new BSON.ObjectId(user.id)
  const mailTeyit = user.custom_data.mailTeyit
  if(!mailTeyit) throw new Error("MONGO // moveWbsLeft // Öncelikle üyeliğinize ait mail adresinin size ait olduğunu doğrulamalısınız, tekrar giriş yapmayı deneyiniz veya bizimle iletişime geçiniz.")


  // const _projectId = new BSON.ObjectId(projectId)
  let _projectId
  try {
    _projectId = new BSON.ObjectId(projectId)
  } catch(err){
    _projectId = projectId
  }
  
  const collection_Projects = context.services.get("mongodb-atlas").db("rapor724_v2").collection("projects")
  const project = await collection_Projects.findOne({_id:_projectId, members:_userId, isDeleted:false})
  
  if(!project) throw new Error("MONGO // moveWbsLeft // Proje bulunamadı")
  if(!project.wbs) throw new Error("MONGO // moveWbsLeft // Projeye ait WBS bulunamadı")


  let wbsOne = project.wbs.find(item => item._id.toString() == wbsId.toString())
  
  if(!wbsOne) {
    throw new Error("MONGO // moveWbsLeft // wbsId sistemde bulunamadı, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
  }

  let _wbs = project.wbs
  let _selectedWbs = wbsOne
  let _wbs2


  let leftPart = _selectedWbs.code.substring(0, _selectedWbs.code.lastIndexOf("."))
  let level = _selectedWbs.code.split(".").length - 1
  let sortNumber = Number(_selectedWbs.code.split(".")[level])
  let longText = _selectedWbs.code

  let leftPartB = leftPart.substring(0, leftPart.lastIndexOf("."))
  let levelB = leftPart.split(".").length - 1
  let sortNumberB = Number(leftPart.split(".")[levelB])
  let longTextB = leftPart
  
  let name_Match = false
  let codeName_Match = false
  let codeName_Match_name
  
  // zaten en üst seviyede ise daha fazla sola alınamaz
  if(!leftPart) {
    throw new Error("MONGO // moveWbsLeft // __mesajBaslangic__ zaten en üst seviyede __mesajBitis__")
  }


  let switch1 = false
  
  
  _wbs2 = _wbs.map(item => {

    let leftPart2
    let level2
    let longText2
    let rightPartWithTheNumber2
    let rightPart2
    let theNumberText2
    let theNumber2

    longText2 = item.code
    
    
    
    
    
    // taşınacağı seviyede isim benzerliği varsa - taşınacak seviye en üst ise
    if(!leftPartB){
      
      let level2 = longText2.split(".").length - 1
      
      if(level2 == 0) {
        
        if(item.name === _selectedWbs.name) {
          name_Match = true
        }
        
        if(item.codeName === _selectedWbs.codeName) {
          codeName_Match = true
          codeName_Match_name = item.name
        }
          
      }
      
    }
    
    
    // taşınacağı seviyede isim benzerliği varsa - taşınacak seviye en üst değil ise
    if(leftPartB){
      
      let level2 = longText2.split(".").length - 1
      
      if(longText2.indexOf(leftPartB + ".") === 0 && level2 == level -1) {
        
        if(item.name === _selectedWbs.name) {
          name_Match = true
        }
        
        if(item.codeName === _selectedWbs.codeName) {
          codeName_Match = true
          codeName_Match_name = item.name
        }
          
      }
      
    }
    
    
    if(name_Match){
      throw new Error("MONGO // moveWbsLeft // __mesajBaslangic__ Taşınmak istenen seviyede --" + _selectedWbs.name + "-- ismi mevcut, aynı seviyede iki aynı başlık kullanılamaz. __mesajBitis__")
    }
  
    if(codeName_Match){
      throw new Error("MONGO // moveWbsLeft // __mesajBaslangic__ Taşınmak istenen seviyede --" + codeName_Match_name + "-- isimli başlığın kod ismi --" + _selectedWbs.codeName + "-- ve taşınmak istenen başlığın kod ismi ile aynı. Aynı seviyede iki aynı kod ismi kullanılamaz. __mesajBitis__")
    }


    
    
    
    

    // taşınacak başlığın kendi seviyesindekiler ve onların alt başlıkları - bu kısmın aşağısında sadece kendi ve onun alt başlıklarını ayırıyoruz ve onlara işlem yapıyoruz
    if (longText2.indexOf(leftPart + ".") === 0) {

      level2 = longText2.split(".").length - 1
      rightPartWithTheNumber2 = longText2.substring(leftPart.length + 1, longText2.length)
      theNumberText2 = rightPartWithTheNumber2.split(".")[0]
      theNumber2 = parseInt(theNumberText2)
      rightPart2 = rightPartWithTheNumber2.substring(theNumberText2.length + 1, rightPartWithTheNumber2.length)

      // taşınacak başlığın kendisinin bir üst seviyeye alınması
      if (level2 == level && theNumber2 == sortNumber) {
        let deneme = { ...item, code: leftPartB ? leftPartB + "." + (sortNumberB + 1) : (sortNumberB + 1).toString() }
        // console.log("deneme", deneme)
        switch1 = true
        return deneme
      }

      // taşınacak başlığın alt başlıklarının taşınması
      if (longText2.indexOf(longText + ".") === 0) {
        let rightPartWithTheNumber = longText2.substring(longText.length + 1, longText2.length)
        let deneme = { ...item, code: leftPartB ? leftPartB + "." + (sortNumberB + 1) + "." + rightPartWithTheNumber : (sortNumberB + 1).toString() + "." + rightPartWithTheNumber }
        switch1 = true
        return deneme
      }

    }


    // taşınacak başlığın kendi seviyesindeki başlıkların ve onların alt başlıklarının bir üste taşınması
    if (longText2.indexOf(leftPart + ".") === 0) {
      let rightPartWithTheNumber = longText2.substring(leftPart.length + 1, longText2.length)
      let theNumberText = rightPartWithTheNumber.split(".")[0]
      let theNumber = parseInt(theNumberText)
      // rightPart 11.23.45 --> 23.45
      let rightPart = rightPartWithTheNumber.substring(theNumberText.length + 1, rightPartWithTheNumber.length)
      if (theNumber > sortNumber) {
        return { ...item, code: rightPart ? leftPart + "." + (theNumber - 1) + "." + rightPart : leftPart + "." + (theNumber - 1) }
      } else {
        return item
      }
    }

    // taşınacak başlığın taşındığı seviyedeki başlıkların ve onların alt başlıklarının bir alta taşınması - (taşınacak seviye en üst seviye ise)
    if (!leftPartB) {
      
      let rightPartWithTheNumber = longText2
      let theNumberText = rightPartWithTheNumber.split(".")[0]
      let theNumber = parseInt(theNumberText)
      // rightPart 11.23.45 --> 23.45
      let rightPart = rightPartWithTheNumber.substring(theNumberText.length + 1, rightPartWithTheNumber.length)
      if (theNumber >= sortNumberB + 1) {
        return { ...item, code: rightPart ? (theNumber + 1) + "." + rightPart : (theNumber + 1).toString() }
      } else {
        return item
      }
    }
    

    // taşınacak başlığın taşındığı seviyedeki kendinden küçük kodların bir alt seviyelere taşınması - (taşınacak seviye en üst seviye değilse)
    if (leftPartB && longText2.indexOf(leftPartB + ".") === 0) {
      
      let rightPartWithTheNumber = longText2.substring(leftPartB.length + 1, longText2.length)
      let theNumberText = rightPartWithTheNumber.split(".")[0]
      let theNumber = parseInt(theNumberText)
      // rightPart 11.23.45 --> 23.45
      let rightPart = rightPartWithTheNumber.substring(theNumberText.length + 1, rightPartWithTheNumber.length)
      if (theNumber >= sortNumberB + 1) {
        return { ...item, code: rightPart ? leftPartB + "." + (theNumber + 1) + "." + rightPart : leftPartB + "." + (theNumber + 1) }
      } else {
        return item
      }
    }

    return item

  })
  
  

  if (switch1) {
    
    await collection_Projects.updateOne(
      { _id:_projectId }, // Query for the user object of the logged in user
      { $set: {wbs:_wbs2} }, // Set the logged in user's favorite color to purple
      // { "$push": { "wbs": newWbsItem  } }
      // { upsert: true }
    );
    
    return {project:{...project, wbs:_wbs2}}

  } else {
    
    return {project}
    
  }


};