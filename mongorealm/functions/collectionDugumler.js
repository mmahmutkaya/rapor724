exports = async function ({
  functionName,
  _projectId,
  _mahalId,
  _pozId,
  _dugumId,
  _lbsId,
  _wbsId,
  wbsCode,
  lbsCode,
  mahalMetrajlar,
  propertyName,
  propertyValue,
  hazirlananMetraj_state,
  hazirlananMetrajlar_state,
  onaylananMetraj_state,
  switchValue
}) {



  const user = context.user;
  const _userId = new BSON.ObjectId(user.id)
  const userEmail = context.user.data.email
  const userIsim = user.custom_data.isim
  const userSoyisim = user.custom_data.soyisim

  const mailTeyit = user.custom_data.mailTeyit;
  if (!mailTeyit) {
    throw new Error("Öncelikle üyeliğinize ait mail adresinin size ait olduğunu doğrulamalısınız, tekrar giriş yapmayı deneyiniz veya bizimle iletişime geçiniz.");
  }

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

  const collection_Projects = context.services.get("mongodb-atlas").db("rapor724_v2").collection("projects")
  const collection_Dugumler = context.services.get("mongodb-atlas").db("rapor724_dugumler").collection(_projectId.toString())
  const collection_HazirlananMetrajlar = context.services.get("mongodb-atlas").db("rapor724_hazirlananMetrajlar").collection(_projectId.toString())
  const collection_OnaylananMetrajlar = context.services.get("mongodb-atlas").db("rapor724_onaylananMetrajlar").collection(_projectId.toString())
  const collection_Mahaller = context.services.get("mongodb-atlas").db("rapor724_mahaller").collection(_projectId.toString())
  const collection_Pozlar = context.services.get("mongodb-atlas").db("rapor724_pozlar").collection(_projectId.toString())
  const collection_Users = context.services.get("mongodb-atlas").db("rapor724_v2").collection("users")



  const project2 = await collection_Projects.aggregate([
    { $match: { _id: _projectId } },
  ]).toArray()


  let project
  project2.map((x, index) => {
    // zaten bir project var ama olsun biz yine de index ===0 mı yani ilk obje mi sorgusunu yapalım
    if (index == 0) project = x
  })


  if (functionName == "getMahalListesi") {

    const list = await collection_Dugumler.aggregate([
      { $match: { openMetraj: true } },
    ]).toArray()

    // const list = await collection_Dugumler.find({_projectId}).toArray()

    // let wbsLer
    // //
    // list.map(oneNode => {

    //   // ilk seviye wbsLer'in yerleştirilmesi
    //   let code2 = ""
    //   if (!wbsLer) {
    //     let { _id, code, name } = project.wbs.find(x => x._id.toString() === oneNode._wbsId.toString())
    //     wbsLer = [{ _id, code, name }]
    //     code2 = code
    //   } else {
    //     if (!wbsLer.find(y => y._id.toString() == oneNode._wbsId.toString())) {
    //       let { _id, code, name } = project.wbs.find(x => x._id.toString() === oneNode._wbsId.toString())
    //       wbsLer = [...wbsLer, { _id, code, name }]
    //       code2 = code
    //     }
    //   }

    //   // varsa üst seviye wbs leri de eklemeye çalışıyoruz
    //   let codeArray = code2.split(".")
    //   if (codeArray.length > 1) {
    //     let initialCode = ""
    //     codeArray.map(oneCode => {
    //       initialCode = initialCode.length ? initialCode + "." + oneCode : oneCode
    //       if (!wbsLer.find(x => x.code == initialCode)) {
    //         let { _id, code, name } = project.wbs.find(x => x.code === initialCode)
    //         wbsLer = [...wbsLer, { _id, code, name }]
    //       }
    //     })
    //   }

    // });


    // let lbsLer
    // //
    // list.map(oneNode => {

    //   // ilk seviye lbsLer'in yerleştirilmesi
    //   let code2 = ""
    //   if (!lbsLer) {
    //     let { _id, code, name } = project.lbs.find(x => x._id.toString() === oneNode._lbsId.toString())
    //     lbsLer = [{ _id, code, name }]
    //     code2 = code
    //   } else {
    //     if (!lbsLer.find(y => y._id.toString() == oneNode._lbsId.toString())) {
    //       let { _id, code, name } = project.lbs.find(x => x._id.toString() === oneNode._lbsId.toString())
    //       lbsLer = [...lbsLer, { _id, code, name }]
    //       code2 = code
    //     }
    //   }

    //   // varsa üst seviye lbs leri de eklemeye çalışıyoruz
    //   let codeArray = code2.split(".")
    //   if (codeArray.length > 1) {
    //     let initialCode = ""
    //     codeArray.map(oneCode => {
    //       initialCode = initialCode.length ? initialCode + "." + oneCode : oneCode
    //       if (!lbsLer.find(x => x.code == initialCode)) {
    //         let { _id, code, name } = project.lbs.find(x => x.code === initialCode)
    //         lbsLer = [...lbsLer, { _id, code, name }]
    //       }
    //     })
    //   }

    // });

    return { list }
  }



  // if (functionName == "updateMahalMetraj") {

  //   const bulkArray = mahalMetrajlar.map(x => {
  //     return (
  //       {
  //         updateOne: {
  //           filter: { _id: x._dugumId },
  //           update: { $set: { metraj: x.metrajValue } }
  //         }
  //       }
  //     )
  //   })

  //   try {
  //     const result = collection_Dugumler.bulkWrite(
  //       bulkArray,
  //       { ordered: false }
  //     )
  //     return result
  //   } catch (error) {
  //     print(error)
  //   }

  // }



  if (functionName == "getHazirlananMetrajlar") {

    const resultArray = await collection_HazirlananMetrajlar.aggregate([
      { $match: { _mahalId, _pozId } }
    ]).toArray()

    return resultArray[0]?.hazirlananMetrajlar ? resultArray[0].hazirlananMetrajlar : resultArray
  }



  if (functionName == "getOnaylananMetraj") {

    const resultArray = await collection_OnaylananMetrajlar.aggregate([
      { $match: { _mahalId, _pozId } }
    ]).toArray()

    return resultArray[0]?.onaylananMetraj ? resultArray[0].onaylananMetraj : resultArray
  }



  if (functionName == "getPozlarMetraj") {

    const result = collection_Dugumler.aggregate([
      {
        $group: { _id: "$_pozId", onaylananMetraj: { $sum: "$onaylananMetraj.metraj" } }
      }
    ]);

    return result

  }



  if (functionName == "updateOnaylananMetraj") {

    let result
    result = await collection_OnaylananMetrajlar.updateOne(
      { _mahalId, _pozId },
      [
        {
          $set: {
            "onaylananMetraj": onaylananMetraj_state
          },
        },
      ]
    );


    if (!result.matchedCount) {
      result = await collection_OnaylananMetrajlar.insertOne({ _mahalId, _pozId, onaylananMetraj: onaylananMetraj_state })
    }

    let result2
    result2 = await collection_HazirlananMetrajlar.updateOne(
      { _mahalId, _pozId },
      [
        {
          $set: {
            "hazirlananMetrajlar": hazirlananMetrajlar_state
          },
        },
      ]
    );


    let hazirlananMetrajlar_state2 = hazirlananMetrajlar_state
    hazirlananMetrajlar_state2 = hazirlananMetrajlar_state2.map(x => {
      delete x.satirlar
      return x
    })

    let onaylananMetraj_state2 = onaylananMetraj_state
    delete onaylananMetraj_state2.satirlar



    const result3 = await collection_Dugumler.updateOne(
      { _mahalId, _pozId },
      [
        {
          $set: {
            "hazirlananMetrajlar": hazirlananMetrajlar_state2,
            "onaylananMetraj": onaylananMetraj_state2
          },
        },
      ]
    );

    return { ok: "'updateOnaylananMetraj' çalıştı.", result, result2, result3 }

  }




  if (functionName == "updateHazirlananMetraj") {

    let metraj = 0

    //  sorgu ile birlikte gönderilen metraj satırlarına müdahaleler
    let satirlar = hazirlananMetraj_state.satirlar.map(oneRow => {

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

    let result
    result = await collection_HazirlananMetrajlar.updateOne(
      { _mahalId, _pozId },
      [
        {
          $set: {
            "hazirlananMetrajlar": {
              $cond: {
                if: { $in: [_userId, "$hazirlananMetrajlar._userId"] },
                then: {
                  $map: {
                    input: "$hazirlananMetrajlar",
                    as: "hazirlananMetraj",
                    in: {
                      $cond: {
                        if: { "$eq": ["$$hazirlananMetraj._userId", _userId] },
                        then: { "$mergeObjects": ["$$hazirlananMetraj", { satirlar, metraj }] },
                        else: "$$hazirlananMetraj"
                      }
                    }
                  }
                },
                else: { $concatArrays: ["$hazirlananMetrajlar", [{ _userId, satirlar, metraj }]] }
              }
            }
          },
        },
      ]
    );


    if (!result.matchedCount) {
      result = await collection_HazirlananMetrajlar.insertOne({ _mahalId, _pozId, hazirlananMetrajlar: [{ _userId, satirlar, metraj }] })
    }


    const result2 = await collection_Dugumler.updateOne(
      { _mahalId, _pozId },
      [
        {
          $set: {
            "hazirlananMetrajlar": {
              $cond: {
                if: { $in: [_userId, "$hazirlananMetrajlar._userId"] },
                then: {
                  $map: {
                    input: "$hazirlananMetrajlar",
                    as: "oneMetraj",
                    in: {
                      $cond: {
                        if: { "$eq": ["$$oneMetraj._userId", _userId] },
                        then: { "$mergeObjects": ["$$oneMetraj", { metraj }] },
                        else: "$$oneMetraj"
                      }
                    }
                  }
                },
                else: { $concatArrays: ["$hazirlananMetrajlar", [{ _userId, metraj }]] }
              }
            }
          },
        },
      ]
    );

    return { ok: "'updateHazirlananMetraj' çalıştı.", result, result2 }

  }




  if (functionName == "toggle_openMetraj") {

    const result = await collection_Dugumler.updateOne(
      { _mahalId, _pozId },
      [
        {
          $set: {
            ["openMetraj"]: switchValue
          },
        }
      ]
    )

    if (result.matchedCount) {
      return { ok: "'toggle_openMetraj' - toggle - çalıştı.", result }
    }

    const dugumObject = {
      _mahalId,
      _pozId,
      openMetraj: switchValue,
      // onaylananMetrajlar: { metraj: 0, satirlar: [] },
      hazirlananMetrajlar: [],
      createdBy: _userId,
    }
    const result2 = await collection_Dugumler.insertOne(dugumObject)
    return { ok: "'toggle_openMetraj' - yeniObject - çalıştı.", result2 }

  }



  if (functionName == "getProjectPozlar") {
    try {

      // pozlar metraj
      const collection_Dugumler = context.services.get("mongodb-atlas").db("rapor724_dugumler").collection(_projectId.toString())

      const onaylananMetrajlar = await collection_Dugumler.aggregate([
        {
          $group: { _id: "$_pozId", onaylananMetraj: { $sum: "$onaylananMetraj.metraj" } }
        }
      ]).toArray()

      const hazirlananMetrajlar = await collection_Dugumler.aggregate([
        {
          $unwind: "$hazirlananMetrajlar"
        },
        {
          $group: { _id: { _pozId: "$_pozId", _userId: "$hazirlananMetrajlar._userId" }, hazirlananMetraj: { $sum: "$hazirlananMetrajlar.metraj" } }
        },
        {
          $group: { _id: "$_id._pozId", hazirlananMetrajlar: { $push: { _userId: "$_id._userId", metraj: "$hazirlananMetraj" } } }
        }
      ]).toArray()


      const aktifPozlar = await collection_Dugumler.aggregate([
        {
          $match: { openMetraj: true }
        },
        {
          $group: { _id: "$_pozId" }
        }
      ]).toArray()



      // pozlar bulma ve metrajlar ile birleştirme
      const collection = context.services.get("mongodb-atlas").db("rapor724_pozlar").collection(_projectId.toString())
      let pozlar = await collection.find({ isDeleted: false }).toArray()
      let pozlar2 = pozlar.map(onePoz => {
        let onaylananMetraj = onaylananMetrajlar.find(x => x._id.toString() == onePoz._id.toString())
        let hazirlananMetrajlar2 = hazirlananMetrajlar.find(x => x._id.toString() == onePoz._id.toString())
        let openMetraj = aktifPozlar.find(x => x._id.toString() == onePoz._id.toString()) ? true : false
        let pozBirim = project.pozBirimleri.find(x => x.id == onePoz?.birimId)?.name
        return { ...onePoz, ...onaylananMetraj, ...hazirlananMetrajlar2, openMetraj, pozBirim }
      })

      return pozlar2

    } catch (err) {

      throw new Error("MONGO // getProjectPozlar // " + err.message)
    }

  }




  return { ok: true, description: "herhangi bir fonksiyon içine giremedi" };
};
