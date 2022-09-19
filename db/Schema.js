import mongoose from "mongoose";

var SuccessInLevelsSchema = mongoose.Schema({
    level:Number,
    status:String,
    time:Number,
})

var ClearanceRecordsSchema = mongoose.Schema({
    level:Number,
    status:String,
    time:Number
})
var SkillUsesSchema = mongoose.Schema({
    skillId:Number,
    uses:Number
})
var ItemInteractions = mongoose.Schema({
    ItemId:Number,
    status:String,
    count:Number
})


export {ClearanceRecordsSchema,SkillUsesSchema}