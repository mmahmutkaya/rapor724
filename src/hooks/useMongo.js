import { useContext } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { StoreContext } from '../components/store'
import { useApp } from "../components/useApp"




// QUERIES


// MONGO FONKSİYON - getFirmalarNames
export const useGetFirmalarNames_byUser = (onSuccess, onError) => {

  // const RealmApp = useApp();
  const { RealmApp } = useContext(StoreContext)

  return useQuery({
    queryKey: ['firmalarNames_byUser', RealmApp.currentUser._profile.data.email],
    queryFn: () => RealmApp?.currentUser.callFunction("getFirmalarNames_byUser"),
    enabled: !!RealmApp,
    onSuccess,
    onError,
    refetchOnMount: false,
    refetchOnWindowFocus: false
  })

}


export const useGetFirmaPozlar = (onSuccess, onError) => {

  // const RealmApp = useApp();
  const { RealmApp, selectedFirma } = useContext(StoreContext)

  return useQuery({
    queryKey: ['firmaPozlar', selectedFirma?._id.toString()],
    queryFn: () => RealmApp?.currentUser.callFunction("getFirmaPozlar", ({ _firmaId: selectedFirma?._id })),
    enabled: !!RealmApp && !!selectedFirma,
    onSuccess,
    onError,
    refetchOnMount: false,
    refetchOnWindowFocus: false
  })

}



export const useGetPozlar = (onSuccess, onError) => {

  // const RealmApp = useApp();
  const { RealmApp, selectedProje } = useContext(StoreContext)

  return useQuery({
    queryKey: ['pozlar', selectedProje?._id.toString()],
    queryFn: () => RealmApp?.currentUser.callFunction("getPozlar", ({ _projeId: selectedProje?._id })),
    enabled: !!RealmApp && !!selectedProje,
    onSuccess,
    onError,
    refetchOnMount: false,
    refetchOnWindowFocus: false
  })

}



export const useGetMahaller = (onSuccess, onError) => {

  // const RealmApp = useApp();
  const { RealmApp, selectedProje } = useContext(StoreContext)

  return useQuery({
    queryKey: ['mahaller', selectedProje?._id.toString()],
    queryFn: () => RealmApp?.currentUser.callFunction("getMahaller", ({ _projeId: selectedProje?._id })),
    enabled: !!RealmApp && !!selectedProje,
    onSuccess,
    onError,
    refetchOnMount: false,
    refetchOnWindowFocus: false
  })

}





// MONGO FONKSİYON - getProjelerNames_byFirma
export const useGetProjelerNames_byFirma = (onSuccess, onError) => {

  // const RealmApp = useApp();
  const { RealmApp, selectedFirma } = useContext(StoreContext)

  return useQuery({
    queryKey: ['projelerNames_byFirma', selectedFirma?._id.toString()],
    queryFn: () => RealmApp?.currentUser.callFunction("getProjelerNames_byFirma", { _firmaId: selectedFirma._id }),
    enabled: !!RealmApp,
    onSuccess,
    onError,
    refetchOnMount: false,
    refetchOnWindowFocus: false
  })

}





export const useGetNetworkUsers = (onSuccess, onError) => {

  // const RealmApp = useApp();
  const { RealmApp } = useContext(StoreContext)

  return useQuery({
    queryKey: ['networkUsers', RealmApp.currentUser._profile.data.email],
    queryFn: () => RealmApp?.currentUser.callFunction("collectionNetworkUser", ({ functionName: "getNetworkUsers" })),
    enabled: !!RealmApp,
    onSuccess,
    onError,
    refetchOnMount: false,
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
    // onSuccess,
    // onError,
    refetchOnMount: false,
    refetchOnWindowFocus: false
  })

}




export const useGetMahalListesi = () => {

  // const RealmApp = useApp();
  const { selectedProje, RealmApp } = useContext(StoreContext)

  return useQuery({
    queryKey: ['mahalListesi', selectedProje?._id.toString()],
    queryFn: () => RealmApp?.currentUser.callFunction("collectionDugumler", ({ functionName: "getMahalListesi", _projectId: selectedProje?._id })),
    enabled: !!RealmApp && !!selectedProje,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    // select: (data) => data.mahalListesi,
  })

}





