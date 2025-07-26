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
    throw new Error("MONGO // getOnaylananMetraj // Öncelikle üyeliğinize ait mail adresinin size ait olduğunu doğrulamalısınız, tekrar giriş yapmayı deneyiniz veya bizimle iletişime geçiniz.");
  }

  if (!_dugumId) {
    throw new Error("MONGO // getOnaylananMetraj // '_dugumId' verisi db sorgusuna gelmedi");
  }



  const collection_onaylananMetraj = context.services.get("mongodb-atlas").db("rapor724_v2").collection("onaylananMetrajlar")


  try {

    let onaylananMetraj = await collection_onaylananMetraj.findOne({ _dugumId })
    if (!onaylananMetraj) {
      onaylananMetraj = {metraj:0,satirlar:[]}
    }
    return onaylananMetraj

  } catch (error) {
    throw new Error({ hatayeri: "MONGO // getOnaylananMetraj // ", error });
  }



};
