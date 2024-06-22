
// Select the database to use.
use('rapor724_v2');




db.projects.updateMany({},
	[
		{
			$set: {
				pozBasliklari: [
					{ id: 1, platform: "web", sira: 1, referans: "pozNo", goster: true, sabit: true, genislik: 7, paddingInfo: "0px 1rem 0px 0px", yatayHiza: "end", name: "Poz No", dataType: "metin" },
					{ id: 2, platform: "web", sira: 2, referans: "name", goster: true, sabit: true, genislik: 20, paddingInfo: "0px 1rem 0px 0px", yatayHiza: "end", name: "Poz İsmi", dataType: "metin" },
				]
			}
		}
	]
)

