# Session: metrajcetvel — Metraj Cetvel Sayfaları (2026-03-27)

Dosyalar:
- `src/pages/metrajcetvel/CetvelOlustur.js` → `P_MetrajOlusturCetvel` (prepare modu)
- `src/pages/metrajcetvel/CetvelOnayla.js`  → `P_MetrajOnaylaCetvel` (approve modu)

Supabase tabloları: `measurement_sessions`, `measurement_lines`
Önceki session: `sessions/2026-03-23-metrajonaylacetvel-revize.md`

---

## Mimari: İki Ayrı Dosya — Tek Sayfa

Her iki bileşen AppBar'da "Oluştur / Onayla" toggle barı taşır.
Toggle, `metrajMode` context state'ini değiştirir (`'prepare'` | `'approve'`).
Navigasyon App.js route'larıyla yapılır:
- `/metrajolusturcetvel` → `P_MetrajOlusturCetvel`
- `/metrajonaylacetvel`  → `P_MetrajOnaylaCetvel`

Context state farkı:
- **Olustur**: `selectedMahal.wpAreaId` (hazırlayan akışı)
- **Onayla**: `selectedMahal_metraj.wpAreaId` (onaylayan akışı)

---

## `buildApprovalTree` Farkı

### CetvelOlustur (hazırlayan)
```js
// Revizeler: newest first (daha negatif order_index = daha yeni)
if (oa < 0 && ob < 0) return ob - oa   // R2(-2) R1(-1) sırasıyla
if (oa < 0) return -1                   // revizeler düzenli çocuklardan önce
```
R numarası: `revIdx++` (simple counter)
`isSupersededByLaterRevision` hesaplanmıyor.

### CetvelOnayla (onaylayan) — daha gelişmiş
```js
// Revizeler: newest first (aynı sort) + isSupersededByLaterRevision hesaplama
```
`isSupersededByLaterRevision` ve `isLastRevision` eklendi (2026-03-23 session).

---

## CetvelOnayla.js — Durum (Tamamlandı)

Dosya: 1473 satır — **production-ready durumda**.

