# rapor724 — Metraj Modülü: UI/UX Bağlamı

Bu dosya, GitHub Copilot ile geliştirme sürecinde bağlam sağlamak amacıyla hazırlanmıştır.
**Son güncelleme: 2026-03-23** — Supabase tabanlı güncel implementasyonu yansıtır.

---

## Aktörler

| Rol | Açıklama |
|-----|----------|
| **Metraj Hazırlayan** | Seçilmiş iş paketi → poz → mahal için metraj satırları oluşturur (ör. Ayşe, Fatma) |
| **Onay Yetkilisi** | Hazırlanan metraj satırlarını onaylar, reddeder veya ignore eder (ör. Mehmet, Ali) |

- Birden fazla hazırlayan aynı poz + mahal kombinasyonu için bağımsız çalışabilir.
- Birden fazla onay yetkilisi olabilir; kim onay verdiği kayıt altına alınır.

---

## Sayfa Akışı

### Metraj Oluştur Akışı (Hazırlayan)

```
/metrajolustur
  → Kendi iş paketleri listesi (useGetMyWorkPackages)
  → Seçim: setSelectedIsPaket → /metrajolusturpozlar

/metrajolusturpozlar
  → WBS ağacı + poz listesi
  → Sütunlar: "Onaylanan" (tüm kullanıcılar), kendi hazırlanan miktarı
  → Seçim: setSelectedPoz → /metrajolusturpozmahaller

/metrajolusturpozmahaller
  → LBS ağacı + mahal listesi
  → Sütunlar: "Onaylanan" kolonu + kullanıcı başına renkli nokta sütunları
  → Seçim: setSelectedMahal({ ...workArea, wpAreaId, sessionId?, sessionStatus? })
         → /metrajolusturcetvel

/metrajolusturcetvel
  → Kart bazlı metraj girişi (her kullanıcı için ayrı kart + Onay Kartı)
  → CRUD: satır ekle/sil/düzenle, onaya gönder, revize talebi gönder
```

### Metraj Onayla Akışı (Onay Yetkilisi)

```
/metrajonayla
  → Tüm iş paketleri listesi (useGetWorkPackages — üyelik filtresi yok)
  → Seçim: setSelectedIsPaket → /metrajonaylapozlar

/metrajonaylapozlar
  → WBS ağacı + poz listesi
  → Sadece aktif session'ı olan pozlar gösterilir
  → Sütunlar: "Onaylanan" + kullanıcı başına nokta
  → Seçim: setSelectedPoz → /metrajonaylapozmahaller

/metrajonaylapozmahaller
  → LBS ağacı + mahal listesi, tüm kullanıcı session'ları
  → Seçim: setSelectedMahal_metraj({ wpAreaId, name, code })
         → /metrajonaylacetvel

/metrajonaylacetvel
  → Kart bazlı onay arayüzü
  → Aksiyon: Onayla / Reddet / Ignore (satır bazında veya toplu)
```

**Önemli:** `selectedMahal` (Oluştur) ile `selectedMahal_metraj` (Onayla) farklı context state'leridir.

---

## Supabase Tablo Yapısı

### `measurement_sessions`

Her kullanıcının belirli bir `work_package_poz_area` için sahip olduğu tek kayıt.

| Alan | Tip | Açıklama |
|------|-----|----------|
| `id` | uuid | PK |
| `work_package_poz_area_id` | uuid | FK → work_package_poz_areas |
| `created_by` | uuid | FK → auth.users |
| `status` | text | Bkz. durum tablosu |
| `total_quantity` | numeric | Tüm satırların hesaplanan toplamı |
| `revision_snapshot` | jsonb | Revize öncesi orijinal satır değerleri |
| `updated_at` | timestamptz | Son değişiklik zamanı |

### `measurement_lines`

Bir session'a ait bireysel metraj satırları.

