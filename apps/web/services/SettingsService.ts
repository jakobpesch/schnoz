import { Participant, Rule, Terrain } from "database"
import { StaticImageData } from "next/image"
import bob from "../assets/sprites/bob@640.png"
import background from "../assets/sprites/grass.png"
import house from "../assets/sprites/house.png"
import maurice from "../assets/sprites/maurice.png"
import ulf from "../assets/sprites/ulf.png"
import ruleDiagonal from "../assets/sprites/rule_diagonal_north_east.png"
import ruleHole from "../assets/sprites/rule_hole.png"
import ruleStone from "../assets/sprites/rule_stone.png"
import ruleWater from "../assets/sprites/rule_water.png"
import terrainStone from "../assets/sprites/terrain_stone.png"
import terrainTree from "../assets/sprites/terrain_tree.png"
import terrainWater from "../assets/sprites/terrain_water.png"

export const RenderSettings = {
  tileSize: 50,
  uiScale: 1,
  setUIScale: (scale: number) => {
    RenderSettings.uiScale = scale
  },
  getPlayerAppearance: (playerNumber?: Participant["playerNumber"]) => {
    let unit: StaticImageData
    let color: string
    if (playerNumber === 0) {
      unit = bob
      color = "pink.500"
    } else if (playerNumber === 1) {
      unit = ulf
      color = "teal.500"
    } else {
      unit = house
      color = "gray.700"
    }
    return { unit, color }
  },
  background: background,
  getRuleAppearance: (rule: Rule) => {
    let sprite = ruleWater
    if (rule === "HOLE") {
      sprite = ruleHole
    }
    if (rule === "TERRAIN_STONE_NEGATIVE") {
      sprite = ruleStone
    }
    if (rule === "DIAGONAL_NORTHEAST") {
      sprite = ruleDiagonal
    }
    return sprite
  },
  getTerrainAppearance: (terrain: Terrain) => {
    let sprite = terrainWater
    if (terrain === Terrain.TREE) {
      sprite = terrainTree
    }
    if (terrain === Terrain.STONE) {
      sprite = terrainStone
    }
    return sprite
  },
  getRuleName: (rule: Rule) => {
    let name = "Water D. Law"
    if (rule === "TERRAIN_STONE_NEGATIVE") {
      name = "Stoned"
    }
    if (rule === "HOLE") {
      name = "Glorious Holes"
    }
    if (rule === "DIAGONAL_NORTHEAST") {
      name = "Diagon-Alley"
    }
    return name
  },
}