### Session Kartları
- Her hazırlayan için ayrı kart `(sessions.map)`
- Edit modu: kart başlığındaki ✏️ ile açılır
- Toplu onay/ignore butonları (header'da)
- Satır bazında durum ikonu/butonları
- Footer: Hazırlanan/Onaya Sunulan/Ignore/Onaylanan toplamları

### Onaylı Metraj Kartı
- `buildApprovalTree` çıktısını recursive render (`renderOnayRow`)
- Revize satırlar `.RN` numaralı (N = sıra)
- Satır seçimi → kırmızı nokta indikatörü
- R butonu → `pendingNewLines` ile revize kopya form oluştur
- \+ butonu → alt satır form oluştur
- Footer: RevizeTalebi / RetEdilen / KabulEdilen / Onaylanan toplamları

### Kaydedilmemiş Değişiklikler Uyarısı (mod değiştirme)
```js
if (hasSaveableChanges) { /* DialogAlert → iptal veya devam */ }
```

### Görünürlük Dialog'u
- "Göster / Gizle" dialog: Onaylı Metraj kartı + her session kartı toggle

---

## CetvelOlustur.js — Durum (Geliştirilmekte)

Dosya: ~42K token (çok büyük), hazırlayan modunu implemente ediyor.

### Önemli State Değişkenleri
```js
sessions            // sessionlar + lines + isChanged flag
revizeForms         // { [lineId]: [{tempId, desc, mult, count, ...}] }
pendingDeletes      // silinecek line ID'leri (save'e kadar DB'ye yazılmaz)
pendingStatusReverts   // pending→draft (onaya geri çekme)
pendingStatusForwards  // draft→pending (onaya gönderme)
selectedOnayRow     // onaylı satır seçimi (R/+ işlemleri için)
pendingNewLines     // { [parentLineId]: [{tempId, isEdit, rNum, ...}] }
insertAfterTempId   // + butonunun hangi pozisyona ekleyeceği (pending new line)
insertAfterDbRowId  // + butonunun hangi DB satırından sonra ekleyeceği
selectedRowEditMode // satır düzenleme modu
rowEditValues       // { [lineId]: {description, multiplier, count, length, width, height} }
rowEditDeletes      // silinecek satır ID'leri (düzenleme modundayken)
approvedRowEditValues   // seçili onaylı satır düzenleme değerleri
approvedRowEditInitial  // başlangıç değerleri (değişiklik tespiti)
existingRevisionId  // mevcut pending revize satır ID'si (varsa UPDATE, yoksa INSERT)
VIRTUAL_SESS_ID = 'virtual-new'  // henüz Supabase'e kaydedilmemiş session
```

### Grid
```js
GRID_COLS = 'max-content 1fr 70px 70px 70px 70px 70px 90px 52px'
// Son sütun 52px (actions) — CetvelOnayla'da 80px (farklı)
```

---

## Revize Satır Order_Index Kuralı (Her İki Dosyada)

- `order_index < 0` = revize satır sentinel
- Her yeni revize → `-(existingRevCount + 1)` (örn. ilk revize: -1, ikinci: -2)
- Sıralama: `ob - oa` yani daha küçük (daha negatif) önce → en yeni revize en başta
- R numarası UI'da: 1'den başlar, artarak gider (eski → yeni)

## Sıralama Notu
`CetvelOlustur'da revize sıralama CetvelOnayla'dan farklı`:
- Olustur: `ob - oa` (aynı) ancak `isSupersededByLaterRevision` yok
- Onayla: `ob - oa` + `latestApprovedRevIdx` ile `isSupersededByLaterRevision/isLastRevision` hesaplama

---

## CetvelOnayla.js — Satır Seçimi Kaldırıldı (2026-03-28)

- `selectedOnayRow` ve `hoveredRowId` state'leri kaldırıldı
- `handleSelectOnayRow` fonksiyonu kaldırıldı
- `handleDuzenleNew(node)` ve `handleAddChildNew(node)` → artık `node` parametresi alır (selectedOnayRow yerine)
- Header R/+ butonları kaldırıldı (satır seçimi gerektiriyordu)
- Per-row R/+ ikonları eklendi: edit modunda, `approved && !isSuperseded` satırların action sütununda gösterilir
- Row click handler'ları kaldırıldı (isClickable, isHovered, rowHandlers, onRowClick, kırmızı nokta)

---

## Kalan İşler / TODOs CetvelOlustur

1. `selectedRowEditMode` ve `rowEditValues` — satır düzenleme modu UI'ı
2. `insertAfterTempId` / `insertAfterDbRowId` — konuma göre satır ekleme
3. ~~`approvedRowEditValues` / `existingRevisionId` — onaylı satır revize düzenleme~~ **FIXED (2026-03-28)**
4. `childEditParents` / `childEditValues` — onay kartında alt satır düzenleme
5. `pendingStatusReverts` / `pendingStatusForwards` — onaya gönder/geri çek akışı

## Bug Fixes

### ownSiblingRev repositioning bug (2026-03-28)
**Sorun:** `isRevised && showRevizeTalepleri` bloğunda `isInEditMode=true` iken, aktif kullanıcının kendi pending kardeş revizesi (ownSiblingRev) varsa, `selectedOnayRow` (1.R1) `revKids`'den siliniyordu. `renderOnayRow(1.R1)` hiç çağrılmadığı için edit formu (line 2413) açılmıyordu.

**Kök neden:** `withoutBoth` filtresi hem selectedOnayRow hem ownSiblingRev'i siliyordu, sadece ownSiblingRev geri ekleniyordu. Bu özellikle aktif kullanıcının `hazırlayan` olmadığı (başkasının oluşturduğu) onaylı revize satırları seçtiğinde tetikleniyordu.

**Fix:** `selectedOnayRow` listede kalır (edit formu için), `ownSiblingRev` onun hemen ardına taşınır.

---

## Context State (store.js'de olması gerekenler)
```js
metrajMode         // 'prepare' | 'approve'
setMetrajMode      // toggle handler
selectedMahal           // Olustur: { wpAreaId, sessionId?, sessionStatus? }
selectedMahal_metraj    // Onayla: { wpAreaId, name, code }
```
