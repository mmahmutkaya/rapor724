# Rapor7/24 — Proje Kılavuzu

İnşaat sektörüne yönelik proje yönetim ve raporlama web uygulaması.
Türk inşaat şirketleri için: iş kalemi (poz) tanımları, mahal yönetimi, metraj iş akışları, iş paketleri ve bütçe takibi.

---

## Geliştirme Ortamı

```bash
# Frontend (c:\vscode\rapor724)
npm start          # http://localhost:3000

# Backend (excelMongo — ayrı repo)
npm run dev        # nodemon server.js — http://localhost:4000
```

Frontend `.env`:
```
REACT_APP_BASE_URL=http://localhost:4000
```

---

## Frontend Tech Stack

| Paket | Versiyon | Kullanım |
|---|---|---|
| React | 18.2.0 | UI framework — StrictMode aktif |
| React Router DOM | 6.22.3 | Client-side routing |
| @tanstack/react-query | 5.37.1 | Server state / veri çekme |
| @tanstack/react-query-devtools | 5.39.0 | Query debug aracı |
| @mui/material | 5.15.15 | UI bileşen kütüphanesi |
| @mui/icons-material | 5.15.15 | MUI ikonları |
| lodash | 4.17.21 | Yardımcı fonksiyonlar (cloneDeep vb.) |

---

## Frontend Klasör Yapısı

```
src/
├── App.js                   # React Router – tüm route tanımları (flat, ~40 route)
├── index.js                 # Entry point: BrowserRouter > QueryClientProvider > StoreProvider > Layout > App
├── pages/                   # Her route için ayrı sayfa bileşeni
│   ├── index.js             # Ana sayfa
│   ├── firmalar/            # Şirket listesi
│   ├── projeler/            # Proje listesi
│   ├── projects/            # Proje detay/navigasyon
│   ├── dashboard/           # Proje özeti
│   ├── wbs/                 # İş Kırılım Yapısı
│   ├── lbs/                 # Konum Kırılım Yapısı
│   ├── pozlar/              # İş kalemleri
│   ├── mahaller/            # Mahal/lokasyon tanımları
│   ├── ispaketler*/         # İş paketleri ve bütçe
│   ├── ispaketpozmahaller/  # İş paketi – poz – mahal atama (aktif geliştirme)
│   ├── metraj*/             # Metraj oluşturma, onaylama, görüntüleme
│   ├── birimfiyat/          # Birim fiyat yönetimi
│   ├── parabirimleri/       # Para birimi yönetimi
│   ├── firmawbs/            # Firma şablon WBS
│   ├── firmapozlari/        # Firma şablon iş kalemleri
│   └── firmakadrosu/        # Firma personel
│
├── components/
│   ├── store.js             # StoreContext — tüm global state
│   ├── useApp.js            # MongoDB Realm app init hook
│   ├── Layout.js            # Wrapper: auth kontrol + AppBar + Sidebar + içerik
│   ├── Sidebar.js           # Bağlam duyarlı navigasyon menüsü
│   ├── AppBar.js            # Üst navigasyon çubuğu
│   ├── general/
│   │   ├── DialogAlert.js   # Uyarı/bilgi dialog (icon, mesaj, detay, opsiyonel butonlar)
│   │   ├── DialogOption.js  # Seçim dialog'u
│   │   └── DialogWindow.js  # Genel modal container
│   ├── Form*.js             # Domain CRUD formları
│   └── Edit*.js             # Domain düzenleme bileşenleri
│
└── hooks/
    └── useMongo.js          # Tüm React Query hook'ları burada
```

---

## Client-Side Route Haritası (`src/App.js` — 31 route)

