import express from 'express'
import bodyParser from 'body-parser'
import dotenv from "dotenv"
import mongoose from "mongoose"
import path from 'path';
import {PeopleEnterSuccessSchema,
    GearShowsSchema,
    GearObtainsSchema,
    GearUsesSchema,
    HpofEnemySchema,
    HitofBallsSchema} from "./db/Schema.js"

const __dirname = path.resolve();
dotenv.config()
mongoose.connect(process.env.MONGO_URI)
const app = express();
app.use(bodyParser.json())
const port = 8080;

let PeopleEnterSuccess = mongoose.model('PeopleEnterSuccess',PeopleEnterSuccessSchema,'PeopleEnterSuccesses')
let GearShow = mongoose.model('GearShow',GearShowsSchema,'GearShows')
let GearObtain = mongoose.model('GearObtain',GearObtainsSchema,'GearObtains')
let GearUse = mongoose.model('GearUse',GearUsesSchema,'GearUses')
let HpofEnemy = mongoose.model('HpofEnemy',HpofEnemySchema,'HpofEnemys')
let HitofBall = mongoose.model('HitofBall',HitofBallsSchema,'HitofBalls')

function sortByNum(arr){
    arr.sort((a,b)=>{if(a>b)return 1;if(a<b)return -1;return 0;})
    return arr;
}

app.get("/Hello",(req,res)=>{
    console.log(__dirname)
    res.sendFile("1.png",{root:__dirname})
})
app.get("/Plot2",(req,res)=>{
    res.sendFile("timeOfLevels.html",{root:'.'})
})

app.post("/logPeopleEnterSuccesses",async (req,res)=>{
    const level = req.body['level'];
    const status = req.body['status'];
    let peopleEnterSuccess = new PeopleEnterSuccess({level:level,status:status});
    console.log("logPeopleEnterSuccesses:",{level:level,status:status})
    await peopleEnterSuccess.save();
    res.send("success!")
})
app.post("/logGearShows",async (req,res)=>{
    const gearId = req.body['gearId'];
    const gearShow = new GearShow({gearId:gearId});
    console.log("logGearShows:",{gearId:gearId})
    await gearShow.save();
    res.send("success!")
})
app.post("/logGearObtains",async (req,res)=>{
    const gearId = req.body['gearId'];
    const gearObtain = new GearObtain({gearId:gearId});
    console.log("logGearObtains:",{gearId:gearId})
    await gearObtain.save();
    res.send("success!")
})
app.post("/logGearUses",async (req,res)=>{
    const gearId = req.body['gearId'];
    const status = req.body['status'];
    let gearUse = new GearUse({gearId:gearId,status:status});
    console.log("logGearUses:",{gearId:gearId,status:status})
    await gearUse.save();
    res.send("success!")
})
app.post("/logHpofEnemies",async (req,res)=>{
    const userId = req.body['userId'];
    const enemyId = req.body['enemyId'];
    const hp = req.body['hp'];
    let hpofenemy = new HpofEnemy({userId:userId,enemyId:enemyId,hp:hp});
    console.log("logHpofEnemys:",{userId:userId,enemyId:enemyId,hp:hp})
    await hpofenemy.save();
    res.send("success!")
})
app.post("/logHitofBalls",async (req,res)=>{
    const ballId = req.body['ballId'];
    const hitCount = req.body['hitCount'];
    let hitofBall = new HitofBall({ballId:ballId,hitCount:hitCount});
    console.log("logHitofBalls:",{ballId:ballId,hitCount:hitCount})
    await hitofBall.save();
    res.send("success!")
})

