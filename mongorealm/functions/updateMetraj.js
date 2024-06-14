exports = async function({_projectId,_pozId,data}){

  const user = context.user
  const _userId = new BSON.ObjectId(user.id)
  const mailTeyit = user.custom_data.mailTeyit
  if (!mailTeyit) throw new Error("MONGO // updateMetraj --  Öncelikle üyeliğinize ait mail adresinin size ait olduğunu doğrulamalısınız, tekrar giriş yapmayı deneyiniz veya bizimle iletişime geçiniz.")


  const collection_Projects = context.services.get("mongodb-atlas").db("rapor724_v2").collection("projects")

  let isProject = await collection_Projects.findOne({ _id: _projectId, members: _userId, isDeleted: false })
  isProject = { ...isProject }
  if (!isProject) throw new Error("MONGO // updateMetraj // Mahal başlığı eklemek istediğiniz proje sistemde bulunamadı, lütfen sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ileirtibata geçiniz.")

  const collection_Metrajlar = context.services.get("mongodb-atlas").db("rapor724_v2").collection("metrajlar")

  
  return data
  
  
  let operations = mahalBilgiler_willBeSaved.map(oneBilgi => {
    return (
      
      { updateOne :
          {
             "filter": {
               _id: oneBilgi.mahalId
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
  
    const result = await collection_Mahaller.bulkWrite(operations);  
  
  
  
  // const result = collection_Mahaller.updateOne(
  //   { _id: newBilgi.mahalId },
  //   [{
  //     $set: {
  //       ilaveBilgiler: {
  //         $cond: [
  //           { $in: [newBilgi.baslikId, "$ilaveBilgiler.baslikId"] },
  //           {
  //             $map: {
  //               input: "$ilaveBilgiler",
  //               in: {
  //                 $cond: [
  //                   { $eq: ["$$this.baslikId", newBilgi.baslikId] },
  //                   {
  //                     baslikId: "$$this.baslikId",
  //                     veri:newBilgi.veri
  //                   },
  //                   "$$this"
  //                 ]
  //               }
  //             }
  //           },
  //           { $concatArrays: ["$ilaveBilgiler", [{ baslikId: newBilgi.baslikId, veri: newBilgi.veri }]] }
  //         ]
  //       }
  //     }
  //   }]
  // )
  
  
  // const result = collection_Mahaller.updateOne(
  //   // {_id:new BSON.ObjectId(mahalBilgiler_willBeSaved[0].mahalId.toString())},
  //   {_id:newBilgi.mahalId},
  //   { $set: { "ilaveBilgiler.$[oneBilgi].veri": newBilgi.veri } },
  //   { arrayFilters: [{ "oneBilgi.baslikId": newBilgi.baslikId } ], upsert: true }
  // );
  

  return result

};