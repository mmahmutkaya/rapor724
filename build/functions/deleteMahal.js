exports = async function({mahalId}){
  
  const user = context.user
  const _userId = new BSON.ObjectId(user.id)
  const mailTeyit = user.custom_data.mailTeyit
  if(!mailTeyit) throw new Error("MONGO // deleteMahal // Öncelikle üyeliğinize ait mail adresinin size ait olduğunu doğrulamalısınız, tekrar giriş yapmayı deneyiniz veya bizimle iletişime geçiniz.")
  
  
  const collection_Projects = context.services.get("mongodb-atlas").db("rapor724_v2").collection("projects")
  const collection_Mahaller = context.services.get("mongodb-atlas").db("rapor724_v2").collection("mahaller")
  
  const mahal = await collection_Mahaller.findOne({_id:mahalId})
  
  if(mahal?.includesMetraj) throw new Error("MONGO // deleteMahal // Bu mahale metraj girilmiş olduğu için silinemez.")
  
  let result = await collection_Mahaller.deleteOne({_id:mahalId})
  
  if(!result.deletedCount) throw new Error("MONGO // deleteMahal // Silinmek istenen mahal sistemde bulunamadı, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz")
  
  const anyMahal = await collection_Mahaller.findOne({_lbsId:mahal._lbsId})
  
  
  result.isProjectChanged = false

  if(!anyMahal) {
    
    await collection_Projects.updateOne(
      {
        _id:mahal._projectId,
      },
      {
        $set: {"lbs.$[elem].includesMahal" : false }
      },
      {
        arrayFilters: [ { "elem._id": mahal._lbsId } ] 
        // arrayFilters: [ { "elem.grade": { $gte: 85 } } ] 
      }
    );
    
    result.isIncludesMahalFalse = true

  }
  
  return result
  
  // await collection_Projects.update(
  //   { _id:mahal._projectId, lbs:{$elemMatch:{_lbsId:mahal._lbsId}} }, // Query for the user object of the logged in user
  //   { $set: {'lbs.$.includesMahal':false} }, // Set the logged in user's favorite color to purple
  //   // { "$push": { "lbs": newLbsItem  } }
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
  
  // if(!project) throw new Error("MONGO // deleteMahal // Proje bulunamadı")
  // if(!project.lbs) throw new Error("MONGO // deleteMahal // Projeye ait Lbs bulunamadı")


  // let lbs = project.lbs.find(item => item._id.toString() == lbsId.toString())
  
  // if(!lbs) {
  //   throw new Error("MONGO // deleteMahal // lbsId sistemde bulunamadı, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
  // }

  // if(lbs.openForMahal) {
  //   throw new Error("MONGO // deleteMahal // Mahal eklemeye açık başlıklar silinemez, öncelikle mahal eklemeye kapatınız.")
  // }


  // // lbs in alt seviyeleri mevcutsa silinmesin
  // // burada includes kullanamayız çünkü içinde değil başında arıyoruz
  // let text = lbs.code + "."
  // if(project.lbs.find(item => item.code.indexOf(text) === 0)) {
  //   throw new Error("MONGO // deleteMahal // " + "Silmek istediğiniz  Lbs'in alt seviyeleri mevcut, öncelikle onları silmelisiniz.") 
  // }
  
  // let lbsCode = lbs.code

  // // en üst seviyede silme yapılacaksa
  // if(!lbsCode.includes(".")) {
    
  //   try {
    
  //     const willBeDeletedLbsCode = lbsCode
  //     // const leftPart = willBeDeletedLbsCode.substring(0, willBeDeletedLbsCode.lastIndexOf("."))
      
  //     // seçili lbs i listeden çıkarma
  //     const newLbsArray = project.lbs.filter(item => {
  //       if(item.code != willBeDeletedLbsCode) {
  //         return item
  //       }
  //     })
      
      
  //     // silinme işleminden sonra komşu lbs lerin code numarasını düzenleme, silinenden sonrakilerin code numarasında ilgili kısmı 1 azaltma
  //     // değişecek lbs code ların alt lbs leri de olabilir, alt lbs lerinde ilgili haneleri 1 azalmalı
  //     // unutma bu kısım en üst lbs ler için aşağıdan farklı
      
  //     // en üst (0) seviye olduğu için tek hane ve kendisi silinecek sayı zaten
  //     let willBeDeletedNumber = parseInt(willBeDeletedLbsCode)
  //     let longText
  //     let rightPart
  //     let theNumberText
  //     let theNumber
      
  //     const newLbsArray2 = newLbsArray.map(item => {
        
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
      
  //     // return newLbsArray2
      
  //     const result = await collection_Projects.updateOne(
  //       { _id:_projectId }, // Query for the user object of the logged in user
  //       { $set: {lbs:newLbsArray2} }, // Set the logged in user's favorite color to purple
  //       // { "$push": { "lbs": newLbsItem  } }
  //       // { upsert: true }
  //     );
      
  //     return {...project, lbs:newLbsArray2}
      
  //   } catch (err) {
  //     return {error: err.message}
  //   }
      
  // }
      
      


  // // en üst seviye değilse
  // if(lbsCode.includes(".")) {
    
  //   try {
    
  //     const willBeDeletedLbsCode = lbsCode

  //     // seçili lbs i listeden çıkarma
  //     const newLbsArray = project.lbs.filter(item => {
  //       if(item.code != willBeDeletedLbsCode) {
  //         return item
  //       }
  //     })
      
      
      
  //     let level = willBeDeletedLbsCode.split(".").length - 1
  //     // silinecek lbs numarasının en son hanede olduğunu biliyoruz çünkü son haneden önceki hanesi silinecek olsa alt seviyesi olmuş olurdu, yukarıdaki kontrolden geçmezdi
  //     let willBeDeletedNumber = parseInt(willBeDeletedLbsCode.split(".")[level])
      
  //     // leftPart - değişecek hane son hane demiştik, sabit baş kısmını alıyoruz, aşağıda işlem yapacağız -- 11.23.45 --> 11.23
  //     const leftPart = willBeDeletedLbsCode.substring(0, willBeDeletedLbsCode.lastIndexOf("."))
  //     let longText
  //     let rightPartWithTheNumber
  //     let rightPart
  //     let theNumberText
  //     let theNumber
  //     //
  //     const newLbsArray2 = newLbsArray.map(item => {
        
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
      
  //     // return newLbsArray2
      
  //     const result = await collection_Projects.updateOne(
  //       { _id:_projectId }, // Query for the user object of the logged in user
  //       { $set: {lbs:newLbsArray2} }, // Set the logged in user's favorite color to purple
  //       // { "$push": { "lbs": newLbsItem  } }
  //       // { upsert: true }
  //     );
      
  //     return {...project, lbs:newLbsArray2}
      
  //   } catch (err) {
  //     return {error: err.message}
  //   }
      
  // }
      
      

    

};