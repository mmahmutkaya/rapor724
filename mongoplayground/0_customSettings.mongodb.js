

const customSettings = {
  pages: {
    firmapozlari: {
      basliklar: [
        { id: "aciklama", baslikName: "Açıklama", visible: true, show: false },
        { id: "versiyon", baslikName: "Versiyon", visible: true, show: false }
      ]
    },
    pozlar: {
      basliklar: [
        { id: "aciklama", baslikName: "Açıklama", visible: true, show: false },
        { id: "versiyon", baslikName: "Versiyon", visible: true, show: false }
      ]
    },
    mahaller: {
      basliklar: [
        { id: "aciklama", baslikName: "Açıklama", visible: true, show: false },
        { id: "versiyon", baslikName: "Versiyon", visible: true, show: false }
      ]
    },
    metrajpozlar: {
      basliklar: [
        { id: "aciklama", baslikName: "Açıklama", visible: true, show: false },
        { id: "versiyon", baslikName: "Versiyon", visible: true, show: false }
      ],
      showHasMahal: false
    }
  }
}


use('rapor724_v2');
db["users"].updateMany(
  {},
  { $set: { customSettings } }
)

