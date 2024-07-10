exports = async function ({
  functionName,
  _projectId,
  _mahalId,
  _pozId,
  propertyName,
  propertyValue,
}) {
  // gelen verileri ikiye ayırabiliriz,
  // 1-form verisinden önceki ana veriler - hata varsa hata döndürülür
  // 2-form verileri - hata varsa form alanlarında gözükmesi için bir obje gönderilir

  // tip2 - (yukarıda açıklandı)
  if (!_projectId)
    throw new Error(
      "MONGO // updateDugum // Proje Id -- sorguya gönderilmemiş, lütfen Rapor7/24 ile irtibata geçiniz. "
    );
  try {
    if (typeof _projectId == "string") {
      _projectId = new BSON.ObjectId(projectId);
    }
  } catch (err) {
    throw new Error(
      "MONGO // updateDugum --  " +
        "MONGO // updateDugum -- sorguya gönderilen --projectId-- türü doğru değil, lütfen Rapor7/24 ile irtibata geçiniz."
    );
  }
  if (typeof _projectId != "object")
    throw new Error(
      "MONGO // updateDugum --  " +
        "MONGO // updateDugum -- sorguya gönderilen --projectId-- türü doğru değil, lütfen Rapor7/24 ile irtibata geçiniz. "
    );

  // tip2 - (yukarıda açıklandı)
  if (!_mahalId)
    throw new Error(
      "MONGO // updateDugum // Proje Id -- sorguya gönderilmemiş, lütfen Rapor7/24 ile irtibata geçiniz. "
    );
  try {
    if (typeof mahalId == "string") {
      _mahalId = new BSON.ObjectId(mahalId);
    }
  } catch (err) {
    throw new Error(
      "MONGO // updateDugum --  " +
        "MONGO // updateDugum -- sorguya gönderilen --mahalId-- türü doğru değil, lütfen Rapor7/24 ile irtibata geçiniz."
    );
  }
  if (typeof _mahalId != "object")
    throw new Error(
      "MONGO // updateDugum --  " +
        "MONGO // updateDugum -- sorguya gönderilen --mahalId-- türü doğru değil, lütfen Rapor7/24 ile irtibata geçiniz. "
    );

  // tip2 - (yukarıda açıklandı)
  if (!_pozId)
    throw new Error(
      "MONGO // updateDugum // Proje Id -- sorguya gönderilmemiş, lütfen Rapor7/24 ile irtibata geçiniz. "
    );
  try {
    if (typeof pozId == "string") {
      _pozId = new BSON.ObjectId(pozId);
    }
  } catch (err) {
    throw new Error(
      "MONGO // updateDugum --  " +
        "MONGO // updateDugum -- sorguya gönderilen --pozId-- türü doğru değil, lütfen Rapor7/24 ile irtibata geçiniz."
    );
  }
  if (typeof _pozId != "object")
    throw new Error(
      "MONGO // updateDugum --  " +
        "MONGO // updateDugum -- sorguya gönderilen --pozId-- türü doğru değil, lütfen Rapor7/24 ile irtibata geçiniz. "
    );

  // tip2 - (yukarıda açıklandı)
  const user = context.user;
  const _userId = new BSON.ObjectId(user.id);
  const mailTeyit = user.custom_data.mailTeyit;
  if (!mailTeyit)
    throw new Error(
      "MONGO // updateDugum --  Öncelikle üyeliğinize ait mail adresinin size ait olduğunu doğrulamalısınız, tekrar giriş yapmayı deneyiniz veya bizimle iletişime geçiniz."
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
          $merge: {
            into: "newDailySales201905",
            on: ["_projectId", "_mahalId", "_pozId"],
            whenMatched: [
              {
                $set: { [propertyName]: propertyValue },
              },
            ],
            whenNotMatched: "insert",
          },
        },
      ]
    );
    return { ok: true, situation: functionName, result };
  }

  return { ok: true, situation: false };
};
