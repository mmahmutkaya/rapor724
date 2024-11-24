
exports = async function(){
  
  
  // if(subFunction === "wbs_upload") {
  
  //   const project = await context.services.get("mongodb-atlas").db("rapor724_v2").collection("projects").findOne({_id:projectId})
    
  //   const result = await context.services.get("mongodb-atlas").db("rapor724_v2").collection("deneme").updateOne(
  //     {name:"wbs1"},
  //     {$set:{data:project.wbs}},
  //     {upsert:true}
  //   )
  //   return result
  // }
  
  
  // if(subFunction === "wbs_download") {
    
  //   const item = await context.services.get("mongodb-atlas").db("rapor724_v2").collection("deneme").findOne({"name":"wbs1"})
    
  //   const _wbs = item.data
    
  //   const result = await context.services.get("mongodb-atlas").db("rapor724_v2").collection("projects").updateOne(
  //     {_id:projectId},
  //     {$set:{wbs:_wbs}},
  //   )
  //   return _wbs
    
  // }

  
  
  // GRUP  - 1
  // const response = await context.http.get({
  //   url: "https://us-east-1.aws.data.mongodb-api.com/app/iyirp-laumu/endpoint/deneme",
  // })
  
  // const response2 = await JSON.parse(response.body.text())
  
  // const collection = context.services.get("mongodb-atlas").db("iyiRP").collection("users")
  
  // collection.insertMany(response2)
  
  // const collection1Items = await context.services.get("mongodb-atlas").db("iyiRP").collection("wbs").find({}).toArray()
  
  // const collection2 = context.services.get("mongodb-atlas").db("iyiRP").collection("wbs2")
  // collection2.insertMany(collection1Items)




  // KOMPLE SİLMEK
  // const collection = context.services.get("mongodb-atlas").db("rapor724_v2").collection("wbs")
  // await collection.deleteMany({})
  // await collection.deleteMany({'seviye': {$ne : "1"}})
  
  
  
  
  
  // KISMİ SİLMEK - 1 PROPERTY FELAN
  
  // const collection = context.services.get("mongodb-atlas").db("rapor724_v2").collection("projects")
  
  // collection.updateMany(
    
  //   // filter
  //   // {pozId:new BSON.ObjectId("63270942789576db73eb74ae")},
  //   {},
    
  //   // set
  //   { $set: {wbs:null}}
  // );
  

  
  // const collection = context.services.get("mongodb-atlas").db("rapor724_v2").collection("projects")
  // collection.updateMany(
  //   {},
  //   { $set: { pozTipleri: ["standart", "pencere", "kapi", "insaatDemiri"] } }
  // );



  // { $pull: { [objArrayName]: {$in : item.silinecekObjeler} } }
  // {$addToSet: { ["metrajSatirlari"]: null }}
  // { $push: { [objArrayName]: {$each : item.objeler} } }
  
  
  
  

  // const PozGrupArray = [
  // 	{kod:"01",isim:"Zemin - Şap Altı İmalatlar"},
  //   {kod:"02",isim:"Zemin - Şap İmalatları"},
  //   {kod:"03",isim:"Zemin - Kaplama Altı İmalatlar"},
  //   {kod:"04",isim:"Zemin - Kaplamalar"},
  //   {kod:"05",isim:"Duvar İşleri"},
  //   {kod:"06",isim:"Konstrüktif Duvar İşleri"},
  //   {kod:"07",isim:"Konstrüktif Duvar İşleri"}
  // ]

  // let sira = 0
  // // WBSArray = PozGrupArray.slice(0).reverse().map(isim => {
  // WBSArray = PozGrupArray.map(item => {
  //   sira = sira + 1
  //   return {
  //     tur:"Poz Grup",
  //     proje:"T360",
  //     blok:"386",
  //     versiyon:"2023_v1",
  //     parentNode:"T360-386-INCE",
  //     node:"T360-386-INCE-" + item.kod,
  //     isim:item.isim,
  //     sira,
  //     children:["POZ"]
  //   }
  // })
  // collection.insertMany(WBSArray)
  
  

  // let _project = JSON.parse(JSON.stringify(project))
  
  // console.log("_project",_project.name)
  
  // _wbs = _project.wbs
  // context.services.get("mongodb-atlas").db("rapor724_v2").collection("projects").insertOne({wbsOrjinal:"gtgtg", name:"1"})
  
  
    
  //  GÜNCELLEMEK
  // const collection = context.services.get("mongodb-atlas").db("rapor724_v2").collection("groups")
  // collection.updateMany(
    
  //   {},
    
  //   [
  //     { 
  //       $set: { name2: "deneme" },
  //     },
      
  //     { 
  //       $unset: { groupName: "" },
  //     }
  //   ]
    
  // )
  
  
    
  
  // const collection_Deneme = context.services.get("mongodb-atlas").db("rapor724_v2").collection("deneme")
  // await collection_Deneme.updateOne(
  //   {
  //     name:"mahmut",
  //   },
  //   {
  //     $set: {"notlar.$[elem].not" : 80 }
  //   },
  //   {
  //     arrayFilters: [ { "elem.id": "1" } ] 
  //     // arrayFilters: [ { "elem.grade": { $gte: 85 } } ] 
  //   }
  // );
  

  // await collection_Projects.update(
  //   { _id:poz._projectId, wbs:{$elemMatch:{_wbsId:poz._wbsId}} }, // Query for the user object of the logged in user
  //   { $set: {'wbs.$.includesPoz':false} }, // Set the logged in user's favorite color to purple
  //   // { "$push": { "wbs": newWbsItem  } }
  //   // { upsert: true }
  // );

  
  context.services.get("mongodb-atlas").db("rapor724_dugumler").getCollectionNames().map(colName => {
    context.services.get("mongodb-atlas").db("rapor724_dugumler").collection(colName).updateMany({},
      [
        {
          $set: {
            // deneme: "44"
            // metrajSatirlari: [],
            // metrajBilgileri:{}
          }
        },
        { $unset: "deneme" }
      ]
    )
  })


    
};