```
Genel
  /                          → Home (giriş/landing)
  /firmalar                  → P_Firmalar
  /projeler                  → P_Projeler
  /parabirimleri             → P_ParaBirimleri
  /projects                  → P_Projects (proje detay/navigasyon)
  /firmawbs                  → P_FirmaWbs
  /firmapozlari              → P_FirmaPozlari
  /firmakadrosu              → P_FirmaKadrosu

Proje Yapısı
  /wbs                       → P_Wbs (iş kırılım yapısı)
  /pozlar                    → P_Pozlar
  /lbs                       → P_Lbs (konum kırılım yapısı)
  /mahaller                  → P_Mahaller

Mahal Listesi
  /mahallistesipozlar        → P_MahalListesiPozlar
  /mahallistesipozmahaller   → P_MahalListesiPozMahaller

Metraj Oluştur
  /metrajolusturpozlar       → P_MetrajOlusturPozlar
  /metrajolusturpozmahaller  → P_MetrajOlusturPozMahaller
  /metrajolusturcetvel       → P_MetrajOlusturCetvel

Metraj Onayla
  /metrajonaylapozlar        → P_MetrajOnaylaPozlar
  /metrajonaylapozmahaller   → P_MetrajOnaylaPozMahaller
  /metrajonayla              → P_MetrajOnayla
  /metrajonaylacetvel        → P_MetrajOnaylaCetvel

Metraj Görüntüle
  /metrajpozlar              → P_MetrajPozlar
  /metrajpozmahaller         → P_MetrajPozMahaller
  /metrajcetvel              → P_MetrajCetvel

Diğer
  /birimfiyat                → P_BirimFiyat
  /ispaketler                → P_IsPaketler
  /ispaketlerbutce           → P_IsPaketlerButce
  /ispaketpozlar             → P_isPaketPozlar
  /ispaketpozmahaller        → P_isPaketPozMahaller  ← aktif geliştirme
```

---

## State Yönetimi — StoreContext

`src/components/store.js` — React Context + useState ile yönetilir.

### Kimlik Doğrulama
```js
appUser        // { email, token, mailTeyit, isim, soyisim, ... }
setAppUser     // null → çıkış yapar
```
`localStorage.setItem('appUser', JSON.stringify(appUser))` ile kalıcı hale getirilir.

### Seçim Hiyerarşisi
```
selectedFirma → selectedProje → selectedPoz / selectedPozBaslik
                              → selectedMahal / selectedMahalBaslik
                              → selectedWbs / selectedLbs
                              → selectedIsPaket → selectedIsPaketVersiyon
                              → selectedBirimFiyatVersiyon
                              → selectedMetrajVersiyon
```

### Mod Değişkenleri
```js
mode_metrajOnayla      // metraj onaylama modu aktif mi
mode_birimFiyatEdit    // birim fiyat düzenleme modu
mode_isPaketEdit       // iş paketi düzenleme modu
detailMode             // detay görünüm modu
pageMetraj_show        // metraj sayfası görünüm durumu
```

### Node / Metraj Durumları
```js
selectedNode           // seçili WBS-LBS kesişim düğümü
editNodeMetraj         // düzenlenmekte olan metraj düğümü
onayNodeMetraj         // onaylanacak metraj düğümü
showNodeMetraj         // görüntülenen metraj düğümü
nodeMetrajlar          // düğüme ait metraj kayıtları listesi
```

### Layout
```js
drawerWidth: 240          // px
topBarHeight: "3.5rem"    // sabit AppBar yüksekliği
subHeaderHeight: "3.5rem"
myTema                    // renk şeması { renkler: { metrajOnaylananBaslik, ... } }
```

---

## Kimlik Doğrulama Akışı

1. `POST /api/user/login` → `{ appUser: { email, token, ... } }`
2. `localStorage.setItem('appUser', ...)` ile sakla
3. Her API isteğinde header olarak gönder:
   ```js
   headers: {
     email: appUser.email,
     token: appUser.token,
     'Content-Type': 'application/json'
   }
   ```
4. Token süresi dolmuşsa (`responseJson.error.includes("expired")`):
   ```js
   setAppUser()
   localStorage.removeItem('appUser')
   navigate('/')
   window.location.reload()
   ```

### Layout.js'de Onboarding Kontrolleri
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
    <ReactQueryDevtools name="Tanilama_React_Query" initialIsOpen={false} />
  </StoreProvider>
