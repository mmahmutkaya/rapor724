import React from 'react'
import { ErrorMessage, Formik, Field, Form } from 'formik';
import styles from '../styles/FormSignUp.module.css'
import { useEffect } from "react";

import { useApp } from "./useApp.js";

export default function FormSignUp({ setLoginFormMode }) {

  const RealmApp = useApp();

  async function clickForm(props) {


    const { email, password } = props
    // console.log( email, password)

    try {

      await RealmApp.emailPasswordAuth.registerUser({ email, password });
      // kod alta devam ediyorsa hata vermemiş, kayıt işlemi gerçekleşmiş
      setLoginFormMode("login")
      return console.log("Kayıt işlemi gerçekleşti, giriş yapmayı deneyiniz")

    } catch (err) {

      const hataMesaj = err.message

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


  const initialValues = {
    firstName: "",
    lastName: "",
    email: "",
  }

  return (
    <div className={styles.form_container}>
      <h1>Üye Ol</h1>
      <Formik
        initialValues={initialValues}
        onSubmit={clickForm}
      >
        <Form className={styles.form}>

          {/* <label className={styles.label} htmlFor="email">Email</label> */}
          <Field
            className={styles.input}
            id="email"
            name="email"
            placeholder="Email"
            type="email"
          />
          {/* <ErrorMessage name="email">{msg => <div>{msg}</div>}</ErrorMessage> */}
          {/* <ErrorMessage name="email"><div>{"msg"}</div></ErrorMessage> */}

          {/* <label className={styles.label} htmlFor="password">Şifre</label> */}
          <Field
            className={styles.input}
            id="password"
            name="password"
            placeholder="Şifre"
            type="password"
          />

          <button className={styles.button1} type="submit">Üyelik Başvurusu Yap</button>
          <button className={styles.button2} type="change" onClick={() => setLoginFormMode("login")}>Mevcut Üye Girişi</button>
        </Form>
      </Formik>
    </div>
  )
}