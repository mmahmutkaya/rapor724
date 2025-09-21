// import { result } from "lodash";

exports = async function ({
  pozlar_newPara
}) {



  const user = context.user;
  const _userId = new BSON.ObjectId(user.id)
  const userEmail = context.user.data.email
  const userIsim = user.custom_data.isim
  const userSoyisim = user.custom_data.soyisim

  const mailTeyit = user.custom_data.mailTeyit;
  if (!mailTeyit) {
    throw new Error("MONGO // update_pozlar_para // Öncelikle üyeliğinize ait mail adresinin size ait olduğunu doğrulamalısınız, tekrar giriş yapmayı deneyiniz veya bizimle iletişime geçiniz.");
  }

  if (!pozlar_newPara) {
    throw new Error("MONGO // update_pozlar_para // 'pozlar_newPara' verisi db sorgusuna gelmedi");
  }


  const currentTime = new Date();

  const collection_Pozlar = context.services.get("mongodb-atlas").db("rapor724_v2").collection("pozlar")


  // let paraBirimiGuncellenecekPozIdler = pozlar_newPara.map(onePoz => {
  //   return onePoz._id
  // })


  try {

    let bulkArray = []

    pozlar_newPara.map(onePoz => {

      oneBulk = {
        updateOne: {
          filter: { _id: onePoz._id },
          update: {
            $set: {
              "birimFiyatlar": onePoz.birimFiyatlar,
            }
          },
        }
      }

      bulkArray = [...bulkArray, oneBulk]

    })


    await collection_Pozlar.bulkWrite(
      bulkArray,
      { ordered: false }
    )

  } catch (error) {
    throw new Error("MONGO // update_pozlar_para // " + error);
  }

    return bulkArray


};
