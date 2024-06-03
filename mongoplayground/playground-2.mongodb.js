

// Select the database to use.
use('rapor724_v2');

// Insert a few documents into the sales collection.
// db.getCollection('projects').updateMany(
//     { },
//     { $set: { "settings.$[elem].mean" : 100 } },
//     { arrayFilters: [ { "elem.name": { $gte: 85 } } ] }
// );

const deneme = {
    name:"web",
    pages:"metraj",
    pozBasliklari:"33"
}


// db.getCollection('sales').collection.update(
//     { "friends.u.username": "michael" },
//     { "$set": { "friends.$[elem].u.name": "hello" } },
//     { 
//       "arrayFilters": [{ "elem.u.username": "michael" }], 
//       "multi": true,
//       "upsert": true 
//     }
// )



db.getCollection('sales').collection.update(
    { "settings.platform":"web" },
    { "$set": deneme },
    { 
      "upsert": true 
    }
)