</QueryClientProvider>
```

**Standart Hook Şablonu** (`src/hooks/useMongo.js`):
```js
export const useGetFirmalar = () => {
  const { appUser, setAppUser } = useContext(StoreContext)
  const navigate = useNavigate()

  return useQuery({
    queryKey: ['firmalar'],
    queryFn: async () => {
      const response = await fetch(process.env.REACT_APP_BASE_URL + '/api/firmalar', {
        headers: { email: appUser.email, token: appUser.token }
      })
      const data = await response.json()
      if (data.error) {
        if (data.error.includes("expired")) { /* logout */ }
        throw new Error(data.error)
      }
      return data
    },
    enabled: !!appUser,
    refetchOnMount: true,
    refetchOnWindowFocus: false
  })
}
```

**Tüm Hook'lar ve Query Key'leri** (`src/hooks/useMongo.js`):
```
Hook                                  Query Key
─────────────────────────────────────────────────────────────────
useGetFirmalar                      → ['firmalar']
useGetFirmaPozlar                   → ['firmaPozlar']
useGetProjeler_byFirma              → ['dataProjeler']
useGetPozlar                        → ['dataPozlar']
useGetIsPaketPozlar                 → ['dataIsPaketPozlar']
useGetMahaller                      → ['dataMahaller']
useGetMahalListesi_pozlar           → ['dataMahallistesi_pozlar']
useGetMahalListesi_mahaller_byPoz   → ['dataMahalListesi_mahaller_byPoz']
useGetMahalListesi_byPoz            → ['dataMahalListesi_byPoz2']
useGetDugumler                      → ['dugumler']
useGetDugumler_byPoz                → ['dataDugumler_byPoz']
useGetMahalListesi                  → ['mahalListesi']
useGetHazirlananMetraj              → ['dataHazirlananMetraj']
useGetHazirlananMetrajlar           → ['dataHazirlananMetrajlar']
useGetOnaylananMetraj               → ['dataOnaylananMetraj']
useGetNetworkUsers                  → ['networkUsers', email]
useGetProjectNames_firma            → ['projectNames_firma', firmaId]
```

**Cache Geçersizleştirme**:
```js
queryClient.invalidateQueries(['dataDugumler_byPoz'])
```

---

## Yaygın Bileşen Kalıpları

### İki Aşamalı Görünüm
```js
const [show, setShow] = useState("Main")
// show == "Main" → liste, show == "FormCreate" → form bileşeni
```

### Hata Dialog'u
```js
const [dialogAlert, setDialogAlert] = useState()
// ...
{dialogAlert && <DialogAlert {...dialogAlert} onCloseAction={() => setDialogAlert()} />}
```

**`DialogAlert` Props:**
```js
// Zorunlu
dialogMessage: string              // gösterilecek mesaj
onCloseAction: () => void          // kapatma handler'ı

// Opsiyonel
dialogIcon: "warning" | "success" | "info" | "none"
detailText: string                 // "Ayrıntıları Göster/Gizle" expandable alan
actionText1: string                // 1. buton etiketi
action1: () => void                // 1. buton handler'ı
actionText2: string                // 2. buton etiketi
action2: () => void                // 2. buton handler'ı
// NOT: detailText varsa action butonları gösterilmez
```

### Onay Dialog'u (değişiklik kaybı uyarısı)
```js
const [showEminMisin, setShowEminMisin] = useState(false)
const [dialogConfirmAction, setDialogConfirmAction] = useState(null)

setDialogConfirmAction(() => () => { /* yapılacak işlem */ })
setShowEminMisin(true)
```

### Değişiklik Takibi
```js
const [isChanged, setIsChanged] = useState()
// isChanged true ise AppBar'da kaydet/iptal butonları görünür
```

---

## Backend Tech Stack

**Repo**: `https://github.com/mmahmutkaya/excelMongo`
**Deploy**: `https://excel-mongo-iota.vercel.app`

| Paket | Versiyon | Kullanım |
|---|---|---|
| express | ^4.18.1 | HTTP framework |
| mongoose | ^6.3.5 | MongoDB ODM |
| jsonwebtoken | ^9.0.2 | JWT kimlik doğrulama |
| bcrypt | ^6.0.0 | Şifre hash'leme |
| nodemailer | ^7.0.6 | E-posta gönderimi |
| validator | ^13.15.15 | Giriş doğrulama |
| cors | ^2.8.5 | CORS desteği |
| dotenv | ^16.0.1 | Ortam değişkenleri |

---

## Backend Yapısı

