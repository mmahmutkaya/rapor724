import { useEffect, useState } from "react";
import * as Realm from "realm-web";

export function useApp() {
  const [app, setApp] = useState(null);
  // Run in useEffect so that App is not created in server-side environment
  useEffect(() => {
    
    // setApp(Realm.getApp(process.env.NEXT_PUBLIC_APP_ID));
    
    // const RealmApp = new Realm.App({ id: "rapor724_v2-cykom" });
    setApp(Realm.getApp("rapor724_v2-cykom"));
    

  }, []);
  return app;
}

