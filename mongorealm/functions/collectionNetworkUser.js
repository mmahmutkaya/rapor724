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

    let errorObject = { isError: false }

    const validateEmail = (email) => {
      return String(email)
        .toLowerCase()
        .match(
          /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
    };

    if (!validateEmail(baglantiTalepEmail)) {
      errorObject.emailError = "Email adresinizi kontrol ediniz."
      errorObject.isError = true
    }

    if (baglantiTalepEmail === userEmail) {
      errorObject.emailError = "Kendi mail adresinizi girmiş gözüküyorsunuz."
      errorObject.isError = true
    }

    if (errorObject.isError) {
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
        await context.functions.execute("sendMail", email, subject, message)
      } catch (error) {
        throw new Error({ error, MONGO_Fonksiyon: "collectionNetworkUser", hataYeri: "Kullanıcıya davet maili gönderilmesi sırasında hata oluştu." })
      }
    }



    let userNetworkIncludes

    try {
      userNetworkIncludes = context.services.get("mongodb-atlas").db("userNetwork").collection(userEmail).find({ _id: baglantiTalepUser })
    } catch (error) {
      throw new Error({ error, MONGO_Fonksiyon: "collectionNetworkUser", hataYeri: "Kaydetmek istediğiniz kullanıcı ağınızda mevcut mu diye sorgulanırken hata oluştu." })
    }

    if (!userNetworkIncludes) {
      try {
        await context.services.get("mongodb-atlas").db("userNetwork").collection(userEmail).insertOne(
          {
            _id: baglantiTalepEmail,
            remoteStatus: baglantiTalepUser ? "pending_userApprove" : "pending_accountCreate",
            status: "requestContact"
          }
        )
      } catch (error) {
        throw new Error({ error, MONGO_Fonksiyon: "collectionNetworkUser", hataYeri: "Kullanıcının listenize eklenmesi sırasında hata oluştu" })
      }
    }



    let remoteUserNetworkIncludes

    try {
      remoteUserNetworkIncludes = context.services.get("mongodb-atlas").db("userNetwork").collection(baglantiTalepUser).find({ _id: userEmail })
    } catch (error) {
      throw new Error({ error, MONGO_Fonksiyon: "collectionNetworkUser", hataYeri: "Kaydetmek istediğiniz kullanıcının ağında siz var mısınız diye sorgulanırken hata oluştu." })
    }

    if (!remoteUserNetworkIncludes) {
      try {
        await context.services.get("mongodb-atlas").db("userNetwork").collection(baglantiTalepEmail).insertOne(
          {
            _id: userEmail,
            remoteStatus: "requestContact",
            status: baglantiTalepUser ? "pending_userApprove" : "pending_accountCreate"
          }
        )
      } catch (error) {
        throw new Error({ error, MONGO_Fonksiyon: "collectionNetworkUser", hataYeri: "Kullanıcının listesine sizin eklenmeniz sırasında hata oluştu" })
      }
    }

    return { ok: "İşlem Başarılı", insertResult, insertResult2 }

  }


  return { description: "herhangi bir fonksiyon içine giremedi" };
};
