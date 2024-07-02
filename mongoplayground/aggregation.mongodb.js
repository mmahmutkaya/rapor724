

use('rapor724_v2');

db.sales.deleteMany({})


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






const veri = [
  {
    "_id": 1,
    "userId": "641e6e1b65e76e035761952c",
    "createdAt": {
      "$date": "2023-03-25T11:10:57.044Z"
    },
    "mailTeyit": true,
    "email": "mahmutkaya999@gmail.com",
    "name": "Mahmut-88",
    // "surname": "olp",
    // "customProjectSettings": [
    //   {
    //     "_projectId": 1,
    //     "pozBasliklari": [
    //       // { "_id": 1 },
    //       {
    //         "_id": 2,
    //         "show": [
    //           "webPage_metraj"
    //         ]
    //       }
    //     ]
    //   },
    //   {
    //     "_projectId": 2,
    //     "pozBasliklari": [
    //       {
    //         "_id": 1,
    //         "show": [],
    //         "genislik": "10rem"
    //       },
    //       {
    //         "_id": 2,
    //         "show": []
    //       }
    //     ]
    //   }
    // ]
  }
]

db.sales.insertMany(veri)




db.sales.aggregate(
  {
    $match: { _id: 1 }
  },
  // { $set: { "deneme": { $ifNull: ["$customProjectSettings._projectId", false] } } }
  {
    $set: {
      customProjectSettings: {
        $cond: {
          if: {
            $and: [3, "$customProjectSettings22._projectId"]
          },
          then: "deneme22",
          // {
          //   $map: {
          //     input: "$customProjectSettings",
          //     as: "oneSet",
          //     as: { $cond: { if:"$one"},{ then:}, { else:} }
          //   }
          // },
          else: "false"
        }
      }
    }
  }
)






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




// -------------- yedekler --------------------------

// data

// [
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
//             "_id": 1,
//             "show": [
//               ""
//             ]
//           },
//           {
//             "_id": 2,
//             "show": [
//               ""
//             ]
//           }
//         ]
//       },
//       {
//         "_projectId": 2,
//         "pozBasliklari": [
//           {
//             "_id": 1,
//             "show": [
//               ""
//             ]
//           },
//           {
//             "_id": 2
//           }
//         ]
//       }
//     ]
//   }
// ]






// db.collection.aggregate({
//   $match: {
//     _id: 1
//   }
// },
// {
//   "$set": {
//     "customProjectSettings": {
//       "$cond": {
//         "if": {
//           "$and": [
//             {
//               "$ifNull": [
//                 "$customProjectSettings",
//                 false
//               ]
//             },
//             {
//               "$isArray": "$customProjectSettings"
//             }
//           ]
//         },
//         "then": {
//           "$cond": {
//             "if": {
//               "$in": [
//                 2,
//                 "$customProjectSettings._projectId"
//               ]
//             },
//             "then": {
//               "$map": {
//                 "input": "$customProjectSettings",
//                 "as": "oneSet",
//                 "in": {
//                   "$cond": {
//                     "if": {
//                       "$eq": [
//                         "$$oneSet._projectId",
//                         2
//                       ]
//                     },
//                     "then": {
//                       "$cond": {
//                         "if": {
//                           "$and": [
//                             {
//                               "$ifNull": [
//                                 "$$oneSet.pozBasliklari",
//                                 false
//                               ]
//                             },
//                             {
//                               "$isArray": "$$oneSet.pozBasliklari"
//                             }
//                           ]
//                         },
//                         "then": {
//                           "$mergeObjects": [
//                             "$$oneSet",
//                             {
//                               pozBasliklari: {
//                                 "$cond": {
//                                   "if": {
//                                     "$in": [
//                                       2,
//                                       "$$oneSet.pozBasliklari._id"
//                                     ]
//                                   },
//                                   "then": {
//                                     "$map": {
//                                       "input": "$$oneSet.pozBasliklari",
//                                       "as": "oneBaslik",
//                                       "in": {
//                                         "$cond": {
//                                           "if": {
//                                             "$eq": [
//                                               2,
//                                               "$$oneBaslik._id"
//                                             ]
//                                           },
//                                           "then": {
//                                             "$mergeObjects": [
//                                               "$$oneBaslik",
//                                               {
//                                                 show: "olanı güncelleme"
//                                               }
//                                             ]
//                                           },
//                                           "else": "$$oneBaslik"
//                                         }
//                                       }
//                                     }
//                                   },
//                                   "else": {
//                                     "$concatArrays": [
//                                       [
//                                         {
//                                           _id: 2,
//                                           show: "pozBaslik Id yoksa"
//                                         }
//                                       ],
//                                       "$$oneSet.pozBasliklari"
//                                     ]
//                                   }
//                                 }
//                               }
//                             }
//                           ]
//                         },
//                         "else": {
//                           "$mergeObjects": [
//                             "$$oneSet",
//                             {
//                               pozBasliklari: [
//                                 {
//                                   _id: 2,
//                                   show: "pozBasliklari yoksa veya Array değilse"
//                                 }
//                               ]
//                             }
//                           ]
//                         }
//                       }
//                     },
//                     "else": "$$oneSet"
//                   }
//                 }
//               }
//             },
//             "else": {
//               "$concatArrays": [
//                 "$customProjectSettings",
//                 [
//                   {
//                     _projectId: 2,
//                     pozBasliklari: [
//                       {
//                         _id: 2,
//                         show: [
//                           "projectId yoksa"
//                         ]
//                       }
//                     ]
//                   }
//                 ]
//               ]
//             }
//           }
//         },
//         "else": [
//           {
//             "_projectId": 2,
//             "pozBasliklari": [
//               {
//                 "_id": 2,
//                 "show": [
//                   "customProjectSettings yoksa"
//                 ]
//               }
//             ]
//           }
//         ]
//       }
//     }
//   }
// })