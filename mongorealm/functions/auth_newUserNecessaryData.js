exports = async function ({ isim, soyisim }) {

  isim = isim.trim()
  soyisim = soyisim.trim()

  if (!context.user.custom_data.mailTeyit) {
    throw new Error("Öncelikle mail adresinin sizin olduğunu teyit etmelisiniz")
  }

  let errorObj = { isError: false }


  if (isim.length < 2) {
    errorObj.isimError = "En az 2 karakter girilmeli"
    errorObj.isError = true
  }
  if (!isim.length) {
    errorObj.isimError = "İsim girilmeli"
    errorObj.isError = true
  }


  if (soyisim.length < 2) {
    errorObj.soyisimError = "En az 2 karakter girilmeli"
    errorObj.isError = true
  }
  if (!soyisim.length) {
    errorObj.soyisimError = "Soyisim girilmeli"
    errorObj.isError = true
  }

  if (errorObj.isError) {
    return errorObj
  }


  const collection_Users = context.services.get("mongodb-atlas").db("rapor724_v2").collection("users")

  
  // let userCode = isim.substring(0, 3) + soyisim.substring(0, 3)
  // let kullanilmis
  // i = 1
  // kullanilmis = await collection_Users.findOne({userCode})
  
  // if(!kullanilmis) {
    
  //   return
    
  // } else {
    
  //   start_position: while (true) {
      
  //       userCode + i
  //       kullanilmis = await collection_Users.findOne({userCode})
  //       i++;
      
  //       if (kullanilmis) continue start_position;
  //       break;
  //   }

  // }

  

  const userEmail = context.user.data.email

  try {
    const result = await collection_Users.updateOne({ email: userEmail },
      [
        { $set: { isim, soyisim, userCode } }
      ]
    )
    return result
  } catch (error) {
    throw new Error(error)
  }

  // ilk firmayı oluşturmaktan vazgeçtik artık manuel 
  // const collection_Firmalar = context.services.get("mongodb-atlas").db("rapor724_v2").collection("firmalar")
  // try {
  //   const result = await collection_Firmalar.updateOne(
  //     { kullanicilar: { email: userEmail, yetki: "owner" } },
  //     { $set: { name: isim + " " + soyisim } },
  //     { upsert: true }
  //   )
  //   return result
  // } catch (error) {
  //   throw new Error(error)
  // }


  // try {
  //   const result = await collection_Firmalar.insertOne({ kullanicilar:{email:userEmail,yetki:"sahsi"}, name:isim + " " + soyisim, first:true })
  //   return result
  // } catch (error) {
  //   throw new Error(error)
  // }

};