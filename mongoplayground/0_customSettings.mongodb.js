

const customSettings = {
  pages: {
    firmapozlari: {
      basliklar: [
        { id: "aciklama", baslikName: "Açıklama", visible: true, show: true },
        { id: "versiyon", baslikName: "Versiyon", visible: true, show: true }
      ]
    },
    pozlar: {
      basliklar: [
        { id: "aciklama", baslikName: "Açıklama", visible: true, show: true },
        { id: "versiyon", baslikName: "Versiyon", visible: true, show: true }
      ]
    },
    mahaller: {
      basliklar: [
        { id: "aciklama", baslikName: "Açıklama", visible: true, show: true },
        { id: "versiyon", baslikName: "Versiyon", visible: true, show: true }
      ]
    },
    metrajpozlar: {
      basliklar: [
        { id: "aciklama", baslikName: "Açıklama", visible: true, show: true },
        { id: "versiyon", baslikName: "Versiyon", visible: true, show: true }
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

