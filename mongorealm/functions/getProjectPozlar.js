exports = async function ({ projectId }) {

  const user = context.user
  const _userId = new BSON.ObjectId(user.id)
  const mailTeyit = user.custom_data.mailTeyit
  if (!mailTeyit) throw new Error("MONGO // getProjectPozlar -->  Öncelikle üyeliğinize ait mail adresinin size ait olduğunu doğrulamalısınız, tekrar giriş yapmayı deneyiniz veya bizimle iletişime geçiniz.")


  if (!projectId) throw new Error("MONGO // getProjectPozlar -->  \"projectId\" sorguya, gönderilmemiş, lütfen Rapor7/24 ile irtibata geçiniz. ")
  let _projectId
  try {
    if (typeof projectId == "string") {
      _projectId = new BSON.ObjectId(projectId)
    } else {
      _projectId = projectId
    }
  } catch (err) {
    throw new Error("MONGO // getProjectPozlar -->  " + "MONGO // getProjectPozlar --> sorguya gönderilen \"projectId\" türü doğru değil, lütfen Rapor7/24 ile irtibata geçiniz. ")
  }
  if (typeof _projectId != "object") throw new Error("MONGO // getProjectPozlar -->  " + "MONGO // getProjectPozlar --> sorguya gönderilen \"projectId\" türü doğru değil, lütfen Rapor7/24 ile irtibata geçiniz. ")


  try {

    // pozlar metraj
    const collection_Dugumler = context.services.get("mongodb-atlas").db("rapor724_dugumler").collection(_projectId.toString())

    const onaylananMetrajlar = await collection_Dugumler.aggregate([
      {
        $group: { _id: "$_pozId", onaylananMetraj: { $sum: "$onaylananMetraj.metraj" } }
      }
    ]).toArray()

    const hazirlananMetrajlar = await collection_Dugumler.aggregate([
      {
        $unwind:"$hazirlananMetrajlar"
      },
      {
        $group: { _id: {_pozId:"$_pozId", _userId:"$hazirlananMetrajlar._userId"}, hazirlananMetraj: { $sum: "$hazirlananMetrajlar.metraj" } }
      },
      {
        $group: { _id: "$_id._pozId", hazirlananMetrajlar: {$push : {_userId:"$_id._userId", metraj:"$hazirlananMetraj"}} }
      }
    ]).toArray()


    const aktifPozlar = await collection_Dugumler.aggregate([
      {
        $match :{openMetraj:true}
      },
      {
        $group: { _id: "$_pozId" }
      }
    ]).toArray()


    // pozlar bulma ve metrajlar ile birleştirme
    const collection = context.services.get("mongodb-atlas").db("rapor724_pozlar").collection(_projectId.toString())
    let pozlar = await collection.find({ isDeleted: false }).toArray()
    let pozlar2 = pozlar.map(onePoz => {
      let onaylananMetraj = onaylananMetrajlar.find(x => x._id.toString() == onePoz._id.toString())
      let hazirlananMetrajlar2 = hazirlananMetrajlar.find(x => x._id.toString() == onePoz._id.toString())
      let openMetraj = aktifPozlar.find(x => x._id.toString() == onePoz._id.toString()) ? true : false
      return {...onePoz, ...onaylananMetraj, ...hazirlananMetrajlar2, openMetraj}
    })
    
    return pozlar2

  } catch (err) {

    throw new Error("MONGO // getProjectPozlar // " + err.message)
  }

};



