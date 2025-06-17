
import { useState, useContext } from 'react';
import { StoreContext } from '../../components/store'

import { useApp } from "../../components/useApp";



export default function P_Mongo() {

  const { selectedProje, setSelectedProje } = useContext(StoreContext)
  const { selectedWbs, setSelectedWbs } = useContext(StoreContext)

  const RealmApp = useApp();

  async function wbs_upload() {
    try {
      const result = await RealmApp?.currentUser?.callFunction("admin", { subFunction: "wbs_upload", projectId: selectedProje._id });
      console.log("result", result);
    } catch (error) {
      console.log('Error:', error);
    }
  }

  async function wbs_download() {
    try {
      const result = await RealmApp?.currentUser?.callFunction("admin", { subFunction: "wbs_download", projectId: selectedProje._id });
      console.log("result", result);
      setSelectedProje({ ...selectedProje, wbs: result })
    } catch (error) {
      console.log('Error:', error);
    }
  }

  return (
    <>
      <button onClick={() => wbs_upload()}>wbs_kaydet</button>
      <button onClick={() => wbs_download()}>wbs_yenile</button>
    </>
  )

}