app.post("/getPeopleEnterSuccesses",async (req,res)=>{
    let ans = {
        xLabel:[],
        data:[]
    };
    let records;
    await PeopleEnterSuccess.find({})
        .then(data=>{
            records = data;
        })
        .catch(err=>{
            console.log("err:",err)
        })
    let enterMap = new Map();
    let successMap = new Map();
    let sortES = [];
    records.forEach((e)=>{
        if(e.status === 'enter')
            enterMap.set(e.level,(enterMap.get(e.level)||0)+1)
        else if(e.status === 'success')
            successMap.set(e.level,(successMap.get(e.level)||0)+1)
        if(!sortES.includes(e.level))
            sortES.push(e.level);
    })
    sortES = sortByNum(sortES);
    sortES.forEach((level)=>{
        ans.xLabel.push('level '+ level);
        ans.data.push([
            enterMap.get(level)||0,
            successMap.get(level)||0
        ]);
    })
    console.log('getPeopleEnterSuccesses:',ans)
    res.send(ans);
})
app.post("/getGearUses",async (req,res) => {
    let ans = {
        xLabel:[],
        data:[]
    };
    let records;
    await GearUse.find({})
        .then(data=>{
            records = data;
        })
        .catch(err=>{
            console.log("err:",err)
        })
    let plainMap = new Map();
    let chargeMap = new Map();
    let comboMap = new Map();
    let sortGear = [];
    records.forEach((record) => {
        let gearId = record.gearId;
        if(record.status === "plain use")
            plainMap.set(gearId,(plainMap.get(gearId)||0)+1);
        else if(record.status === "charge")
            chargeMap.set(gearId,(chargeMap.get(gearId)||0)+1);
        else if(record.status === "combo")
            comboMap.set(gearId,(comboMap.get(gearId)||0)+1);
        if(!sortGear.includes(gearId))
            sortGear.push(gearId);
    })
    sortGear = sortByNum(sortGear);
    sortGear.forEach((gearId) => {
        ans.xLabel.push("gear " + gearId);
        ans.data.push([
            plainMap.get(gearId)||0,
            chargeMap.get(gearId)||0,
            comboMap.get(gearId)||0
        ])
    })
    console.log("getGearUses:",ans);
    res.send(ans);
})
app.post("/getGearShowsVsObtains",async (req,res) => {
    let ans = {
        xLabel:[],
        data:[]
    };
    let showRecords,obtainRecords;
    await GearShow.find({})
        .then(data=>{
            showRecords = data;
        })
        .catch(err=>{
            console.log("err:",err)
        })
    await GearObtain.find({})
        .then(data=>{
            obtainRecords = data;
        })
        .catch(err=>{
            console.log("err:",err)
        })
    let showMap = new Map(), obtainMap = new Map();
    let sortGear = [];
    showRecords.forEach((record) => {
        let gearId = record.gearId;
        showMap.set(gearId,(showMap.get(gearId)||0)+1);
        if(!sortGear.includes(gearId))
            sortGear.push(gearId);
    })
    obtainRecords.forEach((record) => {
        let gearId = record.gearId;
        obtainMap.set(gearId,(obtainMap.get(gearId)||0)+1);
    })
    sortGear = sortByNum(sortGear);
    sortGear.forEach((gearId) => {
        ans.xLabel.push("gear " + gearId);
        ans.data.push([
            showMap.get(gearId)||0,
            obtainMap.get(gearId)||0
        ])
    })
    console.log("getGearShowsVsObtains:",ans);
    res.send(ans);
})
app.post("/getGearObtainsVsUses",async (req,res) => {
    let ans = {
        xLabel:[],
        data:[]
    };
    let obtainRecords,useRecords;
    await GearObtain.find({})
        .then(data=>{
            obtainRecords = data;
        })
        .catch(err=>{
            console.log("err:",err)
        })
    await GearUse.find({})
        .then(data=>{
            useRecords = data;
        })
        .catch(err=>{
            console.log("err:",err)
        })
    let obtainMap = new Map(), useMap = new Map();
    let sortGear = [];
    obtainRecords.forEach((record) => {
        let gearId = record.gearId;
        obtainMap.set(gearId,(obtainMap.get(gearId)||0)+1);
        if(!sortGear.includes(gearId))
            sortGear.push(gearId);
    })
    useRecords.forEach((record) => {
        let gearId = record.gearId;
        useMap.set(gearId,(useMap.get(gearId)||0)+1);
    })
    sortGear = sortByNum(sortGear);
    sortGear.forEach((gearId) => {
        ans.xLabel.push("gear " + gearId);
        ans.data.push([
            obtainMap.get(gearId)||0,
            useMap.get(gearId)||0
        ])
    })
    console.log("getGearObtainsVsUses:",ans);
    res.send(ans);
})
app.post("/getHpofEnemies",async (req,res)=>{
    let ans = {
        xLabel:[],
        data:[]
    };
    let HpofEnemysRecords;
    await HpofEnemy.find({})
        .then(data=>{
            HpofEnemysRecords = data;
        })
        .catch(err=>{
            console.log("err:",err)
        })
    let enemyMap = new Map();
    let sortEnemy = [];
    HpofEnemysRecords.forEach((e)=>{
        let cur = enemyMap.get(e.enemyId)||[];
        cur.push(e);
        enemyMap.set(e.enemyId,cur);
        if(!sortEnemy.includes(e.enemyId))
            sortEnemy.push(e.enemyId);
    })
    sortEnemy.sort();
    console.log(sortEnemy);
    sortEnemy.forEach((e)=>{
        ans.xLabel.push('enemy '+ e);
        let userMap = new Map();
        enemyMap.get(e).forEach((record)=>{
            userMap.set(record.userId,(userMap.get(record.userId)||0)+record.hp);
        })
        let userNums = userMap.size;
        let sum = 0;
        userMap.forEach((v,k)=>{
            sum += v
        })
        sum/=userNums;
        ans.data.push(sum);
    })
    console.log('getHpofEnemies:',ans)
    res.send(ans);
})
app.post("/getHitofBalls",async (req,res) => {
    let ans = {
        xLabel:[],
        data:[]
    }
    let records;
    await HitofBall.find({})
        .then(data=>{
            records = data;
        })
        .catch(err=>{
            console.log("err:",err)
        })
    let countMap = new Map();
    let sortBall = [];
    records.forEach((record) => {
        let ballId = record.ballId;
        if(!sortBall.includes(ballId))
            sortBall.push(ballId);
        countMap.set(ballId,(countMap.get(ballId)||0)+record.hitCount);
    })
    sortBall = sortByNum(sortBall);
    sortBall.forEach((ballId) => {
        ans.xLabel.push("ball " + ballId);
        ans.data.push(countMap.get(ballId));
    })
    console.log("getHitofBalls: ", ans);
    res.send(ans);
})

app.listen(port, () => {
    console.log(`App running on PORT ${port}`);
});
