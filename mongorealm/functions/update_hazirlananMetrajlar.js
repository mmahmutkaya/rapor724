exports = async function ({
  _dugumId,
  hazirlananMetraj_state
}) {



  const user = context.user;
  const _userId = new BSON.ObjectId(user.id)
  const userEmail = context.user.data.email
  const userIsim = user.custom_data.isim
  const userSoyisim = user.custom_data.soyisim

  const mailTeyit = user.custom_data.mailTeyit;
  if (!mailTeyit) {
    throw new Error("MONGO // update_hazirlananMetrajlar // Öncelikle üyeliğinize ait mail adresinin size ait olduğunu doğrulamalısınız, tekrar giriş yapmayı deneyiniz veya bizimle iletişime geçiniz.");
  }

  if (!_dugumId) {
    throw new Error("MONGO // update_hazirlananMetrajlar // '_dugumId' verisi db sorgusuna gelmedi");
  }

  if (!hazirlananMetraj_state) {
    throw new Error("MONGO // update_hazirlananMetrajlar // 'hazirlananMetraj_state' verisi db sorgusuna gelmedi");
  }


  const currentTime = new Date();

  const collection_hazirlananMetrajlar = context.services.get("mongodb-atlas").db("rapor724_v2").collection("hazirlananMetrajlar")
  const collection_Dugumler = context.services.get("mongodb-atlas").db("rapor724_v2").collection("dugumler")



  let {metraj} = hazirlananMetraj_state.satirlar
  let newSatirlar = hazirlananMetraj_state.satirlar.filter(x => !x.onayli)

  try {

    let metrajSatirlari

    const hazirlananMetraj = await collection_hazirlananMetrajlar.findOne({ _dugumId, userEmail })

    if (hazirlananMetraj) {

      let { metrajSatirlari } = hazirlananMetraj

      if (metrajSatirlari) {

        metrajSatirlari = metrajSatirlari.filter(x => !x.onayli)
        metrajSatirlari = [...metrajSatirlari, ...newSatirlar]

      } else {

        metrajSatirlari = newSatirlar

      }

    } else {

      metrajSatirlari = newSatirlar

    }

    await collection_hazirlananMetrajlar.updateOne(
      { _dugumId, userEmail },
      { $set: { metrajSatirlari, metraj} },
      { upsert: true }
    )


  } catch (error) {
    throw new Error({ hatayeri: "MONGO // update_hazirlananMetrajlar // ", error });
  }



  

  try {

    let dugum = await collection_Dugumler.findOne({ _id: _dugumId })

    let { hazirlananMetrajlar } = dugum

    let isUpdated

    if (hazirlananMetrajlar) {

      hazirlananMetrajlar = hazirlananMetrajlar.map(x => {
        if (x.userEmail === userEmail) {
          x.metraj = metraj
          isUpdated = true
        }
        return x
      })

      if (!isUpdated) {
        hazirlananMetrajlar = [...hazirlananMetrajlar, { userEmail, metraj }]
      }

    } else {

      hazirlananMetrajlar = [{ userEmail, metraj }]

    }

    await collection_Dugumler.updateOne(
      { _id: _dugumId },
      { $set: { hazirlananMetrajlar } },
      { upsert: true }
    )

    return

  } catch (error) {
    throw new Error({ hatayeri: "MONGO // update_hazirlananMetrajlar // getDugumler // ", error });
  }

  return

};
