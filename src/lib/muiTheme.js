import { createTheme } from '@mui/material/styles'

const grayTheme = createTheme({
  palette: {
    primary: {
      main: '#3D4849',
      light: '#616E6F',
      dark: '#2A3233',
      contrastText: '#fff',
    },
    secondary: {
      main: '#52525b',
      light: '#71717a',
      dark: '#3f3f46',
      contrastText: '#fff',
    },
  },
})

export default grayTheme
