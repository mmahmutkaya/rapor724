exports = async function ({
  _dugumId,
  newMetrajSatirlari
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

  if (!newMetrajSatirlari) {
    throw new Error("MONGO // update_hazirlananMetrajlar // 'newMetrajSatirlari' verisi db sorgusuna gelmedi");
  }


  const currentTime = new Date();

  const collection_hazirlananMetrajlar = context.services.get("mongodb-atlas").db("rapor724_v2").collection("hazirlananMetrajlar")
  const collection_Dugumler = context.services.get("mongodb-atlas").db("rapor724_v2").collection("dugumler")



  let toplamMetraj = 0

  try {

    let oldHazirlananMetraj
    let metrajSatirlari

    const hazirlananMetraj = await collection_hazirlananMetrajlar.findOne({ _dugumId, userEmail })
    let { oldMetrajSatirlari } = hazirlananMetraj


    if (oldMetrajSatirlari) {
      oldMetrajSatirlari = oldMetrajSatirlari.filter(x => !x.onayli)
      metrajSatirlari = [...oldMetrajSatirlari, ...newMetrajSatirlari]
    } else {
      metrajSatirlari = newMetrajSatirlari
    }

    const result = await collection_hazirlananMetrajlar.updateOne(
      { _dugumId, userEmail },
      { $set: { metrajSatirlari } },
      { upsert: true }
    )


    metrajSatirlari.map(x => {
      toplamMetraj = toplamMetraj + x.metraj
    })


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
          x.metraj = toplamMetraj
          isUpdated = true
        }
        return x
      })

      if (!isUpdated) {
        hazirlananMetrajlar = [...hazirlananMetrajlar, { userEmail, metraj: toplamMetraj }]
      }

    } else {

      hazirlananMetrajlar = [{ userEmail, metraj: toplamMetraj }]

    }

    return

  } catch (error) {
    throw new Error({ hatayeri: "MONGO // update_hazirlananMetrajlar // getDugumler // ", error });
  }

  return

};
