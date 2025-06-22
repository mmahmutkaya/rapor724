exports = async function ({
  newMahal
}) {

  // 44
  const user = context.user
  const _userId = new BSON.ObjectId(user.id)
  const userEmail = context.user.data.email
  const mailTeyit = user.custom_data.mailTeyit
  if (!mailTeyit) throw new Error("MONGO // ceateMahal // Öncelikle üyeliğinize ait mail adresinin size ait olduğunu doğrulamalısınız, tekrar giriş yapmayı deneyiniz veya bizimle iletişime geçiniz.")

  const dateNow = new Date()
  const collection_mahaller = context.services.get("mongodb-atlas").db("rapor724_v2").collection("mahaller")


  // newMahal frontend den gelen veri


  // gelen veri kontrol
  if (!newMahal._firmaId) {
    // form alanına değil - direkt ekrana uyarı veren hata - (fonksiyon da durduruluyor)
    throw new Error("DB ye gönderilen sorguda 'firmaId' verisi bulunamadı, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
  }

  if (!newMahal._projeId) {
    // form alanına değil - direkt ekrana uyarı veren hata - (fonksiyon da durduruluyor)
    throw new Error("DB ye gönderilen sorguda 'projeId' verisi bulunamadı, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
  }

  ////// form validation - backend
  // form alanına uyarı veren hatalar

  let errorObject = {}
  let isFormError = false

  let lbsIdError
  let mahalNameError
  let mahalNoError



  if (!newMahal._lbsId && !lbsIdError) {
    errorObject.lbsIdError = "Zorunlu"
    lbsIdError = true
    isFormError = true
  }


  if (typeof newMahal.mahalName !== "string" && !mahalNameError) {
    errorObject.mahalNameError = "Zorunlu"
    mahalNameError = true
    isFormError = true
  }

  if (typeof newMahal.mahalName === "string" && !mahalNameError) {
    if (newMahal.mahalName.length === 0) {
      errorObject.mahalNameError = "Zorunlu"
      mahalNameError = true
      isFormError = true
    }
  }

  if (typeof newMahal.mahalName === "string" && !mahalNameError) {
    let minimumHaneSayisi = 3
    if (newMahal.mahalName.length > 0 && newMahal.mahalName.length < minimumHaneSayisi) {
      errorObject.mahalNameError = `${minimumHaneSayisi} haneden az olamaz`
      mahalNameError = true
      isFormError = true
    }
  }


  const mahaller = await collection_mahaller.aggregate([
    {
      $match: { _projeId: newMahal._projeId, isDeleted: false }
    }
  ]).toArray()

  if (mahaller?.find(x => x.mahalName === newMahal.mahalName) && !mahalNameError) {
    errorObject.mahalNameError = `Bu mahal ismi kullanılmış`
    mahalNameError = true
    isFormError = true
  }


  if (!newMahal.mahalNo && !mahalNoError) {
    errorObject.mahalNoError = `Zorunlu`
    mahalNoError = true
    isFormError = true
  }

  let mahalFinded = mahaller?.find(x => x.mahalNo === newMahal.mahalNo)
  if (mahalFinded && !mahalNoError) {
    errorObject.mahalNoError = `Bu mahal numarası kullanılmış`
    mahalNoError = true
    isFormError = true
  }




  // form alanına uyarı veren hatalar olmuşsa burda durduralım
  if (isFormError) {
    return { errorObject }
  }

  newMahal = {
    ...newMahal,
    createdAt: dateNow,
    createdBy: userEmail,
    isDeleted: false
  }

  const result = await collection_mahaller.insertOne(newMahal)

  newMahal = {
    ...newMahal,
    _id: result.insertedId
  }

  return { newMahal }


};