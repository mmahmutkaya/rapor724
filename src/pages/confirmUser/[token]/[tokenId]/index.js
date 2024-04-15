import React from 'react'
import { useEffect, useState } from "react";
import { useRouter } from 'next/router'


import * as Realm from "realm-web";



export default function ConfirmUserIndex() {

  const RealmApp = Realm.getApp("rapor724_v2-cykom")
  const { query } = useRouter()

  // const [pathArray, setPathArray] = useState(asPath.split("/"))

  // const [token, setToken] = useState(pathArray[2])
  // const [tokenId, setTokenId] = useState(pathArray[3])


  // const RealmApp = useApp();
  // async function regesterMail() {

  //   console.log(token, tokenId)

  //   //Confirm client

  //   if (RealmApp) {
  //     try {
  //       await RealmApp.emailPasswordAuth.confirmUser(token, tokenId)
  //       return "kayıt yapıdı";
  //     } catch (error) {
  //       return "hata var";
  //     }
  //   }
  //   return "app yok"
  // }

  // useEffect(() => {
  //   console.log("use çalıştı")
  //   console.log(regesterMail())
  // }, [RealmApp])





  async function confirmClick(props) {

    try {

      const {token} = (query)
      const {tokenId} = (query)

      await RealmApp.emailPasswordAuth.confirmUser({ token, tokenId });
      return console.log("kayıt oldu")

    } catch (err) {

      console.log("hata oldu")
      return console.log(err)

      if (err.statusCode === 409) {
        return console.log("Bu mail sistemde kayıtlı")
      }

      if (hataMesaj.includes("password must be between 6")) {
        return console.log("Şifre en az 6 karakter olmalı")
      }

      if (hataMesaj.includes("email invalid")) {
        return console.log("Email adresi hatalı")
      }

      if (hataMesaj.includes("unknown user confirmation status")) {
        // başındaki ""unknown user confirmation status"" yazısnı atmak için
        const hataMesaj2 = hataMesaj.slice(34, hataMesaj.length - 1)
        return console.log(hataMesaj2)
      }

      console.log(hataMesaj)
      return console.log("Kayıt esnasında hata oluştu, lütfen iletişime geçiniz..")

      // if (err.statusCode === 400) {
      //   return console.log("Şifre en az 6 karakter olmalı")
      // }
      console.log(err.statusCode);
      console.log(err.message);
    }

  }


  useEffect(() => {

    // Object.keys(query).length ? console.log({ "query": query }) : console.log("query boş")
    Object.keys(query).length ?  confirmClick() : console.log("query boş")

    // return () => {
    //   second
    // }
  }, [query])


  // useEffect(() => {

  //   setPathArray(asPath.split("/"))
  //   setToken(pathArray[2])
  //   setTokenId(pathArray[3])
  //   console.log(token)
  //   console.log(token.length)


  //   if (RealmApp && token.length > 10) {
  //     const kayitOl = async () => {

  //       confirmClick()
  //     }
  //     kayitOl()
  //   }

  // }, [RealmApp, token.length]);


  return (
    <>
      <div>merhaba</div>

      <div>{"token"}</div>
      <div>{"tokenId"}</div>

      {/* <button onClick={confirmClick}></button> */}

    </>
  )
}
