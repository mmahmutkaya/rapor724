
export default function deleteLastSpace(sTr) {

  if (typeof sTr !== "string") {
    return sTr
  }

  if (sTr.endsWith(" ")) {
    do {
      sTr = sTr.slice(0, -1)
    } while (sTr.endsWith(" "));
  }

  return sTr
}




// const _id = new BSON.ObjectId()
// console.log("_id",_id);
// const id = _id.toString()
// console.log("id",id);
// const _id2 = new BSON.ObjectId(id)
// console.log("_id2",_id2);
// const id2 = _id2.toString()
// console.log("id2",id2);
