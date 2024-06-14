exports = async function({pozId}){
  
  const user = context.user
  const _userId = new BSON.ObjectId(user.id)
  const mailTeyit = user.custom_data.mailTeyit
  if(!mailTeyit) throw new Error("MONGO // deletePoz // Öncelikle üyeliğinize ait mail adresinin size ait olduğunu doğrulamalısınız, tekrar giriş yapmayı deneyiniz veya bizimle iletişime geçiniz.")
  
  
  const collection_Projects = context.services.get("mongodb-atlas").db("rapor724_v2").collection("projects")
  const collection_Pozlar = context.services.get("mongodb-atlas").db("rapor724_v2").collection("pozlar")
  
  const poz = await collection_Pozlar.findOne({_id:pozId})
  
  if(poz?.includesMetraj) throw new Error("MONGO // deletePoz // Bu poza metraj girilmiş olduğu için silinemez.")
  
  let result = await collection_Pozlar.deleteOne({_id:pozId})
  
  if(!result.deletedCount) throw new Error("MONGO // deletePoz // Silinmek istenen poz sistemde bulunamadı, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz")
  
  const anyPoz = await collection_Pozlar.findOne({_wbsId:poz._wbsId})
  
  
  result.isProjectChanged = false

  if(!anyPoz) {
    
    await collection_Projects.updateOne(
      {
        _id:poz._projectId,
      },
      {
        $set: {"wbs.$[elem].includesPoz" : false }
      },
      {
        arrayFilters: [ { "elem._id": poz._wbsId } ] 
        // arrayFilters: [ { "elem.grade": { $gte: 85 } } ] 
      }
    );
    
    result.isIncludesPozFalse = true

  }
  
  return result
  
  // await collection_Projects.update(
  //   { _id:poz._projectId, wbs:{$elemMatch:{_wbsId:poz._wbsId}} }, // Query for the user object of the logged in user
  //   { $set: {'wbs.$.includesPoz':false} }, // Set the logged in user's favorite color to purple
  //   // { "$push": { "wbs": newWbsItem  } }
  //   // { upsert: true }
  // );
  
  
  
  // // const _projectId = new BSON.ObjectId(projectId)
  // let _projectId
  // try {
  //   _projectId = new BSON.ObjectId(projectId)
  // } catch(err){
  //   _projectId = projectId
  // }
  
  // const collection_Projects = context.services.get("mongodb-atlas").db("rapor724_v2").collection("projects")
  // const project = await collection_Projects.findOne({_id:_projectId, members:_userId, isDeleted:false})
  
  // if(!project) throw new Error("MONGO // deletePoz // Proje bulunamadı")
  // if(!project.wbs) throw new Error("MONGO // deletePoz // Projeye ait WBS bulunamadı")


  // let wbs = project.wbs.find(item => item._id.toString() == wbsId.toString())
  
  // if(!wbs) {
  //   throw new Error("MONGO // deletePoz // wbsId sistemde bulunamadı, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
  // }

  // if(wbs.openForPoz) {
  //   throw new Error("MONGO // deletePoz // Poz eklemeye açık başlıklar silinemez, öncelikle poz eklemeye kapatınız.")
  // }


  // // wbs in alt seviyeleri mevcutsa silinmesin
  // // burada includes kullanamayız çünkü içinde değil başında arıyoruz
  // let text = wbs.code + "."
  // if(project.wbs.find(item => item.code.indexOf(text) === 0)) {
  //   throw new Error("MONGO // deletePoz // " + "Silmek istediğiniz  WBS'in alt seviyeleri mevcut, öncelikle onları silmelisiniz.") 
  // }
  
  // let wbsCode = wbs.code

  // // en üst seviyede silme yapılacaksa
  // if(!wbsCode.includes(".")) {
    
  //   try {
    
  //     const willBeDeletedWbsCode = wbsCode
  //     // const leftPart = willBeDeletedWbsCode.substring(0, willBeDeletedWbsCode.lastIndexOf("."))
      
  //     // seçili wbs i listeden çıkarma
  //     const newWbsArray = project.wbs.filter(item => {
  //       if(item.code != willBeDeletedWbsCode) {
  //         return item
  //       }
  //     })
      
      
  //     // silinme işleminden sonra komşu wbs lerin code numarasını düzenleme, silinenden sonrakilerin code numarasında ilgili kısmı 1 azaltma
  //     // değişecek wbs code ların alt wbs leri de olabilir, alt wbs lerinde ilgili haneleri 1 azalmalı
  //     // unutma bu kısım en üst wbs ler için aşağıdan farklı
      
  //     // en üst (0) seviye olduğu için tek hane ve kendisi silinecek sayı zaten
  //     let willBeDeletedNumber = parseInt(willBeDeletedWbsCode)
  //     let longText
  //     let rightPart
  //     let theNumberText
  //     let theNumber
      
  //     const newWbsArray2 = newWbsArray.map(item => {
        
  //       longText = item.code
        
  //       if (longText.includes(".")) {
  //         theNumberText = longText.split(".")[0]
  //         theNumber = parseInt(theNumberText)
  //         // rightPart 11.23.45 --> 23.45
  //         rightPart = longText.substring(theNumberText.length + 1, longText.length)
  //         if(theNumber > willBeDeletedNumber) {
  //           return {...item, code: (theNumber -1) + "." + rightPart }
  //         } else {
  //           return item
  //         }
  //       }
        
  //       if (!longText.includes(".")) {
  //         // theNumberText = longText.split(".")[0]
  //         // theNumberText = longText
  //         // theNumber = parseInt(theNumberText)
  //         theNumber = parseInt(longText)
          
  //         if(theNumber > willBeDeletedNumber) {
  //           return {...item, code: (theNumber -1).toString() }
  //         } else {
  //           return item
  //         }
  //       }
        
        
  //     })
      
  //     // return newWbsArray2
      
  //     const result = await collection_Projects.updateOne(
  //       { _id:_projectId }, // Query for the user object of the logged in user
  //       { $set: {wbs:newWbsArray2} }, // Set the logged in user's favorite color to purple
  //       // { "$push": { "wbs": newWbsItem  } }
  //       // { upsert: true }
  //     );
      
  //     return {...project, wbs:newWbsArray2}
      
  //   } catch (err) {
  //     return {error: err.message}
  //   }
      
  // }
      
      


  // // en üst seviye değilse
  // if(wbsCode.includes(".")) {
    
  //   try {
    
  //     const willBeDeletedWbsCode = wbsCode

  //     // seçili wbs i listeden çıkarma
  //     const newWbsArray = project.wbs.filter(item => {
  //       if(item.code != willBeDeletedWbsCode) {
  //         return item
  //       }
  //     })
      
      
      
  //     let level = willBeDeletedWbsCode.split(".").length - 1
  //     // silinecek wbs numarasının en son hanede olduğunu biliyoruz çünkü son haneden önceki hanesi silinecek olsa alt seviyesi olmuş olurdu, yukarıdaki kontrolden geçmezdi
  //     let willBeDeletedNumber = parseInt(willBeDeletedWbsCode.split(".")[level])
      
  //     // leftPart - değişecek hane son hane demiştik, sabit baş kısmını alıyoruz, aşağıda işlem yapacağız -- 11.23.45 --> 11.23
  //     const leftPart = willBeDeletedWbsCode.substring(0, willBeDeletedWbsCode.lastIndexOf("."))
  //     let longText
  //     let rightPartWithTheNumber
  //     let rightPart
  //     let theNumberText
  //     let theNumber
  //     //
  //     const newWbsArray2 = newWbsArray.map(item => {
        
  //       if (item.code.indexOf(leftPart) === 0) {
  //         longText = item.code
  //         rightPartWithTheNumber = longText.substring(leftPart.length + 1, longText.length)
  //         theNumberText = rightPartWithTheNumber.split(".")[0]
  //         theNumber = parseInt(theNumberText)
  //         rightPart = rightPartWithTheNumber.substring(theNumberText.length + 1, rightPartWithTheNumber.length)

  //         if(theNumber > willBeDeletedNumber) {
  //           if(rightPart.length) {
  //             return {...item, code: leftPart + "." + (theNumber -1) + "." + rightPart }
  //           } else {
  //             return {...item, code: leftPart + "." + (theNumber -1) }
  //           }
  //         } else {
  //           return item
  //         }
          
  //       } else {
  //         return item
  //       }
  //     })
      
  //     // return newWbsArray2
      
  //     const result = await collection_Projects.updateOne(
  //       { _id:_projectId }, // Query for the user object of the logged in user
  //       { $set: {wbs:newWbsArray2} }, // Set the logged in user's favorite color to purple
  //       // { "$push": { "wbs": newWbsItem  } }
  //       // { upsert: true }
  //     );
      
  //     return {...project, wbs:newWbsArray2}
      
  //   } catch (err) {
  //     return {error: err.message}
  //   }
      
  // }
      
      

    

};