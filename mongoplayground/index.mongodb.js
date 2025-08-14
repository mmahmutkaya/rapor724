
use('rapor724_v2')

db.getCollection("dugumler").createIndex(
  { "_mahalId": 1, "_pozId": 1 },
  { unique: true }
)

