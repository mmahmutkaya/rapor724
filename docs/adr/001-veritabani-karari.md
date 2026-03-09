# ADR-001 — Veritabanı Seçimi: MongoDB Atlas

**Tarih:** 2026-03-09  
**Durum:** Kabul Edildi  
**Karar Veren:** Geliştirici Ekibi

---

## Bağlam

Rapor7/24, Türk inşaat şirketlerine yönelik bir proje yönetim ve raporlama uygulamasıdır.
Temel iş nesneleri şunlardır:

- **Firmalar** — şirket kaydı ve şablon kalemleri
- **Projeler** — proje bilgileri, WBS ve LBS ağaçları
- **WBS (İş Kırılım Yapısı)** — ağaç hiyerarşisi, derinlik değişken
- **LBS (Konum Kırılım Yapısı)** — ağaç hiyerarşisi, derinlik değişken
- **Pozlar** — iş kalemleri; `birimFiyatlar[]`, `isPaketler[]` gibi iç içe diziler içerir
- **Mahaller** — konum/alan tanımları
- **Düğümler (`dugumler`)** — WBS × LBS kesişim noktaları; çok sayıda gömülü metraj verisi barındırır
- **HazirlananMetrajlar / OnaylananMetrajlar** — sürümlü, iç içe satır dizileri olan ölçüm kayıtları
- **Kullanıcılar, Metrajlar, Gruplar, Mail doğrulama kodları**

Şu anda kullanılan yığın: **MongoDB Atlas Serverless** (veritabanı adı `rapor724_v2`) + **MongoDB Atlas App Services (eski adıyla Realm)** sunucusuz fonksiyonları + **Express.js / Mongoose** REST API katmanı.

---

## Soru

> **Bu proje için MongoDB yerine başka bir veritabanı kullanmak daha mı iyi olurdu?**

---

## Değerlendirilen Seçenekler

| # | Seçenek | Tür | Barındırma |
|---|---|---|---|
| 1 | **MongoDB Atlas** *(mevcut)* | Doküman (NoSQL) | Yönetilen bulut |
| 2 | PostgreSQL / Supabase | İlişkisel (SQL) | Yönetilen bulut |
| 3 | Firebase Firestore | Doküman (NoSQL) | Google yönetilen |
| 4 | MySQL / PlanetScale | İlişkisel (SQL) | Yönetilen bulut |
| 5 | SQLite (Turso / LibSQL) | İlişkisel (SQL) | Edge / gömülü |

---

## Analiz

### 1. Veri Modeli Doğası

Uygulamanın temel veri yapısı **doküman odaklı ve hiyerarşiktir**:

```
proje
 ├── wbs[]           (ağaç, değişken derinlik)
 ├── lbs[]           (ağaç, değişken derinlik)
 ├── pozlar[]
 │    ├── birimFiyatlar[]   (gömülü dizi)
 │    └── isPaketler[]      (gömülü referans dizisi)
 └── dugumler[]      (wbsId × lbsId kesişimleri)
      ├── hazirlananMetrajlar[]
      │    └── satırlar[]
      └── onaylananMetrajlar[]
           └── satırlar[]
```

Bu yapının ilişkisel bir şemada temsil edilmesi **en az 12–15 tablo** ve karmaşık JOIN sorguları gerektirir; oysa MongoDB'de aynı veri tek ya da birkaç doküman içinde doğal biçimde saklanır.

### 2. Şema Esnekliği

- **Metraj tipleri** (`pozMetrajTipId`) uygulamanın geliştirme sürecinde değişmektedir. MongoDB'nin şemasız yapısı yeni alanların şema geçişi yapmadan eklenmesine olanak tanır.
- `birimFiyatlar` dizisi, farklı uzunluk ve yapıya sahip kayıtlar içerir; ilişkisel bir tablo bu varyasyonu normalleştirmekte güçlük çeker.

### 3. Atlas App Services (Realm) Entegrasyonu

Proje, **107 MongoDB Realm sunucusuz fonksiyona** sahiptir. Bu fonksiyonlar doğrudan MongoDB sorgulama API'sini (`aggregate`, `bulkWrite`, `$addToSet`, `$pull` vb.) kullanmaktadır. Farklı bir veritabanına geçmek bu fonksiyonların tamamının yeniden yazılmasını gerektirirdi.

### 4. Alternatif Karşılaştırması

