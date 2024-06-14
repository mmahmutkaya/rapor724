

use('rapor724_v2');

db.sales.deleteMany({})


const veri = [
    {
        "name": "mahmut",
        "yemekler": "karpuz"
    },
    {
        "name": "asaf",
        "yemekler": 35
    },
    {
        "name": "ayse",
    },
    {
        "name": "fatma",
        "yemekler": [
            {
                "name": "yumurta",
                "cinsi":"gezen",
                "sariAdeti":2,
                "kalori": 41
            },
            {
                "name": "peynir",
                "kalori": 25,
                "cinsi":"ezine",
            }
        ]
    }
]


db.sales.insertMany(veri)



db.sales.find({})

