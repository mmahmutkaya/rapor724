exports = async function ({
  _projeId,
  mahalListesi_state_filtered
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

  if (!_projeId) {
    throw new Error("ProjeId verisi db sorgusuna gelmedi");
  }


  const currentTime = new Date();

  const collection_Dugumler = context.services.get("mongodb-atlas").db("rapor724_v2").collection("dugumler")

  const bulkArray = mahalListesi_state_filtered.map(x => {
    return (
      {
        updateOne: {
          filter: { _projeId, _mahalId: x._mahalId, _pozId: x._pozId },
          update: { $set: { openMetraj: x.openMetraj } },
          upsert: true
        }
      }
    )
  })

  try {
    const result = collection_Dugumler.bulkWrite(
      bulkArray,
      { ordered: false }
    )
    return result
  } catch (error) {
    print(error)
  }

  const list = await collection_Dugumler.aggregate([
    { $match: { _projeId } },
    { $project: { _pozId: 1, _mahalId: 1, openMetraj: 1 } }
  ]).toArray()

  return { list }





};
