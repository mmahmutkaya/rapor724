exports = async function ({
  functionName,
  otherUserEmail
}) {


  const user = context.user;
  // const _userId = new BSON.ObjectId(user.id)
  const userEmail = context.user.data.email
  const userIsim = user.custom_data.isim
  const userSoyisim = user.custom_data.soyisim

  const mailTeyit = user.custom_data.mailTeyit;
  if (!mailTeyit) {
    throw new Error("-mesajSplit-Öncelikle üyeliğinize ait mail adresinin size ait olduğunu doğrulamalısınız, tekrar giriş yapmayı deneyiniz veya bizimle iletişime geçiniz.-mesajSplit-");
  }

  
  if (functionName == "getNetworkUsers") {

    try {
      const result = context.services.get("mongodb-atlas").db("userNetwork").collection(userEmail).find({})
      return result      
    } catch (error) {
      throw new Error({ error, MONGO_Fonksiyon: "collectionNetworkUser", hataYeri: "-mesajSplit-Ağınızdaki kullanıcıların sistemde aranması sırasında hata oluştu.-mesajSplit-" })
    }

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

    if (!validateEmail(otherUserEmail)) {
      errorObject.emailError = "Email adresinizi kontrol ediniz."
      errorObject.isError = true
    }

    if (otherUserEmail === userEmail) {
      errorObject.emailError = "Kendi mail adresinizi girmiş gözüküyorsunuz."
      errorObject.isError = true
    }

    if (errorObject.isError) {
      return errorObject
    }


    let otherUser


    try {
      otherUser = await collection_Users.findOne({ email: otherUserEmail })
    } catch (error) {
      throw new Error({ error, MONGO_Fonksiyon: "collectionNetworkUser", hataYeri: "-mesajSplit-Kullanıcının sitemde aranması sırasında hata oluştu.-mesajSplit-" })
    }

    const otherUserObj = {
      _id: otherUserEmail,
      isim: otherUser?.isim,
      soyisim: otherUser?.soyisim,
      status: otherUser ? "pending_otherUser_approve" : "pending_otherUser_account"
    }



    if (!otherUser) {
      try {
        let email = otherUser
        let subject = '${userIsim} ${userSoyisim} adlı kişi sizi Rapor7/24 sistemine davet ediyor'
        let message = '${userIsim} ${userSoyisim} adlı kişi sizi Rapor7/24 sistemine davet ediyor, üye olmak için lütfen tıklayınız. https://rapor724-v2-cykom-zijnv.mongodbstitch.com'
        await context.functions.execute("sendMail", email, subject, message)
      } catch (error) {
        throw new Error({ error, MONGO_Fonksiyon: "collectionNetworkUser", hataYeri: "-mesajSplit-Kullanıcıya davet maili gönderilmesi sırasında hata oluştu.-mesajSplit-" })
      }
    }



    let userNetworkIncludes

    try {
      userNetworkIncludes = await context.services.get("mongodb-atlas").db("userNetwork").collection(userEmail).findOne({ _id: otherUserEmail })
    } catch (error) {
      throw new Error({ error, MONGO_Fonksiyon: "collectionNetworkUser", hataYeri: "-mesajSplit-Kaydetmek istediğiniz kullanıcı ağınızda mevcut mu diye sorgulanırken hata oluştu.-mesajSplit-" })
    }

    
    if (!userNetworkIncludes) {
      try {
        await context.services.get("mongodb-atlas").db("userNetwork").collection(userEmail).insertOne(otherUserObj)
      } catch (error) {
        throw new Error({ error, MONGO_Fonksiyon: "collectionNetworkUser", hataYeri: "-mesajSplit-Kullanıcının listenize eklenmesi sırasında hata oluştu-mesajSplit-" })
      }
    }



    let otherUserNetworkIncludes

    try {
      otherUserNetworkIncludes = await context.services.get("mongodb-atlas").db("userNetwork").collection(otherUserEmail).findOne({ _id: userEmail })
    } catch (error) {
      throw new Error({ error, MONGO_Fonksiyon: "collectionNetworkUser", hataYeri: "-mesajSplit-Kaydetmek istediğiniz kullanıcının ağında siz var mısınız diye sorgulanırken hata oluştu.-mesajSplit-" })
    }

    if (!otherUserNetworkIncludes) {
      try {
        await context.services.get("mongodb-atlas").db("userNetwork").collection(otherUserEmail).insertOne(
          {
            _id: userEmail,
            isim:userIsim,
            soyisim:userSoyisim,
            status: "pending_your_approve"
          }
        )
      } catch (error) {
        throw new Error({ error, MONGO_Fonksiyon: "collectionNetworkUser", hataYeri: "-mesajSplit-Kullanıcının listesine sizin eklenmeniz sırasında hata oluştu-mesajSplit-" })
      }
    }

    if (userNetworkIncludes && otherUserNetworkIncludes) {
      if (userNetworkIncludes?.status?.includes("pending") || userNetworkIncludes?.otherStatus?.includes("pending")) {
        throw new Error({ MONGO_Fonksiyon: "collectionNetworkUser", hataYeri: "-mesajSplit-Bu kullanıcı listenizde zaten mevcut, onay bekleniyor..-mesajSplit-" })
      }
      throw new Error({ MONGO_Fonksiyon: "collectionNetworkUser", hataYeri: "-mesajSplit-Bu kullanıcı ile bağlantınız zaten mevcut.-mesajSplit-" })
    }

    if (userNetworkIncludes && !otherUserNetworkIncludes) {
      throw new Error({ MONGO_Fonksiyon: "collectionNetworkUser", hataYeri: "-mesajSplit-Bu kullanıcı sizin ağınızda zaten vardı, siz bu kullanıcının ağına kaydoldunuz.-mesajSplit-" })
    }

    if (otherUserNetworkIncludes && !userNetworkIncludes) {
      return {addUser:otherUserObj}
    }

    return {addUser:otherUserObj}

  }


  return { description: "herhangi bir fonksiyon içine giremedi" };
};