#### PostgreSQL / Supabase
- ✅ Güçlü ACID garantileri, zengin SQL ekosistemi
- ✅ Row-Level Security, Realtime abonelikler
- ❌ Hiyerarşik WBS/LBS ağaçları için `JSONB` sütunları ya da özyinelemeli CTE sorguları gerekir
- ❌ Tüm Realm fonksiyonları ve Mongoose modelleri yeniden yazılmalıdır
- ❌ Gömülü dizi güncellemeleri (`$addToSet`, `$pull`) SQL'de çok daha ayrıntılı kod ister
- ⚠️ Göç maliyeti: tahminen **3–6 ay** tam geliştirici çabası

#### Firebase Firestore
- ✅ Gerçek zamanlı dinleyiciler, Google altyapısı
- ✅ Doküman modeli — mevcut veri yapısıyla uyumlu
- ❌ Karmaşık sorgular ve toplu `aggregate` işlemleri yetersiz kalır
- ❌ MongoDB Realm → Firestore geçişi yine de önemli yeniden yazım gerektirir
- ❌ Vendor lock-in riski MongoDB'den daha yüksek

#### MySQL / PlanetScale
- PostgreSQL ile benzer değerlendirme; ek olarak `JSON` sütun desteği daha sınırlı

#### SQLite / Turso
- Çok kullanıcılı, bulut tabanlı bir uygulama için uygun değil

### 5. Mevcut MongoDB Kullanımının Artıları

| Kriter | Değerlendirme |
|---|---|
| Veri modeli uyumu | ✅ Doküman yapısı mevcut hiyerarşi ile birebir örtüşür |
| Geliştirme hızı | ✅ Şema geçişi olmadan yeni alanlar eklenebilir |
| Toplu yazma işlemleri | ✅ `bulkWrite` + `$addToSet`/`$pull` ile verimli |
| Atlas sunucusuz ölçekleme | ✅ Trafik yokken sıfır maliyet, talebe göre ölçeklenir |
| Mevcut yatırım | ✅ 107 Realm fonksiyonu + Mongoose şeması zaten mevcut |
| Aggregation Pipeline | ✅ Karmaşık raporlama sorguları kolayca ifade edilir |

### 6. Mevcut MongoDB Kullanımının Eksileri / Riskleri

| Risk | Etki | Önlem |
|---|---|---|
| Atomik çoklu-doküman işlemleri | Orta — bazı çok adımlı operasyonlarda kısmi başarısızlık olabilir | `session.withTransaction()` kullan; mevcut `README` bunu tanımlar |
| Atlas Realm lock-in | Düşük-Orta | Express/Mongoose API zaten Realm bağımlılığını soyutluyor |
| Şema tutarsızlığı | Düşük | Mongoose ile model katmanında validasyon uygulanıyor |

---

## Karar

**MongoDB Atlas kullanımına devam edilmesine karar verildi.**

Bu projenin veri modeli — değişken derinlikli ağaçlar, gömülü metraj satırları, esnek şemalar —
MongoDB'nin güçlü yönleriyle doğrudan örtüşmektedir. Mevcut 107 Realm fonksiyonu ve Mongoose
şemasını başka bir veritabanına taşımanın getireceği mühendislik maliyeti, alternatiflerin
sağlayabileceği avantajlardan çok daha yüksektir.

### Kabul edilen iyileştirmeler (MongoDB üzerinde kalarak)

1. **Çok adımlı atomik işlemleri** `session.withTransaction()` ile koru (bkz. `README.md` — kritik `bulkWrite` uyarısı).
2. **Realm'dan tam bağımsızlık** için Express/Mongoose API katmanının kapsamını genişlet; doğrudan `RealmApp.currentUser.callFunction(...)` çağrılarını azalt.
3. **Mongoose şema validasyonunu** zorunlu (`required: true`) alanlarda etkinleştirerek MongoDB'nin şemasız yapısından kaynaklanan tutarsızlıkları önle.

---

## Sonuç

> MongoDB Atlas, **Rapor7/24 için doğru veritabanı seçimidir**. Belge odaklı yapısı,
> esnek şeması ve güçlü aggregation desteği; inşaat projesinin hiyerarşik ve
> değişken veri modeliyle tam uyum sağlamaktadır. Alternatif bir veritabanına geçişin
> teknik borcu ve geliştirme maliyeti, kazanımından çok daha büyük olacaktır.