export const useGetHazirlananMetrajlar = ({ selectedNode }) => {

  // const RealmApp = useApp();
  const { selectedProje, RealmApp } = useContext(StoreContext)

  return useQuery({
    queryKey: ['hazirlananMetrajlar', selectedNode?._id.toString()],
    queryFn: () => RealmApp?.currentUser.callFunction("collectionDugumler", ({ functionName: "getHazirlananMetrajlar", _projectId: selectedProje?._id, _mahalId: selectedNode?._mahalId, _pozId: selectedNode?._pozId })),
    enabled: !!RealmApp && !!selectedProje && !!selectedNode,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  })

}



export const useGetOnaylananMetraj = ({ selectedNode }) => {

  // const RealmApp = useApp();
  const { selectedProje, RealmApp } = useContext(StoreContext)

  return useQuery({
    queryKey: ['onaylananMetraj', selectedNode?._id.toString()],
    queryFn: () => RealmApp?.currentUser.callFunction("collectionDugumler", ({ functionName: "getOnaylananMetraj", _projectId: selectedProje?._id, _mahalId: selectedNode?._mahalId, _pozId: selectedNode?._pozId })),
    enabled: !!RealmApp && !!selectedProje && !!selectedNode,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  })

}






export const useGetPozlarMetraj = () => {

  // const RealmApp = useApp();
  const { selectedProje, RealmApp } = useContext(StoreContext)

  return useQuery({
    queryKey: ['pozlarMetraj', selectedProje?._id.toString()],
    queryFn: () => RealmApp?.currentUser.callFunction("collectionDugumler", ({ functionName: "getPozlarMetraj", _projectId: selectedProje?._id })),
    enabled: !!RealmApp && !!selectedProje,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
    // select: (data) => data[0]
  })

}






// MUTATIONS


// export const useToggleOpenMetrajDugum = () => {

//   // const RealmApp = useApp();
//   const queryClient = useQueryClient()
//   const { selectedProje,  RealmApp} = useContext(StoreContext)

//   const mahalListesi_optimisticUpdate = (mahalListesi, variables2) => {

//     const { _mahalId, _pozId, _lbsId, _wbsId, wbsCode, lbsCode, switchValue } = variables2
//     let list = mahalListesi.list
//     let wbsLer = mahalListesi.wbsLer

//     if (switchValue) {

//       // openMetraj:false şeklinde property güncellemesi yapmıyorum çünkü backendden false olanlar dönmüyor, node sayıları backend den dönen hali aynı olsun diye
//       // backend ve frontend tutarlılığı için o sebeple listede olup olmadığına bakmıyorum, ekleyeceksek zaten yoktur, alt satırdaki filter onun için yoruma çevirildi
//       list = list.length ? [...list, { _mahalId, _pozId, _lbsId, _wbsId, wbsCode, lbsCode, openMetraj: switchValue }] : [{ _mahalId, _pozId, _lbsId, _wbsId, wbsCode, lbsCode, openMetraj: switchValue }]
//       // ilk seviye wbs'in yerleştirilmesi


//       // mahallistesi.wbsLer den kontrol ederek, yukarı doğru giderek, listeden çıkarıyoruz

//       // 
//       let wbsCode2 = JSON.parse(JSON.stringify(wbsCode))
//       let mapDurdur = false // mapDurdur true yapılırsa döngü daha da devam etmeden dursun diye

//       // esasen wbsCode2 döngüsü ile 
//       wbsCode.split(".").map(c => {

//         if (mapDurdur) {
//           return
//         }

//         // wbsLer boşsa herhangi bir sorgulama yapmadan yapıştır, aşağıda birdaha da boşmu diye sorgulama
//         if (!wbsLer) {
//           let { _id, code, name } = selectedProje.wbs.find(x => x.code === wbsCode2)
//           wbsLer = [{ _id, code, name }]
//         } else {
//           // wbsLer boş olsa bu sorgu hata verecek ama yukarıda yapıldı o sorgu, burdaysak doludur

