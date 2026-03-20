import { useContext } from 'react';
import { useQuery } from '@tanstack/react-query'
import { StoreContext } from '../components/store'
import { supabase } from '../lib/supabase.js'

export const useGetFirmalar = () => {

  const { appUser } = useContext(StoreContext)

  return useQuery({
    queryKey: ['firmalar'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('firms')
        .select('id, name, created_at')
        .order('name')

      if (error) throw new Error(error.message)

      return { firmalar: data }
    },
    enabled: !!appUser,
    retry: false,
    refetchOnMount: true,
    refetchOnWindowFocus: false
  })

}

export const useGetWbsNodes = () => {

  const { appUser, selectedProje } = useContext(StoreContext)

  return useQuery({
    queryKey: ['wbsNodes', selectedProje?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wbs_nodes')
        .select('id, parent_id, name, code_name, order_index')
        .eq('project_id', selectedProje.id)

      if (error) throw new Error(error.message)

      return data ?? []
    },
    enabled: !!appUser && !!selectedProje,
    retry: false,
    refetchOnMount: true,
    refetchOnWindowFocus: false
  })

}

export const useGetLbsNodes = () => {

  const { appUser, selectedProje } = useContext(StoreContext)

  return useQuery({
    queryKey: ['lbsNodes', selectedProje?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lbs_nodes')
        .select('id, parent_id, name, code_name, order_index')
        .eq('project_id', selectedProje.id)

      if (error) throw new Error(error.message)

      return data ?? []
    },
    enabled: !!appUser && !!selectedProje,
    retry: false,
    refetchOnMount: true,
    refetchOnWindowFocus: false
  })

}

export const useGetPozUnits = () => {

  const { appUser, selectedProje } = useContext(StoreContext)

  return useQuery({
    queryKey: ['pozUnits', selectedProje?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_poz_units')
        .select('id, name, order_index')
        .eq('project_id', selectedProje.id)
        .order('order_index')

      if (error) throw new Error(error.message)

      return data ?? []
    },
    enabled: !!appUser && !!selectedProje,
    retry: false,
    refetchOnMount: true,
    refetchOnWindowFocus: false
  })

}

export const useGetProjectPozlar = () => {

  const { appUser, selectedProje } = useContext(StoreContext)

  return useQuery({
    queryKey: ['projectPozlar', selectedProje?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_pozlar')
        .select('id, wbs_node_id, code, short_desc, long_desc, project_note, unit_id, order_index')
        .eq('project_id', selectedProje.id)
        .order('wbs_node_id', { nullsFirst: true })
        .order('order_index')

      if (error) throw new Error(error.message)

      return data ?? []
    },
    enabled: !!appUser && !!selectedProje,
    retry: false,
    refetchOnMount: true,
    refetchOnWindowFocus: false
  })

}

export const useGetUserSettings = () => {

  const { appUser } = useContext(StoreContext)

  return useQuery({
    queryKey: ['userSettings', appUser?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_settings')
        .select('settings')
        .eq('user_id', appUser.id)
        .maybeSingle()

      if (error) throw new Error(error.message)

      return data?.settings ?? {}
    },
    enabled: !!appUser,
    retry: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity
  })

}

export const useGetWorkPackages = () => {

  const { appUser, selectedProje } = useContext(StoreContext)

  return useQuery({
    queryKey: ['workPackages', selectedProje?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('work_packages')
        .select('id, name, code, description, status, created_at, olusturan:users!created_by(first_name, last_name)')
        .eq('project_id', selectedProje.id)
        .order('created_at')

      if (error) throw new Error(error.message)

      return data ?? []
    },
    enabled: !!appUser && !!selectedProje,
    retry: false,
    refetchOnMount: true,
    refetchOnWindowFocus: false
  })

}

