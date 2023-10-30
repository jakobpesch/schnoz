import { animated, config, useSpring } from "@react-spring/three"
import { Text } from "@react-three/drei"
import { useEffect } from "react"
import { Vector3 } from "three"
import { LAYERS } from "../../pages/webgl"
import { useSound } from "../../providers/SoundProvider"
import { AnimationObject } from "../../store"

export const PlusOneAnimation = (props: {
  animationObject: AnimationObject
  onFinished?: () => void
}) => {
  const { playSFX } = useSound()
  const {
    animationObject: {
      id,
      position: [row, col],
    },
    onFinished,
  } = props

  useEffect(() => {
    playSFX("coin")
  }, [])

  const [springs, api] = useSpring(
    () => ({
      from: {
        opacity: 0,
        intensity: 0,
        scale: 0.1,
        position: [col, -row, LAYERS.UNITS_HIGHLIGHT],
        color: "#ff6d6d",
      },
      to: async (next, cancel) => {
        await next({
          opacity: 1,
          intensity: 5,
          position: [col, -row + 1, LAYERS.UNITS_HIGHLIGHT],
          scale: 0.4,
        })
        await next({
          opacity: 0,
          intensity: 0,
          position: [col, -row + 1.2, LAYERS.UNITS_HIGHLIGHT],
          config: { duration: 200 },
        })
        onFinished?.()
      },
      // loop: {
      //   reverse: false,
      // },

      config: (key) => {
        switch (key) {
          case "scale":
            return config.stiff
          case "position":
            return config.molasses
          case "opacity":
            return config.gentle
          default:
            return {}
        }
      },
    }),
    [],
  )

  const AnimText = animated(Text)
  return (
    // @ts-ignore: Spring type is Vector3 Type (Typescript return error on position)
    <animated.group scale={springs.scale} position={springs.position}>
      <animated.pointLight intensity={springs.intensity} />
      <mesh>
        <circleGeometry args={[0.8, 64, 64]} />
        {
          /* @ts-ignore: Type instantiation is excessively deep and possibly infinite */
          <animated.meshStandardMaterial
            opacity={springs.opacity}
            transparent
            color="#F4BF96"
          />
        }
      </mesh>
      <mesh>
        <ringGeometry args={[0.7, 0.8]} />
        {
          /* @ts-ignore: Type instantiation is excessively deep and possibly infinite */
          <animated.meshStandardMaterial
            opacity={springs.opacity}
            transparent
            color="#F9B572"
          />
        }
      </mesh>
      <AnimText
        position={new Vector3(0, -0.1, 0)}
        fontSize={0.8}
        scale={new Vector3(1, 0.9, 0)}
        fillOpacity={springs.opacity}
        color={"black"}
      >
        +1
      </AnimText>
    </animated.group>
  )
}
