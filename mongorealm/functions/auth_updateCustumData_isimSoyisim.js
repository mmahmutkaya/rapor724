exports = async function ({ isim, soyisim }) {

  isim = isim.trim()
  soyisim = soyisim.trim()

  if (!context.user.custom_data.mailTeyit) {
    throw new Error("Öncelikle mail adresinin sizin olduğunu teyit etmelisiniz")
  }

  let errorObj

  if (isim.length < 2) {
    errorObj.isimError = "En az 2 karakter girilmeli"
  }
  if (!isim.length) {
    errorObj.isimError = "İsim girilmeli"
  }


  if (soyisim.length < 2) {
    errorObj.soyisim = "En az 2 karakter girilmeli"
  }
  if (!soyisim.length) {
    errorObj.soyisim = "Soyisim girilmeli"
  }

  if (errorObj) {
    return errorObj
  }


  const email = context.user.data.email
  const collection_Users = context.services.get("mongodb-atlas").db("rapor724_v2").collection("users")

  try {
    const result = await collection_Users.updateOne({ email },
      [
        { $set: { isim, soyisim } }
      ]
    )
    return result
  } catch (error) {
    throw new Error(error)
  }

};