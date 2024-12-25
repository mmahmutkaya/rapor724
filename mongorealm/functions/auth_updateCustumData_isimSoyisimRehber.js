exports = async function ({ isim, soyisim, rehber }) {

  isim = isim.trim()
  soyisim = soyisim.trim()

  if (!context.user.custom_data.mailTeyit) {
    throw new Error("Öncelikle mail adresinin sizin olduğunu teyit etmelisiniz")
  }

  let errorObj = {isError:false}

  
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

  const email = context.user.data.email
  const collection_Users = context.services.get("mongodb-atlas").db("rapor724_v2").collection("users")

  try {
    const result = await collection_Users.updateOne({ email },
      [
        { $set: { isim, soyisim, rehber } }
      ]
    )
    return result
  } catch (error) {
    throw new Error(error)
  }

};