//           // döngüdeki wbs mevcutsa, üst wbs'ler de mevcut demektir
//           if (wbsLer.find(x => x.code == wbsCode2)) {
//             mapDurdur = true
//             return
//           } else {
//             let { _id, code, name } = selectedProje.wbs.find(x => x.code === wbsCode2)
//             wbsLer = [...wbsLer, { _id, code, name }]
//           }
//         }

//         // bir sonraki döngü için wbsCode2 güncelliyoruz, bir üst seviye wbs code'una dönüştürüyoruz
//         if (wbsCode2.split(".").length > 1) wbsCode2 = wbsCode2.slice(0, wbsCode2.lastIndexOf("."))

//       })

//     }




//     if (!switchValue) {

//       // list den düğümü çıkartıyoruz
//       list = list.filter(x => !(x._mahalId.toString() === _mahalId.toString() && x._pozId.toString() === _pozId.toString()))

//       // mahallistesi.wbsLer den seviye olarak yukarı doğru giderek, kontrol ederek, listeden çıkarıyoruz 
//       let wbsCode2 = JSON.parse(JSON.stringify(wbsCode))
//       let mapDurdur = false // mapDurdur true yapılırsa döngü daha da devam etmeden dursun diye

//       wbsCode.split(".").map((c, index) => {

//         if (mapDurdur) {
//           return
//         }

//         try {
//           if (list.find(x => x.wbsCode.indexOf(wbsCode2) === 0)) {
//             // bu code varsa üst kodlar da vardır döngü iptal edelim
//             mapDurdur = true
//             return
//           } else {
//             wbsLer = wbsLer.filter(x => x.code != wbsCode2)
//           }
//         } catch (error) {
//         }

//         // bir sonraki döngü için wbsCode2 güncelliyoruz, bir üst seviye wbs code'una dönüştürüyoruz, swicthValue true modundayken sonunda nokta yok, yapı farklı
//         if (wbsCode2.split(".").length > 1) wbsCode2 = wbsCode2.slice(0, wbsCode2.lastIndexOf("."))

//       })

//     }

//     mahalListesi.list = list
//     mahalListesi.wbsLer = wbsLer
//     return mahalListesi
//   }


//   return useMutation({
//     mutationFn: ({ _mahalId, _pozId, _lbsId, _wbsId, wbsCode, lbsCode, switchValue }) => {
//       return RealmApp?.currentUser.callFunction("collectionDugumler", ({ functionName: "toggle_openMetraj", _projectId: selectedProje?._id, _mahalId, _pozId, _lbsId, _wbsId, wbsCode, lbsCode }))
//     },
//     // onSuccess: () => queryClient.invalidateQueries({ queryKey: ['mahalListesi', selectedProje?._id.toString()] })
//     onSuccess: (returnData, variables2) => queryClient.setQueryData(['mahalListesi', selectedProje?._id.toString()], (mahallistesi) => mahalListesi_optimisticUpdate(mahallistesi, variables2))
//   })

// }


