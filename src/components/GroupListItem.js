
import styles from '../styles/GroupListItem.module.css'
import Link from 'next/link'
import Image from 'next/image'



const Component = ({ group }) => {

  return (

    <div className={styles.GroupListItem}>

      <Link className={styles.itemName} href={`/${"groups"}/${group._id}/matters`} >
        {group.name}
      </Link>

      <Link className={styles.openMatters} href={`/${"groups"}/${group._id}/matters`} >
        3
      </Link>

      <Link className={styles.pendingMatters} href={`/${"groups"}/${group._id}/matters`} >
        3
      </Link>

    </div>

  );


}

export default Component;