| Alan | Tip | Açıklama |
|------|-----|----------|
| `id` | uuid | PK |
| `session_id` | uuid | FK → measurement_sessions |
| `line_type` | text | `'data'` veya `'comment'` |
| `description` | text | Açıklama metni |
| `multiplier` | numeric | Çarpan (varsayılan 1) |
| `count` | numeric | Adet |
| `length` | numeric | Boy |
| `width` | numeric | En |
| `height` | numeric | Yükseklik |
| `order_index` | integer | Sıra |
| `status` | text | `'draft'` veya `'pending'` (oluşturma sırasında) veya `'approved'` / `'ignored'` (onay sonrası) |
| `parent_line_id` | uuid | NULL → kök satır; değer varsa → alt satır (revize ağacı) |
| `approved_by` | uuid | Onay yetkilisi user ID'si |
| `approved_at` | timestamptz | Onay zamanı |

**Miktar formülü:**
```
qty = multiplier × count × length × width × height
```
Boş alanlar 1 olarak işlenir; tüm değer alanları boşsa qty = 0.

---

## Session Durum Yaşam Döngüsü

```
            [Hazırlayan tarafı]
draft ──(satırları pending yap)──→ ready ──(yetkili gördü)──→ seen
                                     │                          │
                                   (onayla)               (onayla/ignore)
                                     ↓                          ↓
                                  approved ←────────────────────┘
                                     │
                            (yetkili revize eder)
                                     ↓
                                  revised
                                     ↑
                    (hazırlayan revize talebi gönderir)
                                     │
                            revise_requested
```

---

## Durum Görsel Kodlaması (`src/lib/measurementStatus.js`)

| `status` değeri | Görsel durum | Renk |
|----------------|--------------|------|
| `ready` | `unread` | `#f57c00` turuncu |
| `approved` (revision_snapshot yok) | `approved` | `#2e7d32` yeşil |
| `approved` (revision_snapshot dolu) | `revised` | `#1565c0` mavi |
| `revised` | `revised` | `#1565c0` mavi |
| `seen` veya `draft` | `seen` | `#757575` gri |
| `revise_requested` | `pendingRevision` | `#6a1fa2` mor |
| `rejected` | `rejected` | `#d32f2f` kırmızı |

Yardımcı fonksiyonlar: `getMeasurementVisualStatus`, `getMeasurementDotColor`, `getMeasurementStatusLabel`, `getMeasurementChipStyle`

---

## Kart (Card) Mimarisi — Cetvel Sayfaları

### Hazırlayan Cetvel (`/metrajolusturcetvel`)

**Kişi Kartları** (her session için ayrı):
- Satır türleri: `data` (hesaplanan) ve `comment` (metin)
- Grid sütunları: `sıra no | açıklama | çarpan | adet | boy | en | yükseklik | toplam | actions`
- Düzenleme: inline edit, satır ekle/sil
- "Onaya Gönder" → seçili satırların `status` → `'pending'`, session `status` → `'ready'`

**Onay Kartı** (ortak, `buildApprovalTree()` ile oluşturulur):
- Kök = `status === 'approved'` olan satırlar
- Alt satırlar = `parent_line_id IS NOT NULL` olan tüm satırlar
- Onay durumu gösteren hazırlayan/onaylayan sütunları
- Expand/collapse toggle ile revize geçmişi görüntüleme

**Revize talebi (hazırlayan):**
- Onaylı bir satır için `revizeForms` state'ine form ekle
- Kaydet → `measurement_lines` INSERT (yeni satır, `parent_line_id = orijinalSatırId`)
- Session `status → 'revise_requested'`, `revision_snapshot` güncellenir

### Onay Cetvel (`/metrajonaylacetvel`)

Hazırlayan cetvelinden farklar:
- Kişi kartları read-only + collapse/expand
- Satır bazında aksiyon butonları: **Onayla** / **Ignore**
- Toplu aksiyon: `approveAllPending(sessId)` / `ignoreAllPending(sessId)` → `draftLines` state
- `saveCardEdits()` veya `saveOnayKartiEdits()` ile Supabase'e yazılır
- Auto-expand: Sayfa açılışında `status === 'pending'` olan satırlar otomatik genişler
- Görünürlük toggleları: `showHazırlayan`, `showOnaylayan`, `showRevizeTalepleri`

