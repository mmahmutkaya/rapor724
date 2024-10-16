import { useContext } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { StoreContext } from '../components/store'
import { useApp } from "../components/useApp"




// QUERIES

export const useGetMahaller = (onSuccess, onError) => {

  const RealmApp = useApp();
  const { isProject } = useContext(StoreContext)

  return useQuery({
    queryKey: ['mahaller', isProject?._id.toString()],
    queryFn: () => RealmApp?.currentUser.callFunction("getProjectMahaller", ({ projectId: isProject?._id })),
    enabled: !!RealmApp && !!isProject,
    onSuccess,
    onError,
    refetchOnMount: false,
    refetchOnWindowFocus: false
  })

}


export const useGetPozlar = (onSuccess, onError) => {

  const RealmApp = useApp();
  const { isProject } = useContext(StoreContext)

  return useQuery({
    queryKey: ['pozlar', isProject?._id.toString()],
    queryFn: () => RealmApp?.currentUser.callFunction("getProjectPozlar", ({ projectId: isProject?._id })),
    enabled: !!RealmApp && !!isProject,
    onSuccess,
    onError,
    refetchOnMount: false,
    refetchOnWindowFocus: false
  })

}


export const useGetMahalListesi = () => {

  const RealmApp = useApp();
  const { isProject } = useContext(StoreContext)

  return useQuery({
    queryKey: ['mahalListesi', isProject?._id.toString()],
    queryFn: () => RealmApp?.currentUser.callFunction("collectionDugumler", ({ functionName: "getMahalListesi", _projectId: isProject?._id })),
    enabled: !!RealmApp && !!isProject,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    // select: (data) => data.mahalListesi,
  })

}




export const useGetDugumMetraj = ({ selectedNode }) => {

  const RealmApp = useApp();
  const { isProject } = useContext(StoreContext)

  return useQuery({
    queryKey: ['dugumMetraj', selectedNode?._id.toString()],
    queryFn: () => RealmApp?.currentUser.callFunction("collectionDugumler", ({ functionName: "getDugumMetraj", _projectId: isProject?._id, _mahalId: selectedNode?._mahalId, _pozId: selectedNode?._pozId })),
    enabled: !!RealmApp && !!isProject && !!selectedNode,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
    select: (data) => data[0]
  })

}






// MUTATIONS


