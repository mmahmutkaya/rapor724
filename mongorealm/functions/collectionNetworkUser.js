exports = async function ({
  functionName,
  baglantiTalepEmail
}) {


  const user = context.user;
  const _userId = new BSON.ObjectId(user.id)
  const userEmail = context.user.data.email
  const userIsim = user.custom_data.isim
  const userSoyisim = user.custom_data.soyisim

  const mailTeyit = user.custom_data.mailTeyit;
  if (!mailTeyit) {
    throw new Error("Öncelikle üyeliğinize ait mail adresinin size ait olduğunu doğrulamalısınız, tekrar giriş yapmayı deneyiniz veya bizimle iletişime geçiniz.");
  }




  if (functionName == "kisiBaglantiTalep") {

    const collection_Users = context.services.get("mongodb-atlas").db("rapor724_v2").collection("users")

    let errorObject = {}
    let isError

    const validateEmail = (email) => {
      return String(email)
        .toLowerCase()
        .match(
          /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
    };

    if (!validateEmail(baglantiTalepEmail)) {
      errorObject.emailError = "Email adresinizi kontrol ediniz."
      isError = true
    }

    if (baglantiTalepEmail === userEmail) {
      errorObject.emailError = "Kendi mail adresinizi girmiş gözüküyorsunuz."
      isError = true
    }

    if (isError) {
      return errorObject
    }


    let baglantiTalepUser


    try {
      baglantiTalepUser = await collection_Users.findOne({ email: baglantiTalepEmail })
    } catch (error) {
      throw new Error({ error, MONGO_Fonksiyon: "collectionNetworkUser", hataYeri: `Kullanıcının sitemde aranması sırasında hata oluştu.` })
    }



    if (!baglantiTalepUser) {
      try {
        let email = baglantiTalepUser
        let subject = '${userIsim} ${userSoyisim} adlı kişi sizi Rapor7/24 sistemine davet ediyor'
        let message = '${userIsim} ${userSoyisim} adlı kişi sizi Rapor7/24 sistemine davet ediyor, üye olmak için lütfen tıklayınız. https://rapor724-v2-cykom-zijnv.mongodbstitch.com'
        await context.functions.execute("sendMaill", email, subject, message)
      } catch (error) {
        throw new Error({ error, MONGO_Fonksiyon: "collectionNetworkUser", hataYeri: "Kullanıcıya davet maili gönderilmesi sırasında hata oluştu." })
      }
    }

    try {
      await context.services.get("mongodb-atlas").db("userNetwork").collection(userEmail).updateOne(
        { email: baglantiTalepEmail },
        { $set: { status: baglantiTalepUser ? "pending_userApprove" : "pending_accountCreate" } },
        { upsert: true }
      )
    } catch (error) {
      throw new Error({ error, MONGO_Fonksiyon: "collectionNetworkUser", hataYeri: "Kullanıcının listenize eklenmesi sırasında hata oluştu" })
    }

    try {
      await context.services.get("mongodb-atlas").db("userNetwork").collection(baglantiTalepUser).updateOne(
        { email: userEmail },
        { $set: { status: "approved" } },
        { upsert: true }
      )
    } catch (error) {
      throw new Error({ error, MONGO_Fonksiyon: "collectionNetworkUser", hataYeri: "Kullanıcının listesine sizin eklenmeniz sırasında hata oluştu" })
    }

  }




  return { ok: true, description: "herhangi bir fonksiyon içine giremedi" };
};
