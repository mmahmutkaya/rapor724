exports = async function ({ isim, soyisim }) {

  isim = isim.trim()
  soyisim = soyisim.trim()

  const userId = context.user.id

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

  let userCode = isim.substring(0, 2) + soyisim.substring(0, 2)
  
  const collection_Users = context.services.get("mongodb-atlas").db("rapor724_v2").collection("users")

  const userCodes = await collection_Users.find({},{userCode}).toArray()

  if(userCodes.length){
    
    let benzervar
    let maxNumber = 1
    
    userCodes.map(oneCode => {
      
      if(oneCode.substring(0,4) === userCode){
        
        benzerVar = true
        let theNumber = parseInt(oneCode.substring(4,oneCode.length))
        if(theNumber > maxNumber) {
          maxNumber = theNumber
        }
        
      }
      
    })

   if(benzerVar) {
    userCode = userCode + (parseInt(maxNumber) + 1)
   }
    
  }
  


  try {
    const result = await collection_Users.updateOne({ userId },
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