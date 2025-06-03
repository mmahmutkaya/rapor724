exports = async function ({
  functionName,
  basliklar
}) {
  const user = await context.user;
  const userEmail = context.user.data.email;
  
  const _userId = new BSON.ObjectId(user.id);
  const mailTeyit = user.custom_data.mailTeyit;
  if (!mailTeyit)
    throw new Error(
      "MONGO // updateCustomSettings --  Öncelikle üyeliğinize ait mail adresinin size ait olduğunu doğrulamalısınız, tekrar giriş yapmayı deneyiniz veya bizimle iletişime geçiniz."
    );


  const collection_Users = context.services
    .get("mongodb-atlas")
    .db("rapor724_v2")
    .collection("users");


  if (functionName == "sayfaBasliklari") {
    collection_Users.updateOne(
      {email:userEmail},
      {$set:{"customSettings.pages.firmapozlari.basliklar":basliklar}}
    )
    return
  }
  

  if (functionName == "pullItem") {
    result = await collection_Users.updateOne({ userId: user.id }, [
      {
        $set: {
          customProjectSettings: {
            $map: {
              input: "$customProjectSettings",
              as: "oneSet",
              in: {
                $cond: {
                  if: {
                    $eq: [_projectId, "$$oneSet._projectId"],
                  },
                  then: {
                    $mergeObjects: [
                      "$$oneSet",
                      {
                        [upProperty]: {
                          $map: {
                            input: "$$oneSet." + upProperty,
                            as: "oneBaslik",
                            in: {
                              $cond: {
                                if: {
                                  $eq: [_baslikId, "$$oneBaslik._id"],
                                },
                                then: {
                                  $mergeObjects: [
                                    "$$oneBaslik",
                                    {
                                      [propertyName]: {
                                        $filter: {
                                          input: "$$oneBaslik." + propertyName,
                                          as: "oneShow",
                                          cond: {
                                            $lt: [
                                              {
                                                $indexOfBytes: [
                                                  "$$oneShow",
                                                  propertyValue,
                                                ],
                                              },
                                              0,
                                            ],
                                          },
                                        },
                                      },
                                    },
                                  ],
                                },
                                else: "$$oneBaslik",
                              },
                            },
                          },
                        },
                      },
                    ],
                  },
                  else: "$$oneSet",
                },
              },
            },
          },
        },
      },
    ]);
    return { result, situation: "hide", functionName };
  }

  return { situation: "empty" };
};
