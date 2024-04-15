import React from 'react'
import { ErrorMessage, Formik, Field, Form } from 'formik';
import styles from '../styles/FormProfile.module.css'

import { useApp } from "../components/useApp.js";


export default function FormProfile() {

  const RealmApp = useApp();

  const clickLogOut = async () => {
    await RealmApp.currentUser.logOut()
    window.location.reload(false);
  }

  const email = RealmApp?.currentUser?.profile.email


  async function clickEditProfile(props) {

    try {

      const { name, surname } = props
      
      await RealmApp.currentUser.callFunction("auth_SetCustomData", { name, surname });

      // await RealmApp.currentUser.functions.auth_SetCustomData({ name, surname });
      await RealmApp.currentUser.refreshCustomData();
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

    }

  }

  let _name
  let _surname
  _name = RealmApp?.currentUser?.customData.name ? JSON.parse(JSON.stringify(RealmApp.currentUser.customData.name)) : ""
  _surname = RealmApp?.currentUser?.customData.surname ? JSON.parse(JSON.stringify(RealmApp.currentUser.customData.surname)) : ""


  const initialValues = {
    name: _name,
    surname: _surname
  }



  if (RealmApp) {

    return (
      <div className={styles.form_container}>
        <h1>Profil Bilgileri</h1>
        <Formik
          initialValues={initialValues}
          onSubmit={clickEditProfile}
        >
          <Form className={styles.form}>

            <label className={styles.input} htmlFor="firstName">{email}</label>
            {/* <Field className={styles.input} id="email" name="namemail" placeholder={email} /> */}

            {/* <label className={styles.label} htmlFor="firstName">İsim</label> */}
            <Field className={styles.input} id="name" name="name" placeholder={"İsim"} />

            {/* <label className={styles.label} htmlFor="lastName">Soyisim</label> */}
            <Field className={styles.input} id="surname" name="surname" placeholder={"Soyisim"} />

            <button className={styles.button1} type="submit">Kaydet</button>
            <button className={styles.button2} onClick={clickLogOut}>Çıkış Yap</button>
          </Form>
        </Formik>
      </div>
    )
  }

}