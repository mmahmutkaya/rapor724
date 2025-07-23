exports = async function ({
  _projeId,
  functionName,
  mahaller,
  _pozId,
  pozlar,
  _mahalId
}) {



  const user = context.user;
  const _userId = new BSON.ObjectId(user.id)
  const userEmail = context.user.data.email
  const userIsim = user.custom_data.isim
  const userSoyisim = user.custom_data.soyisim

  const mailTeyit = user.custom_data.mailTeyit;
  if (!mailTeyit) {
    throw new Error("MONGO // updateDugumler_openMetraj // Öncelikle üyeliğinize ait mail adresinin size ait olduğunu doğrulamalısınız, tekrar giriş yapmayı deneyiniz veya bizimle iletişime geçiniz.");
  }


  if (!_projeId) {
    throw new Error("MONGO // updateDugumler_openMetraj // '_projeId' verisi db sorgusuna gelmedi");
  }

  const currentTime = new Date();
  const collection_Dugumler = context.services.get("mongodb-atlas").db("rapor724_v2").collection("dugumler")


  if (functionName === "mahaller_byPozId") {

    if (!mahaller) {
      throw new Error("MONGO // updateDugumler_openMetraj // 'mahaller' verisi db sorgusuna gelmedi");
    }

    if (!_pozId) {
      throw new Error("MONGO // updateDugumler_openMetraj // '_pozId' verisi db sorgusuna gelmedi");
    }

    try {

      const bulkArray = mahaller.map(oneMahal => {
        return (
          {
            updateOne: {
              // filter: { _projeId, _mahalId: new BSON.ObjectId(x._mahalId), _pozId: new BSON.ObjectId(x._pozId) },
              filter: { _projeId, _mahalId: oneMahal._id, _pozId },
              update: { $set: { openMetraj: oneMahal.hasDugum } },
              upsert: true
            }
          }
        )
      })

      await collection_Dugumler.bulkWrite(
        bulkArray,
        { ordered: false }
      )

      return { ok: true }

    } catch (error) {
      throw new Error({ hatayeri: "MONGO // updateDugumler_openMetraj // collection_Dugumler.bulkWrite // ", error });
    }


  }



};
