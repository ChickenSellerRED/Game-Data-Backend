import express from 'express'
import bodyParser from 'body-parser'
import fs from "fs"
import dotenv from "dotenv"
import mongoose from "mongoose"
import {PeopleEnterSuccessSchema,
    GearUsesSchema,
    GearObtainsSchema,
    HpofEnemySchema,
    HitofBallsSchema} from "./db/Schema.js"
import { cursorTo } from 'readline'
//import {Int32} from "mongodb";

dotenv.config()
mongoose.connect(process.env.MONGO_URI)

// let BallHitten = mongoose.model('BallHitten',ItemInteractionsSchema,'BallHittens')
// let ClearanceRecord = mongoose.model('ClearanceRecord',ClearanceRecordsSchema,'ClearanceRecords');
// for(let i=1;i<=4;i++){
//     for(let j=0;j<20;j++){
//         let levelRecord = new ClearanceRecord({
//             level:i,
//             time:Math.ceil(Math.random()*200) ,
//             status:'success'
//         })
//         levelRecord.save();
//     }
// }

// let SkillUse = mongoose.model('SkillUse',SkillUsesSchema,'SkillUses');
// for(let i=0;i<5;i++){
//     let skillUse = new SkillUse({
//         skillId:i,
//         uses:i*i+2
//     });
//     skillUse.save();
// }

let levelNum = 4;
let SkillNum = 4;
let ItemNum = 4;

// for(let i=1;i<=ItemNum;i++){
//     for(let j=0;j<i*i;j++){
//         let temItem = new ItemsInteraction({
//             itemId:i,
//             status:'obtained',
//             count:1
//         })
//         temItem.save();
//         let temItem = new ItemsInteraction({
//             itemId:i,
//             status:'used',
//             count:1
//         })
//         temItem.save();
//     }
// }

// SuccessInLevel.find({status:"success"},function (err,doc){
//     if(err){
//         console.log(err);
//     }else{
//         console.log(doc.length);
//         console.log(typeof doc);
//     }
// })

const app = express();
app.use(bodyParser.json())
const port = 8080;

let PeopleEnterSuccess = mongoose.model('PeopleEnterSuccess',PeopleEnterSuccessSchema,'PeopleEnterSuccesses')
let GearUse = mongoose.model('GearUse',GearUsesSchema,'GearUses')
let GearObtain = mongoose.model('GearObtain',GearObtainsSchema,'GearObtains')
let HpofEnemy = mongoose.model('HpofEnemy',HpofEnemySchema,'HpofEnemys')
let HitofBall = mongoose.model('HitofBall',HitofBallsSchema,'HitofBalls')
function sortByNum(arr){
    arr.sort((a,b)=>{if(a>b)return 1;if(a<b)return -1;return 0;})
    return arr;
}

app.get("/Hello",(req,res)=>{
    res.sendFile("hello.html",{root:'.'})
})
app.get("/Plot2",(req,res)=>{
    res.sendFile("timeOfLevels.html",{root:'.'})
})

app.post('/timeOfLevels', async (req,res) => {
    console.log(req.body);
    const timeCost = req.body['timeOfLevels'];
    console.log(timeCost);
    let timeArr = []
    await fs.readFile('timeOfLevels.txt', 'utf8', function(err, data){
        console.log(data.split(','));
        timeArr = data.split(',').map(x=>parseInt(x));
        for(let i = 0;i<timeCost.length;i++)
            timeArr[i] += timeCost[i];
        fs.writeFile(
            "timeOfLevels.txt",
            timeArr.toString(),
            function (err) { console.log(err ? 'Error :'+err : 'ok') }
        );
    });



    res.send({
        "status":"accepted"
    })
})

