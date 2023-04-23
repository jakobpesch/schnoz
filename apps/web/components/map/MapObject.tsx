import { Heading, HeadingProps } from "@chakra-ui/react"

interface MapObjectProps extends HeadingProps {
  /** Should be an emoji for prettiness */
  object: string
}
export const MapObject = (props: MapObjectProps) => {
  const { object, ...headingProps } = props
  return (
    <Heading
      textShadow="1px 1px 0px white,-1px -1px 0px white,1px -1px 0px white,-1px 1px 0px white;"
      {...headingProps}
    >
      {object}
    </Heading>
  )
}
