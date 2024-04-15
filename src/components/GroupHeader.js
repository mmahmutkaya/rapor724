import { useRouter } from 'next/router'
import styles from '../styles/GroupHeader.module.css'
import Link from 'next/link'
import Image from 'next/image'



const GroupHeader = ({ group }) => {

  const { asPath } = useRouter()
  const pathArray = asPath.split("/");
  // const { param } = router.query
  // console.log(pathArray)

  return (
    <>
      <div className={styles.header}>

        <div className={styles.headerA}>

          <div className={styles.headerA_left}>
            <Link href={`${"/groups"}/`} className={styles.logo_left_div}>
              <Image fill src="/back-icon-png-19.jpg" alt="back-icon" sizes="(min-width: 1em) 100vw"/>
            </Link>
            <div style={{ marginTop: '0.1rem' }}>{group.name}</div>
          </div>

          {/* <div className={styles.headerA_right}>
            <Link href={`${"/groups"}/`} className={styles.logo_right_div}>
              <Image fill src="/plus-icon-23564.png" alt="back-icon" />
            </Link>
            <Link href={`${"/groups"}/`} className={styles.logo_right_div}>
              <Image fill src="/plus-icon-23564.png" alt="back-icon" />
            </Link>
            <Link href={`${"/groups"}/`} className={styles.logo_right_div}>
              <Image fill src="/plus-icon-23564.png" alt="back-icon" />
            </Link>
          </div> */}

        </div>

        <div className={styles.headerB}>

          <Link
            href={`${"/groups"}/${group.id}/${"matters"}`}
            className={`${styles.headerB_item} ${pathArray[3] == "matters" ? styles.headerB_selected : ''}`}>
            Vakalar
          </Link>

          <Link
            href={`${"/groups"}/${group.id}/${"decisions"}`}
            className={`${styles.headerB_item} ${pathArray[3] == "decisions" ? styles.headerB_selected : ''}`}>
            Kararlar
          </Link>

          <Link
            href={`${"/groups"}/${group.id}/${"announces"}`}
            className={`${styles.headerB_item} ${pathArray[3] == "announces" ? styles.headerB_selected : ''}`}>
            Duyuru
          </Link>

          <Link
            href={`${"/groups"}/${group.id}/${"members"}`}
            className={`${styles.headerB_item} ${pathArray[3] == "members" ? styles.headerB_selected : ''}`}>
            Üyeler
          </Link>

        </div>

      </div>
    </>
  );
}

export default GroupHeader;