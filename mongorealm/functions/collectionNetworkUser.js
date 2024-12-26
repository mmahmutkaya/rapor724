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

    const validateEmail = (email) => {
      return String(email)
        .toLowerCase()
        .match(
          /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
    };
  
    if (!validateEmail(baglantiTalepEmail)) {
       throw new Error(`-emailError-Email adresinizi kontrol ediniz.-emailError-`)
    }
  
    if (baglantiTalepEmail === userEmail) {
      throw new Error({MongoFonksiyon:"collectionNetworkUser", emailError:"mesajBasi - Kendi mail adresinizi girmiş gözüküyorsunuz"})
    }
  
    
    let baglantiTalepUser


    try {
      baglantiTalepUser = await collection_Users.findOne({ email: baglantiTalepEmail })
    } catch (error) {
      throw new Error({ error, hataMesaj:"Kullanıcının sitemde aranması sırasında hata oluştu" })
    }

    
    try {
      baglantiTalepUser = await collection_Users.findOne({ email: baglantiTalepEmail })
    } catch (error) {
      throw new Error({ error, hataMesaj: "Kullanıcının sitemde aranması sırasında hata oluştu" })
    }

    
    if (!baglantiTalepUser) {
      try {
        let email = baglantiTalepUser
        let subject = '${userIsim} ${userSoyisim} adlı kişi sizi Rapor7/24 sistemine davet ediyor'
        let message = '${userIsim} ${userSoyisim} adlı kişi sizi Rapor7/24 sistemine davet ediyor, üye olmak için lütfen tıklayınız. https://rapor724-v2-cykom-zijnv.mongodbstitch.com'
        await context.functions.execute("sendMaill", email, subject, message)
      } catch (error) {
        throw new Error({ error, hataMesaj: "mesajBasi - Kullanıcıya davet maili gönderilmesi sırasında hata oluştu - mesajSonu" })
      }
    }

    try {
      await context.services.get("mongodb-atlas").db("userNetwork").collection(userEmail).updateOne({ email: baglantiTalepEmail },
        { $set: { status: baglantiTalepUser ? "approvePending" : "accountPending" } }
      )
    } catch (error) {
      throw new Error({ error, hataMesaj: "Kullanıcının listenize eklenmesi sırasında hata oluştu" })
    }

    try {
      await context.services.get("mongodb-atlas").db("userNetwork").collection(baglantiTalepUser).updateOne({ email: userEmail },
        { $set: { status: "approved" } }
      )
    } catch (error) {
      throw new Error({ error, hataMesaj: "Kullanıcının listesine sizin eklenmeniz sırasında hata oluştu" })
    }

  }


  

  return { ok: true, description: "herhangi bir fonksiyon içine giremedi" };
};
