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

## Aktif Route'lar (18)

```
/                          → Home
/firmalar                  → Firma listesi (Supabase)
/projeler                  → Proje listesi (Supabase)
/pozlar                    → İş kalemleri
/mahaller                  → Mahal/lokasyon tanımları
/metrajolustur             → Metraj oluştur (giriş)
/metrajolusturpozlar       → Metraj oluştur — poz seçimi
/metrajolusturpozmahaller  → Metraj oluştur — mahal seçimi
/metrajolusturcetvel       → Metraj oluştur — cetvel
/metrajonayla              → Metraj onayla (giriş)
/metrajonaylapozlar        → Metraj onayla — poz seçimi
/metrajonaylapozmahaller   → Metraj onayla — mahal seçimi
/metrajonaylacetvel        → Metraj onayla — cetvel
/ispaketler                → İş paketleri
/ispaketpozlar             → İş paketi — poz seçimi
/ispaketpozmahaller        → İş paketi — poz/mahal atama (aktif geliştirme)
/butce                     → Bütçe
/proje-ayarlari            → Proje ayarları
```

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

## Yeni Sayfa Ekleme

1. `src/pages/sayfaadi/index.js` oluştur
2. `src/App.js`'e import et ve route ekle
3. `src/components/Sidebar.js`'e menü öğesi ekle

## Yeni API Hook Ekleme

1. `src/hooks/useMongo.js`'e ekle
2. Supabase client'ı (`src/lib/supabase.js`) kullan
3. Standart `useQuery` şablonunu takip et (`enabled: !!appUser`)
