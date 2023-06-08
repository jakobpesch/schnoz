import { Box, Tooltip } from "@chakra-ui/react"
import Image from "next/image"
import Link from "next/link"
import KoFiLogo from "../assets/images/kofi_logo.png"

export const DonateButton = () => (
  <Tooltip
    shouldWrapChildren
    hasArrow
    placement="bottom"
    label="Buy me a coffee"
  >
    <Link href="https://ko-fi.com/I2I1FR7RZ" target="_blank">
      <Box cursor="pointer">
        <Image
          src={KoFiLogo}
          alt="Buy Me a Coffee at ko-fi.com"
          width="32"
          height="32"
        />
      </Box>
    </Link>
  </Tooltip>
)
