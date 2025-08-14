exports = async function ({
  _dugumId,
}) {

  const user = context.user;
  const _userId = new BSON.ObjectId(user.id)
  const userEmail = context.user.data.email
  const userIsim = user.custom_data.isim
  const userSoyisim = user.custom_data.soyisim
  const userCode = user.custom_data.userCode

  const mailTeyit = user.custom_data.mailTeyit;
  if (!mailTeyit) {
    throw new Error("MONGO // getHazirlananMetraj // Öncelikle üyeliğinize ait mail adresinin size ait olduğunu doğrulamalısınız, tekrar giriş yapmayı deneyiniz veya bizimle iletişime geçiniz.");
  }

  if (!_dugumId) {
    throw new Error("MONGO // getHazirlananMetraj // '_dugumId' verisi db sorgusuna gelmedi");
  }

  const collection_hazirlananMetrajlar = context.services.get("mongodb-atlas").db("rapor724_v2").collection("hazirlananMetrajlar")

  let hazirlananMetraj
  let hazirlananMetrajlar
  let defaultHazirlananMetraj = {
    userEmail,
    metraj: 0,
    satirlar: [
      { satirNo: userCode + "-" + 1, aciklama: "", carpan1: "", carpan2: "", carpan3: "", carpan4: "", carpan5: "", metraj: "" },
      { satirNo: userCode + "-" + 2, aciklama: "", carpan1: "", carpan2: "", carpan3: "", carpan4: "", carpan5: "", metraj: "" },
      { satirNo: userCode + "-" + 3, aciklama: "", carpan1: "", carpan2: "", carpan3: "", carpan4: "", carpan5: "", metraj: "" },
      { satirNo: userCode + "-" + 4, aciklama: "", carpan1: "", carpan2: "", carpan3: "", carpan4: "", carpan5: "", metraj: "" },
      { satirNo: userCode + "-" + 5, aciklama: "", carpan1: "", carpan2: "", carpan3: "", carpan4: "", carpan5: "", metraj: "" }
    ]
  }

  try {

    hazirlananMetrajlar = await collection_hazirlananMetrajlar.findOne({ _dugumId })

    if (hazirlananMetrajlar) {

      hazirlananMetraj = hazirlananMetrajlar.find(x => x.userEmail)

      if(!hazirlananMetraj){
        hazirlananMetraj = defaultHazirlananMetraj
      }

    } else {

      hazirlananMetraj = defaultHazirlananMetraj
      await collection_hazirlananMetrajlar.insertOne({ _dugumId },hazirlananMetraj)

    }

    return hazirlananMetraj

  } catch (error) {
    throw new Error({ hatayeri: "MONGO // getHazirlananMetraj // ", error });
  }



};
