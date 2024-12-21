exports = async function(mailCode){

  const userId = context.user.id
  const collection_Users = context.services.get("mongodb-atlas").db("rapor724_v2").collection("users")
  const currentTime = new Date()

  
  if(context.user.custom_data.mailConfirmationKod == mailCode) {
    const result = await collection_Users.updateOne(
      { userId },
      [
        {
          $set: {
            "mailTeyit": true
          },
        },
      ]
    )
    return result
  } else {
    const result = await collection_Users.updateOne(
      { userId },
      [
        {
          $set: {
            "mailTeyit": false
          },
        },
      ]
    )
    return result
  }


  // const result = await collection_Users.updateOne(
  //   { userId },
  //   [
  //     {
  //       $set: {
  //         "mailTeyit": {
  //           $cond: {
  //             if: {$eq:["$mailConfirmationKod", mailCode]},
  //             then: true,
  //             else: false
  //           }
  //         }
  //       },
  //     },
  //   ]
  // );

  
  // const userId = context.user.id
  // const userData = await context.services.get("mongodb-atlas").db("rapor724_v2").collection("mailConfirmationCodes").findOne({userId})
  // const codeDb = userData.mailConfirmationKod


  // try {
    
  //   // mail Teyit kodunu users collection içinde tutmuyoruz, çünkü login olduğunda bu bilgi client tarafına ulaştığı için erişilebilir oluyor
  //   if(codeDb == codePayload) {
  //     const collection_Users = context.services.get("mongodb-atlas").db("rapor724_v2").collection("users")
  //     await collection_Users.updateOne(
  //       { userId }, // Query for the user object of the logged in user
  //       { $set: { mailTeyit:true, createdAt:currentTime} }, // Set the logged in user's favorite color to purple
  //       { upsert: true }
  //     );
  //     return ({ok:true, Fonksiyon:"MONGO // FONK // auth_ConfirmationMail ", mesaj:"mail adresi teyit edildi" })
  //   } else {
  //     return ({ok:false, Fonksiyon:"MONGO // FONK // auth_ConfirmationMail ", mesaj:"mail adresi teyit edilemedi" })
  //   }
    
    
  // } catch (err) {
  //   return ({ok:false, hataYeri:"MONGO // FONK // auth_ConfirmationMail ", hataMesaj:err.message})
  // }
  
  
};