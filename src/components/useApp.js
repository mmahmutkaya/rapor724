import { useEffect, useState } from "react";

export function useApp() {
  const [app, setApp] = useState(null);
  // Run in useEffect so that App is not created in server-side environment
  useEffect(() => {
    
    // setApp(Realm.getApp(process.env.NEXT_PUBLIC_APP_ID));
    
    // const RealmApp = new Realm.App({ id: "rapor724_v2-cykom" });    

  }, []);
  return app;
}

