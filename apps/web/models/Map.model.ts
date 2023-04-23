import mongoose from "mongoose"
import { tileSchema, ITile } from "./Tile.model"

export interface IMap {
  rowCount: number
  columnCount: number
  tiles: ITile[]
}

export interface IMapDoc extends IMap, Document {}

export const mapSchema = new mongoose.Schema({
  rowCount: Number,
  columnCount: Number,
  tiles: {
    type: Array,
    items: tileSchema,
  },
})

export default mongoose.models["Map"] || mongoose.model("Map", mapSchema)
