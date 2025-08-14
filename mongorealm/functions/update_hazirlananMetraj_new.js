exports = async function ({
  _dugumId,
  hazirlananMetraj_new
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

  if (!hazirlananMetraj_new) {
    throw new Error("MONGO // update_hazirlananMetrajlar // 'hazirlananMetraj_new' verisi db sorgusuna gelmedi");
  }


  const currentTime = new Date();

  // const collection_HazirlananMetrajlar = context.services.get("mongodb-atlas").db("rapor724_v2").collection("hazirlananMetrajlar")
  // const collection_OnaylananMetrajlar = context.services.get("mongodb-atlas").db("rapor724_v2").collection("onaylananMetrajlar")
  const collection_Dugumler = context.services.get("mongodb-atlas").db("rapor724_v2").collection("dugumler")


  let dugum

  let hazirlananMetraj_db
  let hazirlananMetraj
  let isSilinecek = true
  let metrajReady = 0
  let metraj = 0



  const result = await collection_Dugumler.aggregate([
    { $match: { _id: _dugumId } },
    {
      $project: {
        hazirlananMetrajlar_filtered: {
          $filter: {
            input: "$hazirlananMetrajlar",
            as: "hazirlananMetraj",
            cond: { $eq: ["$$hazirlananMetraj.userEmail", userEmail] }
          }
        }
      }
    },
    { $limit: 1 }
  ]).toArray()


  let { hazirlananMetrajlar_filtered } = result[0]
  hazirlananMetraj_db = hazirlananMetrajlar_filtered[0]



  // silinecekse - fonksiyon burada bitiyor - ya siliniyor - onaylıya taşınmış varsa da silme niyeti geri çeviriliyor
  try {

    hazirlananMetraj_new.satirlar.map(oneSatir => {
      if (!(oneSatir.aciklama === "" && Number(oneSatir.carpan1) === 0 && Number(oneSatir.carpan2) === 0 && Number(oneSatir.carpan3) === 0 && Number(oneSatir.carpan4) === 0 && Number(oneSatir.carpan5) === 0)) {
        isSilinecek = false
      }
      // ready'ye satır eklemişse de silmeyelim, belki revize etmek için boş satır göndermek istiyor, onaylı tarafa onaylayıcının kendisi
      if (oneSatir.isReady) {
        isSilinecek = false
      }
    })

    // db de isSelected varsa da biri ready lerden onaylı tarafa çekmiş belki, kullanıcı bütün satırları boşaltmadan 
    if (isSilinecek) {

      if (!hazirlananMetraj_db) {

        // zaten yokmuş fonksiyonu sonlandıralım
        return

      } else {

        if (hazirlananMetraj_db.satirlar.find(x => x.isSelected)) {

          // silme işleminden önce ready varmış ve seçilmiş demekki onaylı tarafa
          isSilinecek = false
        }
      }

    }

    // hala true ise ve db'de de varsa artık silebilir ve fonksiyonu sonlandırabiliriz
    if (isSilinecek) {
      await collection_Dugumler.updateOne({ _id: _dugumId },
        [
          {
            $set: {
              hazirlananMetrajlar: {
                $filter: {
                  input: "$hazirlananMetrajlar",
                  as: "hazirlananMetraj",
                  cond: { $ne: ["$$hazirlananMetraj.userEmail", userEmail] }
                }
              }
            }
          }
        ]
      )
    }


  } catch (error) {
    throw new Error("MONGO // update_hazirlananMetrajlar_new // silinecekse " + error.message);
  }



  // yeni eklenecekse veya güncellenecekse
  try {

    // db'de yoksa ve yeni eklenecekse
    if (!hazirlananMetraj_db)
      await collection_Dugumler.updateOne({ _id: _dugumId },
        [
          {
            $set: {
              hazirlananMetrajlar: {
                $concatArrays: [
                  "$hazirlananMetrajlar", // The existing array
                  [hazirlananMetraj_new] // The new object as an array
                ]
              }
            }
          }
        ]
      )

  } catch (error) {
    throw new Error("MONGO // update_hazirlananMetrajlar_new // güncellenecekse " + error.message);
  }



  // // yeni eklenecekse veya güncellenecekse burada bitiyor

  // try {

  //   if (!hazirlananMetrajlar_db) {

  //     hazirlananMetraj_new.satirlar = hazirlananMetraj_new.satirlar.map(oneSatir => {
  //       metraj += Number(oneSatir.metraj)
  //       metrajReady += oneSatir.isReady ? Number(oneSatir.metraj) : 0
  //       delete oneSatir.isKaydedilecek
  //       return oneSatir
  //     })

  //     hazirlananMetrajlar = [{ ...hazirlananMetraj_new, metraj, }]
  //   }

  //   if (hazirlananMetrajlar) {
  //     hazirlananMetraj = hazirlananMetrajlar.find(x => x.userEmail === userEmail)
  //     if (!hazirlananMetraj) {
  //       hazirlananMetrajlar = [...hazirlananMetrajlar, hazirlananMetraj_new]
  //     }
  //   }


  // } catch (error) {
  //   throw new Error("MONGO // update_hazirlananMetrajlar_new // db sorgusu " + error.message);
  // }


  // try {

  //   // metraj verilerini oluşturuyoruz
  //   hazirlananMetraj_new.satirlar = hazirlananMetraj_new.satirlar.map(oneSatir => {
  //     metraj += Number(oneSatir.metraj)
  //     metrajReady += oneSatir.isReady ? Number(oneSatir.metraj) : 0
  //     delete oneSatir.isKaydedilecek
  //     return oneSatir
  //   })


  //   let selectedSatirlar = hazirlananMetraj_db?.satirlar?.filter(x => x.isSelected)
  //   let kaydedilecekSatirlar = hazirlananMetraj_new.satirlar?.filter(x => x.isKaydedilecek)
  //   selectedSatirlar?.map(oneSatir => {
  //     if (kaydedilecekSatirlar.find(x => x.satirNo === oneSatir.satirNo)) {
  //       throw new Error(`__mesajBaslangic__Kaydetmeye çalıştığınız bazı satırlar, siz işlem yaparken, başa kullanıcı tarafından onaylı tarafa alınmış. Kayıt işleminiz gerçekleşmedi. Kontrol edip tekrar deneyiniz.__mesajBitis__`)
  //     }
  //   })


  //   // birdahaki kayıt için kaydedilecek ibarelerini satırları temizleme
  //   // db hazirlik - metraj
  //   // dugum - db hazirlik - metraj
  //   hazirlananMetraj_new.satirlar = hazirlananMetraj_new.satirlar.map(oneSatir => {
  //     metraj += Number(oneSatir.metraj)
  //     metrajReady += oneSatir.isReady ? Number(oneSatir.metraj) : 0
  //     delete oneSatir.isKaydedilecek
  //     return oneSatir
  //   })

  // } catch (error) {
  //   throw new Error("MONGO // update_hazirlananMetrajlar_new // ilk aşama " + err.message);
  // }


  // try {

  //   hazirlananMetraj_new.satirlar.map(oneSatir => {
  //     if (!(oneSatir.aciklama === "" && Number(oneSatir.carpan1) === 0 && Number(oneSatir.carpan2) === 0 && Number(oneSatir.carpan3) === 0 && Number(oneSatir.carpan4) === 0 && Number(oneSatir.carpan5) === 0)) {
  //       isSilinecek = false
  //     }
  //     if (oneSatir.isReady) {
  //       isSilinecek = false
  //     }
  //   })

  //   if (isSilinecek) {
  //     await collection_HazirlananMetrajlar.deleteOne(
  //       { _dugumId, userEmail }
  //     )
  //   } else {

  //     const result = await collection_HazirlananMetrajlar.updateOne(
  //       { _dugumId, userEmail },
  //       { $set: { ...hazirlananMetraj_new, isDeleted: false } }
  //     )

  //     if (!result.matchedCount) {
  //       await collection_HazirlananMetrajlar.insertOne({ ...hazirlananMetraj_new, isDeleted: false }
  //       )
  //     }

  //   }


  // } catch (err) {
  //   throw new Error("MONGO // update_hazirlananMetrajlar_new // silinecek kontrol kısmı " + err.message);
  // }



  return

};
