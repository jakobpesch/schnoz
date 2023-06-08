import { Flex } from "@chakra-ui/react"
import type { NextPage } from "next"

import { MatchesList } from "../components/MatchesList"
import { Navbar } from "../components/Navbar"

const Home: NextPage = () => {
  return (
    <Flex
      flexDir="column"
      marginTop="16"
      paddingTop="8"
      width="full"
      boxSizing="border-box"
      justify="start"
      align="center"
    >
      <MatchesList />
      <Navbar />
    </Flex>
  )
}

export default Home
