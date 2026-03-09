# Yarım Kalan İşlerimiz

Bu dosya, birlikte başlayıp sonraya bıraktığımız işleri takip etmek için tutulur.

---

## SUPABASE MİGRASYON DURUMU (aktif çalışma)

### Genel Strateji
- MongoDB/Express backend tamamen kaldırılıyor
- Yerini doğrudan Supabase (PostgreSQL) alıyor — ayrı backend repo yok
- Sadece o an çalışılan sayfa migrate edilir, kullanılmayan hook'lara dokunulmaz
- RLS şu an tüm tablolarda `USING (true)` — production'da kullanıcı bazlı daraltılacak

### Supabase Bağlantısı
- `src/lib/supabase.js` → Supabase client
- Auth: Supabase Auth (email/password) — `store.js` içinde `onAuthStateChange` ile yönetiliyor
- Test kullanıcısı oluşturuldu ve giriş test edildi

### Tamamlanan Sayfalar

#### ✅ Firmalar (`src/pages/firmalar/index.js`)
- `useGetFirmalar` → `firms` tablosu (Supabase)
- `handleFirmaClick` → sadece `setSelectedFirma` + navigate, fetch yok
- Çalışıyor

#### ✅ Projeler (`src/pages/projeler/index.js`)
- `useGetProjeler_byFirma` → `projects` tablosu (Supabase), `firm_id` ile filtre
- `handleProjeClick` → sadece `setSelectedProje` + navigate, fetch yok
- Çalışıyor

#### ✅ WBS (`src/pages/wbs/index.js`)
- `useGetWbsNodes` → `wbs_nodes` tablosu (Supabase)
- adjacency list yapısı: `parent_id` + `order_index`
- `flattenTree()` client-side ağaç düzleştirme
- `selectedWbsLive` = useMemo ile güncel veri senkronizasyonu
- En alt seviye (leaf) node'lar otomatik poz'a açık — toggle switch yok, `isLeaf` hesaplanıyor
- Leaf = `!rawNodes.some(n => n.parent_id === node.id)` → yeşil nokta
- CRUD + sıralama + taşıma (sol/sağ/yukarı/aşağı) çalışıyor
- Form bileşenleri: `FormWbsCreate.js`, `FormWbsUpdate.js` (Supabase)
- Çalışıyor

#### ✅ LBS (`src/pages/lbs/index.js`)
- `useGetLbsNodes` → `lbs_nodes` tablosu (Supabase)
- WBS ile aynı yapı, `open_for_mahal` yerine `isLeaf` hesaplama
- Form bileşenleri: `FormLbsCreate.js`, `FormLbsUpdate.js` (Supabase)
- **SQL çalıştırılması gerekiyor** (aşağıya bak)

### Çalıştırılması Gereken SQL (Supabase SQL Editor)

```sql
-- LBS tablosu (henüz çalıştırılmadıysa)
ALTER TABLE lbs_nodes
  ADD COLUMN IF NOT EXISTS code_name text;

CREATE POLICY "dev_lbs_nodes_all" ON lbs_nodes
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
```

> Not: `open_for_poz` ve `open_for_mahal` sütunları artık kullanılmıyor.
> WBS SQL (open_for_poz + RLS) daha önce çalıştırıldı, WBS çalışıyor.

### Yedek / Yeniden Kurulum İçin Gerekli Dosyalar
| Dosya | İçerik | Repoda mı? |
|---|---|---|
| `database/schema.sql` | 44 tablo tam tanımı | ✅ Evet |
| `database/rls.sql` | RLS politikaları | ✅ Evet |
| `.env` | Supabase URL + anon key | ❌ Hayır (gitignore) |

**Credentials'ları güvenli bir yerde sakla:**
```
REACT_APP_SUPABASE_URL=https://xxxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJ...
```

### Migrate Edilmemiş Hook'lar (eski Express/Realm — dokunma)
Aşağıdaki hook'lar henüz eski sistemi kullanıyor.
Sayfaları açılana kadar bekleyecek:
- `useGetFirmaPozlar` (Realm)
- `useGetPozlar` (Express)
- `useGetIsPaketPozlar` (Express)
- `useGetMahaller` (Express)
- `useGetMahalListesi_*` (Express)
- `useGetDugumler*` (Express/Realm)
- `useGetHazirlananMetraj*` (Express)
- `useGetOnaylananMetraj` (Express)
- `useGetNetworkUsers` (Realm)
- `useGetProjectNames_firma` (Realm)

### Sonraki Adımlar (sırasıyla)
1. Pozlar sayfası (`/pozlar`) — `poz_items` tablosu, WBS leaf node'larına bağlı
2. Mahaller sayfası (`/mahaller`) — `mahal_items` tablosu, LBS leaf node'larına bağlı
3. Firma / Proje oluşturma formları (hâlâ eski backend)
4. RLS politikalarını production için kullanıcı bazlı daralt

### Değişen Mimari (not)
| | Eski | Yeni |
|---|---|---|
| Backend | Ayrı Express repo (excelMongo) | Yok |
| DB | MongoDB Atlas | Supabase PostgreSQL |
| Auth | JWT token (email+token header) | Supabase Auth (session) |
| API | fetch → localhost:4000 | supabase.from(...) |
| Güvenlik | requireAuth middleware | RLS (Row Level Security) |

---

## 1) Header stil tekrarlarını azaltma (PROJE GENELİ)
- Durum: Beklemede (migrasyon bitince)
- Öncelik: Orta

## 2) Icon button ölçü standardını genişletme
- Durum: Beklemede (migrasyon bitince)
- Öncelik: Düşük-Orta

---

Güncelleme kuralı:
- Her yeni yarım kalan işi buraya ekleyelim.
- İş tamamlandığında durumunu "Tamamlandı" yapalım.
