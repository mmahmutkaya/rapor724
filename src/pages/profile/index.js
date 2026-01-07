// import { useRouter } from 'next/router'
import styles from '../../styles/P_Profile.module.css'
import FormProfile from '../../components/FormProfile.js'
import Link from 'next/link'
import { useState, } from "react";


import { useApp } from "../../components/useApp"



const P_Profile = () => {

    const RealmApp = useApp()

    return (
        <>
            <FormProfile />
        </>
    );
}

export default P_Profile;