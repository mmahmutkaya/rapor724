# Yarım Kalan İşlerimiz

Bu dosya, birlikte başlayıp sonraya bıraktığımız işleri takip etmek için tutulur.

## 1) Header stil tekrarlarını azaltma (PROJE GENELİ)
- Durum: Yarım kaldı
- Öncelik: Orta
- Not: Şu an `ispaketler`, `ispaketlerbutce`, `ispaketpozlar` sayfalarında başlık `AppBar` ve `boxShadow: 4` ile hizalandı.
- Sonraki adım: Tüm proje genelinde tekrar eden header stillerini ortak bir stile/sabite taşıyıp tek yerden yönetmek.
- Kapsam önerisi:
  - Ortak header style helper (veya shared component) oluşturma
  - Başlık satırlarında `IconButton` sabit ölçü standardı (`40x40`) uygulamasını yaygınlaştırma
  - Sayfalar arası padding/height/gölge değerlerini tek standarda çekme

## 2) Icon button ölçü standardını genişletme
- Durum: Yarım kaldı
- Öncelik: Düşük-Orta
- Not: `birimfiyat`, `ispaketler`, `ispaketlerbutce` üzerinde sabit ikon ölçüsü uygulandı.
- Sonraki adım: Header aksiyonları olan diğer sayfalara aynı standardı adım adım yaymak.

---

Güncelleme kuralı:
- Her yeni yarım kalan işi buraya ekleyelim.
- İş tamamlandığında durumunu "Tamamlandı" yapalım.
