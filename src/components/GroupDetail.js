
import styles from '../styles/GroupDetail.module.css'

const GroupDetail = ({ group }) => {

  return (

    <div className={styles.card}>
      <div className={styles.card_grid}>
        <div className={styles.col1}>{group.name}</div>
        <div className={styles.col2}>John Doe</div>
        <div className={styles.col3}>Architect & Engineer</div>
        <div className={styles.col4}>Architect & Engineer</div>
      </div>
    </div>

  );

}

export default GroupDetail;