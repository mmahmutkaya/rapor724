exports = async function ({
  _projeId,
  _dugumId,
  hazirlananMetraj_newSelected
}) {



  const user = context.user;
  const _userId = new BSON.ObjectId(user.id)
  const userEmail = context.user.data.email
  const userIsim = user.custom_data.isim
  const userSoyisim = user.custom_data.soyisim

  const mailTeyit = user.custom_data.mailTeyit;
  if (!mailTeyit) {
    throw new Error("MONGO // update_hazirlananMetrajlar_newSelected // Öncelikle üyeliğinize ait mail adresinin size ait olduğunu doğrulamalısınız, tekrar giriş yapmayı deneyiniz veya bizimle iletişime geçiniz.");
  }

  if (!_projeId) {
    throw new Error("MONGO // update_hazirlananMetrajlar_newSelected // '_projeId' verisi db sorgusuna gelmedi");
  }

  if (!_dugumId) {
    throw new Error("MONGO // update_hazirlananMetrajlar_newSelected // '_dugumId' verisi db sorgusuna gelmedi");
  }

  if (!hazirlananMetraj_newSelected) {
    throw new Error("MONGO // update_hazirlananMetrajlar_newSelected // 'hazirlananMetraj_newSelected' verisi db sorgusuna gelmedi");
  }


  const currentTime = new Date();

  const collection_Projeler = context.services.get("mongodb-atlas").db("rapor724_v2").collection("projeler")
  const collection_HazirlananMetrajlar = context.services.get("mongodb-atlas").db("rapor724_v2").collection("hazirlananMetrajlar")
  const collection_OnaylananMetrajlar = context.services.get("mongodb-atlas").db("rapor724_v2").collection("onaylananMetrajlar")
  const collection_Dugumler = context.services.get("mongodb-atlas").db("rapor724_v2").collection("dugumler")

  const proje = await collection_Projeler.findOne({ _id: _projeId })
  // const {metrajYapabilenler} = proje.yetki


  let hasSelected
  let hasSelectedFull
  let hazirlayanEmail = hazirlananMetraj_newSelected.userEmail

  try {

    let hazirlananMetraj = await collection_HazirlananMetrajlar.findOne({ _dugumId, userEmail: hazirlayanEmail })

    if (hazirlananMetraj) {
      if (hazirlananMetraj._versionId.toString() !== hazirlananMetraj_newSelected._versionId.toString()) {

        hataMesaj = `__mesajBaslangic__Kaydetmeye çalıştığınız bazı veriler, siz işlem yaparken, başa kullanıcı tarafından güncellenmiş. Bu sebeple kayıt işleminiz gerçekleşmedi. Kontrol edip tekrar deneyiniz.__mesajBitis__`

      }
    }




    // db için satirlar
    let { satirlar } = hazirlananMetraj_newSelected
    // db için metraj
    hazirlananMetraj.satirlar.map(oneSatir => {
      metraj += Number(oneSatir?.metraj)
    })
    _versionId = new BSON.ObjectId()

    // aşağıdaki dugumId için veri güncelleme
    if (satirlar.find(x => x.isSelected)) {
      hasSelected = true
      if (satirlar.filter(x => x.isSelected).length === satirlar.length) {
        hasSelectedFull = true
      }
    }

    await collection_HazirlananMetrajlar.updateOne(
      { _dugumId, userEmail },
      { $set: { _versionId, satirlar, metraj } },
      { upsert: true }
    )


  } catch (err) {
    throw new Error("MONGO // update_hazirlananMetrajlar_newSelected // hazirlananMetraj güncelleme " + err.message);
  }




  let metraj = 0

  try {

    let onaylananMetraj = await collection_OnaylananMetrajlar.findOne({ _dugumId })

    if (onaylananMetraj) {

      let newSiraNo = 1
      onaylananMetraj.satirlar.map(oneSatir => {
        if (oneSatir.siraNo > newSiraNo) {
          newSiraNo = oneSatir.siraNo + 1
        }
      })

      hazirlananMetraj_newSelected.satirlar.map(oneSatir => {
        if (!onaylananMetraj.satirlar.find(x => x?._id.toString() === oneSatir._id.toString())) {
          oneSatir.siraNo = newSiraNo
          onaylananMetraj.satirlar = [...onaylananMetraj.satirlar, oneSatir]
          newSiraNo += 1
        }
      })
    } else {
      onaylananMetraj = {
        satirlar: hazirlananMetraj_newSelected.satirlar,
      }
      let newSiraNo = 1
      onaylananMetraj.satirlar = onaylananMetraj.satirlar.map(oneSatir => {
        oneSatir.siraNo = newSiraNo
        newSiraNo += 1
        return oneSatir
      })
    }


    onaylananMetraj.satirlar.map(oneSatir => {
      metraj = metraj + Number(oneSatir.metraj)
    })

    await collection_OnaylananMetrajlar.updateOne(
      { _dugumId },
      { $set: { satirlar: onaylananMetraj.satirlar, metraj } },
      { upsert: true }
    )


  } catch (err) {
    throw new Error("MONGO // update_hazirlananMetrajlar_newSelected // onaylananMetraj güncelleme " + err.message);
  }



  try {

    await collection_Dugumler.updateOne(
      { _id: _dugumId },
      {
        $set: {
          onaylananMetraj: metraj,
          "hazirlananMetrajlar.$[elem].hasSelected": hasSelected,
          "hazirlananMetrajlar.$[elem].hasSelectedFull": hasSelectedFull,
        }
      },
      { arrayFilters: [{ "elem.userEmail": hazirlayanEmail }] }
    )

  } catch (err) {
    throw new Error("MONGO // update_hazirlananMetrajlar_newSelected // dugum onaylananMetraj güncelleme " + err.message);
  }


};
