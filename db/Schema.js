import mongoose from "mongoose";

var PeopleEnterSuccessSchema = mongoose.Schema({
    level:Number,
    status:String,//enter or complete
})
var GearShowsSchema = mongoose.Schema({
    gearId:Number
})

var GearObtainsSchema = mongoose.Schema({
    gearId:Number
})

var GearUsesSchema = mongoose.Schema({
    gearId:Number,
    status:String
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
        GearShowsSchema,
        GearObtainsSchema,
        GearUsesSchema,
        HpofEnemySchema,
        HitofBallsSchema
}
