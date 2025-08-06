exports = async function ({
  _projeId,
  _dugumId,
  hazirlananMetraj_selected
}) {



  const user = context.user;
  const _userId = new BSON.ObjectId(user.id)
  const userEmail = context.user.data.email
  const userIsim = user.custom_data.isim
  const userSoyisim = user.custom_data.soyisim

  const mailTeyit = user.custom_data.mailTeyit;
  if (!mailTeyit) {
    throw new Error("MONGO // update_hazirlananMetraj_selected // Öncelikle üyeliğinize ait mail adresinin size ait olduğunu doğrulamalısınız, tekrar giriş yapmayı deneyiniz veya bizimle iletişime geçiniz.");
  }

  if (!_projeId) {
    throw new Error("MONGO // update_hazirlananMetraj_selected // '_projeId' verisi db sorgusuna gelmedi");
  }

  if (!_dugumId) {
    throw new Error("MONGO // update_hazirlananMetraj_selected // '_dugumId' verisi db sorgusuna gelmedi");
  }

  if (!hazirlananMetraj_selected) {
    throw new Error("MONGO // update_hazirlananMetraj_selected // 'hazirlananMetraj_selected' verisi db sorgusuna gelmedi");
  }


  const currentTime = new Date();

  const collection_Projeler = context.services.get("mongodb-atlas").db("rapor724_v2").collection("projeler")
  const collection_HazirlananMetrajlar = context.services.get("mongodb-atlas").db("rapor724_v2").collection("hazirlananMetrajlar")
  const collection_Dugumler = context.services.get("mongodb-atlas").db("rapor724_v2").collection("dugumler")

  const proje = await collection_Projeler.findOne({ _id: _projeId })
  // const {metrajYapabilenler} = proje.yetki


  try {

    let hazirlananMetraj = await collection_HazirlananMetrajlar.findOne({ _dugumId, userEmail: hazirlananMetraj_selected.userEmail })
    hazirlananMetraj_selected.satirlar.map(oneSatir => {
      if (!hazirlananMetraj.satirlar.find(x => x._id.toString() === oneSatir._id.toString())) {
        throw new Error("MONGO // update_hazirlananMetraj_selected // seçmeye çalıştığınız metrajlar şu anda diğer kullanıcı tarafından işlem görüyor, tekrar deneyiniz.");
      }
    })
    return "hata yok"
    let satirlar = hazirlananMetraj.satirlar(oneSatir => {
      if (hazirlananMetraj_selected.satirlar.find(x => x._id.toString() === oneSatir._id.toString())) {
        oneSatir.isSelected = true
      }
      return oneSatir
    })
    const result = await collection_HazirlananMetrajlar.updateOne(
      { _dugumId, userEmail: hazirlananMetraj_selected.userEmail },
      { $set: { satirlar } }
    )
    return result

  } catch (err) {
    throw new Error("MONGO // update_hazirlananMetraj_selected // hata");
  }



};
