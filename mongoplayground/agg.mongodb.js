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



db.sales.updateMany({},[
   {
      $set: {
         "yemekler": [
            {
               "platform": "web",
               "pages":"metraj"

            }
         ]
      }
   },
])

