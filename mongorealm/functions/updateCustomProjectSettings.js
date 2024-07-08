exports = async function ({
  functionName,
  upProperty,
  propertyName,
  propertyValue,
  _projectId,
  _baslikId,
}) {
  const user = await context.user;

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

  if (functionName == "pushItem") {
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
                                    $ifNull: ["$$oneSet." + upProperty, false],
                                  },
                                  {
                                    $isArray: "$$oneSet." + upProperty,
                                  },
                                ],
                              },
                              then: {
                                $mergeObjects: [
                                  "$$oneSet",
                                  {
                                    [upProperty]: {
                                      $cond: {
                                        if: {
                                          $in: [
                                            _baslikId,
                                            "$$oneSet." + upProperty + "._id",
                                          ],
                                        },
                                        then: {
                                          $map: {
                                            input: "$$oneSet." + upProperty,
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
                                                      [propertyName]: {
                                                        $cond: {
                                                          if: {
                                                            $and: [
                                                              {
                                                                $ifNull: [
                                                                  "$$oneBaslik." +
                                                                    propertyName,
                                                                  false,
                                                                ],
                                                              },
                                                              {
                                                                $isArray:
                                                                  "$$oneBaslik." +
                                                                  propertyName,
                                                              },
                                                            ],
                                                          },
                                                          then: {
                                                            $concatArrays: [
                                                              "$$oneBaslik." +
                                                                propertyName,
                                                              [
                                                                propertyValue +
                                                                  "_(push_to_exist_propertyName)",
                                                              ],
                                                            ],
                                                          },
                                                          else: [
                                                            propertyValue +
                                                              "setArrayValue_propertyNameArray",
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
                                                [propertyName]: [
                                                  propertyValue +
                                                    "_(baslik_cerated_and_pushed_exist_baslikArray)",
                                                ],
                                              },
                                            ],
                                            "$$oneSet." + upProperty,
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
                                    [upProperty]: [
                                      {
                                        _id: _baslikId,
                                        [propertyName]: [
                                          propertyValue +
                                            "_(baslikArray_created)",
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
                          [upProperty]: [
                            {
                              _id: _baslikId,
                              [propertyName]: [
                                propertyValue +
                                  "_(project_created_and_pushed_customSettings)",
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
                  [upProperty]: [
                    {
                      _id: _baslikId,
                      [propertyName]: [
                        propertyValue + "_(customSettings_created)",
                      ],
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
                                      show: {
                                        $filter: {
                                          input: "$$oneBaslik." + propertyName,
                                          as: "oneShow",
                                          cond: {
                                            $lt: [
                                              {
                                                $indexOfBytes: [
                                                  "$$oneShow",
                                                  propertyName,
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
