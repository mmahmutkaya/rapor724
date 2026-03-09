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
alter table wbs_nodes           enable row level security;
alter table lbs_nodes           enable row level security;
alter table project_poz_units   enable row level security;
alter table project_pozlar      enable row level security;

-- Diğer tablolar geliştirildikçe buraya eklenecek:
-- alter table project_pozlar   enable row level security;
-- alter table work_areas       enable row level security;
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
