-- ============================================================
-- RAPOR7/24 — TAM VERİTABANI ŞEMASI
-- Supabase (PostgreSQL) için
--
-- Tablolar bağımlılık sırasına göre sıralanmıştır.
-- Supabase SQL editöründe tek seferde çalıştırılabilir.
--
-- Faz 1 : Kullanıcı, Firma, Proje, Yetki, Onay Şablonları    (7 tablo)
-- Faz 2 : WBS, LBS, İş Alanları, POZ, Birim Fiyat            (7 tablo)
-- Faz 3 : Kaynak Havuzu, Birim Fiyat Analizi                  (4 tablo)
-- Faz 4 : İş Paketi, Metraj, Onay                            (6 tablo)
-- Faz 5 : İhale, Teklif, Sözleşme                            (9 tablo)
-- Faz 6 : İlerleme Takibi, Hakediş, Finansal Kesintiler       (8 tablo)
-- Faz 7 : Raporlama, Earn Value Analizi                       (3 tablo)
--                                                       TOPLAM: 44 tablo
-- ============================================================


-- ============================================================
-- FAZ 1: KULLANICI · FİRMA · PROJE · YETKİ · ONAY ŞABLONLARI
-- ============================================================

create table users (
  id             uuid primary key default gen_random_uuid(),
  email          text unique not null,
  password_hash  text not null,
  first_name     text,
  last_name      text,
  phone          text,
  email_verified boolean not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table firms (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text,
  created_by  uuid references users(id),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Firma üyeliği — minimal rol
-- owner : tam kontrol
-- admin : üye ekle, poz havuzu yönet, proje oluştur
-- member: projelere eklenebilir, firma yönetimi yok
create table firm_users (
  id         uuid primary key default gen_random_uuid(),
  firm_id    uuid not null references firms(id) on delete cascade,
  user_id    uuid not null references users(id) on delete cascade,
  role       text not null check (role in ('owner', 'admin', 'member')),
  invited_by uuid references users(id),
  created_at timestamptz not null default now(),
  unique (firm_id, user_id)
);

create table projects (
  id          uuid primary key default gen_random_uuid(),
  firm_id     uuid not null references firms(id) on delete restrict,
  name        text not null,
  description text,
  status      text not null default 'active'
                check (status in ('active', 'archived', 'completed')),
  created_by  uuid references users(id),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Proje üyeliği + granüler izinler
-- Firma personeli veya dış firma kullanıcısı farketmez — izinler proje bazında
-- user_invite: sadece kendi sahip olduğu izinleri verebilir
create table project_users (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references projects(id) on delete cascade,
  user_id     uuid not null references users(id) on delete cascade,
  invited_by  uuid references users(id),
  permissions jsonb not null default '{
    "wbs_manage":          false,
    "lbs_manage":          false,
    "work_area_manage":    false,
    "poz_manage":          false,
    "unit_price_manage":   false,
    "measurement_create":  false,
    "measurement_approve": false,
    "work_package_manage": false,
    "tender_manage":       false,
    "bid_submit":          false,
    "contract_approve":    false,
    "progress_enter":      false,
    "progress_approve":    false,
    "payment_create":      false,
    "payment_approve":     false,
    "user_invite":         false,
    "project_admin":       false
  }'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (project_id, user_id)
);

-- Onay zinciri şablonları (sözleşme, hakediş vb. için)
create table approval_templates (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  name       text not null,
  type       text not null check (type in ('contract', 'payment', 'custom')),
  created_by uuid references users(id),
  created_at timestamptz not null default now()
);

create table approval_template_steps (
  id               uuid primary key default gen_random_uuid(),
  template_id      uuid not null references approval_templates(id) on delete cascade,
  step_order       int not null,
  user_id          uuid not null references users(id),
  role_description text,
  created_at       timestamptz not null default now(),
  unique (template_id, step_order)
);

create index on firm_users (firm_id);
create index on firm_users (user_id);
create index on projects (firm_id);
create index on project_users (project_id);
create index on project_users (user_id);
create index on approval_templates (project_id);
create index on approval_template_steps (template_id);


-- ============================================================
-- FAZ 2: WBS · LBS · İŞ ALANLARI · POZ · BİRİM FİYAT
-- ============================================================

-- WBS (İş Kırılım Yapısı) — adjacency list, recursive CTE ile sorgulanır
-- Kural: bir düğüm altında ya çocuk düğüm ya POZ olur, ikisi birden olmaz
-- En alt seviye (leaf = çocuğu olmayan) düğümler otomatik poz eklemeye açık sayılır
create table wbs_nodes (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references projects(id) on delete cascade,
  parent_id   uuid references wbs_nodes(id) on delete restrict,
  name        text not null,
  code_name   text,             -- kısa kod, boşluksuz (örn. "KAB")
  order_index int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- LBS (Konum Kırılım Yapısı)
-- Kural: bir düğüm altında ya çocuk düğüm ya iş alanı olur, ikisi birden olmaz
-- En alt seviye (leaf = çocuğu olmayan) düğümler otomatik mahal eklemeye açık sayılır
create table lbs_nodes (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references projects(id) on delete cascade,
  parent_id   uuid references lbs_nodes(id) on delete restrict,
  name        text not null,
  code_name   text,             -- kısa kod, boşluksuz (örn. "ZK")
  order_index int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- İş alanları — sadece LBS yaprak düğümlerine bağlı
-- Alan toplamları recursive CTE ile yukarı akar
create table work_areas (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references projects(id) on delete cascade,
  lbs_node_id uuid not null references lbs_nodes(id) on delete restrict,
  name        text not null,
  code        text,
  area        numeric(14,4),  -- m² (nullable)
  order_index int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Firma POZ havuzu (merkezi şablon listesi)
create table firm_poz_templates (
  id          uuid primary key default gen_random_uuid(),
  firm_id     uuid not null references firms(id) on delete cascade,
  code        text,
  short_desc  text not null,
  long_desc   text,
  unit        text not null,
  is_active   boolean not null default true,
  created_by  uuid references users(id),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Proje poz birimleri (m², m³, adet, kg, ton, vb.) — proje bazında tanımlanır
create table project_poz_units (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references projects(id) on delete cascade,
  name        text not null,
  order_index int not null default 0,
  created_at  timestamptz not null default now()
);

-- Proje POZ'ları
-- firm_poz_template_id null  → projeye özgü POZ
-- firm_poz_template_id dolu  → firma havuzundan seçilmiş, projeye özgü değişiklik yapılabilir
-- code: WBS path + sıra → örn. "KAB.ZEM.001" — poz taşındığında güncellenir
create table project_pozlar (
  id                   uuid primary key default gen_random_uuid(),
  project_id           uuid not null references projects(id) on delete cascade,
  wbs_node_id          uuid references wbs_nodes(id) on delete set null,
  firm_poz_template_id uuid references firm_poz_templates(id) on delete restrict,
  is_project_specific  boolean not null default false,
  code                 text,
  short_desc           text not null,
  long_desc            text,
  project_note         text,
  unit_id              uuid references project_poz_units(id) on delete restrict,
  order_index          int not null default 0,
  created_by           uuid references users(id),
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

-- Birim fiyat versiyonları
-- firm_id   dolu → firma versiyonu
-- project_id dolu → projeye özgü versiyon (firma versiyonunu override eder)
create table price_versions (
  id          uuid primary key default gen_random_uuid(),
  firm_id     uuid references firms(id) on delete cascade,
  project_id  uuid references projects(id) on delete cascade,
  name        text not null,
  currency    text not null default 'TRY',
  is_active   boolean not null default false,
  created_by  uuid references users(id),
  created_at  timestamptz not null default now(),
  check (
    (firm_id is not null and project_id is null) or
    (firm_id is null and project_id is not null)
  )
);

-- Proje POZ birim fiyatları
-- price_type = 'direct'   → elle girilmiş
-- price_type = 'analysis' → poz_analyses tablosundan hesaplanır
create table poz_unit_prices (
  id               uuid primary key default gen_random_uuid(),
  project_poz_id   uuid not null references project_pozlar(id) on delete cascade,
  price_version_id uuid not null references price_versions(id) on delete cascade,
  unit_price       numeric(15,4) not null,
  price_type       text not null default 'direct'
                     check (price_type in ('direct', 'analysis')),
  created_by       uuid references users(id),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (project_poz_id, price_version_id)
);

create index on wbs_nodes (project_id);
create index on wbs_nodes (parent_id);
create index on lbs_nodes (project_id);
create index on lbs_nodes (parent_id);
create index on work_areas (project_id);
create index on work_areas (lbs_node_id);
create index on firm_poz_templates (firm_id);
create index on project_poz_units (project_id);
create index on project_pozlar (project_id);
create index on project_pozlar (wbs_node_id);
create index on project_pozlar (firm_poz_template_id);
create index on price_versions (firm_id);
create index on price_versions (project_id);
create index on poz_unit_prices (project_poz_id);
create index on poz_unit_prices (price_version_id);


-- ============================================================
-- FAZ 3: KAYNAK HAVUZU · BİRİM FİYAT ANALİZİ
-- ============================================================

-- Firma kaynak havuzu (malzeme / işçilik / ekipman / alt yüklenici)
create table resources (
  id            uuid primary key default gen_random_uuid(),
  firm_id       uuid not null references firms(id) on delete cascade,
  code          text,
  name          text not null,
  unit          text not null,
  resource_type text not null
                  check (resource_type in ('material', 'labor', 'equipment', 'subcontract')),
  is_active     boolean not null default true,
  created_by    uuid references users(id),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Versiyonlu kaynak birim fiyatları
-- Proje fiyatı → firma fiyatını override eder (sorgu katmanında COALESCE)
create table resource_prices (
  id               uuid primary key default gen_random_uuid(),
  resource_id      uuid not null references resources(id) on delete cascade,
  price_version_id uuid not null references price_versions(id) on delete cascade,
  unit_price       numeric(15,4) not null,
  created_by       uuid references users(id),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (resource_id, price_version_id)
);

-- POZ birim fiyat analizi
-- Birim fiyat = Σ(miktar × kaynak_fiyatı) × (1 + genel_gider) × (1 + kâr)
create table poz_analyses (
  id               uuid primary key default gen_random_uuid(),
  project_poz_id   uuid not null references project_pozlar(id) on delete cascade,
  price_version_id uuid not null references price_versions(id) on delete cascade,
  overhead_rate    numeric(6,4) not null default 0,  -- 0.15 = %15 genel gider
  profit_rate      numeric(6,4) not null default 0,  -- 0.10 = %10 kâr
  notes            text,
  created_by       uuid references users(id),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (project_poz_id, price_version_id)
);

-- Analiz kalemleri: 1 birim POZ için gereken kaynak miktarları
create table poz_analysis_items (
  id          uuid primary key default gen_random_uuid(),
  analysis_id uuid not null references poz_analyses(id) on delete cascade,
  resource_id uuid not null references resources(id) on delete restrict,
  quantity    numeric(15,6) not null,
  order_index int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (analysis_id, resource_id)
);

create index on resources (firm_id);
create index on resources (resource_type);
create index on resource_prices (resource_id);
create index on resource_prices (price_version_id);
create index on poz_analyses (project_poz_id);
create index on poz_analyses (price_version_id);
create index on poz_analysis_items (analysis_id);
create index on poz_analysis_items (resource_id);


-- ============================================================
-- FAZ 4: İŞ PAKETİ · METRAJ · ONAY
-- ============================================================

create table work_packages (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references projects(id) on delete cascade,
  name        text not null,
  code        text,
  description text,
  status      text not null default 'active'
                check (status in ('active', 'completed', 'cancelled')),
  created_by  uuid references users(id),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table work_package_pozlar (
  id              uuid primary key default gen_random_uuid(),
  work_package_id uuid not null references work_packages(id) on delete cascade,
  project_poz_id  uuid not null references project_pozlar(id) on delete restrict,
  order_index     int not null default 0,
  created_by      uuid references users(id),
  created_at      timestamptz not null default now(),
  unique (work_package_id, project_poz_id)
);

-- İş paketi POZ × iş alanı: metrajın hesaplandığı temel birim
create table work_package_poz_areas (
  id                  uuid primary key default gen_random_uuid(),
  work_package_poz_id uuid not null references work_package_pozlar(id) on delete cascade,
  work_area_id        uuid not null references work_areas(id) on delete restrict,
  order_index         int not null default 0,
  created_by          uuid references users(id),
  created_at          timestamptz not null default now(),
  unique (work_package_poz_id, work_area_id)
);

-- Metraj oturumları
-- Aynı iş_paketi+poz+iş_alanı için farklı kişiler farklı zamanlarda metraj oluşturabilir
-- supersedes_session_id: revizyon zinciri — en son onaylı session geçerlidir
--
-- Durum akışı: draft → ready → approved
--                       ↓         ↓
--                    rejected  revise_requested → draft
create table measurement_sessions (
  id                       uuid primary key default gen_random_uuid(),
  work_package_poz_area_id uuid not null
                             references work_package_poz_areas(id) on delete cascade,
  supersedes_session_id    uuid references measurement_sessions(id),
  status                   text not null default 'draft'
                             check (status in (
                               'draft', 'ready', 'approved', 'rejected', 'revise_requested'
                             )),
  total_quantity           numeric(15,4) not null default 0,
  notes                    text,
  created_by               uuid references users(id),
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

-- Metraj cetveli satırları — standart Türk inşaat metraj formatı
-- Miktar = multiplier × coalesce(count,1) × coalesce(length,1)
--                      × coalesce(width,1) × coalesce(height,1)
-- header/subtotal satırlarda miktar hesaplanmaz
create table measurement_lines (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid not null references measurement_sessions(id) on delete cascade,
  line_type   text not null default 'data'
                check (line_type in ('data', 'header', 'subtotal')),
  description text,
  multiplier  numeric(6,4)  not null default 1,   -- 1 normal, -1 çıkarma (pencere boşluğu vb.)
  count       numeric(12,4),                       -- adet
  length      numeric(12,4),                       -- boy
  width       numeric(12,4),                       -- en
  height      numeric(12,4),                       -- yükseklik
  order_index int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Metraj onay geçmişi
-- submit  → onaya gönderildi
-- approve → onaylandı
-- reject  → reddedildi
-- revise  → düzeltme istendi
create table measurement_approvals (
  id         uuid primary key default gen_random_uuid(),
  session_id uuid not null references measurement_sessions(id) on delete cascade,
  action     text not null
               check (action in ('submit', 'approve', 'reject', 'revise')),
  notes      text,
  created_by uuid references users(id),
  created_at timestamptz not null default now()
);

create index on work_packages (project_id);
create index on work_package_pozlar (work_package_id);
create index on work_package_pozlar (project_poz_id);
create index on work_package_poz_areas (work_package_poz_id);
create index on work_package_poz_areas (work_area_id);
create index on measurement_sessions (work_package_poz_area_id);
create index on measurement_sessions (status);
create index on measurement_lines (session_id);
create index on measurement_approvals (session_id);


-- ============================================================
-- FAZ 5: İHALE · TEKLİF · SÖZLEŞME · DEĞİŞİKLİKLER
-- ============================================================

create table tenders (
  id                  uuid primary key default gen_random_uuid(),
  work_package_id     uuid not null references work_packages(id) on delete restrict,
  title               text not null,
  description         text,
  status              text not null default 'draft'
                        check (status in (
                          'draft', 'open', 'evaluating', 'awarded', 'cancelled'
                        )),
  submission_deadline timestamptz,
  created_by          uuid references users(id),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- Dış firmalara gönderilen davet linkleri
-- token → /teklif?token=abc123 şeklinde benzersiz link
create table tender_invitations (
  id         uuid primary key default gen_random_uuid(),
  tender_id  uuid not null references tenders(id) on delete cascade,
  firm_name  text not null,
  email      text not null,
  token      text unique not null
               default encode(gen_random_bytes(32), 'hex'),
  status     text not null default 'pending'
               check (status in ('pending', 'viewed', 'bid_submitted', 'declined')),
  invited_by uuid references users(id),
  created_at timestamptz not null default now()
);

create table tender_bids (
  id             uuid primary key default gen_random_uuid(),
  tender_id      uuid not null references tenders(id) on delete cascade,
  invitation_id  uuid references tender_invitations(id),
  bidder_user_id uuid references users(id),
  firm_name      text not null,
  status         text not null default 'draft'
                   check (status in (
                     'draft', 'submitted', 'withdrawn', 'won', 'lost'
                   )),
  total_amount   numeric(18,4),
  currency       text not null default 'TRY',
  notes          text,
  submitted_at   timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table tender_bid_items (
  id             uuid primary key default gen_random_uuid(),
  bid_id         uuid not null references tender_bids(id) on delete cascade,
  project_poz_id uuid not null references project_pozlar(id) on delete restrict,
  unit_price     numeric(15,4) not null,
  estimated_qty  numeric(15,4),
  total_amount   numeric(18,4),
  notes          text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (bid_id, project_poz_id)
);

-- winning_bid_id null → ihalesiz sözleşme
create table contracts (
  id                   uuid primary key default gen_random_uuid(),
  project_id           uuid not null references projects(id) on delete restrict,
  work_package_id      uuid not null references work_packages(id) on delete restrict,
  winning_bid_id       uuid references tender_bids(id),
  title                text not null,
  contractor_name      text not null,
  status               text not null default 'draft'
                         check (status in (
                           'draft', 'under_approval', 'active', 'completed', 'terminated'
                         )),
  contract_date        date,
  start_date           date,
  end_date             date,
  total_amount         numeric(18,4),
  currency             text not null default 'TRY',
  approval_template_id uuid references approval_templates(id),
  notes                text,
  created_by           uuid references users(id),
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

-- Sözleşmedeki poz listesi ve anlaşılan birim fiyatlar
create table contract_items (
  id             uuid primary key default gen_random_uuid(),
  contract_id    uuid not null references contracts(id) on delete cascade,
  project_poz_id uuid not null references project_pozlar(id) on delete restrict,
  unit_price     numeric(15,4) not null,
  estimated_qty  numeric(15,4),
  currency       text not null default 'TRY',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (contract_id, project_poz_id)
);

create table contract_approvals (
  id          uuid primary key default gen_random_uuid(),
  contract_id uuid not null references contracts(id) on delete cascade,
  step_order  int not null,
  user_id     uuid not null references users(id),
  action      text not null check (action in ('approve', 'reject', 'revise')),
  notes       text,
  created_at  timestamptz not null default now()
);

-- Sözleşme değişiklikleri: ek iş, fiyat farkı, miktar revizyonu, iş azaltımı
-- Her değişiklik numaralanır ve kendi onay sürecinden geçer
create table contract_amendments (
  id             uuid primary key default gen_random_uuid(),
  contract_id    uuid not null references contracts(id) on delete cascade,
  amendment_no   int not null,
  amendment_type text not null
                   check (amendment_type in (
                     'additional_work',
                     'price_adjustment',
                     'quantity_revision',
                     'scope_reduction'
                   )),
  title          text not null,
  description    text,
  status         text not null default 'draft'
                   check (status in (
                     'draft', 'under_approval', 'approved', 'rejected'
                   )),
  amount_change  numeric(18,4),  -- pozitif: ek maliyet, negatif: azaltım
  created_by     uuid references users(id),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (contract_id, amendment_no)
);

create table contract_amendment_items (
  id               uuid primary key default gen_random_uuid(),
  amendment_id     uuid not null references contract_amendments(id) on delete cascade,
  contract_item_id uuid references contract_items(id),   -- null → yeni eklenen poz
  project_poz_id   uuid references project_pozlar(id),
  new_unit_price   numeric(15,4),
  new_quantity     numeric(15,4),
  description      text,
  created_at       timestamptz not null default now()
);

create index on tenders (work_package_id);
create index on tenders (status);
create index on tender_invitations (tender_id);
create index on tender_invitations (token);
create index on tender_bids (tender_id);
create index on tender_bid_items (bid_id);
create index on contracts (project_id);
create index on contracts (work_package_id);
create index on contracts (status);
create index on contract_items (contract_id);
create index on contract_approvals (contract_id);
create index on contract_amendments (contract_id);
create index on contract_amendment_items (amendment_id);


-- ============================================================
-- FAZ 6: İLERLEME TAKİBİ · HAKEDİŞ · FİNANSAL KESİNTİLER
-- ============================================================

-- Günlük / periyodik ilerleme kayıtları (hakedişten bağımsız proje takibi)
create table progress_entries (
  id               uuid primary key default gen_random_uuid(),
  contract_id      uuid not null references contracts(id) on delete restrict,
  contract_item_id uuid not null references contract_items(id) on delete restrict,
  entry_date       date not null,
  quantity         numeric(15,4) not null,
  notes            text,
  entered_by       uuid references users(id),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- Planlanan ilerleme — Earn Value S-eğrisi bazı
-- period_month her zaman ay başı: 2025-03-01
create table planned_progress (
  id               uuid primary key default gen_random_uuid(),
  contract_item_id uuid not null references contract_items(id) on delete cascade,
  period_month     date not null,
  planned_quantity numeric(15,4) not null,
  created_by       uuid references users(id),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (contract_item_id, period_month)
);

-- Hakediş (resmi ödeme belgesi)
-- draft → submitted → under_approval → approved → paid
create table hakedisler (
  id                   uuid primary key default gen_random_uuid(),
  contract_id          uuid not null references contracts(id) on delete restrict,
  hakedis_no           int not null,
  period_start         date not null,
  period_end           date not null,
  status               text not null default 'draft'
                         check (status in (
                           'draft', 'submitted', 'under_approval', 'approved', 'paid'
                         )),
  total_amount         numeric(18,4),
  currency             text not null default 'TRY',
  approval_template_id uuid references approval_templates(id),
  notes                text,
  created_by           uuid references users(id),
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  unique (contract_id, hakedis_no)
);

-- Hakediş kalemleri — kümülatif takip (standart Türk hakediş cetveli formatı)
create table hakedis_items (
  id                    uuid primary key default gen_random_uuid(),
  hakedis_id            uuid not null references hakedisler(id) on delete cascade,
  contract_item_id      uuid not null references contract_items(id) on delete restrict,
  previous_cumulative   numeric(15,4) not null default 0,
  current_period_qty    numeric(15,4) not null default 0,
  cumulative_qty        numeric(15,4) not null default 0,
  unit_price            numeric(15,4) not null,   -- sözleşme birim fiyatı (snapshot)
  current_period_amount numeric(18,4),
  cumulative_amount     numeric(18,4),
  notes                 text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  unique (hakedis_id, contract_item_id)
);

create table hakedis_approvals (
  id         uuid primary key default gen_random_uuid(),
  hakedis_id uuid not null references hakedisler(id) on delete cascade,
  step_order int not null,
  user_id    uuid not null references users(id),
  action     text not null
               check (action in ('submit', 'approve', 'reject', 'revise')),
  notes      text,
  created_at timestamptz not null default now()
);

-- Sözleşme finansal şartları — bir kez tanımlanır, tüm hakedişlere uygulanır
create table contract_financial_terms (
  id                    uuid primary key default gen_random_uuid(),
  contract_id           uuid unique not null references contracts(id) on delete cascade,
  advance_rate          numeric(6,4) default 0,    -- sözleşme bedelinin %X avans
  advance_recovery_rate numeric(6,4) default 0,    -- her hakedişten %X avans geri kesilir
  retention_rate        numeric(6,4) default 0,    -- teminat kesintisi
  retention_release_pct numeric(6,4) default 1,    -- teminat iade eşiği (%100 tamamlanma)
  vat_rate              numeric(6,4) default 0.20, -- KDV
  income_tax_rate       numeric(6,4) default 0,    -- gelir vergisi stopajı
  sgk_rate              numeric(6,4) default 0,    -- SGK primi
  price_escalation_rate numeric(8,6) default 0,    -- fiyat farkı katsayısı
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- Avans ödemeleri takibi
create table contract_advances (
  id          uuid primary key default gen_random_uuid(),
  contract_id uuid not null references contracts(id) on delete restrict,
  amount      numeric(18,4) not null,
  currency    text not null default 'TRY',
  paid_date   date,
  notes       text,
  created_by  uuid references users(id),
  created_at  timestamptz not null default now()
);

-- Hakediş kesintileri ve ilaveleri
-- amount pozitif → kesinti (düşülür)
-- amount negatif → ilave (eklenir, örn. KDV, fiyat farkı)
create table hakedis_deductions (
  id             uuid primary key default gen_random_uuid(),
  hakedis_id     uuid not null references hakedisler(id) on delete cascade,
  deduction_type text not null
                   check (deduction_type in (
                     'advance_recovery',
                     'retention',
                     'vat',
                     'income_tax',
                     'sgk',
                     'price_escalation',
                     'penalty',
                     'material_advance',
                     'other'
                   )),
  label          text not null,
  rate           numeric(8,6),
  base_amount    numeric(18,4),
  amount         numeric(18,4) not null,
  currency       text not null default 'TRY',
  notes          text,
  created_at     timestamptz not null default now()
);

create index on progress_entries (contract_id);
create index on progress_entries (contract_item_id);
create index on progress_entries (entry_date);
create index on planned_progress (contract_item_id);
create index on planned_progress (period_month);
create index on hakedisler (contract_id);
create index on hakedisler (status);
create index on hakedis_items (hakedis_id);
create index on hakedis_items (contract_item_id);
create index on hakedis_approvals (hakedis_id);
create index on contract_advances (contract_id);
create index on hakedis_deductions (hakedis_id);


-- ============================================================
-- FAZ 7: RAPORLAMA · EARN VALUE ANALİZİ
-- ============================================================

-- Earn Value anlık görüntüleri — S-eğrisi ve trend için periyodik saklanır
-- contract_id null → proje geneli agregasyon
create table ev_snapshots (
  id            uuid primary key default gen_random_uuid(),
  project_id    uuid not null references projects(id) on delete cascade,
  contract_id   uuid references contracts(id),
  snapshot_date date not null,
  currency      text not null default 'TRY',
  bac           numeric(18,4),  -- Budget at Completion
  planned_value numeric(18,4),  -- PV: planlanan iş değeri
  earned_value  numeric(18,4),  -- EV: tamamlanan iş değeri (bütçe fiyatıyla)
  actual_cost   numeric(18,4),  -- AC: gerçek harcama
  -- Türetilmiş metrikler
  schedule_variance numeric(18,4),  -- SV  = EV - PV
  cost_variance     numeric(18,4),  -- CV  = EV - AC
  spi               numeric(8,4),   -- SPI = EV / PV
  cpi               numeric(8,4),   -- CPI = EV / AC
  eac               numeric(18,4),  -- EAC = BAC / CPI  (tahmini nihai maliyet)
  vac               numeric(18,4),  -- VAC = BAC - EAC  (tahmini maliyet sapması)
  etc               numeric(18,4),  -- ETC = EAC - AC   (kalan tahmini maliyet)
  created_by    uuid references users(id),
  created_at    timestamptz not null default now(),
  unique (project_id, contract_id, snapshot_date)
);

-- Bütçe anlık görüntüleri — kapsam/fiyat değişimlerinin bütçeye etkisini gösterir
create table budget_snapshots (
  id              uuid primary key default gen_random_uuid(),
  project_id      uuid not null references projects(id),
  work_package_id uuid references work_packages(id),  -- null → proje geneli
  snapshot_date   date not null,
  snapshot_type   text not null
                    check (snapshot_type in (
                      'baseline',
                      'price_revision',
                      'scope_change',
                      'reforecast',
                      'manual'
                    )),
  total_amount    numeric(18,4) not null,
  currency        text not null default 'TRY',
  notes           text,
  created_by      uuid references users(id),
  created_at      timestamptz not null default now()
);

-- Kaydedilmiş rapor tanımları — kullanıcıların sık kullandığı filtre/görünüm ayarları
create table report_definitions (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references projects(id) on delete cascade,
  name        text not null,
  report_type text not null
                check (report_type in (
                  'earn_value',
                  'progress_summary',
                  'budget_comparison',
                  'payment_summary',
                  'wbs_cost_rollup'
                )),
  config      jsonb,
  created_by  uuid references users(id),
  created_at  timestamptz not null default now()
);

create index on ev_snapshots (project_id);
create index on ev_snapshots (contract_id);
create index on ev_snapshots (snapshot_date);
create index on budget_snapshots (project_id);
create index on budget_snapshots (snapshot_date);
create index on report_definitions (project_id);
create index on report_definitions (report_type);
