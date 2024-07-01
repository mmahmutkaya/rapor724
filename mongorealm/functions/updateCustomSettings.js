exports = async function ({ _projectId, functionName, _baslikId }) {
  const user = await context.user;
  const user2 = { ...user };
  const _userId = new BSON.ObjectId(user.id);
  const mailTeyit = user.custom_data.mailTeyit;
  if (!mailTeyit)
    throw new Error(
      "MONGO // updateCustomSettings --  Öncelikle üyeliğinize ait mail adresinin size ait olduğunu doğrulamalısınız, tekrar giriş yapmayı deneyiniz veya bizimle iletişime geçiniz."
    );

  // validation control - poz başlık - projeId bilgisi
  // form alanına değil - direkt ekrana uyarı veren hata - (fonksiyon da durduruluyor)
  if (typeof _projectId !== "object") {
    throw new Error(
      "Poz kaydı için gerekli olan  'projectId' verisinde hata tespit edildi, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz."
    );
  }

  // const collection_Projects = context.services.get("mongodb-atlas").db("rapor724_v2").collection("projects")

  // let isProject = await collection_Projects.findOne({ _id: _projectId, members: _userId, isDeleted: false })
  // isProject = { ...isProject }
  // if (!isProject) throw new Error("MONGO // updateCustomSettings // Poz başlığı eklemek istediğiniz proje sistemde bulunamadı, lütfen sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ileirtibata geçiniz.")

  const collection_Users = context.services
    .get("mongodb-atlas")
    .db("rapor724_v2")
    .collection("users");

  const data = {
    _projectId,
    pozBasliklari: [{ _id: _baslikId, show: ["webPage_pozlar"] }],
  };

  if ((functionName = "webPage_pozlar_show")) {
    const result = collection_Users.updateOne(
      { userId: user.id },
      {
        $set: {
          "customProjectSettings.$[oneSet].pozBasliklari.$[oneBaslik].show":
            "webPage_pozlar",
        },
      },
      {
        arrayFilters: [
          {
            "oneSet._projectId": _projectId,
          },
          {
            "oneBaslik._id": _baslikId,
          },
        ],
        upsert: true,
      }
    );
    return result;
  }

  if (functionName == "webPage_pozlar_hide") {
    result = await collection_Users.updateOne({ userId: user.id }, [
      {
        $set: {
          customProjectSettings: {
            $map: {
              input: "$customProjectSettings",
              as: "oneSet",
              in: {
                $mergeObjects: [
                  "$$oneSet",
                  {
                    $cond: [
                      { $eq: ["$$oneSet._projectId", _projectId] },
                      {
                        pozBasliklari: {
                          $map: {
                            input: "$$oneSet.pozBasliklari",
                            as: "oneBaslik",
                            in: {
                              $mergeObjects: [
                                "$$oneBaslik",
                                {
                                  $cond: [
                                    { $eq: ["$$oneBaslik._id", _baslikId] },
                                    {
                                      show: {
                                        $filter: {
                                          input: "$$oneBaslik.show",
                                          as: "oneShow",
                                          cond: {
                                            $ne: [
                                              "$$oneShow",
                                              "webPage_pozlar",
                                            ],
                                          },
                                        },
                                      },
                                    },
                                    {},
                                  ],
                                },
                              ],
                            },
                          },
                        },
                      },
                      {},
                    ],
                  },
                ],
              },
            },
          },
        },
      },
    ]);
    return result;
  }

  return;
};
