import mongoose from "mongoose";

var PeopleEnterSuccessSchema = mongoose.Schema({
    level:Number,
    status:String,//enter or complete
})

var GearUsesSchema = mongoose.Schema({
    gearId:Number,
    status:String
})

var GearObtainsSchema = mongoose.Schema({
    gearId:Number
})

var HpofEnemySchema = mongoose.Schema({
    userId:String,
    enemyId:Number,
    hp:Number
})

var HitofBallsSchema = mongoose.Schema({
    ballId:Number,
    hitCount:Number
})


export {PeopleEnterSuccessSchema,
        GearUsesSchema,
        GearObtainsSchema,
        HpofEnemySchema,
        HitofBallsSchema
}