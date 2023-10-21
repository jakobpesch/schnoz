import { Box, useToken } from "@chakra-ui/react"
import { NextPage } from "next"

import { MapControls, useTexture } from "@react-three/drei"
import { Canvas, GroupProps, ThreeElements } from "@react-three/fiber"
import { buildTileLookupId, coordinatesAreEqual } from "coordinate-utils"
import { Tile, Unit } from "database"
import { useEffect, useRef } from "react"
import * as THREE from "three"
import { TileWithUnit } from "types"
import { RenderSettings } from "../../services/SettingsService"
import {
  getPlayerNumber,
  setHoveredCoordinate,
  setTilesWithUnits,
  useStore,
} from "../../store"
export const LAYERS = {
  BASE: 0,
  TERRAIN: 1,
  TERRAIN_HIGHLIGHT: 2,
  UNITS: 3,
  UNITS_HIGHLIGHT: 4,
  CAMERA: 50,
} as const

export const TileMesh = (
  props: ThreeElements["mesh"] & {
    tile: TileWithUnit
  },
) => {
  const { tile, ...rest } = props
  const ref = useRef<THREE.Mesh>(null!)
  const green200 = useToken("colors", "green.200")

  return (
    <mesh {...rest} ref={ref} visible={tile.visible}>
      <planeGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        color={(tile.row + tile.col) % 2 === 0 ? green200 : "#80e0a2"}
      />
    </mesh>
  )
}

export const HighlightMesh = (
  props: ThreeElements["mesh"] & {
    opacity?: number
    color?: string
  },
) => {
  const { opacity = 1, color = "white", ...rest } = props
  const ref = useRef<THREE.Mesh>(null!)
  return (
    <mesh {...rest} ref={ref}>
      <circleGeometry args={[0.4, 8]} />
      <meshStandardMaterial
        opacity={opacity}
        transparent={opacity < 1}
        color={color}
      />
    </mesh>
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
  const { tilesWithUnits } = useStore()
  const updatedTilesWithUnits = useStore((state) => state.updatedTilesWithUnits)
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

  return (
    <mesh
      {...rest}
      ref={ref}
      rotation={[0, 0, (-30 * Math.PI) / 180]}
      visible={tile.visible}
    >
      <circleGeometry
        args={[
          0.5,
          tile.terrain === "STONE" ? 5 : tile.terrain === "TREE" ? 3 : 7,
        ]}
      />
      <meshStandardMaterial
        opacity={opacity}
        transparent={opacity < 1}
        color={
          tile.terrain === "STONE"
            ? "gray"
            : tile.terrain === "TREE"
            ? "green"
            : "blue"
        }
      />
    </mesh>
  )
}

export const Units = () => {
  const { tilesWithUnits } = useStore()
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
  const { tilesWithUnits } = useStore()
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
  const { tilesWithUnits } = useStore()
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
  const { onTileClick } = props
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
