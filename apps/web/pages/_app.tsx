import {
  ChakraProvider,
  theme as defaultTheme,
  extendTheme,
} from "@chakra-ui/react"
import { StoreProvider } from "easy-peasy"
import type { AppProps } from "next/app"
import { store } from "../store"
import "../styles/globals.css"
import { AuthProvider } from "../hooks/useAuth"

const config = {
  ...defaultTheme.config,
  initialColorMode: "dark",
  useSystemColorMode: false,
}

const theme = extendTheme({ ...defaultTheme, config })

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={theme}>
      <StoreProvider store={store}>
        <AuthProvider>
          <Component {...pageProps} />
        </AuthProvider>
      </StoreProvider>
    </ChakraProvider>
  )
}

export default MyApp
