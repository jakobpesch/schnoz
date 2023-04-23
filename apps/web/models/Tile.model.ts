import mongoose from "mongoose"
import { Terrain } from "./Terrain.model"
import { IUnit, unitSchema } from "./Unit.model"

export interface ITile {
  id: string
  row: number
  col: number
  unit?: IUnit
  terrain?: Terrain
}

export interface ITileDoc extends ITile, Document {}

export const tileSchema = new mongoose.Schema({
  id: String,
  row: Number,
  col: Number,
  unit: unitSchema,
  terrain: String,
})

export default mongoose.models["Tile"] || mongoose.model("Tile", tileSchema)
