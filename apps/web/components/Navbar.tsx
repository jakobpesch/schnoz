import { Button, HStack, Heading, Spacer, Text } from "@chakra-ui/react"
import { DonateButton } from "./DonateButton"
import { FC } from "react"
import useAuth from "../hooks/useAuth"
import Link from "next/link"

export const Navbar: FC = () => {
  const { profile, logout } = useAuth()
  const isGuestUser = profile?.email === null
  return (
    <HStack
      align="center"
      justify="center"
      position="fixed"
      width="100vw"
      height="16"
      top="0"
      left="0"
      paddingX="4"
      paddingY="2"
      backgroundColor="gray.900"
      borderBottomWidth="1px"
      borderBottomColor="gray.700"
    >
      <Heading
        lineHeight="40px"
        fontFamily="Geodesic"
        fontSize="40px"
        color="teal.300"
        transform="auto"
        translateY="8px"
      >
        <Link href="/" style={{ userSelect: "none", textDecoration: "none" }}>
          schnoz
        </Link>
      </Heading>
      <Spacer />
      <Text>Hello, {profile?.name}!</Text>
      <Link href="/account">
        <Button size="sm">{isGuestUser ? "Claim Account" : "Account"}</Button>
      </Link>
      {!isGuestUser && (
        <Button size="sm" onClick={logout}>
          Log out
        </Button>
      )}
      <DonateButton />
    </HStack>
  )
}
