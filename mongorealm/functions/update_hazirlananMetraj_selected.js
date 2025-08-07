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
    throw new Error("MONGO // update_hazirlananMetrajlar_selected // Öncelikle üyeliğinize ait mail adresinin size ait olduğunu doğrulamalısınız, tekrar giriş yapmayı deneyiniz veya bizimle iletişime geçiniz.");
  }

  if (!_projeId) {
    throw new Error("MONGO // update_hazirlananMetrajlar_selected // '_projeId' verisi db sorgusuna gelmedi");
  }

  if (!_dugumId) {
    throw new Error("MONGO // update_hazirlananMetrajlar_selected // '_dugumId' verisi db sorgusuna gelmedi");
  }

  if (!hazirlananMetraj_selected) {
    throw new Error("MONGO // update_hazirlananMetrajlar_selected // 'hazirlananMetraj_selected' verisi db sorgusuna gelmedi");
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
  let hazirlayanEmail = hazirlananMetraj_selected.userEmail

  try {

    let hazirlananMetraj = await collection_HazirlananMetrajlar.findOne({ _dugumId, userEmail: hazirlayanEmail })
    //  hazirlananMetraj kesin olmalı zaten onun içinden selected yapılmış olmalı
    
    let hatMesaj
    hazirlananMetraj_selected.satirlar.map(oneSatir => {
      if (!hazirlananMetraj.satirlar.find(x => x._id.toString() === oneSatir._id.toString())) {
        hatMesaj = `__mesajBaslangic__Kaydetmeye çalıştığınız, '${hazirlayan.isim + " " + hazirlayan.soyisim}' tarafından hazırlanan veriler, siz kaydetmeden önce önce diğer kullanıcılar tarafından değiştirilmiş. Kayıtlarınızın bazıları gerçekleşmiş, bazıları gerçekleşmemiş olabilir. Kontol ederek tekrar deneyiniz.__mesajBitis__`
      }
    })

    if (hatMesaj) {
      throw new Error(hatMesaj);
    }


    let satirlar = hazirlananMetraj.satirlar.map(oneSatir => {
      if (hazirlananMetraj_selected.satirlar.find(x => x._id.toString() === oneSatir._id.toString())) {
        oneSatir.isSelected = true
      }
      return oneSatir
    })



    if (satirlar.find(x => x.isSelected)) {
      hasSelected = true
      if (satirlar.filter(x => x.isSelected).length === satirlar.length) {
        hasSelectedFull = true
      }
    }


    await collection_HazirlananMetrajlar.updateOne(
      { _dugumId, userEmail: hazirlayanEmail },
      { $set: { satirlar } }
    )

  } catch (err) {
    throw new Error("MONGO // update_hazirlananMetrajlar_selected // hazirlananMetraj güncelleme " + err.message);
  }




  let metraj = 0

  try {

    let onaylananMetraj = await collection_OnaylananMetrajlar.findOne({ _dugumId })

    if (onaylananMetraj) {
        
      let newSiraNo = 1
      onaylananMetraj.satirlar.map(oneSatir => {
        if(oneSatir.siraNo > newSiraNo){
          newSiraNo = oneSatir.siraNo + 1
        }
      })

      hazirlananMetraj_selected.satirlar.map(oneSatir => {
        if (!onaylananMetraj.satirlar.find(x => x._id.toString() === oneSatir._id.toString())) {
          oneSatir.siraNo = newSiraNo
          onaylananMetraj.satirlar = [...onaylananMetraj.satirlar, {oneSatir}]
          newSiraNo += 1
        }
      })
    } else {
      onaylananMetraj = {
        satirlar: hazirlananMetraj_selected.satirlar,
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
    throw new Error("MONGO // update_hazirlananMetrajlar_selected // onaylananMetraj güncelleme " + err.message);
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
    throw new Error("MONGO // update_hazirlananMetrajlar_selected // dugum onaylananMetraj güncelleme " + err.message);
  }


};
