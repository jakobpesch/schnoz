import { Circle, Flex, HStack, Stack, Text } from "@chakra-ui/react"
import { viewFactorWidth } from "./UIScoreView"

export const UIBonusPointsView = (props: { bonusPoints: number }) => {
  return (
    <Flex position="fixed" top={viewFactorWidth(100)} left="0">
      <Stack
        bg="gray.700"
        borderWidth={viewFactorWidth(1)}
        borderRadius={viewFactorWidth(10)}
        spacing={viewFactorWidth(16)}
        p={viewFactorWidth(10)}
        m={viewFactorWidth(10)}
        maxWidth="50vw"
        overflowX="hidden"
      >
        <HStack position="relative" spacing={viewFactorWidth(16)}>
          <Circle size={viewFactorWidth(30)} bg="yellow.400">
            <Text
              fontSize={viewFactorWidth(20)}
              fontWeight="bold"
              color="yellow.800"
            >
              {props.bonusPoints}
            </Text>
          </Circle>
        </HStack>
      </Stack>
    </Flex>
  )
}
