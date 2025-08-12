exports = async function ({
  _pozId,
  _projeId
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

  if (!_pozId) {
    throw new Error("'_pozId' verisi db sorgusuna gelmedi");
  }



  const collection_Dugumler = context.services.get("mongodb-atlas").db("rapor724_v2").collection("dugumler")
  const collection_Mahaller = context.services.get("mongodb-atlas").db("rapor724_v2").collection("mahaller")
  const collection_Projeler = context.services.get("mongodb-atlas").db("rapor724_v2").collection("projeler")


  try {


    const dugumler_byPoz = await collection_Dugumler.aggregate([
      { $match: { _pozId, openMetraj: true } },
      { $project: { _pozId: 1, _mahalId: 1, openMetraj: 1, hazirlananMetrajlar: 1, onaylananMetraj: 1 } }
    ]).toArray()



    const proje = await collection_Projeler.findOne({ _id: _projeId }, { lbs: 1, yetki: 1 })

    let mahaller = await collection_Mahaller.aggregate([
      { $match: { _projeId, isDeleted: false } },
      { $project: { mahalNo: 1, mahalName: 1, _lbsId: 1 } }
    ]).toArray()

    

    let lbsMetrajlar = proje.lbs.map(oneLbs => {

      let mahaller_byLbs = mahaller.filter(x => x._lbsId.toString() === oneLbs._id.toString())
      let onaylananMetraj = 0
      let hazirlananMetrajlar = proje.yetki.metrajYapabilenler.map(oneYapabilen => {
        return { userEmail: oneYapabilen.userEmail, metraj: 0 }
      })

      mahaller_byLbs.map(oneMahal => {
        let dugum = dugumler_byPoz.find(x => x._mahalId.toString() === oneMahal._id.toString())
        onaylananMetraj += dugum?.onaylananMetraj ? dugum.onaylananMetraj : 0

        hazirlananMetrajlar = hazirlananMetrajlar?.map(oneHazirlanan => {
          let hazirlananMetraj_user = dugum?.hazirlananMetrajlar?.find(x => x.userEmail === oneHazirlanan.userEmail)
          oneHazirlanan.metraj += hazirlananMetraj_user?.metraj ? hazirlananMetraj_user.metraj : 0
          return oneHazirlanan
        })

      })
      return {_id:oneLbs._id, onaylananMetraj, hazirlananMetrajlar}
    })




    return { dugumler_byPoz, lbsMetrajlar }

  } catch (error) {
    throw new Error({ hatayeri: "MONGO // getDugumler_byPoz // ", error });
  }



};