app.post("/logClearanceRecord",async (req,res)=>{
    const level = req.body['level'];
    const status = req.body['status'];
    const time = req.body['time'];
    let record = new ClearanceRecord({level:level,status:status,time:time});
    console.log("logClearanceRecord:")
    console.log("level:",level)
    console.log("status:",status)
    console.log("time:",time)
    record.save();
    res.send("success!")
})
app.post("/getClearanceRecords",async (req,res)=>{
    let ans = {
        xLabel:[],
        data:[],
    };

    let records;
    await ClearanceRecord.find({status:"success"})
        .then(data=>{
            console.log("doc:")
            records = data;
        })
        .catch(err=>{
            console.log("err:",err)
        })
    console.log(records);
    // record.groupBy()
    let map = new Map();
    let sortLevel = [];
    records.forEach((e)=>{
        let tem = (map.get(e.level)||[]);
        tem.push(e.time);
        map.set(e.level,tem);
        if(!sortLevel.includes(e.level))
            sortLevel.push(e.level);
    })
    map.forEach((v,k)=>{
        v.sort((a,b)=>{if(a>b)return 1;if(a<b)return -1;return 0;})
        let n = v.length;
        map.set(k,{
            top:v[n-1],
            box_top:v[Math.floor(n*3/4)],
            mid:v[Math.floor(n/2)],
            box_bot:v[Math.floor(n/4)],
            bot:v[0]
        })
    })
    sortLevel.sort((a,b)=>a-b);
    // let mapAsc = new Map([...map.entries()].sort());
    sortLevel.forEach((e)=>{
        ans.xLabel.push("level "+e);
        ans.data.push(map.get(e));
    })
    console.log(ans);
    res.send(ans);

});
app.post("/logSkillUses",async (req,res)=>{
    const skillId = req.body['skillId'];
    const uses = req.body['uses'];
    let skillUse = new SkillUse({skillId:skillId,uses:uses});
    console.log("logSkillUses:")
    console.log("skillId:",skillId)
    console.log("uses:",uses)
    skillUse.save();
    res.send("success!")
})
app.post("/getSkillUses",async (req,res)=>{
    let ans = {
        xLabel:[],
        data:[]
    };
    let skillUsesRecords;
    await SkillUse.find({})
        .then(data=>{
            skillUsesRecords = data;
        })
        .catch(err=>{
            console.log("err:",err)
        })
    let map = new Map();
    let sortSkill = [];
    skillUsesRecords.forEach((e)=>{
        map.set(e.skillId,(map.get(e.skillId)||0)+e.uses);
        if(!sortSkill.includes(e.skillId))
            sortSkill.push(e.skillId);
    })
    // let mapAsc = new Map([...map.entries()].sort());
    sortSkill.forEach((e)=>{
        ans.xLabel.push('skill '+ e);
        ans.data.push(map.get(e));
    })
    console.log('skill uses:')
    console.log('ans')
    res.send(ans);
})
app.post("/getClearancePeople",async (req,res)=>{
    let ans = {
        xLabel: [],
        data: []
    };
    let records;
    await ClearanceRecord.find({status:"success"})
        .then(data=>{
            records = data;
        })
        .catch(err=>{
            console.log("err:",err)
        })
    let map = new Map();
    let sortLevel = [];
    records.forEach((e)=>{
        map.set(e.level,(map.get(e.level)||0)+1);
        if(!sortLevel.includes(e.level))
            sortLevel.push(e.level)
    })
    sortLevel.sort((a,b)=>a-b);
    // let mapAsc = new Map([...map.entries()].sort());
    sortLevel.forEach((e) => {
        ans.xLabel.push('level ' + e)
        ans.data.push(map.get(e));
    })
    console.log('Clearance People:')
    console.log(ans)
    res.send(ans)
})
app.post("/logItemsInteract",async (req,res)=>{
    const itemId = req.body['itemId'];
    const status = req.body['status'];
    const count = req.body['count'];
    let ItemInteraction = new ItemsInteraction({itemId:itemId,status:status,count:count});
    console.log("logItemsInteract:")
    console.log("itemId:",itemId)
    console.log("status:",status)
    console.log("count:",count)
    ItemInteraction.save();
    res.send("success!")
})
app.post("/getItemsInteract",async (req,res)=>{
    let ans = {
        xLabel:[],
        data:[]
    };
    let records;
    await ItemsInteraction.find({})
        .then(data=>{
            records = data;
        })
        .catch(err=>{
            console.log("err:",err)
        })
    let mapObtained = new Map();
    let mapUsed = new Map();
    let sortIds = [];
    records.forEach((e)=>{
        if(e.status === 'obtained'){
            mapObtained.set(e.itemId,(mapObtained.get(e.itemId)||0)+e.count);
            if(!sortIds.includes(e.itemId))
                sortIds.push(e.itemId);
            console.log('mapObtain:')
            console.log(e.count)
        }else if(e.status === 'used'){
            mapUsed.set(e.itemId,(mapUsed.get(e.itemId)||0)+e.count);
            console.log('used:')
            console.log(e.count)
        }
    })
    sortIds.sort((a,b)=>a-b);
    // let mapObtainedAsc = new Map([...mapObtained.entries()],sort());
    sortIds.forEach((e)=>{
        ans.xLabel.push('item ' + e);
        ans.data.push({
            obtained:mapObtained.get(e),
            used:(mapUsed.get(e)||0)
        })
    })
    console.log('Item Interaction:')
    console.log(ans);
    res.send(ans);
})

app.post("/logPeopleEnterSuccesses",async (req,res)=>{
    const level = req.body['level'];
    const status = req.body['status'];
    let peopleEnterSuccess = new PeopleEnterSuccess({level:level,status:status});
    console.log("logPeopleEnterSuccesses:",{level:level,status:status})
    await peopleEnterSuccess.save();
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
app.post("/logGearObtains",async (req,res)=>{
    const gearId = req.body['gearId'];
    const gearObtain = new GearObtain({gearId:gearId});
    console.log("logGearObtains:",{gearId:gearId})
    await gearObtain.save();
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
        ans.data.push({
            enter:enterMap.get(level)||0,
            success:successMap.get(level)||0
        });
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
app.post("/getGearObtains",async (req,res) => {
    let ans = {
        xLabel:[],
        data:[]
    };
    let records;
    await GearObtain.find({})
        .then(data=>{
            records = data;
        })
        .catch(err=>{
            console.log("err:",err)
        })
    let obtainMap = new Map();
    let sortGear = [];
    records.forEach((record) => {
        let gearId = record.gearId;
        obtainMap.set(gearId,(obtainMap.get(gearId)||0)+1);
        if(!sortGear.includes(gearId))
            sortGear.push(gearId);
    })
    sortGear = sortByNum(sortGear);
    sortGear.forEach((gearId) => {
        ans.xLabel.push("gear " + gearId);
        ans.data.push(obtainMap.get(gearId)||0)
    })
    console.log("getGearObtains:",ans);
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
