import React from 'react'
import { ErrorMessage, Formik, Field, Form } from 'formik';
import styles from '../styles/FormMailTeyit.module.css'

import { useApp } from "../components/useApp.js";


export default function FormMailTeyit() {

  const RealmApp = useApp();

  const email = RealmApp?.currentUser?.profile.email

  async function deneme() {
    try {
      if (RealmApp) {
        const result = await RealmApp.currentUser.callFunction("auth_SendConfirmationCode");
        console.log("result", result)
        if (!result.ok) {
          return (
            <>
              <div>Üzgünüz, bir problem var, lütfen bizi bilgilendiriniz... Hata (COMPONENT:FormMailTeyit - MESSAGE:auth_SendConfirmationCode)</div>
            </>
          )
        }
      }
    } catch (err) {
      return console.log(err)
    }
  }
  deneme()


  async function clickMailTeyit(props) {

    try {

      const { kod } = props

      const result = await RealmApp.currentUser.callFunction("auth_ConfirmationMail", kod);

      console.log("result2", result)

      if (!result.ok) {
        return (
          <>
            <div>Üzgünüz, bir problem var, lütfen bizi bilgilendiriniz... Hata (COMPONENT:FormMailTeyit - MESSAGE:auth_ConfirmationMail)</div>
          </>
        )
      }

      await RealmApp.currentUser.refreshCustomData()
      window.location.reload(false);

    } catch (err) {

      const hataMesaj = err.message

      if (hataMesaj.includes("expected a string 'password' parameter")) {
        return console.log("Şifre girmelisiniz")
      }

      if (hataMesaj === "invalid username") {
        return console.log("Email girmelisiniz")
      }

      if (hataMesaj === "invalid username/password") {
        return console.log("Email ve şifre uyuşmuyor")
      }

      console.log(hataMesaj)
      return console.log("Giriş esnasında hata oluştu, lütfen iletişime geçiniz..")

      console.log(err.statusCode);
      console.log(err.message);
    }

  }

  const clickLogOut = async () => {
    await RealmApp.currentUser.logOut()
    window.location.reload(false);
  }


  const initialValues = {
    kod: "",
  }


  if (RealmApp) {

    return (
      <div className={styles.form_container}>
        <h1>Profil Bilgileri</h1>
        <Formik
          initialValues={initialValues}
          onSubmit={clickMailTeyit}
        >
          <Form className={styles.form}>

            <label className={styles.input} htmlFor="email">{email}</label>
            {/* <Field className={styles.input} id="email" name="namemail" placeholder={email} /> */}

            {/* <label className={styles.label} htmlFor="lastName">Soyisim</label> */}
            <Field className={styles.input} id="kod" name="kod" placeholder={"Mail adresinize gelen kodu giriniz..."} />

            <button className={styles.button1} type="submit">Kaydet</button>
            <button className={styles.button2} onClick={clickLogOut}>Çıkış Yap</button>
          </Form>
        </Formik>
      </div>
    )
  }

}