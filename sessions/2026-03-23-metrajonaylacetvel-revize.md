# Session: metrajonaylacetvel — Revize Satır Sistemi (2026-03-23)

Tek dosya: `src/pages/metrajonaylacetvel/index.js`

---

## Bu Oturumda Yapılanlar

### Revize sıralama bug fix — `buildApprovalTree.enrich`
Tüm revize satırlar `order_index = -1` olduğu için DB'den dönünce sıra bozuluyordu (1.R3 kaydedince 1.R1 ile yer değişiyordu). Fix: revision kids (ikisi de `order_index < 0`) için `id` string'e göre sort (MongoDB ObjectID = timestamp-encoded).
```js
.sort((a, b) => {
  const oa = a.order_index ?? 0; const ob = b.order_index ?? 0
  if (oa < 0 && ob < 0) return a.id < b.id ? -1 : a.id > b.id ? 1 : 0
  return oa - ob
})
```

### Satır seçim sistemi yeniden düzenlendi
- `isClickable = node.status === 'approved' && !isSuperseded` — sadece onaylı satırlar seçilebilir
- `rBtnDisabled = !selectedOnayRow` — R butonu sadece "seçili satır var mı?" kontrolü
- `plusBtnDisabled = !selectedOnayRow` — aynı şekilde
- `rowBg = rawBg` — turuncu renklendirme kaldırıldı
- `isSelected ? '#E65100' :` tüm hücrelerden temizlendi
- `isRevised` gri satırdan `cursor: pointer` ve `onClick` kaldırıldı

### Açıklama hücresinde kırmızı nokta indikatörü
Her üç satır tipinde görünmez `visibility` ile yer tutucu nokta:
- **Normal/revize satır**: `<Box sx={{ width:7, height:7, borderRadius:'50%', backgroundColor:'#c62828', visibility: isSelected ? 'visible' : 'hidden' }} />` — hücre en solunda, `gap:'6px'`
- **isRevised gri satır**: her zaman `visibility:'hidden'` (sadece yer tutar, hiç seçilemiyor)
- **renderNewRows form satırı**: her zaman `visibility:'hidden'`, Box `pl:'4px' gap:'4px'`, input `flex:1 minWidth:0`

### renderNewRows — onaylayan hücresinden "(bekliyor)" kaldırıldı
```jsx
{showOnaylayan && <Box sx={{ ...css_oc, ...pBg }} />}
```
Boş hücre — içerik yok.

---

## Mevcut Mimari Özeti

### Onaylı Metraj Kartı — Seçim + Buton Mantığı
- Sadece `approved && !isSuperseded` satırlar tıklanabilir
- `selectedOnayRow` set edilince açıklama hücresinde kırmızı nokta (sol) belirir
- Card header: R butonu (revize talebi) ve + butonu (alt satır) yalnızca `selectedOnayRow` varsa aktif

### Revize Satır Sistemi
- `order_index < 0` = revize satır sentinel
- `order_index = -1` tüm revizelere atanır (save anında)
- Sıralama → `id` string karşılaştırmasıyla (MongoDB ObjectID zamana göre sıralı)
- `isRevisionRow = (node.order_index ?? 0) < 0`
- `isSuperseded` = approved revision çocuğu VAR veya `isSupersededByLaterRevision`
- `isSupersededByLaterRevision` = bu revize sıradan daha yeni approved revize kardeşi var (enrich'te hesaplanır)
- `isLastRevision` = parent'ın en son revize çocuğu

### pendingNewLines
`{ [parentLineId]: [{tempId, isEdit, rNum, description, multiplier, count, length, width, height}] }`
- `isEdit:true` → revision form (`.RN` numaralı)
- `isEdit:false` → normal alt satır formu
- Revize seçiliyken + veya R basılırsa `targetParentId = parent_line_id` (grandparent'a yönlenir)

### Onay anında kardeş ignore
`approveLine()`: eğer onaylanan satır revision ise (`order_index < 0`), diğer revision kardeşler otomatik `ignored` olur.
