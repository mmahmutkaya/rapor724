
// Select the database to use.
use('rapor724_v2');




db.sales.updateMany({},
    [
        {
            $project: {
                foo: {
                    $map: {
                        input: "$foo",
                        as: "f",
                        in: {
                            $map: {
                                input: "$$f.bar",
                                as: "b",
                                in: {
                                    $mergeObjects: ["$$b", {lala:"1"}]
                                }
                            }
                        }
                    }
                }
            }
        }
    ]
)