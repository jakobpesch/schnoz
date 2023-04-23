import mongoose from "mongoose"
import { ITile, tileSchema } from "./Tile.model"
import { IUnitConstellation } from "./UnitConstellation.model"

export interface IMove {
  tileId: ITile["id"]
  userId: string
  unitConstellation: IUnitConstellation
}

export interface IMoveDoc extends IMove, Document {}

const moveSchema = new mongoose.Schema({
  tileId: tileSchema,
})

export default mongoose.models["Move"] || mongoose.model("Move", moveSchema)
