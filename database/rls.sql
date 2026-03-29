-- ============================================================
-- RAPOR7/24 — ROW LEVEL SECURITY POLİTİKALARI
-- Supabase (PostgreSQL) için
--
-- UYARI: Bu dosyadaki politikalar GELİŞTİRME modundadır.
-- Tüm tablolar authenticated kullanıcılara tamamen açıktır.
-- Production'a geçmeden önce kullanıcı bazlı daraltılmalıdır.
--
-- Önce RLS'yi tablolarda etkinleştir, sonra politikaları ekle.
-- Schema.sql çalıştırıldıktan sonra bu dosyayı çalıştır.
-- ============================================================


-- ============================================================
-- RLS ETKİNLEŞTİRME
-- ============================================================

alter table firms               enable row level security;
alter table projects            enable row level security;
alter table project_name_history enable row level security;
alter table project_currencies  enable row level security;
alter table project_currency_deletions enable row level security;
alter table project_poz_unit_deletions enable row level security;
alter table wbs_nodes           enable row level security;
alter table lbs_nodes           enable row level security;
alter table project_poz_units   enable row level security;
alter table project_pozlar      enable row level security;
alter table work_areas          enable row level security;

-- Diğer tablolar geliştirildikçe buraya eklenecek:
-- alter table work_packages    enable row level security;
-- alter table measurement_sessions enable row level security;
-- ... vb.


-- ============================================================
-- GELİŞTİRME POLİTİKALARI (dev — USING true)
-- ============================================================

-- firms
create policy "dev_firms_all"
  on firms for all to authenticated
  using (true) with check (true);

-- projects
create policy "dev_projects_all"
  on projects for all to authenticated
  using (true) with check (true);

-- project_name_history
create policy "dev_project_name_history_all"
  on project_name_history for all to authenticated
  using (true) with check (true);

-- project_currencies
create policy "dev_project_currencies_all"
  on project_currencies for all to authenticated
  using (true) with check (true);

-- project_currency_deletions
create policy "dev_project_currency_deletions_all"
  on project_currency_deletions for all to authenticated
  using (true) with check (true);

-- project_poz_unit_deletions
create policy "dev_project_poz_unit_deletions_all"
  on project_poz_unit_deletions for all to authenticated
  using (true) with check (true);

-- wbs_nodes
create policy "dev_wbs_nodes_all"
  on wbs_nodes for all to authenticated
  using (true) with check (true);

-- lbs_nodes
create policy "dev_lbs_nodes_all"
  on lbs_nodes for all to authenticated
  using (true) with check (true);

-- project_poz_units
create policy "dev_project_poz_units_all"
  on project_poz_units for all to authenticated
  using (true) with check (true);

-- project_pozlar
create policy "dev_project_pozlar_all"
  on project_pozlar for all to authenticated
  using (true) with check (true);

-- work_areas
create policy "dev_work_areas_all"
  on work_areas for all to authenticated
  using (true) with check (true);


-- ============================================================
-- PRODUCTION POLİTİKA ŞABLONLARI (henüz aktif değil)
-- Aşağıdaki örnekler production'da nasıl yazılacağını gösterir.
-- ============================================================

-- Örnek: sadece firma üyesi olan kullanıcılar projeyi görebilir
-- create policy "prod_projects_select"
--   on projects for select to authenticated
--   using (
--     exists (
--       select 1 from project_users
--       where project_users.project_id = projects.id
--         and project_users.user_id = auth.uid()
--     )
--   );

-- Örnek: wbs_nodes — proje üyesi olan kullanıcılar görebilir
-- create policy "prod_wbs_nodes_select"
--   on wbs_nodes for select to authenticated
--   using (
--     exists (
--       select 1 from project_users
--       where project_users.project_id = wbs_nodes.project_id
--         and project_users.user_id = auth.uid()
--     )
--   );
