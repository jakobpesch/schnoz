import {
  ChakraProvider,
  theme as defaultTheme,
  extendTheme,
} from "@chakra-ui/react"
import { StoreProvider } from "easy-peasy"
import type { AppProps } from "next/app"
import { store } from "../store"
import "../styles/globals.css"
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
