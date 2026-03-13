# rapor724 — Metraj Modülü: UI/UX Bağlamı

Bu dosya, GitHub Copilot ile geliştirme sürecinde bağlam sağlamak amacıyla hazırlanmıştır.

---

## Aktörler

| Rol | Açıklama |
|-----|----------|
| **Metraj Hazırlayan** | Seçilmiş bir poz ve mahal için metraj satırları oluşturur (ör. Ayşe, Fatma) |
| **Onay Yetkilisi** | Hazırlanan metraj satırlarını onaylar, reddeder veya ignore eder (ör. Mehmet, Ali) |

Birden fazla hazırlayan, aynı poz + mahal kombinasyonu için bağımsız olarak metraj hazırlayabilir.
Birden fazla onay yetkilisi olabilir; kim onay verdiği kayıt altına alınır.

---

## Satır Durumları

Her metraj satırı şu durumlardan birinde olabilir:

- **Bekliyor** — Onay yetkilisinin aksiyonu bekleniyor
- **Onaylı** — Onay yetkilisi tarafından kabul edildi
- **Reddedildi** — Hazırlayana geri gönderildi; yeniden hazırlanması isteniyor
- **Ignore** — Kayıt altına alındı, değiştirilemez hale getirildi, işleme konulmadı

---

## Revize Sistemi (Ağaç Yapısı)

Satırlar hiyerarşik olarak derinleşebilir. Her revize, parent satırın altına yerleşir.

```
A3          ← Ayşe'nin orijinal satırı (Onaylı → Revize edildi)
└── A3.1    ← Mehmet'in revizyonu (Onaylı)
    └── A3.1.1  ← Fatma'nın revize talebi (Bekliyor)
```

### Revize Kuralları

- **Onay yetkilisi** onayladığı bir satırı revize edebilir → orijinal satır yerinde kalır, revize alt satır olarak eklenir (ör. A3 → A3.1)
- **Metraj hazırlayanlar** onaylanmış veya revize görmüş satırlara revize talebi gönderebilir → yeni alt satır oluşur (ör. A3.1 → A3.1.1)
- Revize talepleri de onaylı, reddedildi veya ignore statüsü alabilir
- Derinlik sınırı yoktur (A3.1.1.1 oluşabilir)
- Revizeler göster/gizle (toggle) ile açılıp kapanabilir

---

## Kart (Card) Mimarisi

Arayüz iki tip kart içerir:

### 1. Kişi Kartları (her hazırlayan için ayrı)

- O kişinin oluşturduğu tüm satırları gösterir
- Onay bekleyen, reddedilen, ignore edilenler burada görünür
- Kişi, onaylanmış satırlar için revize talebi gönderince bu talep **kendi kartında değil, Onay Kartında** görünür

### 2. Onay Kartı (tek, ortak)

- Onaylanmış tüm aktif satırlar burada birikir
- Mehmet'in kendi revizeleri burada yer alır
- Hazırlayanların revize talepleri de bu kartta, ilgili satırın altında görünür
- Her satır için göster/gizle ile revize geçmişi açılabilir

#### Onay Kartı Sütunları

| Satır No | Açıklama | Miktar | Birim | … | Hazırlayan | Onaylayan |
|----------|----------|--------|-------|---|------------|-----------|
| A2 | … | … | … | … | Ayşe | Mehmet |
| A3 | … | … | … | … | Ayşe | Mehmet *(revize edildi)* |
| A3.1 | … | … | … | … | Mehmet | Mehmet |
| A3.1.1 | … | … | … | … | Fatma | *(bekliyor)* |
| F2 | … | … | … | … | Fatma | Ali |

- **Hazırlayan**: Satırı kim oluşturdu
- **Onaylayan**: Kim onayladı (birden fazla yetkili olabilir)

---

## Örnek Senaryo

```
Başlangıç:
  Ayşe → A1, A2, A3 hazırladı
  Fatma → F1, F2, F3 hazırladı

Mehmet'in aksiyonları:
  A1 → Bekliyor (henüz işlem yok)
  A2 → Onaylandı
  A3 → Onaylandı, ardından Mehmet revize etti → A3.1 oluştu
  F1 → Bekliyor
  F2 → Onaylandı
  F3 → Bekliyor

Sonraki adım:
  Fatma → A3.1'e revize talebi gönderdi → A3.1.1 oluştu
  Fatma → Yeni F4, F5 satırları oluşturdu
  Tümü onay bekliyor
```

---

- **Revize geçmişi**: Onay card göster/gizle toggle'ı, açıldığında revize edilmiş ama artık hesaplarda dikkate alınmayan orjinal satırlar gözükecek

- **Onay Kartı aksiyonları**: Her satır için Mehmet (veya yetkili) → Onayla / Reddet / Ignore butonları

- **Durum renk kodlaması** önerilir:
  - Bekliyor → sarı/turuncu karışımı
  - Onaylı → yeşil
  - Reddedildi → kırmızı
  - Ignore → gri
  - Revize → mavi veya mor tonu