export const useToggleOpenMetrajDugum = () => {

  const RealmApp = useApp();
  const queryClient = useQueryClient()
  const { isProject } = useContext(StoreContext)

  const mahalListesi_optimisticUpdate = (mahalListesi, variables2) => {

    const { _mahalId, _pozId, _lbsId, _wbsId, switchValue } = variables2

    // önce listeden çıkarıyoruz sonra yeni değeri ile ekliyoruz
    mahalListesi.list = mahalListesi.filter(x => !(x._mahalId.toString() === _mahalId.toString() && x._pozId.toString() === _pozId.toString()))
    mahalListesi.list = mahalListesi.list.length ? [...mahalListesi.list, { _mahalId, _pozId, _lbsId, _wbsId, openMetraj: switchValue }] : [{ _mahalId, _pozId, _lbsId, _wbsId, openMetraj: switchValue }]


    if (switchValue) {

      // ilk seviye wbsLer'in yerleştirilmesi
      let code2 = ""
      if (!wbsLer) {
        let { _id, code, name } = project.wbs.find(x => x._id.toString() === oneNode._wbsId.toString())
        wbsLer = [{ _id, code, name }]
        code2 = code
      } else {
        if (!wbsLer.find(y => y._id.toString() == oneNode._wbsId.toString())) {
          let { _id, code, name } = project.wbs.find(x => x._id.toString() === oneNode._wbsId.toString())
          wbsLer = [...wbsLer, { _id, code, name }]
          code2 = code
        }
      }

      // varsa üst seviye wbs leri de eklemeye çalışıyoruz
      let codeArray = code2.split(".")
      if (codeArray.length > 1) {
        let initialCode = ""
        codeArray.map(oneCode => {
          initialCode = initialCode.length ? initialCode + "." + oneCode : oneCode
          if (!wbsLer.find(x => x.code == initialCode)) {
            let { _id, code, name } = project.wbs.find(x => x.code === initialCode)
            wbsLer = [...wbsLer, { _id, code, name }]
          }
        })
      }

    }

    // if (!switchValue) {
    //   mahalListesi.list = mahalListesi.list.filter(item => !(item._mahalId.toString() == _mahalId.toString() && item._pozId.toString() == _pozId.toString()))
    //   if (!mahalListesi.list.find(x => x._wbsId.toString() == _wbsId.toString())) {
    //     mahalListesi._wbsIds = mahalListesi._wbsIds.filter(x => x.toString() !== _wbsId.toString())
    //   }
    //   if (!mahalListesi.list.find(x => x._lbsId.toString() == _lbsId.toString())) {
    //     mahalListesi._lbsIds = mahalListesi._lbsIds.filter(x => x.toString() !== _lbsId.toString())
    //   }
    // }

    return mahalListesi
  }


  return useMutation({
    mutationFn: ({ _mahalId, _pozId, _lbsId, _wbsId, switchValue }) => {
      return RealmApp?.currentUser.callFunction("collectionDugumler", ({ functionName: "toggle_openMetraj", _projectId: isProject?._id, _mahalId, _pozId, _lbsId, _wbsId }))
    },
    // onSuccess: () => queryClient.invalidateQueries({ queryKey: ['mahalListesi', isProject?._id.toString()] })
    onSuccess: (returnData, variables2) => queryClient.setQueryData(['mahalListesi', isProject?._id.toString()], (mahallistesi) => mahalListesi_optimisticUpdate(mahallistesi, variables2))
  })

}



export const useUpdateUserMetraj = (onSuccess, onError) => {

  const RealmApp = useApp();
  const queryClient = useQueryClient()
  const { isProject } = useContext(StoreContext)

  const userMetraj_optimisticUpdate = (nodeArray_MET, variables2) => {

    const { userMetraj_state, setUserMetraj_state } = variables2
    let nodeArray_MET2 = [...nodeArray_MET]
    let isUpdated
    if (nodeArray_MET2 && nodeArray_MET2[0].hazirlananMetrajlar.length > 0) {
      nodeArray_MET2[0].hazirlananMetrajlar = nodeArray_MET2[0].hazirlananMetrajlar.map(oneMetraj => {
        if (oneMetraj._userId.toString() == RealmApp?.currentUser.id) {
          isUpdated = true
          return userMetraj_state
        } else {
          return oneMetraj
        }
      })
      // hazirlanan metrajlar içinde bu kullanıcı metrajı henüz yoksa
      if (!isUpdated) nodeArray_MET2[0].hazirlananMetrajlar = [...nodeArray_MET2[0].hazirlananMetrajlar, userMetraj_state]
      return nodeArray_MET2

    } else {

      nodeArray_MET2 = [{ hazirlananMetrajlar: [userMetraj_state] }]
      setUserMetraj_state()
      return nodeArray_MET2
    }

  }

  return useMutation({
    mutationFn: ({ payload, selectedNode, userMetraj_state, setUserMetraj_state }) => {
      return RealmApp?.currentUser.callFunction("collectionDugumler", ({ functionName: "updateUserMetraj", propertyValue: payload, _projectId: isProject?._id, _mahalId: selectedNode?._mahalId, _pozId: selectedNode?._pozId }))
    },
    // onSuccess: () => queryClient.invalidateQueries({ queryKey: ['mahalListesi', isProject?._id.toString()] })
    onSuccess: (returnData, variables2) => queryClient.setQueryData(['dugumMetraj', variables2.selectedNode?._id.toString()], (nodeArray_MET) => userMetraj_optimisticUpdate(nodeArray_MET, variables2))
  })

}

