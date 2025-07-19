


const yetki = [{
  tümKisiler: [
    "mahmutkaya999@gmail.com",
    "mmahmutkaya@gmail.com",
  ],
  owners: [
    { userEmail: "mahmutkaya999@gmail.com" }
  ],
  metrajYapabilenler: [
    { userEmail: "mahmutkaya999@gmail.com" },
    { userEmail: "mmahmutkaya@gmail.com" }
  ]
}]


use('rapor724_v2');
db["projeler"].updateMany(
  {},
  {
    $set: { yetki }
  }
)

