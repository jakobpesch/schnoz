import "../styles/globals.css"
import type { AppProps } from "next/app"
import { ChakraProvider, extendTheme } from "@chakra-ui/react"
import { theme as defaultTheme } from "@chakra-ui/react"
import { useEffect } from "react"
import { SocketIOApi } from "../services/SocketService"
import { StoreProvider } from "easy-peasy"
import { store } from "../store"
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
        <Component {...pageProps} />
      </StoreProvider>
    </ChakraProvider>
  )
}

export default MyApp