**Satır onaylama:**
```js
supabase.from('measurement_lines')
  .update({ status: 'approved', approved_by: currentUserId, approved_at: now })
  .eq('id', lineId)
```

---

## Onay Kartı — Örnek Tablo

| Satır No | Açıklama | Miktar | Birim | Hazırlayan | Onaylayan |
|----------|----------|--------|-------|------------|-----------|
| A2 | … | … | … | Ayşe | Mehmet |
| A3 | … | … | … | Ayşe | Mehmet *(revize edildi)* |
| A3.1 | … | … | … | Mehmet | Mehmet |
| A3.1.1 | … | … | … | Fatma | *(bekliyor)* |
| F2 | … | … | … | Fatma | Ali |

- **Hazırlayan**: Satırı kim oluşturdu
- **Onaylayan**: Kim onayladı (birden fazla yetkili olabilir)
- Onay yetkilisinin kendi revizyonu → Hazırlayan = Onaylayan olabilir (A3.1 → Mehmet/Mehmet)

---

## `revision_snapshot` Yapısı

Onaylı bir session'da revize yapıldığında `measurement_sessions.revision_snapshot` güncellenir:

```json
[
  {
    "__revision_meta__": true,
    "approved_total": 45.5,
    "changed_line_ids": ["uuid1", "uuid2"]
  },
  {
    "id": "uuid1",
    "description": "Beton döşeme",
    "count": 3,
    "length": 5.0,
    "width": 2.0,
    "height": 0.2
  }
]
```

---

## RPC

### `get_user_display_names(user_ids: uuid[])`

- Security-definer fonksiyon — `auth.users` metadata'ya erişir
- Dönüş: `[{ id, first_name, last_name }]`
- Kullanıldığı sayfalar: `metrajonaylapozlar`, `metrajonaylapozmahaller`, `metrajolusturcetvel`, `metrajonaylacetvel`

---

## Context State — Metraj İlgili (`src/components/store.js`)

```js
selectedMahal          // Hazırlayan akışı: { ...workArea, wpAreaId, sessionId?, sessionStatus? }
selectedMahal_metraj   // Onaylayan akışı:  { wpAreaId, name, code }
mode_metrajOnayla      // onay modu flag (kullanım: store'da tanımlı, cetvel içinde olmayabilir)
pageMetraj_show        // "Pozlar" vb.

// Legacy (MongoDB dönemi, aktif kullanımda değil):
selectedNode, editNodeMetraj, onayNodeMetraj, showNodeMetraj, nodeMetrajlar
```

---

## Guard Pattern (Sayfa Yenilemede Bağlam Kaybı)

Her alt sayfada:
```js
useEffect(() => {
  if (!selectedProje) navigate('/projeler')
  if (!selectedIsPaket) navigate('/metrajolustur') // veya /metrajonayla
  if (!selectedPoz) navigate('/metrajolusturpozlar') // veya /metrajonaylapozlar
}, [selectedProje, selectedIsPaket, selectedPoz])
```

---

## Örnek Senaryo

```
Başlangıç:
  Ayşe → A1(hazırlandı), A2(hazırlandı), A3(hazırlandı)
  Fatma → F1(hazırlandı), F2(hazırlandı), F3(hazırlandı)

Mehmet'in aksiyonları:
  A1 → bekliyor
  A2 → onaylandı → Onay Kartına geçti
  A3 → onaylandı → Mehmet revize etti → A3.1 oluştu
  F2 → onaylandı → Onay Kartına geçti
  F3 → reddedildi / ignore

Devamı:
  Fatma → A3.1'e revize talebi → A3.1.1 oluştu (Onay Kartında görünür, Fatma'nın kartında değil)

Onay Kartı:
  A2       Ayşe   / Mehmet
  A3       Ayşe   / Mehmet  [revize edildi ▼]
    A3.1   Mehmet / Mehmet
      A3.1.1  Fatma / (bekliyor)
  F2       Fatma  / Mehmet
```
