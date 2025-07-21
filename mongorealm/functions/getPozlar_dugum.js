exports = async function ({
  _projeId
}) {


  const user = context.user
  const _userId = new BSON.ObjectId(user.id)
  const userEmail = context.user.data.email
  const mailTeyit = user.custom_data.mailTeyit
  if (!mailTeyit) throw new Error("MONGO // collection_firmaPozlar // Öncelikle üyeliğinize ait mail adresinin size ait olduğunu doğrulamalısınız, tekrar giriş yapmayı deneyiniz veya bizimle iletişime geçiniz.")

  
  const collection_Pozlar = context.services.get("mongodb-atlas").db("rapor724_v2").collection("pozlar")
  const collection_Dugumler = context.services.get("mongodb-atlas").db("rapor724_v2").collection("dugumler")
  const collection_Projeler = context.services.get("mongodb-atlas").db("rapor724_v2").collection("projeler")


  if (!_projeId) throw new Error("MONGO // getPozlar_metraj // -- sorguya gönderilen --projeId-- türü doğru değil, lütfen Rapor7/24 ile irtibata geçiniz. ")


  try {

    let pozlar = await collection_Pozlar.aggregate([
      {
        $match: {
          _projeId,
          isDeleted: false
        }
      },
      {
        $project: {
          _projeId: 1,
          _wbsId: 1,
          pozNo: 1,
          pozName: 1,
          pozBirimId: 1,
          pozMetrajTipId: 1
        }
      }
    ]).toArray()


    const pozlar2 = await collection_Dugumler.aggregate([
      {
        $match: {
          _projeId,
          openMetraj: true
        }
      },
      {
        $project: {
          _pozId: 1,
          onaylananMetraj:1
        }
      },
      {
        $group: {
          _id: "$_pozId",
          onaylananMetraj:{ $sum: "$onaylananMetraj" }
        }
      }
    ]).toArray()


    pozlar = pozlar.map(onePoz => {
      let onePoz2 = pozlar2.find(x => x._id.toString() === onePoz._id.toString())
      if(onePoz2) {
        onePoz.hasMahal = true
        onePoz.onaylananMetraj = onePoz2.onaylananMetraj
      }
      return onePoz
    })

    return pozlar


  } catch (error) {
    throw new Error({ hatayeri: "MONGO // getPozlar_metraj // ", error });
  }


};