

use('rapor724_v2');

db.sales.updateOne(
  {
    "userId": "641e6e1b65e76e035761952c"
  },
  {
    "$set": {
      "customProjectSettings.$[oneSet].pozBasliklari.$[oneBaslik].show": "aAaAa"
    }
  },
  {
    arrayFilters: [
      {
        "oneSet._projectId": 2
      },
      {
        "oneBaslik._id": 1
      }
    ]
  }
)




db.sales.find({})

