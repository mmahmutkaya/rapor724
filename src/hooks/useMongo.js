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

    const { _mahalId, _pozId, _lbsId, _wbsId, wbsCode, lbsCode, switchValue } = variables2
    let list = mahalListesi.list
    let wbsLer = mahalListesi.wbsLer

    if (switchValue) {

      // openMetraj:false şeklinde property güncellemesi yapmıyorum çünkü backendden false olanlar dönmüyor, node sayıları backend den dönen hali aynı olsun diye
      // backend ve frontend tutarlılığı için o sebeple listede olup olmadığına bakmıyorum, ekleyeceksek zaten yoktur, alt satırdaki filter onun için yoruma çevirildi
      list = list.length ? [...list, { _mahalId, _pozId, _lbsId, _wbsId, wbsCode, lbsCode, openMetraj: switchValue }] : [{ _mahalId, _pozId, _lbsId, _wbsId, wbsCode, lbsCode, openMetraj: switchValue }]
      // ilk seviye wbs'in yerleştirilmesi


      // mahallistesi.wbsLer den kontrol ederek, yukarı doğru giderek, listeden çıkarıyoruz

      // 
      let wbsCode2 = JSON.parse(JSON.stringify(wbsCode))
      let mapDurdur = false // mapDurdur true yapılırsa döngü daha da devam etmeden dursun diye

      // esasen wbsCode2 döngüsü ile 
      wbsCode.split(".").map(c => {

        if (mapDurdur) {
          return
        }

        // wbsLer boşsa herhangi bir sorgulama yapmadan yapıştır, aşağıda birdaha da boşmu diye sorgulama
        if (!wbsLer) {
          let { _id, code, name } = isProject.wbs.find(x => x.code === wbsCode2)
          wbsLer = [{ _id, code, name }]
        } else {
          // wbsLer boş olsa bu sorgu hata verecek ama yukarıda yapıldı o sorgu, burdaysak doludur

          // döngüdeki wbs mevcutsa, üst wbs'ler de mevcut demektir
          if (wbsLer.find(x => x.code == wbsCode2)) {
            mapDurdur = true
            return
          } else {
            let { _id, code, name } = isProject.wbs.find(x => x.code === wbsCode2)
            wbsLer = [...wbsLer, { _id, code, name }]
          }
        }

        // bir sonraki döngü için wbsCode2 güncelliyoruz, bir üst seviye wbs code'una dönüştürüyoruz
        if (wbsCode2.split(".").length > 1) wbsCode2 = wbsCode2.slice(0, wbsCode2.lastIndexOf("."))

      })

    }




    if (!switchValue) {

      // list den düğümü çıkartıyoruz
      list = list.filter(x => !(x._mahalId.toString() === _mahalId.toString() && x._pozId.toString() === _pozId.toString()))

      // mahallistesi.wbsLer den seviye olarak yukarı doğru giderek, kontrol ederek, listeden çıkarıyoruz 
      let wbsCode2 = JSON.parse(JSON.stringify(wbsCode))
      let mapDurdur = false // mapDurdur true yapılırsa döngü daha da devam etmeden dursun diye

      wbsCode.split(".").map((c, index) => {

        if (mapDurdur) {
          return
        }

        try {
          if (list.find(x => x.wbsCode.indexOf(wbsCode2) === 0)) {
            // bu code varsa üst kodlar da vardır döngü iptal edelim
            mapDurdur = true
            return
          } else {
            wbsLer = wbsLer.filter(x => x.code != wbsCode2)
          }
        } catch (error) {
        }

        // bir sonraki döngü için wbsCode2 güncelliyoruz, bir üst seviye wbs code'una dönüştürüyoruz, swicthValue true modundayken sonunda nokta yok, yapı farklı
        if (wbsCode2.split(".").length > 1) wbsCode2 = wbsCode2.slice(0, wbsCode2.lastIndexOf("."))

      })

    }

    mahalListesi.list = list
    mahalListesi.wbsLer = wbsLer
    return mahalListesi
  }


  return useMutation({
    mutationFn: ({ _mahalId, _pozId, _lbsId, _wbsId, wbsCode, lbsCode, switchValue }) => {
      return RealmApp?.currentUser.callFunction("collectionDugumler", ({ functionName: "toggle_openMetraj", _projectId: isProject?._id, _mahalId, _pozId, _lbsId, _wbsId, wbsCode, lbsCode }))
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

