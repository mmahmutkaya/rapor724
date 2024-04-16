exports = async function(sTr){
  
  if (typeof sTr !== "string") {
    return sTr
  }

  do {
    if(sTr.endsWith(" ")) sTr = sTr.slice(0, -1)
  } while (sTr.endsWith(" "));

  return sTr  
};