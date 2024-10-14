exports = async function ({
  functionName,
  _projectId,
  _mahalId,
  _pozId,
  _lbsId,
  _wbsId,
  propertyName,
  propertyValue,
}) {

   
  // tip2 - (yukarıda açıklandı)
  const user = context.user;
  const _userId = new BSON.ObjectId(user.id);
  const mailTeyit = user.custom_data.mailTeyit;
  if (!mailTeyit)
    throw new Error(
      "MONGO // collectionDugumler --  Öncelikle üyeliğinize ait mail adresinin size ait olduğunu doğrulamalısınız, tekrar giriş yapmayı deneyiniz veya bizimle iletişime geçiniz."
    );

  const currentTime = new Date();
  const collection_Dugumler = context.services
    .get("mongodb-atlas")
    .db("rapor724_v2")
    .collection("dugumler");

  // gelen verileri ikiye ayırabiliriz,
  // 1-form verisinden önceki ana veriler - hata varsa hata döndürülür
  // 2-form verileri - hata varsa form alanlarında gözükmesi için bir obje gönderilir

  // tip2 - (yukarıda açıklandı)
  if (!_projectId)
    throw new Error(
      "MONGO // collectionDugumler // Proje Id -- sorguya gönderilmemiş, lütfen Rapor7/24 ile irtibata geçiniz. "
    );
  try {
    if (typeof _projectId == "string") {
      _projectId = new BSON.ObjectId(_projectId);
    }
  } catch (err) {
    throw new Error(
      "MONGO // collectionDugumler -- sorguya gönderilen --projectId-- türü doğru değil, lütfen Rapor7/24 ile irtibata geçiniz."
    );
  }
  if (typeof _projectId != "object")
    throw new Error(
      "MONGO // collectionDugumler -- sorguya gönderilen --projectId-- türü doğru değil, lütfen Rapor7/24 ile irtibata geçiniz. "
    );




  


  // // tip2 - (yukarıda açıklandı)
  // if (!_mahalId)
  //   throw new Error(
  //     "MONGO // collectionDugumler // Mahal Id -- sorguya gönderilmemiş, lütfen Rapor7/24 ile irtibata geçiniz. "
  //   );
  // try {
  //   if (typeof _mahalId == "string") {
  //     _mahalId = new BSON.ObjectId(_mahalId);
  //   }
  // } catch (err) {
  //   throw new Error(
  //     "MONGO // collectionDugumler -- sorguya gönderilen --mahalId-- türü doğru değil, lütfen Rapor7/24 ile irtibata geçiniz."
  //   );
  // }
  // if (typeof _mahalId != "object")
  //   throw new Error(
  //     "MONGO // collectionDugumler -- sorguya gönderilen --mahalId-- türü doğru değil, lütfen Rapor7/24 ile irtibata geçiniz. "
  //   );

  // // tip2 - (yukarıda açıklandı)
  // if (!_pozId)
  //   throw new Error(
  //     "MONGO // collectionDugumler // Poz Id -- sorguya gönderilmemiş, lütfen Rapor7/24 ile irtibata geçiniz. "
  //   );
  // try {
  //   if (typeof _pozId == "string") {
  //     _pozId = new BSON.ObjectId(_pozId);
  //   }
  // } catch (err) {
  //   throw new Error(
  //     "MONGO // collectionDugumler -- sorguya gönderilen --pozId-- türü doğru değil, lütfen Rapor7/24 ile irtibata geçiniz."
  //   );
  // }
  // if (typeof _pozId != "object")
  //   throw new Error(
  //     "MONGO // collectionDugumler -- sorguya gönderilen --pozId-- türü doğru değil, lütfen Rapor7/24 ile irtibata geçiniz. "
  //   );

  

  const collection_Projects = context.services
    .get("mongodb-atlas")
    .db("rapor724_v2")
    .collection("projects");

  const project2 = await collection_Projects.aggregate([
    { $match: { _id:_projectId } },
  ]).toArray()

  
  let project
  project2.map((x,index) => {
    if(index == 0) project = x
  })

  

  if (functionName == "getMahalListesi") {
    
    const list = await collection_Dugumler.aggregate([
      { $match: { _projectId, openMetraj:true } },
    ]).toArray()
    // const list = await collection_Dugumler.find({_projectId}).toArray()
    
    let _wbsIds = []
    let _lbsIds = []
    
    list.map(x => !_wbsIds.find(y => y.toString() == x._wbsId.toString() ) && _wbsIds.push(x._wbsId));
    list.map(x => !_lbsIds.find(y => y.toString() == x._lbsId.toString() ) && _lbsIds.push(x._lbsId));

    _wbsIds.map(oneId => {
      let code = project.wbs.find(x => x._id == oneId).code
      let count = code.split(".")
      code.split(".").reduce((initialValue,x,index) => {
        if(index === 0) {
          initialValue = x
          _wbsIds = [...wbsIds, isProject.wbs.find(x => x.code === initialValue)._id]
          return
        }
        if(index === count) {
          return
        }
        initialValue = initialValue + "." + x
        _wbsIds = [...wbsIds, isProject.wbs.find(x => x.code === initialValue)._id]
        
      })
      
    })

    return {list,_wbsIds,_lbsIds,project}
  }


  // if (functionName == "getNodeMetrajlar") {
    
  //   // const result = await collection_Dugumler.aggregate([
  //   //   { $match: { _projectId, _mahalId, _pozId } },
  //   // ]);

  //  const result = await collection_Dugumler.findOne(
  //     { _projectId, _mahalId, _pozId }
  //   );

  //   if (result.metrajSatirlari) {
  //     return result.metrajSatirlari
  //   }
    
  //   const metrajSatirlari = {
  //     guncel: {
  //       satirlar: [
  //          { satirNo:1, metin1: "a", metin2: "", carpan1:"" , carpan2: "", carpan3: "", carpan4: "", carpan5: "", metraj: "" },
  //          { satirNo:2, metin1: "", metin2: "", carpan1: "", carpan2: "", carpan3: "", carpan4: "", carpan5: "", metraj: "" },
  //          { satirNo:3, metin1: "", metin2: "", carpan1:"" , carpan2: "", carpan3: "", carpan4: "", carpan5: "", metraj: "" },
  //          { satirNo:4, metin1: "", metin2: "", carpan1: "", carpan2: "", carpan3: "", carpan4: "", carpan5: "", metraj: "" },
  //          { satirNo:5, metin1: "", metin2: "", carpan1: "", carpan2: "", carpan3: "", carpan4: "", carpan5: "", metraj: "" },
  //       ]
  //     }
  //   }
  //    return metrajSatirlari;
  // }


  
  if (functionName == "getDugumMetraj") {
   
   const result = collection_Dugumler.aggregate([
      { $match: { _projectId, _mahalId, _pozId } },
      { $project: { onaylananMetrajlar: 1, hazirlananMetrajlar: 1, _id: 1 } }
    ]);

    return result
    
  }

  
  // if (functionName == "getUserMetraj") {

  //   // aggregate array dönüş veriyor, içindeki tek objeyi alamadım bir türlü, o yüzden findOne kullandım aşağıda
  //   // let result = collection_Dugumler.aggregate([
  //   //   { $match: { _projectId, _mahalId, _pozId } },
  //   // ]);

  //   let result2 = await collection_Dugumler.findOne({ _projectId, _mahalId, _pozId })
    
  //   let result = {...result2}
  //   let hazirlananMetrajlar
  //   let userMetraj
  //   if(result.hazirlananMetrajlar){
  //     hazirlananMetrajlar = true
  //     userMetraj = result.hazirlananMetrajlar.find(x => x._userId.toString() == _userId.toString())
  //     if(userMetraj){
  //       return userMetraj
  //     }
  //   }
        
  //   let satirlar = [
  //     { satirNo:1, metin1: "a", metin2: "", carpan1:"" , carpan2: "", carpan3: "", carpan4: "", carpan5: "", metraj: "" },
  //     { satirNo:2, metin1: "", metin2: "", carpan1: "", carpan2: "", carpan3: "", carpan4: "", carpan5: "", metraj: "" },
  //     { satirNo:3, metin1: "", metin2: "", carpan1:"" , carpan2: "", carpan3: "", carpan4: "", carpan5: "", metraj: "" },
  //     { satirNo:4, metin1: "", metin2: "", carpan1: "", carpan2: "", carpan3: "", carpan4: "", carpan5: "", metraj: "" },
  //     { satirNo:5, metin1: "", metin2: "", carpan1: "", carpan2: "", carpan3: "", carpan4: "", carpan5: "", metraj: "" }
  //   ]
    
  //   newUserMetraj = {
  //     _userId,
  //     satirlar
  //   }
  //   if(hazirlananMetrajlar && !userMetraj) {
  //     await collection_Dugumler.updateOne( { _projectId, _mahalId, _pozId },[
  //       {$set:{"hazirlananMetrajlar":{
  //         $concatArrays:["$hazirlananMetrajlar",[newUserMetraj]]
  //       }}}
  //     ])
  //   }
    
  //   if(!hazirlananMetrajlar && !userMetraj) {
  //     await collection_Dugumler.updateOne({ _projectId, _mahalId, _pozId },[
  //       {$set:{"hazirlananMetrajlar":[newUserMetraj]}}
  //     ])
  //   }
    
  //   return newUserMetraj
  
  // }


  if (functionName == "updateUserMetraj") {

    let metraj = 0

    //  sorgu ile birlikte gönderilen metraj satırlarına müdahaleler
    let satirlar = propertyValue.map(oneRow => {

      // guncelleme zamanını verelim
      oneRow["sonGuncelleme"] = currentTime

      // bütün çarpan degerler boş ise satır metrajı da boş olsun 
      if (oneRow.carpan1 == "" && oneRow.carpan2 == "" && oneRow.carpan3 == "" && oneRow.carpan4 == "" && oneRow.carpan5 == "") {
        oneRow["metraj"] = ""
        return oneRow
      }

      // buraya geldik madem - her biri birbiri ile çarpılsın (boş hücreler sonucu değiştirmesin diye 1 olsun) 
      const value = (
        (oneRow.carpan1 == "" ? 1 : oneRow.carpan1) *
        (oneRow.carpan2 == "" ? 1 : oneRow.carpan2) *
        (oneRow.carpan3 == "" ? 1 : oneRow.carpan3) *
        (oneRow.carpan4 == "" ? 1 : oneRow.carpan4) *
        (oneRow.carpan5 == "" ? 1 : oneRow.carpan5)
      )


      let isMinha
      isMinha = oneRow["metin1"].replace("İ", "i").toLowerCase().includes("minha") || oneRow["metin2"].replace("İ", "i").toLowerCase().includes("minha") ? true : false
      
      // minha ise sonuç eksi deger olsun 
      if (isMinha) {
        oneRow["metraj"] = value * -1
        metraj = metraj + (value * -1)
        return oneRow
      } else {
        oneRow["metraj"] = value
        metraj = metraj + value
        return oneRow
      }
        
    })
  
    const result = await collection_Dugumler.updateOne(
      { _projectId, _mahalId, _pozId },
      [
        {
          $set: { "hazirlananMetrajlar": {
            $cond:{
              if:{$in:[_userId,"$hazirlananMetrajlar._userId"]},
              then:{$map: {
                input: "$hazirlananMetrajlar",
                as: "oneMetraj",
                in: { $cond: {
                  if: {"$eq":["$$oneMetraj._userId",_userId]},
                  then: {"$mergeObjects": ["$$oneMetraj",{satirlar, metraj}]},
                  else: "$$oneMetraj"
                }}
              }},
              else:{$concatArrays:["$hazirlananMetrajlar",[{_userId,satirlar:propertyValue}]]}
            }
          }},
        },
      ]
    );
    return {ok:"'setUserMetraj' çalıştı.",result}
    
  }

  
  if (functionName == "toggle_openMetraj") {
    
    const result = await collection_Dugumler.updateOne(
      { _projectId, _mahalId, _pozId },
      [
        {
          $set: { ["openMetraj"]: {
            $cond: {
              if: {"$eq":["$openMetraj",true]},
              then: false,
              else: true
            }
          }},
        }
      ]
    )
    
    if(result.matchedCount) {
      return {ok:"'toggle_openMetraj' - toggle - çalıştı.",result}
    }

    const dugumObject = {
      _projectId,
      _mahalId,
      _pozId,
      _lbsId,
      _wbsId,
      openMetraj:true,
      onaylananMetrajlar:{metraj:0, satirlar:[]},
      hazirlananMetrajlar:[],
      createdBy:_userId,      
    }
    const result2 = await collection_Dugumler.insertOne(dugumObject)    
    return {ok:"'toggle_openMetraj' - yeniObject - çalıştı.",result2}
    
  }
  

  return { ok: true, description: "herhangi bir fonksiyon içine giremedi" };
};
