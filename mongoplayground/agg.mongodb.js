
// Select the database to use.
use('rapor724_v2');




// db.sales.aggregate([
//    {
//       $match: {
//          $or:[
//             {name:"asaf"},
//             {name:"mahmut"}
//             // settings: { $not: { $type: "array" } }
//             // settings: { $type: "array" }
//          ]
//       }
//    },
// ])



// db.dugumler.updateMany({}, [
//    {
//       $set: {
//          "onaylananMetrajlar": {
//             "metraj": 0,
//             "satirlar": []
//          }
//       }
//    },
// ])



db.dugumler.updateMany({}, [
   {
      $set: {

         "hazirlananMetrajlar": {
            "$map": {
               "input": "$hazirlananMetrajlar",
               "as": "oneMetraj",
               "in": {
                  "$mergeObjects": [
                     "$$oneMetraj",
                     {
                        satirlar: {
                           "$map": {
                              "input": "$$oneMetraj.satirlar",
                              "as": "oneSatir",
                              "in": {
                                 "$mergeObjects": [
                                    "$$oneSatir",
                                    {
                                       isApproved: false
                                    }
                                 ]
                              }
                           }
                        }
                     }
                  ]
               }
            }
         }


      }
   },
])