export const useToggleOpenMetrajDugum = () => {

  // const RealmApp = useApp();
  const queryClient = useQueryClient()
  const { selectedProje, RealmApp } = useContext(StoreContext)


  // const mahalListesi_optimisticUpdate = (mahalListesi, variables2) => {

  //   const { _mahalId, _pozId, switchValue } = variables2
  //   let list = mahalListesi.list


  //   if (switchValue) {

  //     // openMetraj:false şeklinde property güncellemesi yapmıyorum çünkü backendden false olanlar dönmüyor, node sayıları backend den dönen hali aynı olsun diye
  //     // backend ve frontend tutarlılığı için o sebeple listede olup olmadığına bakmıyorum, ekleyeceksek zaten yoktur, alt satırdaki filter onun için yoruma çevirildi
  //     list = list.length ? [...list, { _mahalId, _pozId, openMetraj: switchValue }] : [{ _mahalId, _pozId, openMetraj: switchValue }]
  //     // ilk seviye wbs'in yerleştirilmesi


  //     // mahallistesi.wbsLer den kontrol ederek, yukarı doğru giderek, listeden çıkarıyoruz

  //     // 
  //     // let wbsCode2 = JSON.parse(JSON.stringify(wbsCode))
  //     // let mapDurdur = false // mapDurdur true yapılırsa döngü daha da devam etmeden dursun diye

  //     // esasen wbsCode2 döngüsü ile 
  //     // wbsCode.split(".").map(c => {

  //     //   if (mapDurdur) {
  //     //     return
  //     //   }

  //     //   // wbsLer boşsa herhangi bir sorgulama yapmadan yapıştır, aşağıda birdaha da boşmu diye sorgulama
  //     //   if (!wbsLer) {
  //     //     let { _id, code, name } = selectedProje.wbs.find(x => x.code === wbsCode2)
  //     //     wbsLer = [{ _id, code, name }]
  //     //   } else {
  //     //     // wbsLer boş olsa bu sorgu hata verecek ama yukarıda yapıldı o sorgu, burdaysak doludur

  //     //     // döngüdeki wbs mevcutsa, üst wbs'ler de mevcut demektir
  //     //     if (wbsLer.find(x => x.code == wbsCode2)) {
  //     //       mapDurdur = true
  //     //       return
  //     //     } else {
  //     //       let { _id, code, name } = selectedProje.wbs.find(x => x.code === wbsCode2)
  //     //       wbsLer = [...wbsLer, { _id, code, name }]
  //     //     }
  //     //   }

  //     //   // bir sonraki döngü için wbsCode2 güncelliyoruz, bir üst seviye wbs code'una dönüştürüyoruz
  //     //   if (wbsCode2.split(".").length > 1) wbsCode2 = wbsCode2.slice(0, wbsCode2.lastIndexOf("."))

  //     // })

  //   }




  //   // if (!switchValue) {

  //   //   // list den düğümü çıkartıyoruz
  //   //   list = list.filter(x => !(x._mahalId.toString() === _mahalId.toString() && x._pozId.toString() === _pozId.toString()))

  //   //   // mahallistesi.wbsLer den seviye olarak yukarı doğru giderek, kontrol ederek, listeden çıkarıyoruz 
  //   //   let wbsCode2 = JSON.parse(JSON.stringify(wbsCode))
  //   //   let mapDurdur = false // mapDurdur true yapılırsa döngü daha da devam etmeden dursun diye

  //   //   wbsCode.split(".").map((c, index) => {

  //   //     if (mapDurdur) {
  //   //       return
  //   //     }

  //   //     try {
  //   //       if (list.find(x => x.wbsCode.indexOf(wbsCode2) === 0)) {
  //   //         // bu code varsa üst kodlar da vardır döngü iptal edelim
  //   //         mapDurdur = true
  //   //         return
  //   //       } else {
  //   //         wbsLer = wbsLer.filter(x => x.code != wbsCode2)
  //   //       }
  //   //     } catch (error) {
  //   //     }

  //   //     // bir sonraki döngü için wbsCode2 güncelliyoruz, bir üst seviye wbs code'una dönüştürüyoruz, swicthValue true modundayken sonunda nokta yok, yapı farklı
  //   //     if (wbsCode2.split(".").length > 1) wbsCode2 = wbsCode2.slice(0, wbsCode2.lastIndexOf("."))

  //   //   })

  //   // }

  //   // mahalListesi.list = list
  //   // mahalListesi.wbsLer = wbsLer
  //   // return mahalListesi
  // }


  return useMutation({
    mutationFn: ({ _mahalId, _pozId, switchValue }) => {
      return RealmApp?.currentUser.callFunction("collectionDugumler", ({ functionName: "toggle_openMetraj", _projectId: selectedProje?._id, _mahalId, _pozId, switchValue }))
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['mahalListesi', selectedProje?._id.toString()] })
    // onSuccess: (returnData, variables2) => queryClient.setQueryData(['mahalListesi', selectedProje?._id.toString()], (mahallistesi) => mahalListesi_optimisticUpdate(mahallistesi, variables2))
  })

}





