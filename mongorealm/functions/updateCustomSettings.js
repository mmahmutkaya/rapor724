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

  let updateObj;

  if (functionName == "webPage_pozlar_show") {
    updateObj = {
      _projectId,
      _baslikId,
      tur: "update",
      baslikProperty: "pozBasliklari",
      upProperty: "show",
      upPropertyData: "webPage_pozlar",
    };
  }

  let deneme = "show";

  if (functionName == "webPage_pozlar_show") {
    const result = collection_Users.updateOne({ userId: user.id }, [
      {
        $set: {
          customProjectSettings: {
            $cond: {
              if: {
                $and: [
                  {
                    $ifNull: ["$customProjectSettings", false],
                  },
                  {
                    $isArray: "$customProjectSettings",
                  },
                ],
              },
              then: {
                $cond: {
                  if: {
                    $in: [_projectId, "$customProjectSettings._projectId"],
                  },
                  then: {
                    $map: {
                      input: "$customProjectSettings",
                      as: "oneSet",
                      in: {
                        $cond: {
                          if: {
                            $eq: ["$$oneSet._projectId", _projectId],
                          },
                          then: {
                            $cond: {
                              if: {
                                $and: [
                                  {
                                    $ifNull: ["$$oneSet.pozBasliklari", false],
                                  },
                                  {
                                    $isArray: "$$oneSet.pozBasliklari",
                                  },
                                ],
                              },
                              then: {
                                $mergeObjects: [
                                  "$$oneSet",
                                  {
                                    [updateObj.baslikProperty]: {
                                      $cond: {
                                        if: {
                                          $in: [
                                            _baslikId,
                                            "$$oneSet.pozBasliklari._id",
                                          ],
                                        },
                                        then: {
                                          $map: {
                                            input: "$$oneSet.pozBasliklari",
                                            as: "oneBaslik",
                                            in: {
                                              $cond: {
                                                if: {
                                                  $eq: [
                                                    _baslikId,
                                                    "$$oneBaslik._id",
                                                  ],
                                                },
                                                then: {
                                                  $mergeObjects: [
                                                    "$$oneBaslik",
                                                    {
                                                      show: {
                                                        $cond: {
                                                          if: {
                                                            $and: [
                                                              {
                                                                $ifNull: [
                                                                   "$$oneBaslik." + updateObj.upProperty,
                                                                  false,
                                                                ],
                                                              },
                                                              {
                                                                $isArray:
                                                                   "$$oneBaslik." + updateObj.upProperty,
                                                              },
                                                            ],
                                                          },
                                                          then: {
                                                            $concatArrays: [
                                                              "$$oneBaslik." + updateObj.upProperty,
                                                              [
                                                                updateObj.upPropertyData + "_(push_show_array)",
                                                              ],
                                                            ],
                                                          },
                                                          else: [
                                                            updateObj.upPropertyData + "_(show_created_exist_baslik)",
                                                          ],
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
                                        else: {
                                          $concatArrays: [
                                            [
                                              {
                                                _id: _baslikId,
                                                show: [
                                                  updateObj.upPropertyData + "_(baslik_cerated_and_pushed_pozBasliklari)",
                                                ],
                                              },
                                            ],
                                            "$$oneSet.pozBasliklari",
                                          ],
                                        },
                                      },
                                    },
                                  },
                                ],
                              },
                              else: {
                                $mergeObjects: [
                                  "$$oneSet",
                                  {
                                    pozBasliklari: [
                                      {
                                        _id: _baslikId,
                                        show: [
                                          updateObj.upPropertyData + "_(pozBasliklari_cretaed)",
                                        ],
                                      },
                                    ],
                                  },
                                ],
                              },
                            },
                          },
                          else: "$$oneSet",
                        },
                      },
                    },
                  },
                  else: {
                    $concatArrays: [
                      "$customProjectSettings",
                      [
                        {
                          _projectId,
                          pozBasliklari: [
                            {
                              _id: _baslikId,
                              show: [
                                updateObj.upPropertyData + "_(project_cretated_and_pushed_customSettings)",
                              ],
                            },
                          ],
                        },
                      ],
                    ],
                  },
                },
              },
              else: [
                {
                  _projectId,
                  pozBasliklari: [
                    {
                      _id: _baslikId,
                      show: [updateObj.upPropertyData + "_(customSettings_created)"],
                    },
                  ],
                },
              ],
            },
          },
        },
      },
    ]);
    return { result, situation: "show", functionName };
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
                $cond: {
                  if: {
                    $eq: [_projectId, "$$oneSet._projectId"],
                  },
                  then: {
                    $mergeObjects: [
                      "$$oneSet",
                      {
                        pozBasliklari: {
                          $map: {
                            input: "$$oneSet.pozBasliklari",
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
                                      show: {
                                        $filter: {
                                          input: "$$oneBaslik.show",
                                          as: "oneShow",
                                          cond: {
                                            $lt: [
                                              {
                                                $indexOfBytes: [
                                                  "$$oneShow",
                                                  "webPage_pozlar",
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
