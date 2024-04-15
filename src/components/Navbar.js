import styles from '../styles/Navbar.module.css'
import Link from 'next/link'
import Image from 'next/image'
import { useApp } from "../components/useApp.js";


const Navbar = ({ setIsSidebar }) => {

  const RealmApp = useApp();

  const group = {
    groupName: "güzel grup"
  }

  const clickSumButton = async () => {
    const result = await RealmApp.currentUser.callFunction("returnBack");
  }

  const clickLogOut = async () => {
    await RealmApp.currentUser.logOut()
    window.location.reload(false);
  }

  function toggleSidebar() {
    setIsSidebar((prev) => !prev)
  }


  return (

    <div className={styles.grid_container}>

      <div className={styles.left}>

        <div className={styles.logo_container}>
          <div className={styles.sidebar__button} onClick={toggleSidebar}>
            <span></span>
            <span></span>
            <span></span>
          </div>


        </div>

        {/* <button onClick={clickSumButton}>
          Sum
        </button> */}


        {/* <Link href="/"> */}
        {/* <Image layout='fill' objectFit='cover' src="/logoPNG.png" alt="Rapor724_Logo" width={20} height={20} /> */}
        {/* </Link> */}
      </div>

      <div>
      </div>

      <div className={styles.right}>
        <Link href="/profile" >
          {RealmApp?.currentUser?.customData?.name ? RealmApp.currentUser.customData?.name : "misafir"}
        </Link>
        <button onClick={clickLogOut}>
          Log Out
        </button>
      </div>

    </div>

  );
}

export default Navbar;