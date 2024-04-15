
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import { styled } from '@mui/system';
import { useState } from 'react';



export default function P_Deneme() {

  let basliklar = [
    { id: 1, isim: "No" },
    { id: 2, isim: "İsim" },
    { id: 3, isim: "Tarif" },
    { id: 4, isim: "Ölçü" },
  ]

  let altBasliklar = [
    { id: 1, isim: "Alt1" },
    { id: 2, isim: "Alt2" },
    { id: 3, isim: "Alt3" },
    { id: 4, isim: "Alt4" },
  ]

  let gruplar = [
    { id: "A" },
    { id: "B" },
  ]

  let count_
  let grup_

  let border = "solid black 1px"
  let borderTop = "solid black 1px"
  let borderLeft = "solid black 1px"
  let borderRight = "solid black 1px"
  let borderBottom = "solid black 1px"


  let pozlar = [
    { id: 1, no: "KAB01", tur: "A", isim: "A-Kalıp yapılması", olcu: "kalıp gören bütün beton yüzeyler ölçülecektir", tarif: "kalıpların üzerlerine iyice yağ sürülecek ve kalıp ustaları tarafından döşenecek, güzelce beklenecek, akşamdan ıslatılsa daha iyi olur, neler yapılacak, neler yapılacak", tarif2: "kalıpların üzerlerine iyice yağ sürülecek ve kalıp ustaları tarafından döşenecek, güzelce beklenecek, akşamdan ıslatılsa daha iyi olur, neler yapılacak, neler yapılacak", tarif3: "kalıpların üzerlerine iyice yağ sürülecek ve kalıp ustaları tarafından döşenecek, güzelce beklenecek, akşamdan ıslatılsa daha iyi olur, neler yapılacak, neler yapılacak" },
    { id: 2, no: "KAB02", tur: "A", isim: "A-Beton yapılması", olcu: "kalıp gören bütün beton yüzeyler ölçülecektir", tarif: "kalıpların üzerlerine iyice yağ sürülecek ve kalıp ustaları tarafından döşenecek, güzelce beklenecek, akşamdan ıslatılsa daha iyi olur, neler yapılacak, neler yapılacak", tarif2: "kalıpların üzerlerine iyice yağ sürülecek ve kalıp ustaları tarafından döşenecek, güzelce beklenecek, akşamdan ıslatılsa daha iyi olur, neler yapılacak, neler yapılacak", tarif3: "kalıpların üzerlerine iyice yağ sürülecek ve kalıp ustaları tarafından döşenecek, güzelce beklenecek, akşamdan ıslatılsa daha iyi olur, neler yapılacak, neler yapılacak" },
    { id: 3, no: "KAB03", tur: "A", isim: "A-Demir Döşenmesi", olcu: "kalıp gören bütün beton yüzeyler ölçülecektir", tarif: "kalıpların üzerlerine iyice yağ sürülecek ve kalıp ustaları tarafından döşenecek, güzelce beklenecek, akşamdan ıslatılsa daha iyi olur, neler yapılacak, neler yapılacak", tarif2: "kalıpların üzerlerine iyice yağ sürülecek ve kalıp ustaları tarafından döşenecek, güzelce beklenecek, akşamdan ıslatılsa daha iyi olur, neler yapılacak, neler yapılacak", tarif3: "kalıpların üzerlerine iyice yağ sürülecek ve kalıp ustaları tarafından döşenecek, güzelce beklenecek, akşamdan ıslatılsa daha iyi olur, neler yapılacak, neler yapılacak" },
    { id: 4, no: "KAB01", tur: "B", isim: "B-Kalıp yapılması", olcu: "kalıp gören bütün beton yüzeyler ölçülecektir", tarif: "kalıpların üzerlerine iyice yağ sürülecek ve kalıp ustaları tarafından döşenecek, güzelce beklenecek, akşamdan ıslatılsa daha iyi olur, neler yapılacak, neler yapılacak", tarif2: "kalıpların üzerlerine iyice yağ sürülecek ve kalıp ustaları tarafından döşenecek, güzelce beklenecek, akşamdan ıslatılsa daha iyi olur, neler yapılacak, neler yapılacak", tarif3: "kalıpların üzerlerine iyice yağ sürülecek ve kalıp ustaları tarafından döşenecek, güzelce beklenecek, akşamdan ıslatılsa daha iyi olur, neler yapılacak, neler yapılacak" },
    { id: 5, no: "KAB02", tur: "B", isim: "B-Beton yapılması", olcu: "kalıp gören bütün beton yüzeyler ölçülecektir", tarif: "kalıpların üzerlerine iyice yağ sürülecek ve kalıp ustaları tarafından döşenecek, güzelce beklenecek, akşamdan ıslatılsa daha iyi olur, neler yapılacak, neler yapılacak", tarif2: "kalıpların üzerlerine iyice yağ sürülecek ve kalıp ustaları tarafından döşenecek, güzelce beklenecek, akşamdan ıslatılsa daha iyi olur, neler yapılacak, neler yapılacak", tarif3: "kalıpların üzerlerine iyice yağ sürülecek ve kalıp ustaları tarafından döşenecek, güzelce beklenecek, akşamdan ıslatılsa daha iyi olur, neler yapılacak, neler yapılacak" },
    { id: 6, no: "KAB03", tur: "B", isim: "B-Demir Döşenmesi", olcu: "kalıp gören bütün beton yüzeyler ölçülecektir", tarif: "kalıpların üzerlerine iyice yağ sürülecek ve kalıp ustaları tarafından döşenecek, güzelce beklenecek, akşamdan ıslatılsa daha iyi olur, neler yapılacak, neler yapılacak", tarif2: "kalıpların üzerlerine iyice yağ sürülecek ve kalıp ustaları tarafından döşenecek, güzelce beklenecek, akşamdan ıslatılsa daha iyi olur, neler yapılacak, neler yapılacak", tarif3: "kalıpların üzerlerine iyice yağ sürülecek ve kalıp ustaları tarafından döşenecek, güzelce beklenecek, akşamdan ıslatılsa daha iyi olur, neler yapılacak, neler yapılacak" },
    { id: 7, no: "KAB03", tur: "B", isim: "B-Demir Döşenmesi", olcu: "kalıp gören bütün beton yüzeyler ölçülecektir", tarif: "kalıpların üzerlerine iyice yağ sürülecek ve kalıp ustaları tarafından döşenecek, güzelce beklenecek, akşamdan ıslatılsa daha iyi olur, neler yapılacak, neler yapılacak", tarif2: "kalıpların üzerlerine iyice yağ sürülecek ve kalıp ustaları tarafından döşenecek, güzelce beklenecek, akşamdan ıslatılsa daha iyi olur, neler yapılacak, neler yapılacak", tarif3: "kalıpların üzerlerine iyice yağ sürülecek ve kalıp ustaları tarafından döşenecek, güzelce beklenecek, akşamdan ıslatılsa daha iyi olur, neler yapılacak, neler yapılacak" },
  ]

  const TableItem = styled('div')(({ index, count_ }) => ({
    borderTop: "solid black 1px",
    borderRight: "solid black 1px",
    borderBottom: index + 1 == count_ ? "solid black 1px" : null
  }));

  let gridTemplateColumns_ = "5rem 15rem 30rem 25rem"

  return (

    <Box sx={{ pt: "1rem", pl: "1rem", pr: "1rem" }}>

      {/* BAŞLIKLAR -  SATIRI */}
      <Grid
        sx={{
          pb: "1rem",
          display: "grid",
          gridTemplateColumns: gridTemplateColumns_,
        }}
      >
        {basliklar.map((oneBaslik, index) => {
          return (
            <Box key={index} sx={{ backgroundColor: "lightgrey", fontWeight: "bold", border, borderRight: index + 1 == basliklar.length ? "solid black 1px" : "0px" }}>
              {oneBaslik.isim}
            </Box>
          )
        })}
      </Grid>


      {/* HAYALET */}
      {<Box sx={{ display: "none" }}>
        {/* {pozlar_ = pozlar.filter(item => item.tur == "A")} */}
        {setPozlarr(item => pozlar)}
        {/* {count_ = pozlarr.length} */}
      </Box>}

      {/* POZLAR - SATIR SATIR */}
      {pozlar.map((onePoz, index) => {
        return (
          <Grid
            key={index}
            sx={{
              display: "grid",
              gridTemplateColumns: gridTemplateColumns_,
            }}
          >
            <TableItem index={index} count_={count_} sx={{ borderLeft }}>
              {onePoz.no}
            </TableItem>
            <TableItem index={index} count_={count_}>
              {onePoz.isim}
            </TableItem>
            <TableItem index={index} count_={count_}>
              {onePoz.tarif}
            </TableItem>
            <TableItem index={index} count_={count_}>
              {onePoz.olcu}
            </TableItem >
          </Grid>
        )
      })}


    </Box>

  )

}



{/* <TableItem sx={{ borderTop, borderLeft, borderBottom: index + 1 == pozlar.length ? borderBottom : null }}>
{onePoz.tarif}
</TableItem> */}
