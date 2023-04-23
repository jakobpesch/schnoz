import mongoose from "mongoose"

export type UnitType = "playerUnit" | "mainBuilding"
export interface IUnit {
  playerId?: string
  type: UnitType
}

export interface IUnitDoc extends IUnit, Document {}

export const unitSchema = new mongoose.Schema({
  playerId: String,
  type: String,
})

export default mongoose.models["Unit"] || mongoose.model("Unit", unitSchema)
