# Rapor7/24 — Proje Kılavuzu

İnşaat sektörüne yönelik proje yönetim ve raporlama web uygulaması.
Türk inşaat şirketleri için: iş kalemi (poz) tanımları, mahal yönetimi, metraj iş akışları, iş paketleri ve bütçe takibi.

---

## Geliştirme Ortamı

**Frontend only** — Backend yoktur. Supabase (Auth + PostgreSQL) kullanılır.

```bash
# Frontend (c:\github\rapor724)
npm start          # http://localhost:3000
```

Frontend `.env`:
```
REACT_APP_SUPABASE_URL=...
REACT_APP_SUPABASE_ANON_KEY=...
```

---

## Tech Stack

| Paket | Versiyon | Kullanım |
|---|---|---|
| React | 18 | UI framework — StrictMode aktif |
| React Router DOM | 6 | Client-side routing |
| @tanstack/react-query | 5 | Server state / veri çekme |
| @mui/material | 5 | UI bileşen kütüphanesi |
| @mui/icons-material | 5 | MUI ikonları |
| supabase-js | — | Auth + DB client |

---

## Klasör Yapısı

```
src/
├── App.js                   # React Router — aktif route tanımları
├── index.js                 # Entry point: BrowserRouter > QueryClientProvider > StoreProvider > Layout > App
├── pages/                   # Her route için ayrı sayfa bileşeni
├── components/
│   ├── store.js             # StoreContext — global state
│   ├── Layout.js            # Auth kontrol + AppBar + Sidebar + içerik
│   ├── Sidebar.js           # Navigasyon menüsü
│   ├── general/
│   │   └── DialogAlert.js   # Uyarı/bilgi dialog
│   ├── FormPozCreate.js, FormPozEdit.js
│   ├── FormMahalCreate.js, FormMahalEdit.js
│   ├── FormIsPaketCreate.js
│   ├── FormSignIn.js, FormSignUp.js, FormSifreYenileme.js
│   ├── FormMailTeyit.js, FormNewUserNecessaryData.js
│   └── FormProfileUpdate.js  # ⚠ Henüz Supabase'e tam taşınmadı
├── hooks/
│   └── useMongo.js          # Tüm React Query hook'ları (isim eski, içerik Supabase)
└── lib/
    ├── supabase.js           # Supabase client
    └── measurementStatus.js
```

---

## Aktif Route'lar

```
/                          → Home
/firmalar                  → Firma listesi           → firms tablosu
/projeler                  → Proje listesi           → projects tablosu
/wbs                       → WBS (iş kırılım yapısı) → wbs_nodes tablosu
/lbs                       → LBS (mahal kırılım)     → lbs_nodes tablosu
/pozlar                    → İş kalemleri            → project_pozlar tablosu
/mahaller                  → Mahal/lokasyon          → (migrate edilecek)
/proje-ayarlari            → Proje ayarları          → project_poz_units tablosu
/metrajolustur             → Metraj oluştur (giriş)
/metrajolusturpozlar       → Metraj oluştur — poz seçimi
/metrajolusturpozmahaller  → Metraj oluştur — mahal seçimi
/metrajolusturcetvel       → Metraj oluştur — cetvel  → pages/metrajcetvel/CetvelOlustur.js
/metrajonayla              → Metraj onayla (giriş)
/metrajonaylapozlar        → Metraj onayla — poz seçimi
/metrajonaylapozmahaller   → Metraj onayla — mahal seçimi
/metrajonaylacetvel        → Metraj onayla — cetvel   → pages/metrajcetvel/CetvelOnayla.js
/ispaketler                → İş paketleri            → work_packages tablosu
/ispaketpozlar             → İş paketi — poz seçimi
/ispaketpozmahaller        → İş paketi — poz/mahal atama (aktif geliştirme)
/butce                     → Bütçe
```

### Metraj Cetvel Sayfası Yapısı

```
src/pages/metrajcetvel/
  index.js          → metrajMode'a göre CetvelOlustur veya CetvelOnayla render eder
  CetvelOlustur.js  → Hazırlayan (oluştur) görünümü
  CetvelOnayla.js   → Onay yetkilisi görünümü
```

`store.js` içindeki `metrajMode` state'i ile mod seçilir: `'prepare'` → CetvelOlustur, `'approve'` → CetvelOnayla

**Grid sütunları:**
```js
const GRID_COLS = 'max-content 1fr 70px 70px 70px 70px 70px 90px 52px'
// SıraNo | Açıklama | Çarpan | Adet | Boy | En | Yükseklik | Miktar | Aksiyonlar
// CetvelOnayla: son sütun 80px
```

