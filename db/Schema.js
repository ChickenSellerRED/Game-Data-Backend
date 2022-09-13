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
    itemId:Number,
    uses:Number
})


export {ClearanceRecordsSchema}