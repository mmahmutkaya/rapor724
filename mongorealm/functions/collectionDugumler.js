exports = async function ({
  functionName,
  _projectId,
  _mahalId,
  _pozId,
  propertyName,
  propertyValue,
}) {

    return BSON.ObjectId.isValid(_projectId)
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

  // tip2 - (yukarıda açıklandı)
  if (!_mahalId)
    throw new Error(
      "MONGO // collectionDugumler // Mahal Id -- sorguya gönderilmemiş, lütfen Rapor7/24 ile irtibata geçiniz. "
    );
  try {
    if (typeof _mahalId == "string") {
      _mahalId = new BSON.ObjectId(_mahalId);
    }
  } catch (err) {
    throw new Error(
      "MONGO // collectionDugumler -- sorguya gönderilen --mahalId-- türü doğru değil, lütfen Rapor7/24 ile irtibata geçiniz."
    );
  }
  if (typeof _mahalId != "object")
    throw new Error(
      "MONGO // collectionDugumler -- sorguya gönderilen --mahalId-- türü doğru değil, lütfen Rapor7/24 ile irtibata geçiniz. "
    );

  // tip2 - (yukarıda açıklandı)
  if (!_pozId)
    throw new Error(
      "MONGO // collectionDugumler // Poz Id -- sorguya gönderilmemiş, lütfen Rapor7/24 ile irtibata geçiniz. "
    );
  try {
    if (typeof _pozId == "string") {
      _pozId = new BSON.ObjectId(_pozId);
    }
  } catch (err) {
    throw new Error(
      "MONGO // collectionDugumler -- sorguya gönderilen --pozId-- türü doğru değil, lütfen Rapor7/24 ile irtibata geçiniz."
    );
  }
  if (typeof _pozId != "object")
    throw new Error(
      "MONGO // collectionDugumler -- sorguya gönderilen --pozId-- türü doğru değil, lütfen Rapor7/24 ile irtibata geçiniz. "
    );

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

  if (functionName == "level1_set") {
    const result = await collection_Dugumler.updateOne(
      { _projectId, _mahalId, _pozId },
      [
        {
          $set: { [propertyName]: propertyValue },
        },
      ]
    );
    if (!result.matchedCount) {
      const result = await collection_Dugumler.insertOne({
        _projectId,
        _mahalId,
        _pozId,
        [propertyName]: propertyValue,
        metrajlar: [],
      });
      return { ok: "level1_set_insertOne", result };
    } else {
      return { ok: "level1_set_updateOne_aggregate", result };
    }
  }

  // return {
  //   functionName,
  //   _projectId,
  //   _mahalId,
  //   _pozId,
  //   propertyName,
  //   propertyValue,
  // };

  if (functionName == "getMahalListesi") {
    const result = await collection_Dugumler.aggregate(
       [ { $match : {  _projectId } } ]
    );
    return result;
  }

  return { ok: true, description: "herhangi bir fonksiyon içine giremedi" };
};
