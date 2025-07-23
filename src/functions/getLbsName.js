


// const ikiHane = (value) => {
//   if (!value) {
//     return ""
//   }
//   if (value != "") {
//     return new Intl.NumberFormat("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2, }).format(value)
//   }
//   return value
// }


// const lbsArray = selectedProje?.wbs
//   .filter(item => item.openForPoz === true)
//   .sort(function (a, b) {
//     var nums1 = a.code.split(".");
//     var nums2 = b.code.split(".");

//     for (var i = 0; i < nums1.length; i++) {
//       if (nums2[i]) { // assuming 5..2 is invalid
//         if (nums1[i] !== nums2[i]) {
//           return nums1[i] - nums2[i];
//         } // else continue
//       } else {
//         return 1; // no second number in b
//       }
//     }
//     return -1; // was missing case b.len > a.len
//   })


// const lbsArray = selectedProje?.lbs
//   .filter(item => item.openForMahal === true)
//   .sort(function (a, b) {
//     var nums1 = a.code.split(".");
//     var nums2 = b.code.split(".");

//     for (var i = 0; i < nums1.length; i++) {
//       if (nums2[i]) { // assuming 5..2 is invalid
//         if (nums1[i] !== nums2[i]) {
//           return nums1[i] - nums2[i];
//         } // else continue
//       } else {
//         return 1; // no second number in b
//       }
//     }
//     return -1; // was missing case b.len > a.len
//   })



export default function ({lbsArray, oneLbs}) {

  let cOunt = oneLbs.code.split(".").length
  let name
  let code

  oneLbs.code.split(".").map((codePart, index) => {

    if (index == 0 && cOunt == 1) {
      code = codePart
      name = lbsArray.find(item => item.code == code).name
    }

    if (index == 0 && cOunt !== 1) {
      code = codePart
      name = lbsArray.find(item => item.code == code).codeName
    }

    if (index !== 0 && index + 1 !== cOunt && cOunt !== 1) {
      code = code + "." + codePart
      name = name + " > " + lbsArray.find(item => item.code == code).codeName
    }

    if (index !== 0 && index + 1 == cOunt && cOunt !== 1) {
      code = code + "." + codePart
      name = name + " > " + lbsArray.find(item => item.code == code).name
    }

  })

  return { name, code }

}



// let getLbsName = (oneLbs) => {

//   let cOunt = oneLbs.code.split(".").length
//   let name
//   let code

//   oneLbs.code.split(".").map((codePart, index) => {

//     if (index == 0 && cOunt == 1) {
//       code = codePart
//       name = selectedProje?.lbs.find(item => item.code == code).name
//     }

//     if (index == 0 && cOunt !== 1) {
//       code = codePart
//       name = selectedProje?.lbs.find(item => item.code == code).codeName
//     }

//     if (index !== 0 && index + 1 !== cOunt && cOunt !== 1) {
//       code = code + "." + codePart
//       name = name + " > " + selectedProje?.lbs.find(item => item.code == code).codeName
//     }

//     if (index !== 0 && index + 1 == cOunt && cOunt !== 1) {
//       code = code + "." + codePart
//       name = name + " > " + selectedProje?.lbs.find(item => item.code == code).name
//     }

//   })

//   return { name, code }

// }