export const useGetMyWorkPackages = () => {

  const { appUser, selectedProje } = useContext(StoreContext)

  return useQuery({
    queryKey: ['myWorkPackages', selectedProje?.id, appUser?.id],
    queryFn: async () => {
      const { data: allPackages, error: pkgError } = await supabase
        .from('work_packages')
        .select('id, name, code, description, status, created_at')
        .eq('project_id', selectedProje.id)
        .eq('status', 'active')
        .order('created_at')

      if (pkgError) throw new Error(pkgError.message)
      if (!allPackages || allPackages.length === 0) return []

      const pkgIds = allPackages.map(p => p.id)

      const { data: allMemberships, error: memError } = await supabase
        .from('work_package_members')
        .select('work_package_id, user_id')
        .in('work_package_id', pkgIds)

      if (memError) throw new Error(memError.message)

      const memberships = allMemberships ?? []
      const pkgsWithAnyMember = new Set(memberships.map(m => m.work_package_id))
      const myPkgIds = new Set(
        memberships.filter(m => m.user_id === appUser.id).map(m => m.work_package_id)
      )

      return allPackages.filter(p =>
        !pkgsWithAnyMember.has(p.id) || myPkgIds.has(p.id)
      )
    },
    enabled: !!appUser && !!selectedProje,
    retry: false,
    refetchOnMount: true,
    refetchOnWindowFocus: false
  })

}
export const useGetWorkAreas = () => {

  const { appUser, selectedProje } = useContext(StoreContext)

  return useQuery({
    queryKey: ['workAreas', selectedProje?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('work_areas')
        .select('id, lbs_node_id, name, code, area, order_index')
        .eq('project_id', selectedProje.id)
        .order('lbs_node_id', { nullsFirst: true })
        .order('order_index')

      if (error) throw new Error(error.message)

      return data ?? []
    },
    enabled: !!appUser && !!selectedProje,
    retry: false,
    refetchOnMount: true,
    refetchOnWindowFocus: false
  })

}

export const useGetWorkPackagePozlar = () => {

  const { appUser, selectedProje, selectedIsPaket } = useContext(StoreContext)

  return useQuery({
    queryKey: ['workPackagePozlar', selectedIsPaket?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('work_package_pozlar')
        .select('id, project_poz_id, order_index, project_poz:project_pozlar(id, code, short_desc, wbs_node_id, unit_id, order_index)')
        .eq('work_package_id', selectedIsPaket.id)
        .order('order_index')

      if (error) throw new Error(error.message)

      return data ?? []
    },
    enabled: !!appUser && !!selectedProje && !!selectedIsPaket,
    retry: false,
    refetchOnMount: true,
    refetchOnWindowFocus: false
  })

}

export const useGetWorkPackagePozAreas = () => {

  const { appUser, selectedProje, selectedIsPaket, selectedPoz } = useContext(StoreContext)

  return useQuery({
    queryKey: ['workPackagePozAreas', selectedIsPaket?.id, selectedPoz?.id],
    queryFn: async () => {
      const { data: wppData, error: wppError } = await supabase
        .from('work_package_pozlar')
        .select('id')
        .eq('work_package_id', selectedIsPaket.id)
        .eq('project_poz_id', selectedPoz.id)
        .maybeSingle()

      if (wppError) throw new Error(wppError.message)
      if (!wppData) return []

      const { data, error } = await supabase
        .from('work_package_poz_areas')
        .select('id, work_area_id, order_index, work_area:work_areas(id, code, name, lbs_node_id, area, order_index)')
        .eq('work_package_poz_id', wppData.id)
        .order('order_index')

      if (error) throw new Error(error.message)

      return data ?? []
    },
    enabled: !!appUser && !!selectedProje && !!selectedIsPaket && !!selectedPoz,
    retry: false,
    refetchOnMount: true,
    refetchOnWindowFocus: false
  })

}

export const useGetProjeler_byFirma = () => {

  const { appUser, selectedFirma } = useContext(StoreContext)

  return useQuery({
    queryKey: ['dataProjeler', selectedFirma?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name, created_at')
        .eq('firm_id', selectedFirma.id)
        .order('name')

      if (error) throw new Error(error.message)

      return { projeler: data }
    },
    enabled: !!appUser && !!selectedFirma,
    retry: false,
    refetchOnMount: true,
    refetchOnWindowFocus: false
  })

}

