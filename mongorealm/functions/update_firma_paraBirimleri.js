exports = async function ({
  _firmaId,
  paraBirimiId,
  paraBirimiName,
  showValue
}) {
  const user = await context.user;
  const userEmail = context.user.data.email;

  const _userId = new BSON.ObjectId(user.id);
  const mailTeyit = user.custom_data.mailTeyit;
  if (!mailTeyit) {
    throw new Error(
      "MONGO // customSettings_update --  Öncelikle üyeliğinize ait mail adresinin size ait olduğunu doğrulamalısınız, tekrar giriş yapmayı deneyiniz veya bizimle iletişime geçiniz."
    )
  }


  const collection_Firmalar = context.services.get("mongodb-atlas").db("rapor724_v2").collection("firmalar");
  const collection_Projeler = context.services.get("mongodb-atlas").db("rapor724_v2").collection("projeler");


  if (!(showValue === true || showValue === false)) {
    throw new Error(
      "MONGO // customSettings_update --  Para birimini aktif ya da pasif etmek istediniz fakat db ye 'showValue' gelmedi, sayfayı yenileyiniz, sorun devam ederse lütfen Rapor 724 ile iletişime geçiniz."
    );
  }

  if (showValue) {

    await collection_Firmalar.updateOne(
      { _id: _firmaId },
      { $set: { "paraBirimleri.$[oneBirim].isActive": true } },
      { arrayFilters: [{ "oneBirim.id": paraBirimiId }] }
    )

    await collection_Projeler.updateMany({ _firmaId }, [
      {
        $set: {
          paraBirimleri: {
            $concatArrays: [
              {
                $filter: {
                  input: "$paraBirimleri",
                  as: "oneBirim",
                  cond: { $ne: ["$$oneBirim.id", paraBirimiId] }
                }
              },
              [{ id: paraBirimiId, name: paraBirimiName, isActive: false }]
            ]
          }
        }
      }
    ])

  } else {


    // let paraBiriminiKullananProje = await collection_Projeler.findOne(
    //   {
    //     _firmaId,
    //     paraBirimleri: { id: paraBirimiId, isActive: true }
    //   },
    //   {
    //     _id: 0, name: 1
    //   }
    // )

    await collection_Firmalar.updateOne(
      { _id: _firmaId },
      { $set: { "paraBirimleri.$[oneBirim].isActive": false } },
      { arrayFilters: [{ "oneBirim.id": paraBirimiId }] }
    )


    await collection_Projeler.updateMany({ _firmaId }, [
      {
        $set: {
          paraBirimleri: {
            $filter: {
              input: "$paraBirimleri",
              as: "oneBirim",
              cond: {
                $or: [
                  { $ne: ["$$oneBirim.id", paraBirimiId] },
                  { $and: [{ $eq: ["$$oneBirim.id", paraBirimiId] }, { $eq: ["$$oneBirim.isActive", true] }] }
                ]
              }
            }
          }
        }
      }
    ])


  }


};
