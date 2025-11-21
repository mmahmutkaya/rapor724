import { useContext } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { StoreContext } from '../components/store'
import { useApp } from "../components/useApp"
import { useNavigate } from "react-router-dom";





// QUERIES


// MONGO FONKSİYON - getFirmalarNames
export const useGetFirmalar = () => {

  const navigate = useNavigate()
  const { appUser, setAppUser } = useContext(StoreContext)

  return useQuery({
    queryKey: ['firmalar'],
    queryFn: async () => {
      const response = await fetch('api/firmalar', {
        method: 'GET',
        headers: {
          email: appUser.email,
          token: appUser.token,
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


export const useGetPozMetrajlarİsPaketByVersiyon = () => {

  const navigate = useNavigate()
  const { appUser, setAppUser, selectedProje, selectedIsPaketVersiyon } = useContext(StoreContext)

  return useQuery({
    queryKey: ['pozMetrajlarIsPaketByVersiyon'],
    queryFn: async () => {
      const response = await fetch('api/pozlar/ispaketmetrajlarbyversiyon', {
        method: 'GET',
        headers: {
          email: appUser.email,
          token: appUser.token,
          projeid: selectedProje?._id,
          versiyonkesiftext: selectedIsPaketVersiyon,
          // versiyonmetrajtext: selectedMetrajVersiyon,
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
    enabled: !!appUser && !!selectedProje && !!(selectedIsPaketVersiyon === 0 || selectedIsPaketVersiyon),
    refetchOnMount: true,
    refetchOnWindowFocus: false
  })

}








export const useGetFirmaPozlar = (onSuccess, onError) => {

  // const RealmApp = useApp();
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




// MONGO FONKSİYON - getProjelerNames_byFirma
export const useGetProjeler_byFirma = () => {

  const navigate = useNavigate()
  const { appUser, setAppUser, selectedFirma } = useContext(StoreContext)

  return useQuery({
    queryKey: ['dataProjeler'],
    queryFn: async () => {
      const response = await fetch(`api/projeler/byfirma/${selectedFirma._id.toString()}`, {
        method: 'GET',
        headers: {
          email: appUser.email,
          token: appUser.token,
          'Content-Type': 'application/json'
        },
      })
      // body: JSON.stringify({ firmaId: selectedFirma._id.toString() })

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
    refetchOnMount: false,
    refetchOnWindowFocus: false
  })

}






// MONGO FONKSİYON - getFirmalarNames
export const useGetPozlar = () => {

  const navigate = useNavigate()
  const { appUser, setAppUser, selectedProje } = useContext(StoreContext)

  return useQuery({
    queryKey: ['dataPozlar'],
    queryFn: async () => {
      const response = await fetch('api/pozlar', {
        method: 'GET',
        headers: {
          email: appUser.email,
          token: appUser.token,
          projeid: selectedProje?._id,
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
    enabled: !!appUser && !!selectedProje,
    refetchOnMount: true,
    refetchOnWindowFocus: false
  })

}





// MONGO FONKSİYON - getFirmalarNames
export const useGetMahaller = () => {

  const navigate = useNavigate()
  const { appUser, setAppUser, selectedProje } = useContext(StoreContext)

  return useQuery({
    queryKey: ['dataMahaller'],
    queryFn: async () => {
      const response = await fetch('api/mahaller', {
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





// MONGO FONKSİYON - getFirmalarNames
export const useGetMahalListesi_pozlar = () => {

  const navigate = useNavigate()
  const { appUser, setAppUser, selectedProje } = useContext(StoreContext)

  return useQuery({
    queryKey: ['dataMahallistesi_pozlar'],
    queryFn: async () => {
      const response = await fetch('api/dugumler/pozlar', {
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






// MONGO FONKSİYON - getFirmalarNames
export const useGetMahalListesi_mahaller_byPoz = () => {

  const navigate = useNavigate()
  const { appUser, setAppUser, selectedProje, selectedPoz_mahalListesi } = useContext(StoreContext)

  return useQuery({
    queryKey: ['dataMahalListesi_mahaller_byPoz'],
    queryFn: async () => {
      const response = await fetch('api/dugumler/mahallerbypoz', {
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




// export const useGetMahalListesi_mahaller_byPoz = (onSuccess, onError) => {

//   // const RealmApp = useApp();
//   const { RealmApp, selectedProje, selectedPoz_mahalListesi } = useContext(StoreContext)

//   return useQuery({
//     queryKey: ['dataMahalListesi_mahaller_byPoz'],
//     queryFn: () => RealmApp?.currentUser.callFunction("getMahalListesi_mahaller_byPoz", ({ _projeId: selectedProje?._id, _pozId: selectedPoz_mahalListesi._id })),
//     enabled: !!RealmApp && !!selectedProje && !!selectedPoz_mahalListesi,
//     onSuccess,
//     onError,
//     refetchOnMount: true,
//     refetchOnWindowFocus: false
//   })

// }





export const useGetMahalListesi_byPoz = () => {

  // const RealmApp = useApp();
  const { selectedProje, RealmApp, selectedPoz_forMahalListesi } = useContext(StoreContext)

  return useQuery({
    queryKey: ['dataMahalListesi_byPoz2'],
    queryFn: () => RealmApp?.currentUser.callFunction("getMahalListesi_byPoz", ({ _projeId: selectedProje?._id, _pozId: selectedPoz_forMahalListesi._id })),
    enabled: !!RealmApp && !!selectedProje && !!selectedPoz_forMahalListesi,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
    // select: (data) => data[0]
  })

}









export const useGetDugumler = () => {

  // const RealmApp = useApp();
  const { selectedProje, RealmApp } = useContext(StoreContext)

  return useQuery({
    queryKey: ['dugumler'],
    queryFn: () => RealmApp?.currentUser.callFunction("getDugumler", ({ _projeId: selectedProje?._id })),
    enabled: !!RealmApp && !!selectedProje,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    // select: (data) => data.mahalListesi,
  })

}












export const useGetDugumler_byPoz = () => {

  const navigate = useNavigate()
  const { appUser, setAppUser, selectedProje, selectedPoz } = useContext(StoreContext)

  return useQuery({
    queryKey: ['dataMahalListesi_byPoz'],
    queryFn: async () => {
      const response = await fetch('api/dugumler/bypoz', {
        method: 'GET',
        headers: {
          email: appUser.email,
          token: appUser.token,
          projeid: selectedProje._id,
          pozid: selectedPoz._id,
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


// export const useGetDugumler_byPoz = () => {

//   // const RealmApp = useApp();
//   const { RealmApp, selectedProje, selectedPoz } = useContext(StoreContext)

//   return useQuery({
//     queryKey: ['dugumler_byPoz'],
//     queryFn: () => RealmApp?.currentUser.callFunction("getDugumler_byPoz", ({ _projeId: selectedProje?._id, _pozId: selectedPoz?._id })),
//     enabled: !!RealmApp && !!selectedPoz,
//     refetchOnMount: true,
//     refetchOnWindowFocus: false,
//     // select: (data) => data.mahalListesi,
//   })

// }





export const useGetMahalListesi = () => {

  // const RealmApp = useApp();
  const { selectedProje, RealmApp } = useContext(StoreContext)

  return useQuery({
    queryKey: ['mahalListesi'],
    queryFn: () => RealmApp?.currentUser.callFunction("collectionDugumler", ({ functionNames: "getMahalListesi", _projeId: selectedProje?._id })),
    enabled: !!RealmApp && !!selectedProje,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    // select: (data) => data.mahalListesi,
  })

}






export const useGetHazirlananMetraj = () => {

  const navigate = useNavigate()
  const { appUser, setAppUser, selectedNode } = useContext(StoreContext)

  return useQuery({
    queryKey: ['dataHazirlananMetraj'],
    queryFn: async () => {
      const response = await fetch('api/dugumler/hazirlananmetraj', {
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







// export const useGetHazirlananMetraj = (onError) => {

//   // const RealmApp = useApp();
//   const { RealmApp, selectedNode } = useContext(StoreContext)

//   return useQuery({
//     // queryKey: ['hazirlananMetraj', selectedNode?._id.toString() + `--` + RealmApp.currentUser.customData.email],
//     queryKey: ['hazirlananMetraj', selectedNode?._id.toString()],
//     queryFn: () => RealmApp?.currentUser.callFunction("getHazirlananMetraj", ({ _dugumId: selectedNode._id })),
//     enabled: !!RealmApp && !!selectedNode,
//     onError,
//     refetchOnMount: true,
//     refetchOnWindowFocus: false,
//     // select: (data) => data.mahalListesi,
//   })

// }






export const useGetHazirlananMetrajlar = () => {

  const navigate = useNavigate()
  const { appUser, setAppUser, selectedNode } = useContext(StoreContext)

  return useQuery({
    queryKey: ['dataHazirlananMetrajlar'],
    queryFn: async () => {
      const response = await fetch('api/dugumler/hazirlananmetrajlar', {
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






// export const useGetHazirlananMetrajlar = () => {

//   // const RealmApp = useApp();
//   const { selectedProje, RealmApp, selectedNode } = useContext(StoreContext)

//   return useQuery({
//     queryKey: ['hazirlananMetrajlar', selectedNode?._id.toString()],
//     queryFn: () => RealmApp?.currentUser.callFunction("getHazirlananMetrajlar", ({ _projeId: selectedProje._id, _dugumId: selectedNode?._id })),
//     enabled: !!RealmApp && !!selectedProje && !!selectedNode,
//     refetchOnMount: true,
//     refetchOnWindowFocus: false
//     // staleTime: 5 * 60 * 1000,
//   })

// }





// export const useGetHazirlananVeOnaylananMetrajlar = () => {

//   // const RealmApp = useApp();
//   const { selectedProje, RealmApp, selectedNode } = useContext(StoreContext)

//   return useQuery({
//     queryKey: ['hazirlananVeOnaylananMetrajlar', selectedNode?._id.toString()],
//     queryFn: () => RealmApp?.currentUser.callFunction("getHazirlananVeOnaylananMetrajlar", ({ _dugumId: selectedNode?._id })),
//     enabled: !!RealmApp && !!selectedProje && !!selectedNode,
//     refetchOnMount: true,
//     refetchOnWindowFocus: false,
//     staleTime: 5 * 60 * 1000,
//   })

// }
















export const useGetOnaylananMetraj = () => {

  const navigate = useNavigate()
  const { appUser, setAppUser, selectedNode } = useContext(StoreContext)

  return useQuery({
    queryKey: ['dataOnaylananMetraj'],
    queryFn: async () => {
      const response = await fetch('api/dugumler/onaylananmetraj', {
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








// export const useGetOnaylananMetraj = () => {

//   // const RealmApp = useApp();
//   const { selectedProje, RealmApp, selectedNode } = useContext(StoreContext)

//   return useQuery({
//     queryKey: ['dataOnaylananMetraj'],
//     queryFn: () => RealmApp?.currentUser.callFunction("getOnaylananMetraj", ({ _dugumId: selectedNode?._id })),
//     enabled: !!RealmApp && !!selectedProje && !!selectedNode,
//     refetchOnMount: true,
//     refetchOnWindowFocus: false,
//     staleTime: 5 * 60 * 1000,
//   })

// }





export const useGetNetworkUsers = (onSuccess, onError) => {

  // const RealmApp = useApp();
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
    // onSuccess,
    // onError,
    refetchOnMount: true,
    refetchOnWindowFocus: false
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
      queryClient.setQueryData(['hazirlananMetrajlar', variables.selectedNode._id.toString()], variables.hazirlananMetrajlar_state)
      queryClient.setQueryData(['onaylananMetraj', variables.selectedNode._id.toString()], variables.onaylananMetraj_state)
      variables.setHazirlananMetrajlar_state()
      variables.setOnaylananMetraj_state()
    }
  })

}


