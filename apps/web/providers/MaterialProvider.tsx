import { useTexture } from "@react-three/drei"
import { ReactNode, createContext, useContext } from "react"
import {
  CircleGeometry,
  MeshStandardMaterial,
  PlaneGeometry,
  RingGeometry,
  SpriteMaterial,
} from "three"
import bob from "../assets/sprites/bob@320.png"
import house from "../assets/sprites/house.png"
import ulf from "../assets/sprites/ulf.png"

interface MaterialContextType {
  bobSpriteMaterial: SpriteMaterial
  bobTransparentSpriteMaterial: SpriteMaterial
  ulfSpriteMaterial: SpriteMaterial
  ulfTransparentSpriteMaterial: SpriteMaterial
  mainBuildingSpriteMaterial: SpriteMaterial
  tilePlaneGeometry: PlaneGeometry
  tileZeroOpacityMeshMaterial: MeshStandardMaterial
  tileMeshMaterial: MeshStandardMaterial
  stoneMaterial: MeshStandardMaterial
  stoneGeometry: CircleGeometry
  treeMaterial: MeshStandardMaterial
  treeGeometry: CircleGeometry
  waterMaterial: MeshStandardMaterial
  waterGeometry: RingGeometry
  placeableHighlightMaterial: MeshStandardMaterial
  placeableHighlightGeometry: RingGeometry
}

//<rectAreaLight width={0.6} height={0.6} intensity={1} {...props}>

const MaterialContext = createContext<MaterialContextType | undefined>(
  undefined,
)

export function useMaterial() {
  const context = useContext(MaterialContext)
  if (!context) {
    throw new Error("useMaterial must be used within a MaterialProvider")
  }
  return context
}

interface MaterialProviderProps {
  children: ReactNode
}

export function MaterialProvider({ children }: MaterialProviderProps) {
  const { map: bobColorMap } = useTexture({
    map: bob.src,
  })
  const bobSpriteMaterial = new SpriteMaterial({ map: bobColorMap })
  const bobTransparentSpriteMaterial = new SpriteMaterial({
    map: bobColorMap,
    opacity: 0.6,
    transparent: true,
  })
  const { map: ulfColorMap } = useTexture({
    map: ulf.src,
  })
  const ulfSpriteMaterial = new SpriteMaterial({ map: ulfColorMap })
  const ulfTransparentSpriteMaterial = new SpriteMaterial({
    map: ulfColorMap,
    opacity: 0.6,
    transparent: true,
  })
  const { map: mainBuildingMaterial } = useTexture({
    map: house.src,
  })
  const mainBuildingSpriteMaterial = new SpriteMaterial({
    map: mainBuildingMaterial,
    color: "white",
  })

  const tilePlaneGeometry = new PlaneGeometry(1, 1)
  const tileZeroOpacityMeshMaterial = new MeshStandardMaterial({
    opacity: 0,
    transparent: true,
  })
  const tileMeshMaterial = new MeshStandardMaterial({
    opacity: 0.02,
    transparent: true,
    color: "black",
  })
  const stoneMaterial = new MeshStandardMaterial({ color: "#393646" })
  const stoneGeometry = new CircleGeometry(0.4, 5, 3)
  const treeMaterial = new MeshStandardMaterial({ color: "#4F6F52" })
  const treeGeometry = new CircleGeometry(0.45, 3, 3)
  const waterMaterial = new MeshStandardMaterial({ color: "#6499E9" })
  const waterGeometry = new RingGeometry(0.1, 0.4, 12)
  const placeableHighlightGeometry = new RingGeometry(0.1, 0.4, 4)
  const placeableHighlightMaterial = new MeshStandardMaterial({
    opacity: 0.05,
    transparent: true,
    color: "yellow",
  })
  const value: MaterialContextType = {
    bobSpriteMaterial,
    bobTransparentSpriteMaterial,
    ulfSpriteMaterial,
    ulfTransparentSpriteMaterial,
    mainBuildingSpriteMaterial,
    tilePlaneGeometry,
    tileZeroOpacityMeshMaterial,
    tileMeshMaterial,
    stoneMaterial,
    stoneGeometry,
    treeMaterial,
    treeGeometry,
    waterMaterial,
    waterGeometry,
    placeableHighlightMaterial,
    placeableHighlightGeometry,
  }

  return (
    <MaterialContext.Provider value={value}>
      {children}
    </MaterialContext.Provider>
  )
}