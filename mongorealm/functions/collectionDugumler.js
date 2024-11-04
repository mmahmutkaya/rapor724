exports = async function ({
  functionName,
  _projectId,
  _mahalId,
  _pozId,
  _lbsId,
  _wbsId,
  wbsCode,
  lbsCode,
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


  const currentTime = new Date();
  const collection_Dugumler = context.services
    .get("mongodb-atlas")
    .db("rapor724_dugumler")
    .collection(_projectId.toString());
  



  const collection_Projects = context.services
    .get("mongodb-atlas")
    .db("rapor724_v2")
    .collection("projects");

  const project2 = await collection_Projects.aggregate([
    { $match: { _id:_projectId } },
  ]).toArray()

  
  let project
  project2.map((x,index) => {
    // zaten bir project var ama olsun biz yine de index ===0 mı yani ilk obje mi sorgusunu yapalım
    if(index == 0) project = x
  })

  

  if (functionName == "getMahalListesi") {
    
    const list = await collection_Dugumler.aggregate([
      { $match: { openMetraj:true } },
    ]).toArray()
    // const list = await collection_Dugumler.find({_projectId}).toArray()

 
    let wbsLer
    //
    list.map(oneNode => {

      // ilk seviye wbsLer'in yerleştirilmesi
      let code2 = ""
      if(!wbsLer) {
        let {_id, code, name} = project.wbs.find(x => x._id.toString() === oneNode._wbsId.toString())
        wbsLer = [{_id, code, name}]
        code2 = code
      } else {
        if( !wbsLer.find( y => y._id.toString() == oneNode._wbsId.toString()) ){
          let {_id, code, name} = project.wbs.find(x => x._id.toString() === oneNode._wbsId.toString())
          wbsLer = [...wbsLer, {_id, code, name}]
          code2 = code
        }
      }
      
      // varsa üst seviye wbs leri de eklemeye çalışıyoruz
      let codeArray = code2.split(".")
      if(codeArray.length > 1) {
        let initialCode = ""
        codeArray.map(oneCode => {
          initialCode = initialCode.length ? initialCode + "." + oneCode : oneCode
          if(!wbsLer.find(x => x.code == initialCode)) {
            let {_id, code, name} = project.wbs.find(x => x.code === initialCode)
            wbsLer = [...wbsLer, {_id, code, name}]
          }
        })
      }  

    });


    let lbsLer
    //
    list.map(oneNode => {

      // ilk seviye lbsLer'in yerleştirilmesi
      let code2 = ""
      if(!lbsLer) {
        let {_id, code, name} = project.lbs.find(x => x._id.toString() === oneNode._lbsId.toString())
        lbsLer = [{_id, code, name}]
        code2 = code
      } else {
        if( !lbsLer.find( y => y._id.toString() == oneNode._lbsId.toString()) ){
          let {_id, code, name} = project.lbs.find(x => x._id.toString() === oneNode._lbsId.toString())
          lbsLer = [...lbsLer, {_id, code, name}]
          code2 = code
        }
      }
      
      // varsa üst seviye lbs leri de eklemeye çalışıyoruz
      let codeArray = code2.split(".")
      if(codeArray.length > 1) {
        let initialCode = ""
        codeArray.map(oneCode => {
          initialCode = initialCode.length ? initialCode + "." + oneCode : oneCode
          if(!lbsLer.find(x => x.code == initialCode)) {
            let {_id, code, name} = project.lbs.find(x => x.code === initialCode)
            lbsLer = [...lbsLer, {_id, code, name}]
          }
        })
      }  

    });
    
    return {list,wbsLer,lbsLer}
  }


  
  if (functionName == "getDugumMetraj") {
   
   const result = collection_Dugumler.aggregate([
      { $match: { _mahalId, _pozId } },
      { $project: { onaylananMetrajlar: 1, hazirlananMetrajlar: 1, _id: 1 } }
    ]);

    return result
    
  }

  
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
      { _mahalId, _pozId },
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
      { _mahalId, _pozId },
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
      _mahalId,
      _pozId,
      _lbsId,
      _wbsId,
      wbsCode,
      lbsCode,
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