**Ortak yardımcı fonksiyonlar:**
```js
computeQuantity(line)          // multiplier * count * length * width * height
buildDisplayTree(lines)        // parent_line_id ile depth-first ağaç, siraNo ve depth ekler
buildApprovalTree(allLines, allSessions, userMap)  // Onay kartı için ağaç
```

**order_index anlamı:**
- `> 0` → normal çocuk satırlar, artan sıralı
- `< 0` → revize satırlar (`-1` en yeni); sıralama: `ob - oa` → R1(-1) R2(-2)'den önce

**isRevised:**
```js
const isRevised = node.status === 'approved' && kids.some(c => c.status === 'approved')
// parent onaylı VE en az bir çocuğu onaylı → gri render
```

**Kart renkleri (`getCardColors(visualStatus, isOwn)`):**
| visualStatus | border | row bg |
|---|---|---|
| `approved` | `#A5D6A7` | `rgba(200,230,201,0.35)` |
| `revised` (isOwn) | `#90CAF9` | `rgba(187,222,251,0.35)` |
| `revised` (!isOwn) | `#9e9e9e` | `rgba(158,158,158,0.18)` |
| `pendingRevision` | `#CE93D8` | `rgba(206,147,216,0.15)` |
| default (isOwn) | `#64B5F6` | `rgba(100,181,246,0.15)` |

