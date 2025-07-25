


const yetki = {
  yetkililer: [
    {userEmail:"mahmutkaya999@gmail.com", isim:"Mahmut", soyisim:"KAYA", userCode:"MaKA"},
    {userEmail:"mmahmutkaya@gmail.com", isim:"Mahmut", soyisim:"KAYA", userCode:"MaKA2"}
  ],
  owners: [
    { userEmail: "mahmutkaya999@gmail.com" }
  ],
  metrajYapabilenler: [
    { userEmail: "mahmutkaya999@gmail.com" },
    { userEmail: "mmahmutkaya@gmail.com" }
  ]
}


// use('rapor724_v2');
// db["projeler"].updateMany(
//   {},
//   {
//     $set: { yetki },
//     $unset: { metrajYapabilenler: "" }
//   }
// )


use('rapor724_v2');
db["projeler"].updateMany(
  {},
  {
    $set: { yetki },
    $unset: { metrajYapabilenler: "" }
  }
)


