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

#### ✅ Proje Ayarları (`src/pages/projeayarlari/index.js`)
- `useGetPozUnits` → `project_poz_units` tablosu (Supabase)
- Poz birimleri CRUD: ekleme, silme, sıralama (yukarı/aşağı)
- FK ile korumalı: poz kullanan birim silinemez
- Sidebar'da "Proje Ayarları" menüsü eklendi (`/proje-ayarlari`)

#### ✅ Pozlar (`src/pages/pozlar/index.js`)
- `useGetProjectPozlar` → `project_pozlar` tablosu (Supabase)
- İki görünüm modu: **WBS ağaç** (tree) | **düz liste** (flat)
- Ağaç görünümü: WBS node'ları collapse/expand edilebilir, yaprak node seçilerek poz eklenir
- Düz liste görünümü: WBS yaprak chip filtreleri ile filtreleme
- Poz kodu otomatik üretilir: `[WBS_PATH].[SEQ]` → örn. `KAB.ZEM.001`
- `FormPozCreate.js` yeniden yazıldı (Supabase, unit_id, otomatik kod)
- **SQL çalıştırılması gerekiyor** (aşağıya bak)

### Çalıştırılması Gereken SQL (Supabase SQL Editor)

```sql
-- LBS tablosu (henüz çalıştırılmadıysa)
ALTER TABLE lbs_nodes
  ADD COLUMN IF NOT EXISTS code_name text;

CREATE POLICY "dev_lbs_nodes_all" ON lbs_nodes
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Poz birimleri tablosu (yeni)
CREATE TABLE IF NOT EXISTS project_poz_units (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references projects(id) on delete cascade,
  name        text not null,
  order_index int not null default 0,
  created_at  timestamptz not null default now()
);
CREATE INDEX IF NOT EXISTS project_poz_units_project_id_idx ON project_poz_units (project_id);
ALTER TABLE project_poz_units ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dev_project_poz_units_all" ON project_poz_units
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Project pozlar tablosu (yeni — unit_id FK ile)
-- NOT: firm_poz_template_id ve created_by sütunları şimdilik eklenmedi
CREATE TABLE IF NOT EXISTS project_pozlar (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references projects(id) on delete cascade,
  wbs_node_id uuid references wbs_nodes(id) on delete set null,
  code        text,
  short_desc  text not null,
  long_desc   text,
  project_note text,
  unit_id     uuid references project_poz_units(id) on delete restrict,
  order_index int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
CREATE INDEX IF NOT EXISTS project_pozlar_project_id_idx ON project_pozlar (project_id);
ALTER TABLE project_pozlar ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dev_project_pozlar_all" ON project_pozlar
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
