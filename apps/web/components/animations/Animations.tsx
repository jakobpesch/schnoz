import { removeAnimationObject, useMatchStore } from "../../store"
import { PlusOneAnimation } from "./PlusOneAnimation"
import { useScoreAnimation } from "./useScoreAnimation"

export const Animations = () => {
  useScoreAnimation()
  const animationObjects = useMatchStore((state) => state.animationObjects)
  const handleDestroy = (objectId: (typeof animationObjects)[number]["id"]) => {
    removeAnimationObject(objectId)
  }
  // return (
  //   <PlusOneAnimation
  //     key={"1"}
  //     animationObject={{ id: "1", position: [15, 15] }}
  //   />
  // )
  // console.log(animationObjects)

  return Object.values(animationObjects).map((obj) => (
    <PlusOneAnimation
      key={obj.id}
      animationObject={obj}
      onFinished={() => handleDestroy(obj.id)}
    />
  ))
}
