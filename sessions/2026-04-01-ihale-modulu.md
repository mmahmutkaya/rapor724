# Oturum: İhale Modülü Temelleri
**Tarih:** 2026-04-01
**Proje:** rapor724 (`c:\github\rapor724`)
**Durum:** Aktif geliştirme — devam edecek

---

## Bu Oturumda Ne Yapıldı

### 1. Yeni Sayfalar Oluşturuldu
- `src/pages/ihale/index.js` — İhale iş paketi listesi (metraj sayfasının kopyası, `useGetMyWorkPackages` ile)
- `src/pages/ihalepozlar/index.js` — **Tamamen yeniden yazıldı** (aşağıda detay)

### 2. App.js'e Route Eklendi
```js
<Route path='/ihale' element={<P_Ihale />} />
<Route path='/ihale/pozlar' element={<P_IhalePozlar />} />
```
Shared sayfalar: `/metraj/pozlar/:id/mahaller?from=ihale` ve `/metraj/cetvel?from=ihale`

### 3. Sidebar Güncellendi
- İhale menü öğesi eklendi (Keşif/Bütçe'nin altına)
- Metraj aktif state: `pathname.includes('/metraj') && !search.includes('from=ihale')`
- İhale aktif state: `pathname.includes('/ihale') || search.includes('from=ihale')`

### 4. `?from=ihale` Param Zinciri
Tüm shared sayfalarda `fromModule` değişkeni ile yönlendirme ve breadcrumb adapte edildi:
- `metrajpozmahaller/index.js` — breadcrumb ve mahal tıklaması
- `metrajcetvel/index.js` — guard'lar
- `metrajcetvel/CetvelOnayla.js` — guard'lar + dialog başlığı değişti ("Metraj Yapanlar") + CheckIcon çift toggle eklendi
- `metrajcetvel/CetvelOlustur.js` — guard'lar

### 5. useMongo.js'e Hook Eklendi
```js
export const useGetIhaleBids = () => {
  // queryKey: ['ihaleBids', selectedIsPaket?.id]
  // supabase.from('ihale_bids').select('id, project_poz_id, bidder_user_id, unit_price')
  //   .eq('work_package_id', selectedIsPaket.id)
}
```

---

## ihalepozlar/index.js — Mimari

### Ne Kaldırıldı (metraj artıkları)
- `isApproveMode`, `metrajMode`, `sessionMap`, `columnUsers`, `hiddenMetrajUsers`
- Metraj/hazırlayan/onaylayan sütunları
- `metrajViewMode` / `cycleViewMode` toggle

### Ne Kaldı
- WBS tree (`flattenTree`, `nodeColor`, `flatNodes`, `isLeafSet`, `maxLeafDepth`)
- `collapsedIds`, collapse/expand butonları
- Header AppBar breadcrumb (İHALE > isPaket adı)
- `handlePozClick` → `/metraj/pozlar/${poz.id}/mahaller?from=ihale`

### Yeni Eklenenler

**State:**
```js
const [onayMap, setOnayMap] = useState({})        // pozId → onaylanan miktar (DB'den hesaplanır)
const [bids, setBids] = useState([])               // useGetIhaleBids'den
const [localEdits, setLocalEdits] = useState({})   // "pozId_bidderUserId" → string (frontend-first)
const [hiddenBidders, setHiddenBidders] = useState(new Set())
const [bidders, setBidders] = useState([])         // [{ id, display_name }]
```

**Grid sütunları:**
```
1rem [depth×totalDepthCols] 6rem  minmax(20rem,max-content)  8rem  [per firma: 7rem 8rem ...]
collapse  wbs-depth-renkleri      kod  açıklama               onaylanan  [BF  Tutar ...]
```

**Birim Fiyat kuralı:**
- `appUser.id === bidder.id` → TextField (editable)
- Başkası → readonly metin

**Save/Cancel:**
- `isChanged = Object.keys(localEdits).length > 0`
- AppBar'da isChanged iken Save (yeşil) + Cancel (X) görünür
- Save: `supabase.from('ihale_bids').upsert(..., { onConflict: 'work_package_id,project_poz_id,bidder_user_id' })`
- Cancel: `setLocalEdits({})`

**Onaylanan hesabı:** `measurement_lines` tablosundan `status='approved'` satırların toplamı (approvedChildrenOf kontrolü ile leaf node'lar)

**Bidder isimleri:** `supabase.rpc('get_user_display_names', { user_ids: uniqueIds })`

---

## Supabase Tablosu — HENÜZ OLUŞTURULMADI

Kullanıcının Supabase Dashboard'dan çalıştırması gerekiyor:

```sql
CREATE TABLE ihale_bids (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  work_package_id uuid NOT NULL,
  project_poz_id  uuid NOT NULL,
  bidder_user_id  uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  unit_price      numeric,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now(),
  UNIQUE (work_package_id, project_poz_id, bidder_user_id)
);
```

---

## Eksik / Gelecek Geliştirmeler

### A) Firma Davet Sistemi (YAPILMADI — en kritik eksik)
Firmalar şu an sisteme giremez çünkü:
1. Hesapları olması gerekiyor
2. `work_package_members` tablosuna proje sahibi tarafından eklenmesi gerekiyor
3. Link oluşturma / gönderme UI'ı yok

**Gerekli akış:**
1. Proje sahibi `/ihale` sayfasından "Firma Davet Et" → e-posta + iş paketi seçer
2. Sistem benzersiz token üretir, `ihale_invitations` tablosuna kaydeder
3. Firma temsilcisi linke tıklar → kayıt/giriş → otomatik `work_package_members`'a eklenir
4. Firma `/ihale/pozlar`'da kendi birim fiyat sütununu görür ve doldurur

### B) Rol Bazlı Görünüm
- Proje sahibi tüm firmaların sütunlarını görür (readonly)
- Firma sadece kendi sütununu görür ve düzenler ✅ (kısmen yapıldı — `appUser.id === bidder.id` kontrolü var)

### C) Teklif Karşılaştırma Ekranı
- Tüm firmaları yan yana + en düşük teklif vurgusu

### D) Teklif Durumu
- Firma teklifini "gönderdi" olarak işaretleyebilsin
- Proje sahibi "teklif alındı" onayı verebilsin

---

## Mevcut Dosya Durumu (2026-04-01)

| Dosya | Durum |
|-------|-------|
| `src/pages/ihale/index.js` | ✅ Tamamlandı |
| `src/pages/ihalepozlar/index.js` | ✅ Tamamlandı |
| `src/components/Sidebar.js` | ✅ Tamamlandı |
| `src/App.js` | ✅ Tamamlandı |
| `src/hooks/useMongo.js` | ✅ `useGetIhaleBids` eklendi |
| `src/pages/metrajpozmahaller/index.js` | ✅ `from=ihale` desteği |
| `src/pages/metrajcetvel/CetvelOnayla.js` | ✅ (uncommitted) |
| `src/pages/metrajcetvel/CetvelOlustur.js` | ✅ `from=ihale` desteği |
| `ihale_bids` Supabase tablosu | ❌ Kullanıcı oluşturacak |

---

## Sonraki Oturumda Yapılacaklar

1. `ihale_bids` tablosunun oluşturulduğunu doğrula
2. `/ihale/pozlar` sayfasını uçtan uca test et (birim fiyat giriş → kaydet → yenile → değer geliyor mu?)
3. Firma davet sistemi tasarımına karar ver ve uygula
4. Teklif karşılaştırma görünümü

---

## Teknik Notlar

- `work_package_members` tablosu → firmayı iş paketine bağlar (mevcut tablo)
- `useGetMyWorkPackages` → üye olduğun veya üyesiz paketleri getirir (ihale sayfası bunu kullanıyor)
- `get_user_display_names` RPC → Supabase'de mevcut, kullanıcı adlarını getiriyor
- Tüm measurement hesabı frontend'de yapılıyor (backend yok, Supabase direct)
