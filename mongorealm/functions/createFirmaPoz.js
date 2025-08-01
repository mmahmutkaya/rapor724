exports = async function ({
  newPoz
}) {


  const user = context.user
  const _userId = new BSON.ObjectId(user.id)
  const userEmail = context.user.data.email
  const mailTeyit = user.custom_data.mailTeyit
  if (!mailTeyit) throw new Error("MONGO // collection_firmaPozlar // Öncelikle üyeliğinize ait mail adresinin size ait olduğunu doğrulamalısınız, tekrar giriş yapmayı deneyiniz veya bizimle iletişime geçiniz.")

  const dateNow = new Date()
  const collection_firmaPozlar = context.services.get("mongodb-atlas").db("rapor724_v2").collection("firmapozlar")
  

  // newPoz frontend den gelen veri

  // veri düzeltme
  if (newPoz.pozMetrajTipId === "insaatDemiri") {
    newPoz.pozBirimId = "ton"
  }

  // gelen veri kontrol
  if (!newPoz._firmaId) {
    // form alanına değil - direkt ekrana uyarı veren hata - (fonksiyon da durduruluyor)
    throw new Error("DB ye gönderilen sorguda 'firmaId' verisi bulunamadı, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
  }

  ////// form validation - backend
  // form alanına uyarı veren hatalar

  let errorObject = {}
  let isFormError = false
  
  let wbsIdError
  let pozNameError
  let pozNoError
  let pozBirimIdError
  let pozMetrajTipIdError


  if (!newPoz._wbsId && !wbsIdError) {
    errorObject.wbsIdError = "Zorunlu"
    wbsIdError = true
    isFormError = true
  }


  if (typeof newPoz.pozName !== "string" && !pozNameError) {
    errorObject.pozNameError = "Zorunlu"
    pozNameError = true
    isFormError = true
  }

  if (typeof newPoz.pozName === "string" && !pozNameError) {
    if (newPoz.pozName.length === 0) {
      errorObject.pozNameError = "Zorunlu"
      pozNameError = true
      isFormError = true
    }
  }

  if (typeof newPoz.pozName === "string" && !pozNameError) {
    let minimumHaneSayisi = 3
    if (newPoz.pozName.length > 0 && newPoz.pozName.length < minimumHaneSayisi) {
      errorObject.pozNameError = `${minimumHaneSayisi} haneden az olamaz`
      pozNameError = true
      isFormError = true
    }
  }


  const pozlar = await collection_firmaPozlar.aggregate([
    {
      $match: { _firmaId:newPoz._firmaId, isDeleted:false }
    }
  ]).toArray()


  if (pozlar?.find(x => x.pozName === newPoz.pozName) && !pozNameError) {
    errorObject.pozNameError = `Bu poz ismi kullanılmış`
    pozNameError = true
    isFormError = true
  }


  if (!newPoz.pozNo && !pozNoError) {
    errorObject.pozNoError = `Zorunlu`
    pozNoError = true
    isFormError = true
  }

  let pozFinded = pozlar?.find(x => x.pozNo === newPoz.pozNo)
  if (pozFinded && !pozNoError) {
    errorObject.pozNoError = `Bu poz numarası kullanılmış`
    pozNoError = true
    isFormError = true
  }


  if (!newPoz.pozBirimId && !pozBirimIdError) {
    errorObject.pozBirimIdError = `Zorunlu`
    pozBirimIdError = true
    isFormError = true
  }


  if (!newPoz.pozMetrajTipId) {
    errorObject.pozMetrajTipIdError = `Zorunlu`
    pozMetrajTipIdError = true
    isFormError = true
  }


  // form alanına uyarı veren hatalar olmuşsa burda durduralım
  if (isFormError) {
    return {errorObject}
  }

  newPoz = {
    ...newPoz,
    createdAt:dateNow,
    createdBy:userEmail,
    isDeleted:false
  }
  
  const result = await collection_firmaPozlar.insertOne(newPoz)

  newPoz = {
    ...newPoz,
    _id:result.insertedId
  }
  
  return {newPoz}


};