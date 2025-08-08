

use('rapor724_v2');

db.onaylananMetrajlar.deleteMany({})

// db.hazirlananMetrajlar.deleteMany({})

// db.dugumler.deleteMany({})


// const veri = [
//     {
//         "name": "mahmut",
//         "yemekler": "karpuz"
//     },
//     {
//         "name": "asaf",
//         "yemekler": 35
//     },
//     {
//         "name": "ayse",
//     },
//     {
//         "name": "fatma",
//         "yemekler": [
//             {
//                 "name": "yumurta",
//                 "cinsi":"gezen",
//                 "sariAdeti":2,
//                 "kalori": 41
//             },
//             {
//                 "name": "peynir",
//                 "kalori": 25,
//                 "cinsi":"ezine",
//             }
//         ]
//     }
// ]



// const veri_ = [
//   {
//     "_id": 1,
//     "userId": "641e6e1b65e76e035761952c",
//     "createdAt": {
//       "$date": "2023-03-25T11:10:57.044Z"
//     },
//     "mailTeyit": true,
//     "email": "mahmutkaya999@gmail.com",
//     "name": "Mahmut-88",
//     "surname": "olp",
//     "customProjectSettings": [
//       {
//         "_projectId": 1,
//         "pozBasliklari": [
//           {
//             "_id": 2,
//             "show": [
//               "webPage_metraj"
//             ]
//           }
//         ]
//       },
//       {
//         "_projectId": 2,
//         "pozBasliklari": [
//           {
//             "_id": 1,
//             "show": [],
//             "genislik": "10rem"
//           },
//           {
//             "_id": 2,
//             "show": []
//           }
//         ]
//       }
//     ]
//   }
// ]






// const veri = [
//   {
//     "_id": 1,
//     "userId": "641e6e1b65e76e035761952c",
//     "createdAt": {
//       "$date": "2023-03-25T11:10:57.044Z"
//     },
//     "mailTeyit": true,
//     "email": "mahmutkaya999@gmail.com",
//     "name": "Mahmut-88",
//     "surname": "olp",
//     "customProjectSettings": [
//       {
//         "_projectId": 1,
//         "pozBasliklari": [
//           // { "_id": 1 },
//           {
//             "_id": 2,
//             "show": [
//               "webPage_metraj"
//             ]
//           }
//         ]
//       },
//       {
//         "_projectId": 2,
//         "pozBasliklari": [
//           {
//             "_id": 1,
//             "show": [],
//             "genislik": "10rem"
//           },
//           {
//             "_id": 2,
//             "show": []
//           }
//         ]
//       }
//     ]
//   }
// ]

// db.sales.insertMany(veri)











// db.sales.updateOne(
//   {
//     "userId": "641e6e1b65e76e035761952c"
//   },
//   {
//     "$addToSet": {
//       "customProjectSettings.$[oneSet].pozBasliklari.$[oneBaslik].show": "aAaAa"
//     }
//   },
//   {
//     arrayFilters: [
//       {
//         "oneSet._projectId": 1
//       },
//       {
//         "oneBaslik._id": 1
//       }
//     ]
//   }
// )




// db.sales.find({})