```
server.js           # Express app, CORS, MongoDB bağlantısı, route kayıtları
routes/             # 8 route dosyası
controllers/        # Her route için iş mantığı
middleware/
  requireAuth.js
  requireAuthAndNecessary.js   # Tüm korumalı rotalar bunu kullanır
  requireMailTeyit.js
models/             # Mongoose şemaları
```

**CORS Yapılandırması** (`server.js`):
```js
cors({
  origin: ['http://localhost:3000', 'https://rapor724.vercel.app'],
  methods: ['GET', 'POST', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', "*"]
})
```

---

## API Endpoint Listesi

### `/api/user`
| Metot | Yol | Middleware | İşlev |
|---|---|---|---|
| POST | `/signup` | — | Kullanıcı kaydı |
| POST | `/login` | — | Giriş, token döner |
| POST | `/sendmailcode` | requireAuth | E-posta doğrulama kodu gönder |
| POST | `/confirmmailcode` | requireAuth | Kodu onayla |
| POST | `/savenecessaryuserdata` | requireAuth + requireMailTeyit | Zorunlu kullanıcı verilerini kaydet |
| POST | `/customsettingspagessetdata` | requireAuthAndNecessary | Özel ayarları güncelle |

### `/api/firmalar`
CRUD — şirket yönetimi

### `/api/projeler`
- `GET /byfirma/:firmaId` — Şirketin projelerini çek

### `/api/pozlar`
| Metot | Yol | İşlev |
|---|---|---|
| GET | `/` | Projenin iş kalemlerini listele |
| POST | `/` | Yeni iş kalemi oluştur |
| PATCH | `/birimfiyatlar` | Birim fiyatları güncelle |
| GET | `/ispaketpozlar` | İş paketi iş kalemlerini çek |

### `/api/mahaller`
CRUD — mahal/lokasyon yönetimi

### `/api/dugumler`
| Metot | Yol | İşlev |
|---|---|---|
| POST | `/` | Düğüm oluştur |
| POST | `/addmetrajsatiri` | Metraj satırı ekle |
| GET | `/pozlar` | Düğümleri iş kalemiyle çek |
| GET | `/mahallerbypoz` | Poza göre mahalleri çek |
| GET | `/bypoz` | Düğümleri poza göre filtrele |
| GET | `/hazirlananmetraj` | Hazırlanan metrajı çek |
| GET | `/onaylananmetraj` | Onaylanan metrajı çek |
| GET | `/hazirlananmetrajlar` | Hazırlanan metrajları listele |
| POST | `/updatehazirlananmetrajpreparing` | Hazırlama durumunu güncelle |
| POST | `/updatehazirlananmetrajready` | Metrajı hazır olarak işaretle |
| POST | `/updateonaylananmetrajrevize` | Onaylanan metrajı revize et |
| POST | `/updateonaylananmetrajsil` | Onaylanan metrajı sil |
| POST | `/updatehazirlananmetrajlarseen` | Görüldü olarak işaretle |
| POST | `/updatehazirlananmetrajlarselected` | Seçilenleri işaretle |
| POST | `/updatehazirlananmetrajlarselectedfull` | Toplu seçim |
| POST | `/updatehazirlananmetrajlarunready` | Hazır durumunu geri al |
| **POST** | **`/ispaketler`** | **İş paketi ata/kaldır** |

### `/api/versiyon`
Versiyon yönetimi (metraj versiyonları, birim fiyat versiyonları)

### `/api/contracts`
Sözleşme işlemleri

---

## Kritik API Kontratları

### `POST /api/dugumler/ispaketler` — İş Paketi Atama/Kaldırma

**İstek Gövdesi:**
```json
{
  "selectedIsPaket": { "_id": "<isPaketId>" },
  "dugumler": [
    { "_id": "<dugumId>", "newSelectedValue": true },
    { "_id": "<dugumId2>", "newSelectedValue": false }
  ]
}
```

- `newSelectedValue: true` → MongoDB `$addToSet { isPaketler: { _id: ObjectId } }`
- `newSelectedValue: false` → MongoDB `$pull { isPaketler: { _id: ObjectId } }`
- `bulkWrite({ ordered: false })` ile toplu işlenir

