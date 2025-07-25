exports = async function ({
  _dugumId,
  onaylananMetraj_state
}) {



  const user = context.user;
  const _userId = new BSON.ObjectId(user.id)
  const userEmail = context.user.data.email
  const userIsim = user.custom_data.isim
  const userSoyisim = user.custom_data.soyisim

  const mailTeyit = user.custom_data.mailTeyit;
  if (!mailTeyit) {
    throw new Error("MONGO // updateDugumler_onaylananMetraj // Öncelikle üyeliğinize ait mail adresinin size ait olduğunu doğrulamalısınız, tekrar giriş yapmayı deneyiniz veya bizimle iletişime geçiniz.");
  }

  if (!_dugumId) {
    throw new Error("MONGO // updateDugumler_onaylananMetraj // '_dugumId' verisi db sorgusuna gelmedi");
  }

  if (!onaylananMetraj_state) {
    throw new Error("MONGO // updateDugumler_onaylananMetraj // 'onaylananMetraj_state' verisi db sorgusuna gelmedi");
  }


  const currentTime = new Date();

  const collection_onaylananMetrajlar = context.services.get("mongodb-atlas").db("rapor724_v2").collection("onaylananMetrajlar")
  const collection_Dugumler = context.services.get("mongodb-atlas").db("rapor724_v2").collection("dugumler")




  let { metraj: newMetraj } = onaylananMetraj_state


  try {

    let { satirlar: newSatirlar } = onaylananMetraj_state
    newSatirlar = newSatirlar.filter(x => !x.onayli)


    const onaylananMetraj = await collection_onaylananMetrajlar.findOne({ _dugumId, userEmail })

    if (onaylananMetraj) {

      let { satirlar } = onaylananMetraj

      if (satirlar) {

        satirlar = satirlar.filter(x => x.onayli)
        newSatirlar = [...satirlar, ...newSatirlar]

      }

    }

    await collection_onaylananMetrajlar.updateOne(
      { _dugumId, userEmail },
      { $set: { satirlar: newSatirlar, metraj: newMetraj } },
      { upsert: true }
    )


  } catch (error) {
    throw new Error({ hatayeri: "MONGO // updateDugumler_onaylananMetraj // onaylanan metrajlar güncelleme", error });
  }



  try {
 
    await collection_Dugumler.updateOne(
      { _id: _dugumId },
      { $set: { onaylananMetraj: newMetraj} },
      { upsert: true }
    )

  } catch (error) {
    throw new Error({ hatayeri: "MONGO // updateDugumler_onaylananMetraj // dugum guncelleme ", error });
  }

  return

};
