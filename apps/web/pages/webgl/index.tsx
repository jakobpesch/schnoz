import { Box, useToken } from "@chakra-ui/react"
import { MapControls, useTexture } from "@react-three/drei"
import { Canvas, GroupProps, ThreeElements } from "@react-three/fiber"
import { buildTileLookupId, coordinatesAreEqual } from "coordinate-utils"
import { Tile, Unit } from "database"
import { NextPage } from "next"
import { useEffect, useRef } from "react"
import * as THREE from "three"
import { TileWithUnit } from "types"
import grassNormal from "../../assets/textures/grass.map.jpeg"
import groundNormal from "../../assets/textures/ground.map.png"
import waterNormal from "../../assets/textures/water.map.jpeg"
import groundNormal2 from "../../assets/textures/ground2.map.jpeg"
import { RenderSettings } from "../../services/SettingsService"
import { animated, config, useSpring } from "@react-spring/three"
import {
  getPlayerNumber,
  setHoveredCoordinate,
  setTilesWithUnits,
  useMatchStore,
} from "../../store"
export const LAYERS = {
  BASE: 0,
  TERRAIN: 0.01,
  TERRAIN_HIGHLIGHT: 0.02,
  UNITS: 0.03,
  UNITS_HIGHLIGHT: 0.04,
  LIGHTING: 25,
  CAMERA: 50,
} as const

export const TileMesh = (
  props: ThreeElements["mesh"] & {
    tile: TileWithUnit
  },
) => {
  const { tile, ...rest } = props
  const ref = useRef<THREE.Mesh>(null!)
  const { map } = useTexture({
    map: groundNormal.src,
  })
  //create a typed array to hold texture data
  const mask = [
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0,
    0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1,
  ]
  const data = new Uint8Array(mask.length)
  //copy mask into the typed array
  data.set(mask.map((v) => v * 255))
  return (
    <mesh {...rest} ref={ref} visible={tile.visible} receiveShadow>
      <planeGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        alphaMap={
          new THREE.DataTexture(
            data,
            8,
            8,
            THREE.LuminanceFormat,
            THREE.UnsignedByteType,
          )
        }
        normalMap={map}
        normalScale={new THREE.Vector2(1, 1)}
        color={new THREE.Color("hsl(120, 25%,25%)")}
        // color={(tile.row + tile.col) % 2 === 0 ? "#268b07" : "#41980a"}
      />
    </mesh>
  )
}

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

export const HighlightCircle = (props: ThreeElements["rectAreaLight"]) => {
  const ref = useRef<THREE.RectAreaLight>(null!)
  const [springs, api] = useSpring(() => ({
    from: {
      intensity: 10,
      scale: 8,
    },
    to: {
      intensity: 8,
      scale: 1,
    },
    loop: { reverse: true },
    config: {
      ...config.molasses,
      tension: 50,
      friction: 100,
      precision: 0.001,
    },
  }))
  return (
    <animated.rectAreaLight
      ref={ref}
      width={0.4}
      height={0.4}
      scale={springs.scale}
      intensity={springs.intensity}
      // @ts-ignore
      rotation={springs.rotation}
      {...props}
    >
      {/* <mesh>
        <planeGeometry args={[1]} />
        <meshStandardMaterial
          opacity={opacity}
          transparent={opacity < 1}
          color={color}
        />
      </mesh> */}
    </animated.rectAreaLight>
  )
}

export const UnitMesh = (
  props: ThreeElements["sprite"] & {
    unit: Unit
    opacity?: number
  },
) => {
  const { unit, opacity = 1, ...rest } = props
  const ref = useRef<THREE.Sprite>(null!)
  const { map } = useTexture({
    map: RenderSettings.getPlayerAppearance(getPlayerNumber(unit.ownerId)).unit
      .src,
  })
  return (
    <sprite {...rest} ref={ref}>
      <spriteMaterial map={map} opacity={opacity} />
    </sprite>
  )
}

