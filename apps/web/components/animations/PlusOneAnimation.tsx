import { animated, config, useSpring } from "@react-spring/three"
import { Text } from "@react-three/drei"
import { useRef } from "react"
import { Vector2, Vector3 } from "three"
import { LAYERS } from "../../pages/webgl"
import { AnimationObject } from "../../store"

export const PlusOneAnimation = (props: {
  animationObject: AnimationObject
  onFinished?: () => void
}) => {
  const {
    animationObject: {
      id,
      position: [row, col],
    },
    onFinished,
  } = props
  const [springs, api] = useSpring(
    () => ({
      from: {
        opacity: 0,
        scale: 0.1,
        position: [col, -row, LAYERS.UNITS_HIGHLIGHT],
        color: "#ff6d6d",
      },
      to: async (next, cancel) => {
        await next({
          opacity: 1,
          position: [col, -row + 1, LAYERS.UNITS_HIGHLIGHT],
          scale: 0.4,
        })
        await next({
          opacity: 0,
          position: [col, -row + 0.8, LAYERS.UNITS_HIGHLIGHT],
          config: { duration: 200 },
        })
        onFinished?.()
      },
      loop: {
        reverse: false,
      },

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
      {
        <animated.pointLight
          intensity={0.3}
          // @ts-ignore: Spring type is Vector3 Type (Typescript return error on position)
          // position={springs.position}
          position={new Vector3(0.2, 0.2, 0.2)}
          color={"yellow"}
        ></animated.pointLight>
      }
      <mesh>
        <circleGeometry args={[0.8, 64, 64]} />
        {
          /* @ts-ignore: Type instantiation is excessively deep and possibly infinite */
          <animated.meshStandardMaterial
            opacity={springs.opacity}
            transparent
            color="#FFD700"
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
            color="#eeff00"
          />
        }
      </mesh>
      <AnimText
        position={new Vector3(0, -0.1, 0)}
        fontSize={0.8}
        scale={new Vector3(1, 0.9, 0)}
        fillOpacity={springs.opacity}
        color={"#ff4400"}
      >
        +1
      </AnimText>
    </animated.group>
  )
}
