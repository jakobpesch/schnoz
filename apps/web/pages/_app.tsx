import {
  ChakraProvider,
  theme as defaultTheme,
  extendTheme,
} from "@chakra-ui/react"
import { Globals } from "@react-spring/shared"
import type { AppProps } from "next/app"
import { AuthProvider } from "../hooks/useAuth"
import "../styles/globals.css"
import { SoundProvider } from "../providers/SoundProvider"
import { MaterialProvider } from "../providers/MaterialProvider"

Globals.assign({
  frameLoop: "always",
})

const config = {
  ...defaultTheme.config,
  initialColorMode: "dark",
  useSystemColorMode: false,
}

const theme = extendTheme({ ...defaultTheme, config })

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={theme}>
      <AuthProvider>
        <SoundProvider>
          <Component {...pageProps} />
        </SoundProvider>
      </AuthProvider>
    </ChakraProvider>
  )
}

export default MyApp