export const Tiles = (props: GroupProps) => {
  const tilesWithUnits = useMatchStore((state) => state.tilesWithUnits)
  const updatedTilesWithUnits = useMatchStore(
    (state) => state.updatedTilesWithUnits,
  )
  useEffect(() => {
    if (!updatedTilesWithUnits || !tilesWithUnits) {
      return
    }
    const tilesWithUnitsClone = [...tilesWithUnits]
    updatedTilesWithUnits.forEach((updatedTileWithUnit) => {
      const index = tilesWithUnits?.findIndex((t) =>
        coordinatesAreEqual(
          [t.row, t.col],
          [updatedTileWithUnit.row, updatedTileWithUnit.col],
        ),
      )
      if (!index) {
        tilesWithUnitsClone.push(updatedTileWithUnit)
        return
      }
      tilesWithUnitsClone[index] = updatedTileWithUnit
    })
    setTilesWithUnits(tilesWithUnitsClone)
  }, [updatedTilesWithUnits])

  return (
    <group
      {...props}
      position={new THREE.Vector3()}
      onPointerLeave={() => setHoveredCoordinate(null)}
    >
      {tilesWithUnits?.map((tile) => {
        const key = [tile.row, tile.col].join(",")
        return (
          <TileMesh
            key={key}
            tile={tile}
            position={[tile.col, -tile.row, LAYERS.BASE]}
            onPointerEnter={() => {
              setHoveredCoordinate([tile.row, tile.col])
            }}
          />
        )
      })}
    </group>
  )
}

export const TerrainMesh = (
  props: ThreeElements["mesh"] & {
    tile: Tile
    opacity?: number
  },
) => {
  const { tile, opacity = 1, ...rest } = props
  const ref = useRef<THREE.Mesh>(null!)
  const { map: waterMap } = useTexture({
    map: waterNormal.src,
  })
  const { map: ground2Map } = useTexture({
    map: groundNormal2.src,
  })

  const stoneSides = 5 + Math.floor((tile.col / tile.row) * 2)
  console.log(stoneSides)

  return (
    <mesh {...rest} ref={ref} visible={tile.visible} castShadow>
      {tile.terrain === "STONE" ? (
        <sphereGeometry args={[0.1, stoneSides, stoneSides]} />
      ) : tile.terrain === "TREE" ? (
        <sphereGeometry args={[0.1, 64, 64]} />
      ) : (
        <planeGeometry args={[0.8, 0.8]} />
      )}

      <meshStandardMaterial
        opacity={opacity}
        transparent={opacity < 1}
        normalMap={tile.terrain === "WATER" ? waterMap : null}
        displacementMap={ground2Map}
        color={
          tile.terrain === "STONE"
            ? "gray"
            : tile.terrain === "TREE"
            ? "darkgreen"
            : "blue"
        }
      />
    </mesh>
  )
}

export const Units = () => {
  const { tilesWithUnits } = useMatchStore()
  if (!tilesWithUnits) {
    return null
  }
  const units: Unit[] = tilesWithUnits
    .filter((tile) => tile.unit)
    .map((tile) => tile.unit) as Unit[]
  return (
    <group position={new THREE.Vector3()}>
      {units.map((unit) => {
        return (
          <UnitMesh
            key={unit.id}
            unit={unit}
            position={[unit.col, -unit.row, LAYERS.UNITS]}
          />
        )
      })}
    </group>
  )
}

export const Terrains = () => {
  const { tilesWithUnits } = useMatchStore()
  if (!tilesWithUnits) {
    return null
  }
  return (
    <group position={new THREE.Vector3()}>
      {tilesWithUnits
        .filter((tile) => tile.terrain)
        .map((tile) => {
          return (
            <TerrainMesh
              key={buildTileLookupId([tile.row, tile.col])}
              tile={tile}
              position={[tile.col, -tile.row, LAYERS.TERRAIN]}
            />
          )
        })}
    </group>
  )
}

export const HoveredUnits = (props: { units: Unit[] }) => {
  const { units } = props
  const { tilesWithUnits } = useMatchStore()
  if (!tilesWithUnits) {
    return null
  }

  return (
    <group position={new THREE.Vector3()}>
      {units.map((unit) => {
        return (
          <UnitMesh
            key={unit?.id}
            unit={unit}
            position={[unit.col, -unit.row, LAYERS.BASE]}
          />
        )
      })}
    </group>
  )
}

export const Scene = (props: { onTileClick: (tile: TileWithUnit) => void }) => {
  return (
    <Canvas
      orthographic
      camera={{
        position: [0, 0, LAYERS.CAMERA],
        zoom: 10,
        up: [0, 0, 1],
        far: 10000,
      }}
    >
      <ambientLight />
      <pointLight position={[0, 0, 10]} />

      <Tiles />
      <Units />

      <MapControls zoomSpeed={0.5} />
    </Canvas>
  )
}

const WebGLPage: NextPage = () => {
  return (
    <Box height="100vh" width="100vw" backgroundColor={"blue"}>
      <Scene onTileClick={(tile) => {}} />
    </Box>
  )
}
export default WebGLPage
