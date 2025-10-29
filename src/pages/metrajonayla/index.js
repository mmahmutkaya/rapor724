
import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { StoreContext } from '../../components/store.js'
import _ from 'lodash';


import ShowMetrajYapabilenler from '../../components/ShowMetrajYapabilenler.js'
import HeaderMetrajOnayla from '../../components/HeaderMetrajOnayla.js'

import { DialogAlert } from '../../components/general/DialogAlert.js';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { BSON } from "realm-web"
import { useGetMahalListesi, useGetHazirlananMetrajlar, useUpdateOnaylananMetraj, useGetOnaylananMetraj } from '../../hooks/useMongo.js';


import { fontSize, fontWeight, styled } from '@mui/system';
import Grid from '@mui/material/Grid';
import Input from '@mui/material/Input';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import { Button, TextField, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import InfoIcon from '@mui/icons-material/Info';
import Chip from '@mui/material/Chip';
import HourglassFullSharpIcon from '@mui/icons-material/HourglassFullSharp';
import LockIcon from '@mui/icons-material/Lock';
import CircleIcon from '@mui/icons-material/Circle';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CheckIcon from '@mui/icons-material/Check';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ClearOutlined from '@mui/icons-material/ClearOutlined';
import { DeleteOutline, Replay, Visibility } from '@mui/icons-material';
import DeleteIcon from '@mui/icons-material/Delete';
import ReplyIcon from '@mui/icons-material/Reply';
import LinearProgress from '@mui/material/LinearProgress';


export default function P_MetrajOnay() {

  const queryClient = useQueryClient()

  const {
    appUser, setAppUser,
    RealmApp,
    subHeaderHeight, myTema,
    selectedProje, selectedPoz, selectedNode
  } = useContext(StoreContext)

  const { showMetrajYapabilenler, setShowMetrajYapabilenler } = useContext(StoreContext)
  const yetkililer = selectedProje?.yetkiliKisiler
  const metrajYapabilenler = selectedProje?.yetkiliKisiler.filter(x => x.yetkiler.find(x => x.name === "owner"))


  const [dialogAlert, setDialogAlert] = useState()
  const [show, setShow] = useState("Main")


  const [isChanged_select, setIsChanged_select] = useState()
  const [isChanged_seen, setIsChanged_seen] = useState()
  const [isChanged_unReady, setIsChanged_unReady] = useState()


  const [mode_unReady, setMode_unReady] = useState()
  const [mode_seen, setMode_seen] = useState()
  const [mode_select, setMode_select] = useState()



  const [hazirlananMetrajlar_state, setHazirlananMetrajlar_state] = useState()
  const [hazirlananMetrajlar_backUp, setHazirlananMetrajlar_backUp] = useState()

  const [onaylananMetrajlar_state, setOnaylananMetrajlar_state] = useState()
  const [onaylananMetrajlar_backUp, setOnaylananMetrajlar_backUp] = useState()

  const [_pozId, set_pozId] = useState()


  let pozBirim
  let pozMetraj

  // renkler

  const onaylananBaslik_color = "rgba( 253, 197, 123 , 0.6 )" // tarçın
  const onaylananSatir_color = "rgba(255,255,0, 0.3)" // açık sarı 

  // "rgba( 253, 197, 123 , 0.6 )" // tarçın
  // "rgba( 0, 255, 0, 0.2 )" // fosforlu yeşil 
  // "rgba( 128, 128, 128, 0.3 )" // gri 
  // "rgba(255,255,0, 0.3)" // sarı

  const hazirlananBaslik_color = "rgba( 253, 197, 123 , 0.6 )" // tarçın
  const hazirlananSatir_color = "rgba(255,255,0, 0.3)" // sarı 
  const hazirlananOnayliSatir_color = "rgba( 128, 128, 128, 0.2 )" // gri
  const hazirlananKilitliSatir_color = "rgba( 128, 128, 128, 0.3 )" // gri


  const { data, error, isLoading } = useGetHazirlananMetrajlar()
  // console.log("data", data)


  const navigate = useNavigate()


  useEffect(() => {
    !selectedNode && navigate("/metrajonaylapozlar")

    setHazirlananMetrajlar_state(_.cloneDeep(data?.hazirlananMetrajlar))
    setHazirlananMetrajlar_backUp(_.cloneDeep(data?.hazirlananMetrajlar))
    // console.log("hazirlananMetrajlar",data?.hazirlananMetrajlar)
    setMode_seen()
    setMode_select()
    setMode_unReady()

  }, [data])



  useEffect(() => {
    if (error) {
      console.log("error", error)
      setDialogAlert({
        dialogIcon: "warning",
        dialogMessage: "Beklenmedik hata, Rapor7/24 ile irtibata geçiniz..",
        detailText: error?.message ? error.message : null
      })
    }
  }, [error]);





  // SELECT FONKSİYONLARI - SELECT - UNSELECT - CANCEL - SAVE

  const add_OneRow_select_all = ({ userEmail }) => {

    let hazirlananMetrajlar_state2 = _.cloneDeep(hazirlananMetrajlar_state)

    let isIslemYapildi

    hazirlananMetrajlar_state2 = hazirlananMetrajlar_state2.map(oneHazirlanan => {
      if (oneHazirlanan.userEmail === userEmail) {
        oneHazirlanan.satirlar.map(oneSatir => {
          if (oneSatir.isReady && !oneSatir.isSelected) {
            oneSatir.isSelected = true
            delete oneSatir.isReady
            oneSatir.newSelected = true
            isIslemYapildi = true
          }
          return oneSatir
        })
      }
      return oneHazirlanan
    })



    if (!isIslemYapildi) {
      hazirlananMetrajlar_state2 = hazirlananMetrajlar_state2.map(oneHazirlanan => {
        if (oneHazirlanan.userEmail === userEmail) {
          oneHazirlanan.satirlar.map(oneSatir => {
            if (!oneSatir.isReady && oneSatir.newSelected) {
              delete oneSatir.isSelected
              oneSatir.isReady = true
              delete oneSatir.newSelected
            }
            return oneSatir
          })
        }
        return oneHazirlanan
      })
    }


    setIsChanged_select()
    outerLoop: for (let i = 0; i < hazirlananMetrajlar_state2.length; i++) {
      let oneHazirlanan = hazirlananMetrajlar_state2[i]
      for (let j = 0; j < oneHazirlanan.satirlar.length; j++) {
        let oneSatir = oneHazirlanan.satirlar[j]
        if (oneSatir.isSelected && oneSatir.newSelected) {
          setIsChanged_select(true)
          break outerLoop; // Exits both loops
        }
      }
    }

    setHazirlananMetrajlar_state(hazirlananMetrajlar_state2)

  }



  const add_OneRow_select = ({ oneRow, hazirlayan }) => {

    if (!isChanged_select) {
      setIsChanged_select(true)
    }

    let hazirlananMetrajlar_state2 = _.cloneDeep(hazirlananMetrajlar_state)

    hazirlananMetrajlar_state2 = hazirlananMetrajlar_state2.map(oneHazirlanan => {
      if (oneHazirlanan.userEmail === hazirlayan.userEmail) {
        oneHazirlanan.satirlar.map(oneSatir => {
          if (oneSatir.satirNo === oneRow.satirNo) {
            oneSatir.isSelected = true
            delete oneSatir.isReady
            oneSatir.newSelected = true
          }
          return oneSatir
        })
      }
      return oneHazirlanan
    })

    setHazirlananMetrajlar_state(hazirlananMetrajlar_state2)

  }



  const remove_OneRow_select = ({ oneRow, hazirlayan }) => {

    if (!oneRow.newSelected) {
      return
    }

    if (!isChanged_select) {
      setIsChanged_select(true)
    }


    let hazirlananMetrajlar_state2 = _.cloneDeep(hazirlananMetrajlar_state)
    hazirlananMetrajlar_state2 = hazirlananMetrajlar_state2.map(oneHazirlanan => {
      if (oneHazirlanan.userEmail === hazirlayan.userEmail) {
        oneHazirlanan.satirlar.map(oneSatir => {
          if (oneSatir.satirNo === oneRow.satirNo) {
            delete oneSatir.isSelected
            oneSatir.isReady = true
            delete oneSatir.newSelected
          }
          return oneSatir
        })
      }
      return oneHazirlanan
    })
    setHazirlananMetrajlar_state(hazirlananMetrajlar_state2)


    // kaydetme tuşunu pasif hale getirme
    let hasNewSelected = false;
    for (var i = 0; i < hazirlananMetrajlar_state2.length; i++) {
      if (hazirlananMetrajlar_state2[i].satirlar.find(x => x.newSelected)) {
        hasNewSelected = true;
        break;
      }
    }
    if (!hasNewSelected) {
      setIsChanged_select()
    }


  }


  const cancel_select = () => {
    setHazirlananMetrajlar_state(_.cloneDeep(hazirlananMetrajlar_backUp))
    setIsChanged_select()
    setMode_select()
  }


  // Edit Metraj Sayfasının Fonksiyonu
  const save_select = async () => {

    if (isChanged_select) {

      try {

        // await RealmApp?.currentUser.callFunction("update_hazirlananMetrajlar_selected", ({ _projeId: selectedProje._id, _dugumId: selectedNode._id, hazirlananMetrajlar_state }))

        const response = await fetch(`/api/dugumler/updatehazirlananmetrajlarselected`, {
          method: 'POST',
          headers: {
            email: appUser.email,
            token: appUser.token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            dugumId: selectedNode._id,
            hazirlananMetrajlar_state
          })
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

        if (responseJson.ok) {
          setShow("Main")
          setMode_select()
          setIsChanged_select()
          queryClient.invalidateQueries(['dataOnaylananMetraj'])
          queryClient.invalidateQueries(['dataHazirlananMetrajlar'])
        } else {
          throw new Error("Kayıt işleminde hata oluştu, sayfayı yenileyiniz, sorun devam ederse, Rapor7/24 ile iletişime geçiniz.")
        }

      } catch (err) {

        console.log(err)

        setDialogAlert({
          dialogIcon: "warning",
          dialogMessage: "Beklenmedik hata, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz..",
          detailText: err?.message ? err.message : null,
          onCloseAction: () => {
            setShow("Main")
            setMode_select()
            setIsChanged_select()
            queryClient.resetQueries(['dataOnaylananMetraj'])
            queryClient.resetQueries(['dataHazirlananMetrajlar'])
            setDialogAlert()
          }
        })

      }
    }

  }








  // UNREADY FONKSİYONLARI - SELECT - UNSELECT - CANCEL - SAVE


  const add_OneRow_unReady_all = ({ userEmail }) => {

    let hazirlananMetrajlar_state2 = _.cloneDeep(hazirlananMetrajlar_state)

    let isIslemYapildi

    hazirlananMetrajlar_state2 = hazirlananMetrajlar_state2.map(oneHazirlanan => {
      if (oneHazirlanan.userEmail === userEmail) {
        oneHazirlanan.satirlar.map(oneSatir => {
          if (oneSatir.isReady) {
            oneSatir.isReady = false
            oneSatir.newSelected = true
            isIslemYapildi = true
          }
          return oneSatir
        })
      }
      return oneHazirlanan
    })



    if (!isIslemYapildi) {
      hazirlananMetrajlar_state2 = hazirlananMetrajlar_state2.map(oneHazirlanan => {
        if (oneHazirlanan.userEmail === userEmail) {
          oneHazirlanan.satirlar.map(oneSatir => {
            if (oneSatir.isReady === false && oneSatir.newSelected) {
              oneSatir.isReady = true
              delete oneSatir.newSelected
            }
            return oneSatir
          })
        }
        return oneHazirlanan
      })
    }


    setIsChanged_unReady()
    outerLoop: for (let i = 0; i < hazirlananMetrajlar_state2.length; i++) {
      let oneHazirlanan = hazirlananMetrajlar_state2[i]
      for (let j = 0; j < oneHazirlanan.satirlar.length; j++) {
        let oneSatir = oneHazirlanan.satirlar[j]
        if (oneSatir.isReady === false && oneSatir.newSelected) {
          setIsChanged_unReady(true)
          break outerLoop; // Exits both loops
        }
      }
    }

    setHazirlananMetrajlar_state(hazirlananMetrajlar_state2)

  }



  const add_OneRow_unReady = ({ oneRow, hazirlayan }) => {

    if (!isChanged_unReady) {
      setIsChanged_unReady(true)
    }

    let hazirlananMetrajlar_state2 = _.cloneDeep(hazirlananMetrajlar_state)
    hazirlananMetrajlar_state2 = hazirlananMetrajlar_state2.map(oneHazirlanan => {
      if (oneHazirlanan.userEmail === hazirlayan.userEmail) {
        oneHazirlanan.satirlar.map(oneSatir => {
          if (oneSatir.satirNo === oneRow.satirNo) {
            oneSatir.isReady = false
            oneSatir.newSelected = true
          }
          return oneSatir
        })
      }
      return oneHazirlanan
    })

    setHazirlananMetrajlar_state(hazirlananMetrajlar_state2)

  }




  const remove_OneRow_unReady = ({ oneRow, hazirlayan }) => {

    if (!oneRow.newSelected) {
      return
    }

    if (!isChanged_unReady) {
      setIsChanged_unReady(true)
    }

    let hazirlananMetrajlar_state2 = _.cloneDeep(hazirlananMetrajlar_state)
    hazirlananMetrajlar_state2 = hazirlananMetrajlar_state2.map(oneHazirlanan => {
      if (oneHazirlanan.userEmail === hazirlayan.userEmail) {
        oneHazirlanan.satirlar.map(oneSatir => {
          if (oneSatir.satirNo === oneRow.satirNo) {
            oneSatir.isReady = true
            delete oneSatir.newSelected
          }
          return oneSatir
        })
      }
      return oneHazirlanan
    })
    setHazirlananMetrajlar_state(hazirlananMetrajlar_state2)


    // kaydetme tuşunu pasif hale getirme
    let hasNewSelected = false;
    for (var i = 0; i < hazirlananMetrajlar_state2.length; i++) {
      if (hazirlananMetrajlar_state2[i].satirlar.find(x => x.newSelected)) {
        hasNewSelected = true;
        break;
      }
    }
    if (!hasNewSelected) {
      setIsChanged_unReady()
    }


  }


  const cancel_unReady = () => {
    setHazirlananMetrajlar_state(_.cloneDeep(hazirlananMetrajlar_backUp))
    setIsChanged_unReady()
    setMode_unReady()
  }


  // Edit Metraj Sayfasının Fonksiyonu
  const save_unReady = async () => {

    if (isChanged_unReady) {

      try {

        // await RealmApp?.currentUser.callFunction("update_hazirlananMetrajlar_unReady", ({ _projeId: selectedProje._id, _dugumId: selectedNode._id, hazirlananMetrajlar_state }))

        const response = await fetch(`/api/dugumler/updatehazirlananmetrajlarunready`, {
          method: 'POST',
          headers: {
            email: appUser.email,
            token: appUser.token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            dugumId: selectedNode._id,
            hazirlananMetrajlar_state
          })
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

        if (responseJson.ok) {
          setShow("Main")
          setMode_unReady()
          setIsChanged_unReady()
          queryClient.invalidateQueries(['dataOnaylananMetraj'])
          queryClient.invalidateQueries(['dataHazirlananMetrajlar'])
        } else {
          throw new Error("Kayıt işleminde hata oluştu, sayfayı yenileyiniz, sorun devam ederse, Rapor7/24 ile iletişime geçiniz.")
        }

      } catch (err) {

        console.log(err)

        setDialogAlert({
          dialogIcon: "warning",
          dialogMessage: "Beklenmedik hata, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz..",
          detailText: err?.message ? err.message : null,
          onCloseAction: () => {
            setShow("Main")
            setMode_unReady()
            setIsChanged_unReady()
            queryClient.resetQueries(['dataOnaylananMetraj'])
            queryClient.resetQueries(['dataHazirlananMetrajlar'])
            setDialogAlert()
          }
        })

      }
    }

  }











  // SEEN FONKSİYONLARI - SELECT - UNSELECT - CANCEL - SAVE


  const add_OneRow_seen_all = ({ userEmail }) => {

    let hazirlananMetrajlar_state2 = _.cloneDeep(hazirlananMetrajlar_state)

    let isIslemYapildi

    hazirlananMetrajlar_state2 = hazirlananMetrajlar_state2.map(oneHazirlanan => {
      if (oneHazirlanan.userEmail === userEmail) {
        oneHazirlanan.satirlar.map(oneSatir => {
          if (oneSatir.isReadyUnSeen) {
            oneSatir.isReadyUnSeen = false
            oneSatir.newSelected = true
            isIslemYapildi = true
          }
          return oneSatir
        })
      }
      return oneHazirlanan
    })



    if (!isIslemYapildi) {
      hazirlananMetrajlar_state2 = hazirlananMetrajlar_state2.map(oneHazirlanan => {
        if (oneHazirlanan.userEmail === userEmail) {
          oneHazirlanan.satirlar.map(oneSatir => {
            if (oneSatir.isReadyUnSeen === false && oneSatir.newSelected) {
              oneSatir.isReadyUnSeen = true
              delete oneSatir.newSelected
            }
            return oneSatir
          })
        }
        return oneHazirlanan
      })
    }


    setIsChanged_seen()
    outerLoop: for (let i = 0; i < hazirlananMetrajlar_state2.length; i++) {
      let oneHazirlanan = hazirlananMetrajlar_state2[i]
      for (let j = 0; j < oneHazirlanan.satirlar.length; j++) {
        let oneSatir = oneHazirlanan.satirlar[j]
        if (oneSatir.isReadyUnSeen === false && oneSatir.newSelected) {
          setIsChanged_seen(true)
          break outerLoop; // Exits both loops
        }
      }
    }

    setHazirlananMetrajlar_state(hazirlananMetrajlar_state2)

  }



  const add_OneRow_seen = ({ oneRow, hazirlayan }) => {

    if (!isChanged_seen) {
      setIsChanged_seen(true)
    }

    let hazirlananMetrajlar_state2 = _.cloneDeep(hazirlananMetrajlar_state)
    hazirlananMetrajlar_state2 = hazirlananMetrajlar_state2.map(oneHazirlanan => {
      if (oneHazirlanan.userEmail === hazirlayan.userEmail) {
        oneHazirlanan.satirlar.map(oneSatir => {
          if (oneSatir.satirNo === oneRow.satirNo) {
            oneSatir.isReadyUnSeen = false
            oneSatir.newSelected = true
          }
          return oneSatir
        })
      }
      return oneHazirlanan
    })

    setHazirlananMetrajlar_state(hazirlananMetrajlar_state2)

  }




  const remove_OneRow_seen = ({ oneRow, hazirlayan }) => {

    if (!oneRow.newSelected) {
      return
    }

    if (!isChanged_seen) {
      setIsChanged_seen(true)
    }

    let hazirlananMetrajlar_state2 = _.cloneDeep(hazirlananMetrajlar_state)
    hazirlananMetrajlar_state2 = hazirlananMetrajlar_state2.map(oneHazirlanan => {
      if (oneHazirlanan.userEmail === hazirlayan.userEmail) {
        oneHazirlanan.satirlar.map(oneSatir => {
          if (oneSatir.satirNo === oneRow.satirNo) {
            oneSatir.isReadyUnSeen = true
            delete oneSatir.newSelected
          }
          return oneSatir
        })
      }
      return oneHazirlanan
    })
    setHazirlananMetrajlar_state(hazirlananMetrajlar_state2)


    // kaydetme tuşunu pasif hale getirme
    let hasNewSelected = false;
    for (var i = 0; i < hazirlananMetrajlar_state2.length; i++) {
      if (hazirlananMetrajlar_state2[i].satirlar.find(x => x.newSelected)) {
        hasNewSelected = true;
        break;
      }
    }
    if (!hasNewSelected) {
      setIsChanged_seen()
    }


  }


  const cancel_seen = () => {
    setHazirlananMetrajlar_state(_.cloneDeep(hazirlananMetrajlar_backUp))
    setIsChanged_seen()
    setMode_seen()
  }


  // Edit Metraj Sayfasının Fonksiyonu
  const save_seen = async () => {

    if (isChanged_seen) {

      try {

        // await RealmApp?.currentUser.callFunction("update_hazirlananMetrajlar_seen", ({ _projeId: selectedProje._id, _dugumId: selectedNode._id, hazirlananMetrajlar_state }))

        const response = await fetch(`/api/dugumler/updatehazirlananmetrajlarseen`, {
          method: 'POST',
          headers: {
            email: appUser.email,
            token: appUser.token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            dugumId: selectedNode._id,
            hazirlananMetrajlar_state
          })
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

        if (responseJson.ok) {
          setShow("Main")
          setMode_seen()
          setIsChanged_seen()
          queryClient.invalidateQueries(['dataHazirlananMetrajlar'])
        } else {
          throw new Error("Kayıt işleminde hata oluştu, sayfayı yenileyiniz, sorun devam ederse, Rapor7/24 ile iletişime geçiniz.")
        }

      } catch (err) {

        console.log(err)

        setDialogAlert({
          dialogIcon: "warning",
          dialogMessage: "Beklenmedik hata, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz..",
          detailText: err?.message ? err.message : null,
          onCloseAction: () => {
            setShow("Main")
            setMode_seen()
            setIsChanged_seen()
            queryClient.resetQueries(['dataHazirlananMetrajlar'])
            setDialogAlert()
          }
        })

      }
    }

  }












  // KİŞİLERİN HAZILADIĞI METRAJLARI GÖSTERİP GİZLEME

  const toggleShow = ({ userEmail }) => {

    let showMetrajYapabilenler2 = _.cloneDeep(showMetrajYapabilenler)

    showMetrajYapabilenler2 = showMetrajYapabilenler2.map(oneYapabilen => {
      if (oneYapabilen.userEmail === userEmail) {
        oneYapabilen.isSelected = !oneYapabilen.isSelected
      }
      return oneYapabilen
    })

    setShowMetrajYapabilenler(showMetrajYapabilenler2)

  }










  // GENEL - bir string değerinin numerik olup olmadığının kontrolü
  function isNumeric(str) {
    if (str) {
      str.toString()
    }
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`Number` alone does not do this)...
      !isNaN(Number(str)) // ...and ensure strings of whitespace fail
  }



  // GENEL - bir fonksiyon, ortak kullanılıyor olabilir
  const ikiHane = (value) => {
    if (value != "") {
      return new Intl.NumberFormat("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2, }).format(value)
    }
    return value
  }



  // GENEL - bir fonksiyon, ortak kullanılıyor olabilir
  const metrajValue = (oneRow, oneProperty, isMinha) => {

    if (oneProperty == "pozBirim") return pozBirim
    if (oneProperty.includes("carpan")) return show !== "EditMetraj" ? ikiHane(oneRow[oneProperty]) : oneRow[oneProperty]
    if (oneProperty == "metraj") return ikiHane(oneRow[oneProperty])

    // yukarıdaki hiçbiri değilse
    return oneRow[oneProperty]

  }



  // CSS
  const css_enUstBaslik = {
    px: "0.3rem", border: "1px solid black", backgroundColor: "lightgray", display: "grid", alignItems: "center", justifyContent: "center"
  }


  const css_metrajCetveliBaslik = {
    mt: "1.2rem", px: "0.3rem", border: "1px solid black", backgroundColor: "rgba( 253, 197, 123 , 0.6 )", display: "grid", alignItems: "center", justifyContent: "center"
  }

  const css_metrajCetveliSatir = {
    px: "0.3rem", border: "1px solid black", display: "grid", alignItems: "center", justifyContent: "center"
  }

  const css_metrajOnayBaslik = {
    mt: "2rem", px: "0.3rem", border: "1px solid black", fontWeight: "600", backgroundColor: myTema.renkler.metrajOnaylananBaslik, display: "grid", alignItems: "center", justifyContent: "center"
  }

  const gridTemplateColumns1 = 'max-content minmax(min-content, 5fr) repeat(7, minmax(min-content, 1fr)) 1rem max-content'

  pozBirim = selectedProje?.pozBirimleri.find(item => item.id == selectedPoz?.pozBirimId)?.name


  return (

    <>

      {dialogAlert &&
        <DialogAlert
          dialogIcon={dialogAlert.dialogIcon}
          dialogMessage={dialogAlert.dialogMessage}
          detailText={dialogAlert.detailText}
          onCloseAction={dialogAlert.onCloseAction ? dialogAlert.onCloseAction : () => setDialogAlert()}
        />
      }

      <Grid item sx={{ mt: (Number(subHeaderHeight) + 1) + "rem", }}>
        <HeaderMetrajOnayla
          show={show} setShow={setShow}
          save_select={save_select} cancel_select={cancel_select} isChanged_select={isChanged_select} setIsChanged_select={setIsChanged_select} mode_select={mode_select} setMode_select={setMode_select}
          save_unReady={save_unReady} cancel_unReady={cancel_unReady} isChanged_unReady={isChanged_unReady} setIsChanged_unReady={setIsChanged_unReady} mode_unReady={mode_unReady} setMode_unReady={setMode_unReady}
          save_seen={save_seen} cancel_seen={cancel_seen} isChanged_seen={isChanged_seen} setIsChanged_seen={setIsChanged_seen} mode_seen={mode_seen} setMode_seen={setMode_seen}
        />
      </Grid>


      {/* BAŞLIK GÖSTER / GİZLE */}
      {show == "ShowMetrajYapabilenler" &&
        <ShowMetrajYapabilenler
          setShow={setShow}
        />
      }


      {isLoading &&
        <Box sx={{ width: '100%', px: "1rem", mt: "5rem", color: 'gray' }}>
          <LinearProgress color='inherit' />
        </Box >
      }


      {
        !isLoading && !metrajYapabilenler?.length > 0 &&
        <Stack sx={{ width: '100%', padding: "1rem" }} spacing={2}>
          <Alert severity="info">
            Bu projede metraj yapabilecek bir kişi oluşturulmamış
          </Alert>
        </Stack>
      }


      {
        !isLoading && metrajYapabilenler?.length > 0 && !showMetrajYapabilenler?.filter(x => x.isShow).length > 0 &&
        <Stack sx={{ width: '100%', padding: "1rem" }} spacing={2}>
          <Alert severity="info">
            Metraj yapabilenlerin tümünü gösterime kapattınız.
          </Alert>
        </Stack>
      }



      {
        !isLoading && showMetrajYapabilenler?.filter(x => x.isShow).length > 0 &&


        < Box sx={{ width: "65rem", display: "grid", gridTemplateColumns: gridTemplateColumns1, mt: subHeaderHeight, mb: "1rem", mx: "1rem" }}>

          <Box sx={{ mt: "0.7rem", mb: "0.7rem", gridColumn: "1/12", fontWeight: "600" }}>
            Hazırlanan Metrajlar
          </Box>

          {/* En Üst Başlık Satırı */}
          < React.Fragment >
            <Box sx={{ ...css_enUstBaslik }}>
              Sıra
            </Box>
            <Box sx={{ ...css_enUstBaslik }}>
              Açıklama
            </Box>
            <Box sx={{ ...css_enUstBaslik }}>
              Benzer
            </Box>
            <Box sx={{ ...css_enUstBaslik }}>
              Adet
            </Box>
            <Box sx={{ ...css_enUstBaslik }}>
              En
            </Box>
            <Box sx={{ ...css_enUstBaslik }}>
              Boy
            </Box>
            <Box sx={{ ...css_enUstBaslik }}>
              Yük.
            </Box>
            <Box sx={{ ...css_enUstBaslik }}>
              Metraj
            </Box>
            <Box sx={{ ...css_enUstBaslik }}>
              Birim
            </Box>

            <Box>
            </Box>

            <Box>
            </Box>

          </React.Fragment >




          {showMetrajYapabilenler?.filter(x => x.isShow).map((oneYapabilen, index) => {

            const oneHazirlanan = hazirlananMetrajlar_state?.find(x => x.userEmail === oneYapabilen.userEmail)

            let hazirlayan = yetkililer?.find(oneYetkili => oneYetkili.userEmail === oneYapabilen.userEmail)

            return (

              <React.Fragment key={index}>
                {/* Metraj Cetveli Başlık Satırı */}
                <React.Fragment>

                  <Box sx={{ ...css_metrajCetveliBaslik, gridColumn: "1/8", justifyContent: "start", pr: "1rem", display: "grid", gridTemplateColumns: "1fr max-content" }}>
                    <Box sx={{}}>
                      {hazirlayan?.isim + " " + hazirlayan?.soyisim}
                    </Box>
                    {oneYapabilen.isSelected &&
                      <ExpandLessIcon onClick={() => toggleShow({ userEmail: oneYapabilen.userEmail })} sx={{ cursor: "pointer" }} />
                    }
                    {!oneYapabilen.isSelected &&
                      <ExpandMoreIcon onClick={() => toggleShow({ userEmail: oneYapabilen.userEmail })} sx={{ cursor: "pointer" }} />
                    }
                  </Box>

                  <Box sx={{ ...css_metrajCetveliBaslik, justifyContent: "end", pr: "0.3rem", color: oneHazirlanan?.metraj < 0 ? "red" : null }}>
                    {oneHazirlanan?.metrajReady ? ikiHane(oneHazirlanan?.metrajReady) : ""}
                  </Box>

                  <Box sx={{ ...css_metrajCetveliBaslik }}>
                    {pozBirim}
                  </Box>

                  <Box></Box>


                  {/* ALLTAKİ 4 TANEDEN BİRİ GÖSTERİLİYOR */}
                  {!mode_seen && !mode_select && !mode_unReady &&
                    <Box sx={{ ...css_metrajCetveliBaslik }}>
                      Durum
                    </Box>
                  }

                  {mode_seen &&
                    <Box onClick={() => add_OneRow_seen_all({ userEmail: oneYapabilen.userEmail })} sx={{ ...css_metrajCetveliBaslik, cursor: "pointer" }}>
                      <Visibility variant="contained" sx={{ minWidth: "3.05rem", color: "gray", fontSize: "1rem" }} />
                    </Box>
                  }

                  {mode_select &&
                    <Box onClick={() => add_OneRow_select_all({ userEmail: oneYapabilen.userEmail })} sx={{ ...css_metrajCetveliBaslik, cursor: "pointer" }}>
                      <DoneAllIcon variant="contained" sx={{ minWidth: "3.05rem", color: "gray", fontSize: "1rem" }} />
                    </Box>
                  }

                  {mode_unReady &&
                    <Box onClick={() => add_OneRow_unReady_all({ userEmail: oneYapabilen.userEmail })} sx={{ ...css_metrajCetveliBaslik, cursor: "pointer" }}>
                      <ReplyIcon variant="contained" sx={{ minWidth: "3.05rem", color: "gray", fontSize: "1rem" }} />
                    </Box>
                  }

                </React.Fragment>




                {
                  oneHazirlanan?.satirlar.map((oneRow, index) => {

                    if (!oneYapabilen.isSelected) {
                      return
                    }
                    // console.log("oneHazirlanan",oneHazirlanan)


                    return (
                      < React.Fragment key={index}>

                        {["satirNo", "aciklama", "carpan1", "carpan2", "carpan3", "carpan4", "carpan5", "metraj", "pozBirim"].map((oneProperty, index) => {

                          let isMinha = oneRow["aciklama"].replace("İ", "i").toLowerCase().includes("minha") ? true : false

                          return (
                            <React.Fragment key={index}>

                              <Box
                                sx={{
                                  ...css_metrajCetveliSatir,
                                  cursor: !oneRow.isSelected || oneRow.newSelected ? "pointer" : null,
                                  backgroundColor: oneRow?.isSelected || oneRow?.hasSelectedCopy ? myTema.renkler.inaktifGri : !oneRow.isReady && "rgba(238, 251, 0, 0.22)",
                                  justifyContent: (oneProperty.includes("satirNo") || oneProperty.includes("aciklama")) ? "start" : oneProperty.includes("carpan") ? "end" : oneProperty.includes("metraj") ? "end" : "center",
                                  minWidth: oneProperty.includes("carpan") ? "5rem" : oneProperty.includes("metraj") ? "5rem" : null,
                                  color: isMinha ? "red" : null
                                }}>
                                {metrajValue(oneRow, oneProperty, isMinha)}
                              </Box>

                            </React.Fragment>
                          )

                        })}

                        <Box></Box>

                        <Box

                          onClick={() =>
                            mode_select && !mode_unReady && !mode_seen && !oneRow?.isSelected ? add_OneRow_select({ oneRow, hazirlayan }) :
                              mode_select && !mode_unReady && !mode_seen && oneRow?.newSelected ? remove_OneRow_select({ oneRow, hazirlayan }) :
                                mode_unReady && !mode_seen && !mode_select && !oneRow?.isSelected && oneRow?.isReady ? add_OneRow_unReady({ oneRow, hazirlayan }) :
                                  mode_unReady && !mode_seen && !mode_select && oneRow?.newSelected ? remove_OneRow_unReady({ oneRow, hazirlayan }) :
                                    mode_seen && oneRow?.isReadyUnSeen ? add_OneRow_seen({ oneRow, hazirlayan }) :
                                      mode_seen && oneRow?.newSelected && remove_OneRow_seen({ oneRow, hazirlayan })
                          }

                          sx={{

                            // backgroundColor: oneRow.isSelected ? null : "rgba(255,255,0, 0.3)",
                            // backgroundColor: "rgba(255,255,0, 0.3)",
                            cursor: "pointer",
                            display: "grid",
                            alignItems: "center",
                            justifyItems: "center",
                            px: "0.3rem",
                            border: "1px solid black"
                          }}>
                          {oneRow?.isSelected && !oneRow?.hasSelectedCopy &&
                            <DoneAllIcon variant="contained" sx={{ color: oneRow.newSelected ? "orange" : "black", fontSize: "1rem" }} />
                          }
                          {oneRow?.hasSelectedCopy &&
                            <DoneAllIcon variant="contained" sx={{ color: "gray", fontSize: "1rem" }} />
                          }
                          {oneRow?.isReady === false &&
                            <ReplyIcon variant="contained" sx={{ color: "red", fontSize: "1rem" }} />
                          }
                          {!oneRow?.isSelected && oneRow?.isReady && !oneRow.isReadyUnSeen &&
                            <Visibility variant="contained" sx={{ color: oneRow.newSelected ? "rgba( 255,165,0, 1 )" : "lightgray", fontSize: "1rem" }} />
                          }
                          {/* {oneRow?.isReady && !oneRow?.newSelected &&
                            <ClearOutlined variant="contained" sx={{ color: "red", fontSize: "1rem" }} />
                          } */}
                        </Box>

                      </React.Fragment>
                    )

                  })
                }

              </React.Fragment>

            )
          })}

        </Box >
      }





    </ >

  )

}


