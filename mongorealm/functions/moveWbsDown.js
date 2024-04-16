exports = async function({projectId,wbsId}){
  
  const user = context.user
  const _userId = new BSON.ObjectId(user.id)
  const mailTeyit = user.custom_data.mailTeyit
  if(!mailTeyit) throw new Error("MONGO // moveWbsDown // Öncelikle üyeliğinize ait mail adresinin size ait olduğunu doğrulamalısınız, tekrar giriş yapmayı deneyiniz veya bizimle iletişime geçiniz.")


  // const _projectId = new BSON.ObjectId(projectId)
  let _projectId
  try {
    _projectId = new BSON.ObjectId(projectId)
  } catch(err){
    _projectId = projectId
  }
  
  const collection_Projects = context.services.get("mongodb-atlas").db("rapor724_v2").collection("projects")
  const project = await collection_Projects.findOne({_id:_projectId, members:_userId, isDeleted:false})
  
  if(!project) throw new Error("MONGO // moveWbsDown // Proje bulunamadı")
  if(!project.wbs) throw new Error("MONGO // moveWbsDown // Projeye ait WBS bulunamadı")


  let wbsOne = project.wbs.find(item => item._id.toString() == wbsId.toString())
  
  if(!wbsOne) {
    throw new Error("MONGO // moveWbsDown // wbsId sistemde bulunamadı, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
  }

  let _wbs = project.wbs
  let _selectedWbs = wbsOne
  let _wbs2



  let leftPart
  let level
  let sortNumber
  let longText

  leftPart = _selectedWbs.code.substring(0, _selectedWbs.code.lastIndexOf("."))
  level = _selectedWbs.code.split(".").length - 1
  sortNumber = Number(_selectedWbs.code.split(".")[level])
  longText = _selectedWbs.code

  let switch1 = false


  // taşınacak başlık en üst seviyede ise
  if (!leftPart) {

    _wbs2 = _wbs.map(item => {

      let leftPart2
      let level2
      let longText2
      let rightPartWithTheNumber2
      let rightPart2
      let theNumberText2
      let theNumber2

      longText2 = item.code


      level2 = longText2.split(".").length - 1
      rightPartWithTheNumber2 = longText2
      theNumberText2 = rightPartWithTheNumber2.split(".")[0]
      theNumber2 = parseInt(theNumberText2)
      rightPart2 = rightPartWithTheNumber2.substring(theNumberText2.length + 1, rightPartWithTheNumber2.length)
      
      
      // aynı seviyede bir altında varsa onu üste alma işlemi, switch kontrlün yapılıyor, altında yoksa işlem yok diye
      if (level2 == level && theNumber2 == sortNumber + 1) {
        let deneme = { ...item, code: (sortNumber).toString() }
        // console.log("deneme", deneme)
        switch1 = true
        return deneme
      }
      
      // aynı seviyede bir altında varsa onun alt başlıklarını üste alma işlemi, switch kontrlüne gerek yok, zaten üst başlığında yapıldı
      if (level2 > level && theNumber2  == sortNumber + 1 ) {
        let deneme2 = { ...item, code: (sortNumber) + "." + rightPart2 }
        // console.log("deneme2", deneme2)
        return deneme2
      }
      
      // taşınacak wbs i bir alta alma işlemi, switch kontrlüne gerek yok, zaten bu var kendisi
      if (level2 == level && theNumber2 == sortNumber) {
        let deneme3 = { ...item, code: (sortNumber + 1).toString() }
        // console.log("deneme3", deneme3)
        return deneme3
      }
      
      // taşınacak wbs in alt başlıklarını bir alta alma işlemi, switch kontrlüne gerek yok, zaten üst başlığında yapıldı
      if (level2 > level && theNumber2 == sortNumber) {
        let deneme4 = { ...item, code: (sortNumber + 1) + "." + rightPart2 }
        // console.log("deneme4", deneme4)
        return deneme4
      }

      return item

    })
  }


  // taşınacak başlık en üst seviyede değilse
  if (leftPart) {

    _wbs2 = _wbs.map(item => {

      let leftPart2
      let level2
      let longText2
      let rightPartWithTheNumber2
      let rightPart2
      let theNumberText2
      let theNumber2

      longText2 = item.code

      if (longText2.indexOf(leftPart + ".") === 0) {

        level2 = longText2.split(".").length - 1
        rightPartWithTheNumber2 = longText2.substring(leftPart.length + 1, longText2.length)
        theNumberText2 = rightPartWithTheNumber2.split(".")[0]
        theNumber2 = parseInt(theNumberText2)
        rightPart2 = rightPartWithTheNumber2.substring(theNumberText2.length + 1, rightPartWithTheNumber2.length)
        // console.log("rightPartWithTheNumber2", rightPartWithTheNumber2)
        // console.log("theNumber2", theNumber2)
        // console.log("rightPart2", rightPart2)
        // console.log("---")
          
        // aynı seviyede bir altında varsa onu üste alma işlemi, switch kontrlün yapılıyor, altında yoksa işlem yok diye
        if (level2 == level && theNumber2 == sortNumber + 1) {
          let deneme = { ...item, code: leftPart + "." + (sortNumber) }
          // console.log("deneme", deneme)
          switch1 = true
          return deneme
        }
        
        // aynı seviyede bir altında varsa onun alt başlıklarını üste alma işlemi, switch kontrlüne gerek yok, zaten üst başlığında yapıldı
        if (level2 > level && theNumber2 == sortNumber + 1) {
          let deneme2 = { ...item, code: leftPart + "." + (sortNumber) + "." + rightPart2 }
          // console.log("deneme2", deneme2)
          return deneme2
        }
        
        // taşınacak wbs i bir alta alma işlemi, switch kontrlüne gerek yok, zaten bu var kendisi
        if (level2 == level && theNumber2 == sortNumber) {
          let deneme3 = { ...item, code: leftPart + "." + (sortNumber + 1) }
          // console.log("deneme3", deneme3)
          return deneme3
        }
        
        // taşınacak wbs in alt başlıklarını bir alta alma işlemi, switch kontrlüne gerek yok, zaten üst başlığında yapıldı
        if (level2 > level && theNumber2 == sortNumber) {
          let deneme4 = { ...item, code: leftPart + "." + (sortNumber + 1) + "." + rightPart2 }
          // console.log("deneme4", deneme4)
          return deneme4
        }

      }

      return item

    })
    
  }


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