export const useUpdateHazirlananMetrajShort = () => {

  // const RealmApp = useApp();
  const queryClient = useQueryClient()
  const { selectedProje, RealmApp } = useContext(StoreContext)

  const mahalListesi_optimisticUpdate = (mahalListesi, variables) => {

    const { _mahalId, _pozId, metraj, switchValue } = variables
    let list = mahalListesi.list

    list = list.map(x => {
      if (x._mahalId.toString() == _mahalId.toString() && x._pozId.toString() == _pozId.toString()) {
        x.metraj = metraj
      }
      return x
    })

    mahalListesi.list = list
    return mahalListesi
  }


  return useMutation({
    mutationFn: (mahalMetrajlar) => {
      return RealmApp?.currentUser.callFunction("collectionDugumler", ({ functionName: "updateMahalMetraj", _projectId: selectedProje?._id, mahalMetrajlar }))
    },
    // onSuccess: () => queryClient.invalidateQueries({ queryKey: ["hazirlananMetraj"] })
    // onSuccess: (returnData, variables) => queryClient.setQueryData(['mahalListesi', selectedProje?._id.toString()], (mahallistesi) => mahalListesi_optimisticUpdate(mahallistesi, variables))
  })

}






export const useUpdateHazirlananMetraj = () => {

  // const RealmApp = useApp();
  const queryClient = useQueryClient()
  const { selectedProje, RealmApp } = useContext(StoreContext)

  const optimisticUpdate = (hazirlananMetrajlar, variables) => {

    const { hazirlananMetraj_state } = variables

    hazirlananMetrajlar = hazirlananMetrajlar.filter(x => x._userId.toString() !== hazirlananMetraj_state._userId.toString())

    hazirlananMetrajlar = [...hazirlananMetrajlar, hazirlananMetraj_state]

    return hazirlananMetrajlar

  }

  return useMutation({
    mutationFn: ({ selectedNode, hazirlananMetraj_state, setHazirlananMetraj_state }) => {
      return RealmApp?.currentUser.callFunction("collectionDugumler", ({ functionName: "updateHazirlananMetraj", hazirlananMetraj_state, _projectId: selectedProje?._id, _mahalId: selectedNode?._mahalId, _pozId: selectedNode?._pozId }))
    },
    onSuccess: (returnData, variables) => {
      queryClient.setQueryData(['hazirlananMetrajlar', variables.selectedNode._id.toString()], (hazirlananMetrajlar) => optimisticUpdate(hazirlananMetrajlar, variables))
      variables.setHazirlananMetraj_state()
    }
  })

}






export const useUpdateOnaylananMetraj = () => {

  // const RealmApp = useApp();
  const queryClient = useQueryClient()
  const { selectedProje, RealmApp } = useContext(StoreContext)

  return useMutation({
    mutationFn: ({ selectedNode, hazirlananMetrajlar_state, setHazirlananMetrajlar_state, onaylananMetraj_state, setOnaylananMetraj_state }) => {
      return RealmApp?.currentUser.callFunction("collectionDugumler", ({ functionName: "updateOnaylananMetraj", hazirlananMetrajlar_state, onaylananMetraj_state, _projectId: selectedProje?._id, _mahalId: selectedNode?._mahalId, _pozId: selectedNode?._pozId }))
    },
    onSuccess: (returnData, variables) => {
      // queryClient.invalidateQueries({ queryKey: ['hazirlananMetrajlar', variables.selectedNode._id.toString()] })
      // queryClient.invalidateQueries({ queryKey: ['onaylananMetraj', variables.selectedNode._id.toString()] })
      queryClient.setQueryData(['hazirlananMetrajlar', variables.selectedNode._id.toString()], variables.hazirlananMetrajlar_state)
      queryClient.setQueryData(['onaylananMetraj', variables.selectedNode._id.toString()], variables.onaylananMetraj_state)
      variables.setHazirlananMetrajlar_state()
      variables.setOnaylananMetraj_state()
    }
  })

}


