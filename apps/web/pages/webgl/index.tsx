import { Box } from "@chakra-ui/react"
import { ThreeElements } from "@react-three/fiber"
import { NextPage } from "next"
import { useRef } from "react"
import * as THREE from "three"
export const LAYERS = {
  BASE: 0,
  TILE: 0.01,
  TERRAIN: 0.02,
  TERRAIN_HIGHLIGHT: 0.03,
  UNITS: 0.04,
  FOG: 0.05,
  UNITS_HIGHLIGHT: 0.06,
  LIGHTING: 25,
  CAMERA: 50,
} as const

export const HighlightSquare = (
  props: ThreeElements["mesh"] & {
    opacity?: number
    color?: string
    size?: number
  },
) => {
  const { opacity = 1, color = "white", size = 1, ...rest } = props
  const ref = useRef<THREE.Mesh>(null!)

  return (
    <mesh {...rest} ref={ref}>
      <planeGeometry args={[size]} />
      <meshStandardMaterial
        opacity={opacity}
        transparent={opacity < 1}
        color={color}
      />
    </mesh>
  )
}

const WebGLPage: NextPage = () => {
  return <Box height="100vh" width="100vw" backgroundColor={"blue"}></Box>
}
export default WebGLPage
