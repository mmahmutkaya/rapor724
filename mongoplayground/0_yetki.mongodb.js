


const yetki =  {
      yetkililer: [
        { userEmail: "mmahmutkaya@gmail.com", userCode: "MaKA1", isim: "Mahmut", soyisim: "KAYA" },
        { userEmail: "mbrkhncr@gmail.com", userCode: "BuHA", isim: "Burak", soyisim: "HANÇER" },
        { userEmail: "mahmutkaya999@gmail.com", userCode: "MaKA", isim: "Mahmut", soyisim: "KAYA" }
      ],
      owners: [
        { userEmail: "mmahmutkaya@gmail.com" },
        { userEmail: "mbrkhncr@gmail.com" },
        { userEmail: "mahmutkaya999@gmail.com" }
      ],
      metrajYapabilenler: [
        { userEmail: "mahmutkaya999@gmail.com" },
        { userEmail: "mmahmutkaya@gmail.com" },
        { userEmail: "mbrkhncr@gmail.com" }
      ]
    }




use('rapor724_v2');
db["projeler"].updateMany(
  {},
  {
    $set: { yetki },
    $unset: { metrajYapabilenler: "" }
  }
)


