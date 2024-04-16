exports = async function ({_projectId, pozBilgiler_willBeSaved}) {

  const user = context.user
  const _userId = new BSON.ObjectId(user.id)
  const mailTeyit = user.custom_data.mailTeyit
  if (!mailTeyit) throw new Error("MONGO // updatePozBilgiler --  Öncelikle üyeliğinize ait mail adresinin size ait olduğunu doğrulamalısınız, tekrar giriş yapmayı deneyiniz veya bizimle iletişime geçiniz.")


  const collection_Projects = context.services.get("mongodb-atlas").db("rapor724_v2").collection("projects")

  let isProject = await collection_Projects.findOne({ _id: _projectId, members: _userId, isDeleted: false })
  isProject = { ...isProject }
  if (!isProject) throw new Error("MONGO // updatePozBilgiler // Poz başlığı eklemek istediğiniz proje sistemde bulunamadı, lütfen sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ileirtibata geçiniz.")

  const collection_Pozlar = context.services.get("mongodb-atlas").db("rapor724_v2").collection("pozlar")

  

  
  let operations = pozBilgiler_willBeSaved.map(oneBilgi => {
    return (
      
      { updateOne :
          {
             "filter": {
               _id: oneBilgi.pozId
             },
             "update": 
              [{
                $set: {
                  ilaveBilgiler: {
                    $cond: [
                      { $in: [oneBilgi.baslikId, "$ilaveBilgiler.baslikId"] },
                      {
                        $map: {
                          input: "$ilaveBilgiler",
                          in: {
                            $cond: [
                              { $eq: ["$$this.baslikId", oneBilgi.baslikId] },
                              {
                                baslikId: "$$this.baslikId",
                                veri:oneBilgi.veri
                              },
                              "$$this"
                            ]
                          }
                        }
                      },
                      { $concatArrays: ["$ilaveBilgiler", [{ baslikId: oneBilgi.baslikId, veri: oneBilgi.veri }]] }
                    ]
                  }
                }
              }]               
          }
       }      
    )
    });
  
    const result = await collection_Pozlar.bulkWrite(operations);  
  
  
  return result

};


