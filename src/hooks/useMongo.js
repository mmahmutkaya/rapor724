import { useContext } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { StoreContext } from '../components/store'
import { useNavigate } from "react-router-dom";
import _ from 'lodash';
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

export const useGetFirmaPozlar = (onSuccess, onError) => {

  const { RealmApp, selectedFirma } = useContext(StoreContext)

  return useQuery({
    queryKey: ['firmaPozlar'],
    queryFn: () => RealmApp?.currentUser.callFunction("getFirmaPozlar", ({ _firmaId: selectedFirma?._id })),
    enabled: !!RealmApp && !!selectedFirma,
    onSuccess,
    onError,
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

export const useGetPozlar = () => {

  const navigate = useNavigate()
  const { appUser, setAppUser, selectedProje, setSelectedProje, selectedBirimFiyatVersiyon, setSelectedBirimFiyatVersiyon, selectedMetrajVersiyon, setSelectedMetrajVersiyon, selectedIsPaket, selectedIsPaketVersiyon } = useContext(StoreContext)

  return useQuery({
    queryKey: ['dataPozlar', selectedIsPaket?._id ?? null],
    queryFn: async () => {
      const headers = {
          email: appUser.email,
          token: appUser.token,
          projeid: selectedProje?._id,
          selectedBirimFiyatVersiyonNumber: selectedBirimFiyatVersiyon ? selectedBirimFiyatVersiyon?.versiyonNumber : null,
          selectedMetrajVersiyonNumber: selectedMetrajVersiyon ? selectedMetrajVersiyon?.versiyonNumber : null,
          'Content-Type': 'application/json'
      }
      if (selectedIsPaket?._id) {
        headers.ispaketid = selectedIsPaket._id
        headers.ispaketversiyonnumber = selectedIsPaketVersiyon?.versiyonNumber
      }

      const response = await fetch(process.env.REACT_APP_BASE_URL + '/api/pozlar', {
        method: 'GET',
        headers
      })

      const responseJson = await response.json()

      if (responseJson.error) {
        if (responseJson.error.includes("expired")) {
          setAppUser()
          localStorage.removeItem('appUser')
          navigate('/')
          window.location.reload()
        }
        throw new Error(responseJson.error);
      }

      setSelectedBirimFiyatVersiyon(responseJson.selectedBirimFiyatVersiyon)
      setSelectedMetrajVersiyon(responseJson.selectedMetrajVersiyon)

      let proje2 = _.cloneDeep(selectedProje)
      proje2.paraBirimleri = responseJson.paraBirimleri
      proje2.birimFiyatVersiyonlar = responseJson.birimFiyatVersiyonlar
      proje2.metrajVersiyonlar = responseJson.metrajVersiyonlar
      proje2.birimFiyatVersiyon_isProgress = responseJson.birimFiyatVersiyon_isProgress
      proje2.anyVersiyonZero = responseJson.anyVersiyonZero
      setSelectedProje(proje2)

      return responseJson

    },
    enabled: !!appUser && !!selectedProje,
    refetchOnMount: true,
    refetchOnWindowFocus: false
  })

}

export const useGetIsPaketPozlar = () => {

  const navigate = useNavigate()
  const { appUser, setAppUser, selectedProje, selectedIsPaketVersiyon, mode_isPaketEdit } = useContext(StoreContext)

  return useQuery({
    queryKey: ['dataIsPaketPozlar', mode_isPaketEdit ? 'edit' : selectedIsPaketVersiyon?.versiyonNumber],
    queryFn: async () => {
      const headers = {
        email: appUser.email,
        token: appUser.token,
        projeid: selectedProje?._id,
        'Content-Type': 'application/json'
      }
      if (!mode_isPaketEdit && selectedIsPaketVersiyon?.versiyonNumber !== undefined) {
        headers['ispaketversiyonnumber'] = selectedIsPaketVersiyon.versiyonNumber
      }
      const response = await fetch(process.env.REACT_APP_BASE_URL + '/api/pozlar/ispaketpozlar', {
        method: 'GET',
        headers
      })

      const responseJson = await response.json()

      if (responseJson.error) {
        if (responseJson.error.includes("expired")) {
          setAppUser()
          localStorage.removeItem('appUser')
          navigate('/')
          window.location.reload()
        }
        throw new Error(responseJson.error)
      }

      return responseJson
    },
    enabled: !!appUser && !!selectedProje,
    refetchOnMount: true,
    refetchOnWindowFocus: false
  })

}

export const useGetMahaller = () => {

  const navigate = useNavigate()
  const { appUser, setAppUser, selectedProje } = useContext(StoreContext)

  return useQuery({
    queryKey: ['dataMahaller'],
    queryFn: async () => {
      const response = await fetch(process.env.REACT_APP_BASE_URL + '/api/mahaller', {
        method: 'GET',
        headers: {
          email: appUser.email,
          token: appUser.token,
          projeid: selectedProje._id,
          'Content-Type': 'application/json'
        }
      })

      const responseJson = await response.json()

      if (responseJson.error) {
        if (responseJson.error.includes("expired")) {
          setAppUser()
          localStorage.removeItem('appUser')
          navigate('/')
          window.location.reload()
        }
        throw new Error(responseJson.error);
      }

      return responseJson

    },
    enabled: !!appUser,
    refetchOnMount: true,
    refetchOnWindowFocus: false
  })

}

export const useGetMahalListesi_pozlar = () => {

  const navigate = useNavigate()
  const { appUser, setAppUser, selectedProje } = useContext(StoreContext)

  return useQuery({
    queryKey: ['dataMahallistesi_pozlar'],
    queryFn: async () => {
      const response = await fetch(process.env.REACT_APP_BASE_URL + '/api/dugumler/pozlar', {
        method: 'GET',
        headers: {
          email: appUser.email,
          token: appUser.token,
          projeid: selectedProje._id,
          'Content-Type': 'application/json'
        }
      })

      const responseJson = await response.json()

      if (responseJson.error) {
        if (responseJson.error.includes("expired")) {
          setAppUser()
          localStorage.removeItem('appUser')
          navigate('/')
          window.location.reload()
        }
        throw new Error(responseJson.error);
      }

      return responseJson

    },
    enabled: !!appUser,
    refetchOnMount: true,
    refetchOnWindowFocus: false
  })

}

export const useGetMahalListesi_mahaller_byPoz = () => {

  const navigate = useNavigate()
  const { appUser, setAppUser, selectedProje, selectedPoz_mahalListesi } = useContext(StoreContext)

  return useQuery({
    queryKey: ['dataMahalListesi_mahaller_byPoz'],
    queryFn: async () => {
      const response = await fetch(process.env.REACT_APP_BASE_URL + '/api/dugumler/mahallerbypoz', {
        method: 'GET',
        headers: {
          email: appUser.email,
          token: appUser.token,
          projeid: selectedProje._id,
          pozid: selectedPoz_mahalListesi._id,
          'Content-Type': 'application/json'
        }
      })

      const responseJson = await response.json()

      if (responseJson.error) {
        if (responseJson.error.includes("expired")) {
          setAppUser()
          localStorage.removeItem('appUser')
          navigate('/')
          window.location.reload()
        }
        throw new Error(responseJson.error);
      }

      return responseJson

    },
    enabled: !!appUser,
    refetchOnMount: true,
    refetchOnWindowFocus: false
  })

}

export const useGetMahalListesi_byPoz = () => {

  const { selectedProje, RealmApp, selectedPoz_forMahalListesi } = useContext(StoreContext)

  return useQuery({
    queryKey: ['dataMahalListesi_byPoz2'],
    queryFn: () => RealmApp?.currentUser.callFunction("getMahalListesi_byPoz", ({ _projeId: selectedProje?._id, _pozId: selectedPoz_forMahalListesi._id })),
    enabled: !!RealmApp && !!selectedProje && !!selectedPoz_forMahalListesi,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  })

}

export const useGetDugumler = () => {

  const { selectedProje, RealmApp } = useContext(StoreContext)

  return useQuery({
    queryKey: ['dugumler'],
    queryFn: () => RealmApp?.currentUser.callFunction("getDugumler", ({ _projeId: selectedProje?._id })),
    enabled: !!RealmApp && !!selectedProje,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  })

}

export const useGetDugumler_byPoz = () => {

  const navigate = useNavigate()
  const { appUser, setAppUser, selectedProje, selectedPoz, selectedMetrajVersiyon, mode_isPaketEdit, selectedIsPaketVersiyon } = useContext(StoreContext)

  return useQuery({
    queryKey: ['dataDugumler_byPoz', mode_isPaketEdit ? 'edit' : selectedIsPaketVersiyon?.versiyonNumber, selectedMetrajVersiyon?.versiyonNumber ?? 0],
    queryFn: async () => {
      const headers = {
        email: appUser.email,
        token: appUser.token,
        projeid: selectedProje._id,
        pozid: selectedPoz._id,
        selectedmetrajversiyontext: selectedMetrajVersiyon?.versiyonNumber ?? 0,
        'Content-Type': 'application/json'
      }
      if (!mode_isPaketEdit && selectedIsPaketVersiyon?.versiyonNumber !== undefined) {
        headers.ispaketversiyonnumber = selectedIsPaketVersiyon.versiyonNumber
      }
      const response = await fetch(process.env.REACT_APP_BASE_URL + '/api/dugumler/bypoz', {
        method: 'GET',
        headers
      })

      const responseJson = await response.json()

      if (responseJson.error) {
        if (responseJson.error.includes("expired")) {
          setAppUser()
          localStorage.removeItem('appUser')
          navigate('/')
          window.location.reload()
        }
        throw new Error(responseJson.error);
      }

      return responseJson

    },
    enabled: !!appUser,
    refetchOnMount: true,
    refetchOnWindowFocus: false
  })

}

export const useGetMahalListesi = () => {

  const { selectedProje, RealmApp } = useContext(StoreContext)

  return useQuery({
    queryKey: ['mahalListesi'],
    queryFn: () => RealmApp?.currentUser.callFunction("collectionDugumler", ({ functionNames: "getMahalListesi", _projeId: selectedProje?._id })),
    enabled: !!RealmApp && !!selectedProje,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  })

}

export const useGetHazirlananMetraj = () => {

  const navigate = useNavigate()
  const { appUser, setAppUser, selectedNode } = useContext(StoreContext)

  return useQuery({
    queryKey: ['dataHazirlananMetraj'],
    queryFn: async () => {
      const response = await fetch(process.env.REACT_APP_BASE_URL + '/api/dugumler/hazirlananmetraj', {
        method: 'GET',
        headers: {
          email: appUser.email,
          token: appUser.token,
          dugumid: selectedNode._id,
          'Content-Type': 'application/json'
        }
      })

      const responseJson = await response.json()

      if (responseJson.error) {
        if (responseJson.error.includes("expired")) {
          setAppUser()
          localStorage.removeItem('appUser')
          navigate('/')
          window.location.reload()
        }
        throw new Error(responseJson.error);
      }

      return responseJson

    },
    enabled: !!appUser,
    refetchOnMount: true,
    refetchOnWindowFocus: false
  })

}

export const useGetHazirlananMetrajlar = () => {

  const navigate = useNavigate()
  const { appUser, setAppUser, selectedNode } = useContext(StoreContext)

  return useQuery({
    queryKey: ['dataHazirlananMetrajlar'],
    queryFn: async () => {
      const response = await fetch(process.env.REACT_APP_BASE_URL + '/api/dugumler/hazirlananmetrajlar', {
        method: 'GET',
        headers: {
          email: appUser.email,
          token: appUser.token,
          dugumid: selectedNode._id,
          'Content-Type': 'application/json'
        }
      })

      const responseJson = await response.json()

      if (responseJson.error) {
        if (responseJson.error.includes("expired")) {
          setAppUser()
          localStorage.removeItem('appUser')
          navigate('/')
          window.location.reload()
        }
        throw new Error(responseJson.error);
      }

      return responseJson

    },
    enabled: !!appUser,
    refetchOnMount: true,
    refetchOnWindowFocus: false
  })

}

export const useGetOnaylananMetraj = () => {

  const navigate = useNavigate()
  const { appUser, setAppUser, selectedNode } = useContext(StoreContext)

  return useQuery({
    queryKey: ['dataOnaylananMetraj'],
    queryFn: async () => {
      const response = await fetch(process.env.REACT_APP_BASE_URL + '/api/dugumler/onaylananmetraj', {
        method: 'GET',
        headers: {
          email: appUser.email,
          token: appUser.token,
          dugumid: selectedNode._id,
          'Content-Type': 'application/json'
        }
      })

      const responseJson = await response.json()

      if (responseJson.error) {
        if (responseJson.error.includes("expired")) {
          setAppUser()
          localStorage.removeItem('appUser')
          navigate('/')
          window.location.reload()
        }
        throw new Error(responseJson.error);
      }

      return responseJson

    },
    enabled: !!appUser,
    refetchOnMount: true,
    refetchOnWindowFocus: false
  })

}

export const useGetNetworkUsers = (onSuccess, onError) => {

  const { RealmApp } = useContext(StoreContext)

  return useQuery({
    queryKey: ['networkUsers', RealmApp.currentUser._profile.data.email],
    queryFn: () => RealmApp?.currentUser.callFunction("collectionNetworkUser", ({ functionName: "getNetworkUsers" })),
    enabled: !!RealmApp,
    onSuccess,
    onError,
    refetchOnMount: true,
    refetchOnWindowFocus: false
  })

}

export const useGetProjectNames_firma = () => {

  const { RealmApp, selectedFirma } = useContext(StoreContext)
  let _firmaId = selectedFirma?._id

  return useQuery({
    queryKey: ['projectNames_firma', _firmaId?.toString()],
    queryFn: () => RealmApp?.currentUser.callFunction("collection_projects", { functionName: "getProjectNames_firma", _firmaId }),
    enabled: !!RealmApp && !!_firmaId,
    refetchOnMount: true,
    refetchOnWindowFocus: false
  })

}
