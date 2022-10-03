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
var ItemInteractionsSchema = mongoose.Schema({
    itemId:Number,
    status:String,
    count:Number
})
var HpofEnemySchema = mongoose.Schema({
    userId:String,
    enemyId:Number,
    hp:Number
})

var PeopleEnterSuccessSchema = mongoose.Schema({
    level:Number,
    status:String,//enter/complete
})


export {ClearanceRecordsSchema,SkillUsesSchema,ItemInteractionsSchema,HpofEnemySchema}