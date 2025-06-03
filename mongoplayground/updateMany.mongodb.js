// use('rapor724_v2');

// Select the database to use.
// import { useApp } from "../src/components/useApp.js";


// const RealmApp = useApp()

// const pozBasliklari = [
// 	{
// 		"id": new ObjectId(),
// 		"sira": 1,
// 		"referans": "miktar",
// 		"goster": true,
// 		"sabit": false,
// 		"genislik": 10,
// 		"paddingInfo": "0px 1rem 0px 0px",
// 		"yatayHiza": "end",
// 		"name": "Miktar",
// 		"veriTuruId": "metin"
// 	},
// 	{
// 		"id": new ObjectId(),
// 		"sira": 2,
// 		"referans": "birim",
// 		"goster": true,
// 		"sabit": false,
// 		"genislik": 7,
// 		"paddingInfo": "0px 1rem 0px 0px",
// 		"yatayHiza": "center",
// 		"name": "Birim",
// 		"veriTuruId": "metin"
// 	},
// 	{
// 		"id": new ObjectId(),
// 		"sira": 3,
// 		"referans": "birim2",
// 		"goster": true,
// 		"sabit": false,
// 		"genislik": 7,
// 		"paddingInfo": "0px 1rem 0px 0px",
// 		"yatayHiza": "center",
// 		"name": "Birim",
// 		"veriTuruId": "metin"
// 	}
// ]


// db.projects.updateMany({},
// 	[
// 		{
// 			$set: {
// 				mahalBasliklari:
// 				{
// 					$map: {
// 						input: "$mahalBasliklari",
// 						as: "oneBaslik",
// 						in: {
// 							$mergeObjects: [
// 								"$$oneBaslik",
// 								{ yatayHiza: "center" }
// 							]
// 						}
// 					}
// 				}
// 			}
// 		}
// 	]
// )




// db.projects.updateMany({},
// 	[
// 		{
// 			$set: {
// 				mahalBasliklari: [
// 					{ _id: new ObjectId(), platform: "web", sira: 1, referans: "pozNo", goster: true, sabit: true, genislik: 7, paddingInfo: "0px 1rem 0px 0px", yatayHiza: "end", name: "Poz No", dataType: "metin" },
// 					{ _id: new ObjectId(), platform: "web", sira: 2, referans: "name", goster: true, sabit: true, genislik: 20, paddingInfo: "0px 1rem 0px 0px", yatayHiza: "end", name: "Poz İsmi", dataType: "metin" },
// 				]
// 			}
// 		}
// 	]
// )



// db.projects.aggregate(
// 	{
// 		$set: {
// 			pozBasliklari: [
// 				{ _id: new ObjectId(), platform: "web", sira: 1, referans: "pozNo", goster: true, sabit: true, genislik: 7, paddingInfo: "0px 1rem 0px 0px", yatayHiza: "end", name: "Poz No", dataType: "metin" },
// 				{ _id: new ObjectId(), platform: "web", sira: 2, referans: "name", goster: true, sabit: true, genislik: 20, paddingInfo: "0px 1rem 0px 0px", yatayHiza: "end", name: "Poz İsmi", dataType: "metin" },
// 			]
// 		}
// 	}
// )


// use('rapor724_dugumler');
// let collectionNames = db.getCollectionNames()

// db.getCollectionNames().map(colName => {

// 	db[colName].updateMany({},
// 		[
// 			{
// 				$set: {
// 					deneme: "33"
// 					// metrajSatirlari: [],
// 					// metrajBilgileri:{}
// 				}
// 			},
// 			// {
// 			// 	$unset: {
// 			// 		metrajSatirlari: ""
// 			// 	}
// 			// }
// 		]
// 	)

// })


// use('rapor724_dugumler');
// db["672bd237e537a506c714a800"].deleteMany({})

// const pozMetrajTipleri = [
//   { id: "standartMetrajSayfasi", name: "Standart Metraj Sayfası", birimId: "" },
//   { id: "insaatDemiri", name: "İnşaat Demiri", birimId: "ton" },
// ]

 const customSettings = {
    "pages": {
      "firmapozlari": {
        "basliklar": [
          {
            "id": "pozAciklama",
            "visible": true,
            "show": true
          },
          {
            "id": "pozVersiyon",
            "visible": true,
            "show": true
          }
        ]
      }
    }
  }


use('rapor724_v2');
db["users"].updateMany(
  {},
  { $set: { customSettings } }
)