**Frontend'de Kullanım (ispaketpozmahaller/index.js):**
Her eşsiz değişen isPaket ID'si için bir POST çağrısı yapılır. Mevcut state ile orijinal `dataDugumler_byPoz` verisi karşılaştırılarak fark bulunur.

```js
// Her değişen isPaket için:
const response = await fetch(REACT_APP_BASE_URL + '/api/dugumler/ispaketler', {
  method: 'POST',
  headers: { email, token, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    selectedIsPaket: { _id: isPaketId },
    dugumler: [{ _id: dugumId, newSelectedValue: true/false }]
  })
})
```

---

## Sidebar Navigasyon Mantığı (`src/components/Sidebar.js`)

Sidebar, context'e göre 3 farklı menü gösterir:

```
Durum 1 — !selectedFirma && !selectedProje:
  → /firmalar

Durum 2 — selectedFirma, !selectedProje:
  → /projeler
  → /parabirimleri

Durum 3 — selectedProje:
  → /wbs              (Poz Başlıkları)
  → /pozlar           (Pozlar)
  → /lbs              (Mahal Başlıkları)
  → /mahaller         (Mahaller)
  → /mahallistesipozlar   (Mahal Listesi)
  → /metrajolusturpozlar  (Metraj Oluştur)
  → /metrajonaylapozlar   (Metraj Onayla)
  → /metrajpozlar         (Metraj)
  → /birimfiyat           (Birim Fiyat)
  → /ispaketler           (İş Paketleri — setSelectedIsPaket() sıfırlar)
```

**Highlight Mantığı:** `pathname.includes('/metrajolustur')` gibi prefix eşleşmesi — alt sayfalar da aynı menü öğesini aktif gösterir.

---

## Bilinen Sorunlar ve Çözümler

### MUI Menu + React 18 StrictMode → aria-hidden Uyarısı
**Sorun:** React 18 StrictMode çift effect çağrısı, Modal tabanlı MUI `<Menu>` bileşeninin aria-hidden yönetiminde zamanlama hatasına yol açar.

**Çözüm:** `<Menu>` yerine `<Popper>` + `<ClickAwayListener>` + `<MenuList>` kullan — Modal değil, portal tabanlı değil.

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
Yönlendirmeden gelen sayfa (`selectedPoz`, `selectedProje` vb. context değerleri) yenilemede kaybolur.

**Çözüm:** Her alt sayfada guard useEffect:
```js
useEffect(() => {
  if (!selectedProje || !selectedPoz) {
    navigate('/ispaketpozlar')
  }
}, [selectedProje, selectedPoz, navigate])
```

---

## Türkçe Domain Sözlüğü

| Türkçe | İngilizce |
|---|---|
| firma | company / firm |
| proje | project |
| poz | cost item / line item / position |
| mahaller | locations / areas / zones |
| mahal | location / area |
| metraj | measurement / survey data |
| birimfiyat | unit rate / unit price |
| ispaket / iş paketi | work package |
| dugum | node (WBS + LBS intersection point) |
| cetvel | table / schedule / register |
| WBS | Work Breakdown Structure |
| LBS | Location Breakdown Structure |
| lbs | location node / location code |
| pozBaslik | item category / section header |
| mahalBaslik | location category / section header |
| hazirlanan | prepared / draft |
| onaylanan | approved |
| versiyon | version |
| kadro | staff / crew |
| butce | budget |
| paraBirimi | currency unit |

---

## Yeni Sayfa Ekleme

1. `src/pages/sayfaadi/index.js` oluştur
2. `src/App.js`'e import et: `import P_SayfaAdi from './pages/sayfaadi'`
3. Route ekle: `<Route path='/sayfaadi' element={<P_SayfaAdi />} />`
4. `src/components/Sidebar.js`'e menü öğesi ekle

## Yeni API Hook Ekleme

1. `src/hooks/useMongo.js`'e ekle
2. Standart `useQuery` şablonunu takip et (auth headers, error handling, enabled: !!appUser)
3. Token expire kontrolünü dahil et

## Yeni Backend Endpoint Ekleme

1. `controllers/` altında controller fonksiyonu yaz
2. `routes/` altındaki ilgili route dosyasına ekle
3. `requireAuthAndNecessary` middleware'ini uygula
