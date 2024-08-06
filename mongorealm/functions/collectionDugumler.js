exports = async function ({
  functionName,
  _projectId,
  _mahalId,
  _pozId,
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




  if (functionName == "getMahalListesi") {
    const result = await collection_Dugumler.aggregate([
      { $match: { _projectId } },
    ]);
    return result;
  }


  if (functionName == "getNodeMetrajlar") {
    
    // const result = await collection_Dugumler.aggregate([
    //   { $match: { _projectId, _mahalId, _pozId } },
    // ]);

   const result = await collection_Dugumler.findOne(
      { _projectId, _mahalId, _pozId }
    );

    if (result.metrajSatirlari) {
      return result.metrajSatirlari
    }
    
    const metrajSatirlari = {
      guncel: {
        satirlar: [
           { satirNo:1, metin1: "a", metin2: "", carpan1:"" , carpan2: "", carpan3: "", carpan4: "", carpan5: "", metraj: "" },
           { satirNo:2, metin1: "", metin2: "", carpan1: "", carpan2: "", carpan3: "", carpan4: "", carpan5: "", metraj: "" },
           { satirNo:3, metin1: "", metin2: "", carpan1:"" , carpan2: "", carpan3: "", carpan4: "", carpan5: "", metraj: "" },
           { satirNo:4, metin1: "", metin2: "", carpan1: "", carpan2: "", carpan3: "", carpan4: "", carpan5: "", metraj: "" },
           { satirNo:5, metin1: "", metin2: "", carpan1: "", carpan2: "", carpan3: "", carpan4: "", carpan5: "", metraj: "" },
        ]
      }
    }
     return metrajSatirlari;
  }


  if (functionName == "getUserMetraj") {
  
    let result = collection_Dugumler.aggregate([
      { $match: { _projectId, _mahalId, _pozId } },
    ]);

    let result2 = Object.assign({}, result)
    // result = result.map(x => {
    //   if(!result2) result2 = x
    //   return x
    // })
    return {result,result2}
    
    let hazirlananMetrajlar
    let userMetraj
    if(result.hazirlananMetrajlar){
      hazirlananMetrajlar = true
      userMetraj = result.hazirlananMetrajlar.find(x => x._userId === _userId)
      if(userMetraj){
        return userMetraj
      }
    }
    return {hazirlananMetrajlar,userMetraj}
    
    let satirlar = [
      { satirNo:1, metin1: "a", metin2: "", carpan1:"" , carpan2: "", carpan3: "", carpan4: "", carpan5: "", metraj: "" },
      { satirNo:2, metin1: "", metin2: "", carpan1: "", carpan2: "", carpan3: "", carpan4: "", carpan5: "", metraj: "" },
      { satirNo:3, metin1: "", metin2: "", carpan1:"" , carpan2: "", carpan3: "", carpan4: "", carpan5: "", metraj: "" },
      { satirNo:4, metin1: "", metin2: "", carpan1: "", carpan2: "", carpan3: "", carpan4: "", carpan5: "", metraj: "" },
      { satirNo:5, metin1: "", metin2: "", carpan1: "", carpan2: "", carpan3: "", carpan4: "", carpan5: "", metraj: "" }
    ]
    
    newUserMetraj = {
      _userId,
      satirlar
    }
    if(hazirlananMetrajlar && !userMetraj) {
      await collection_Dugumler.updateOne( { _projectId, _mahalId, _pozId },[
        {$set:{"hazirlananMetrajlar":{
          $concatArrays:["$hazirlananMetrajlar",newUserMetraj]
        }}}
      ])
    }
    
    if(!hazirlananMetrajlar && !userMetraj) {
      await collection_Dugumler.updateOne({ _projectId, _mahalId, _pozId },[
        {$set:{"hazirlananMetrajlar":[newUserMetraj]}}
      ])
    }
    
    return newUserMetraj
  
  }



  if (functionName == "hazirlananMetrajlar") {
    const result = await collection_Dugumler.updateOne(
      { _projectId, _mahalId, _pozId },
      [
        {
          $set: { "hazirlananMetrajlar": {
            $map: {
              input: "$hazirlananMetrajlar",
              as: "oneMetraj",
              in: { $cond: {
                if: {"$eq":["oneMetraj._userId",_userId]},
                then: {"$mergeObjects": ["$$oneMetraj",{satirlar: propertValue}]},
                else: "$$oneMetraj"
              }}
            }
          }},
        },
      ]
    );
    if (!result.matchedCount) {
      const result = await collection_Dugumler.insertOne({
        _projectId,
        _mahalId,
        _pozId,
        [propertyName]: propertyValue,
      });
      return { ok: "level1_set_insertOne", result };
    } else {
      return { ok: "level1_set_updateOne_aggregate", result };
    }
  }

  return { ok: true, description: "herhangi bir fonksiyon içine giremedi" };
};