**CetvelOlustur önemli notlar:**
- `VIRTUAL_SESS_ID = 'virtual-new'` → ilk save'de gerçek session oluşturulur
- X (İptal) butonu: `selectedOnayRow` korunur, sadece edit değerleri temizlenir
- `existingRevisionId` varsa revize insert değil update yapılır
- `draftLines` pattern kullanılmaz (CetvelOnayla'ya özgü)

**CetvelOnayla önemli notlar:**
- `draftLines` → senkron karar state'i, save'e kadar DB'ye gitmiyor
- `cardEditMode[sessId]` true iken o session değişiklikleri approvalTree'ye yansımaz (kasıtlı)
- Revize satırı approve edilince kardeş revizeler auto-ignored
- `autoExpandDone` ref ile approvalTree ilk yüklenince expand otomatik yapılır

---

## State Yönetimi — StoreContext

`src/components/store.js` — React Context + useState.

### Kimlik Doğrulama (Supabase)
```js
appUser        // Supabase user objesi
setAppUser     // null → çıkış yapar
```

### Seçim Hiyerarşisi
```
selectedFirma → selectedProje → selectedPoz / selectedPozBaslik
                              → selectedMahal / selectedMahalBaslik
                              → selectedIsPaket
                              → selectedMetrajVersiyon
```

### Layout
```js
drawerWidth: 240
topBarHeight: "3.5rem"
subHeaderHeight: "3.5rem"
myTema                    // renk şeması
```

---

## Layout.js Onboarding Kontrolleri

- `!appUser` → FormSignIn göster
- `!appUser.mailTeyit` → FormMailTeyit göster
- `!appUser.isim || !appUser.soyisim` → FormNewUserNecessaryData göster
- Aksi hâlde → normal uygulama

---

## React Query Kuralları

**Query Client Kurulumu** (`src/index.js`):
```jsx
<QueryClientProvider client={queryClient}>
  <StoreProvider>
    <Layout><App /></Layout>
    <ReactQueryDevtools initialIsOpen={false} />
  </StoreProvider>
</QueryClientProvider>
```

**Standart Hook Şablonu** (`src/hooks/useMongo.js`):
```js
export const useGetFirmalar = () => {
  const { appUser } = useContext(StoreContext)

  return useQuery({
    queryKey: ['firmalar'],
    queryFn: async () => {
      const { data, error } = await supabase.from('firmalar').select('*')
      if (error) throw new Error(error.message)
      return data
    },
    enabled: !!appUser,
    refetchOnMount: true,
    refetchOnWindowFocus: false
  })
}
```

---

## Yaygın Bileşen Kalıpları

### İki Aşamalı Görünüm
```js
const [show, setShow] = useState("Main")
// show == "Main" → liste, show == "FormCreate" → form
```

### Hata Dialog'u
```js
const [dialogAlert, setDialogAlert] = useState()
{dialogAlert && <DialogAlert {...dialogAlert} onCloseAction={() => setDialogAlert()} />}
```

**`DialogAlert` Props:**
```js
dialogMessage: string              // zorunlu
onCloseAction: () => void          // zorunlu
dialogIcon: "warning" | "success" | "info" | "none"
detailText: string                 // expandable alan (varsa action butonları gizlenir)
actionText1: string
action1: () => void
actionText2: string
action2: () => void
```

### Onay Dialog'u
```js
const [showEminMisin, setShowEminMisin] = useState(false)
const [dialogConfirmAction, setDialogConfirmAction] = useState(null)
setDialogConfirmAction(() => () => { /* işlem */ })
setShowEminMisin(true)
```

### Değişiklik Takibi
```js
const [isChanged, setIsChanged] = useState()
// true ise AppBar'da kaydet/iptal butonları görünür
```

---

## Bilinen Sorunlar ve Çözümler

### MUI Menu + React 18 StrictMode → aria-hidden Uyarısı
`<Menu>` yerine `<Popper>` + `<ClickAwayListener>` + `<MenuList>` kullan:

```jsx
<Popper open={Boolean(anchorEl)} anchorEl={anchorEl} placement="bottom-start" style={{ zIndex: 1300 }}>
  <Paper elevation={8}>
    <ClickAwayListener onClickAway={handleClose}>
      <MenuList>
        <MenuItem onClick={...}>Seçenek</MenuItem>
      </MenuList>
    </ClickAwayListener>
  </Paper>
</Popper>
```

### Sayfa Yenilemede Bağlam Kaybı
Her alt sayfada guard useEffect:
```js
useEffect(() => {
  if (!selectedProje || !selectedPoz) navigate('/ispaketpozlar')
}, [selectedProje, selectedPoz, navigate])
```

---

## Türkçe Domain Sözlüğü

| Türkçe | İngilizce |
|---|---|
| firma | company / firm |
| proje | project |
| poz | cost item / line item / position |
| mahal / mahaller | location / area |
| metraj | measurement / survey data |
| ispaket / iş paketi | work package |
| dugum | node (WBS + LBS intersection point) |
| cetvel | table / schedule / register |
| hazirlanan | prepared / draft |
| onaylanan | approved |
| bekliyor | pending |
| reddedildi | rejected |
| revize | revision |
| butce | budget |

---

## Supabase Migrasyon Durumu

### Tamamlanan Sayfalar (Supabase)
| Sayfa | Tablo |
|---|---|
| /firmalar | `firms` |
| /projeler | `projects` |
| /wbs | `wbs_nodes` (adjacency list: `parent_id` + `order_index`) |
| /lbs | `lbs_nodes` |
| /pozlar | `project_pozlar` (kod: `[WBS_PATH].[SEQ]`, örn. `KAB.ZEM.001`) |
| /proje-ayarlari | `project_poz_units` |
| /ispaketler | `work_packages` |
| /metrajcetvel | `measurement_sessions`, `measurement_lines` |

### Migrate Edilmemiş Hook'lar (dokunma — sayfaları açılana kadar bekleyecek)
`useMongo.js` içindeki şu hook'lar hâlâ eski sistemi kullanıyor:
- `useGetFirmaPozlar`, `useGetPozlar`, `useGetIsPaketPozlar`
- `useGetMahaller`, `useGetMahalListesi_*`
- `useGetDugumler*`
- `useGetHazirlananMetraj*`, `useGetOnaylananMetraj`
- `useGetNetworkUsers`, `useGetProjectNames_firma`

### Bekleyen SQL (Supabase SQL Editor'de çalıştırılacak)
```sql
-- LBS
ALTER TABLE lbs_nodes ADD COLUMN IF NOT EXISTS code_name text;
CREATE POLICY "dev_lbs_nodes_all" ON lbs_nodes FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Poz birimleri
CREATE TABLE IF NOT EXISTS project_poz_units (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  name text not null, order_index int not null default 0,
  created_at timestamptz not null default now()
);
ALTER TABLE project_poz_units ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dev_project_poz_units_all" ON project_poz_units FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- İş paketleri RLS
ALTER TABLE work_packages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dev_work_packages_all" ON work_packages FOR ALL TO authenticated USING (true) WITH CHECK (true);
```

> Tüm tablolar için şema: `database/schema.sql` | RLS: `database/rls.sql`

### Sonraki Geliştirme Sırası
1. `/ispaketpozlar` — work_packages + project_pozlar ilişkisi
2. `/mahaller` — `work_areas` tablosu, LBS leaf node'larına bağlı
3. Firma / Proje oluşturma formları (hâlâ eski backend)
4. RLS politikalarını production için kullanıcı bazlı daralt

---

## Yeni Sayfa Ekleme

1. `src/pages/sayfaadi/index.js` oluştur
2. `src/App.js`'e import et ve route ekle
3. `src/components/Sidebar.js`'e menü öğesi ekle

## Yeni API Hook Ekleme

1. `src/hooks/useMongo.js`'e ekle
2. Supabase client'ı (`src/lib/supabase.js`) kullan
3. Standart `useQuery` şablonunu takip et (`enabled: !!appUser`)
