import express from 'express'
import bodyParser from 'body-parser'
import fs from "fs"
import dotenv from "dotenv"
import mongoose from "mongoose"
import {ClearanceRecordsSchema,SkillUsesSchema,ItemInteractionsSchema,HpofEnemySchema,PeopleEnterSuccessSchema} from "./db/Schema.js"
import { cursorTo } from 'readline'
//import {Int32} from "mongodb";

dotenv.config()
mongoose.connect(process.env.MONGO_URI)

let ClearanceRecord = mongoose.model('ClearanceRecord',ClearanceRecordsSchema,'ClearanceRecords');
let SkillUse = mongoose.model('SkillUse',SkillUsesSchema,'SkillUses');
let ItemsInteraction = mongoose.model('ItemsInteraction',ItemInteractionsSchema,'ItemInteractions');
let HpofEnemy = mongoose.model('HpofEnemy',HpofEnemySchema,'HpofEnemys')
let PeopleEnterSuccess = mongoose.model('PeopleEnterSuccess',PeopleEnterSuccessSchema,'PeopleEnterSuccesses')
// let BallHitten = mongoose.model('BallHitten',ItemInteractionsSchema,'BallHittens')
// var ClearanceRecord = mongoose.model('ClearanceRecord',ClearanceRecordsSchema,'ClearanceRecords');
// for(var i=1;i<=4;i++){
//     for(var j=0;j<20;j++){
//         var levelRecord = new ClearanceRecord({
//             level:i,
//             time:Math.ceil(Math.random()*200) ,
//             status:'success'
//         })
//         levelRecord.save();
//     }
// }

// var SkillUse = mongoose.model('SkillUse',SkillUsesSchema,'SkillUses');
// for(var i=0;i<5;i++){
//     var skillUse = new SkillUse({
//         skillId:i,
//         uses:i*i+2
//     });
//     skillUse.save();
// }

let levelNum = 4;
let SkillNum = 4;
let ItemNum = 4;

// for(var i=1;i<=ItemNum;i++){
//     for(var j=0;j<i*i;j++){
//         var temItem = new ItemsInteraction({
//             itemId:i,
//             status:'obtained',
//             count:1
//         })
//         temItem.save();
//         var temItem = new ItemsInteraction({
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
    var timeArr = []
    await fs.readFile('timeOfLevels.txt', 'utf8', function(err, data){
        console.log(data.split(','));
        timeArr = data.split(',').map(x=>parseInt(x));
        for(var i = 0;i<timeCost.length;i++)
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
    var record = new ClearanceRecord({level:level,status:status,time:time});
    console.log("logClearanceRecord:")
    console.log("level:",level)
    console.log("status:",status)
    console.log("time:",time)
    record.save();
    res.send("success!")
})
app.post("/getClearanceRecords",async (req,res)=>{
    var ans = {
        xLabel:[],
        data:[],
    };

    var records;
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
    var map = new Map();
    var sortLevel = [];
    records.forEach((e)=>{
        var tem = (map.get(e.level)||[]);
        tem.push(e.time);
        map.set(e.level,tem);
        if(!sortLevel.includes(e.level))
            sortLevel.push(e.level);
    })
    map.forEach((v,k)=>{
        v.sort((a,b)=>{if(a>b)return 1;if(a<b)return -1;return 0;})
        var n = v.length;
        map.set(k,{
            top:v[n-1],
            box_top:v[Math.floor(n*3/4)],
            mid:v[Math.floor(n/2)],
            box_bot:v[Math.floor(n/4)],
            bot:v[0]
        })
    })
    sortLevel.sort((a,b)=>a-b);
    // var mapAsc = new Map([...map.entries()].sort());
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
    var skillUse = new SkillUse({skillId:skillId,uses:uses});
    console.log("logSkillUses:")
    console.log("skillId:",skillId)
    console.log("uses:",uses)
    skillUse.save();
    res.send("success!")
})
app.post("/getSkillUses",async (req,res)=>{
    var ans = {
        xLabel:[],
        data:[]
    };
    var skillUsesRecords;
    await SkillUse.find({})
        .then(data=>{
            skillUsesRecords = data;
        })
        .catch(err=>{
            console.log("err:",err)
        })
    var map = new Map();
    var sortSkill = [];
    skillUsesRecords.forEach((e)=>{
        map.set(e.skillId,(map.get(e.skillId)||0)+e.uses);
        if(!sortSkill.includes(e.skillId))
            sortSkill.push(e.skillId);
    })
    // var mapAsc = new Map([...map.entries()].sort());
    sortSkill.forEach((e)=>{
        ans.xLabel.push('skill '+ e);
        ans.data.push(map.get(e));
    })
    console.log('skill uses:')
    console.log('ans')
    res.send(ans);
})
app.post("/getClearancePeople",async (req,res)=>{
    var ans = {
        xLabel: [],
        data: []
    };
    var records;
    await ClearanceRecord.find({status:"success"})
        .then(data=>{
            records = data;
        })
        .catch(err=>{
            console.log("err:",err)
        })
    var map = new Map();
    var sortLevel = [];
    records.forEach((e)=>{
        map.set(e.level,(map.get(e.level)||0)+1);
        if(!sortLevel.includes(e.level))
            sortLevel.push(e.level)
    })
    sortLevel.sort((a,b)=>a-b);
    // var mapAsc = new Map([...map.entries()].sort());
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
    var ItemInteraction = new ItemsInteraction({itemId:itemId,status:status,count:count});
    console.log("logItemsInteract:")
    console.log("itemId:",itemId)
    console.log("status:",status)
    console.log("count:",count)
    ItemInteraction.save();
    res.send("success!")
})
app.post("/getItemsInteract",async (req,res)=>{
    var ans = {
        xLabel:[],
        data:[]
    };
    var records;
    await ItemsInteraction.find({})
        .then(data=>{
            records = data;
        })
        .catch(err=>{
            console.log("err:",err)
        })
    var mapObtained = new Map();
    var mapUsed = new Map();
    var sortIds = [];
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
    // var mapObtainedAsc = new Map([...mapObtained.entries()],sort());
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

//
app.post("/logHpofEnemys",async (req,res)=>{
    const userId = req.body['userId'];
    const enemyId = req.body['enemyId'];
    const hp = req.body['hp'];
    var hpofenemy = new HpofEnemys({userId:userId,enemyId:enemyId,hp:hp});
    console.log("logHpofEnemys:")
    console.log("userID:",userId)
    console.log("enemyID:",enemyId)
    console.log("hp:",hp)
    hpofenemy.save();
    res.send("success!")
})
app.post("/getHpofEnemys",async (req,res)=>{
    var ans = {
        xLabel:[],
        data:[]
    };
    var HpofEnemysRecords;
    await HpofEnemy.find({})
        .then(data=>{
            HpofEnemysRecords = data;
        })
        .catch(err=>{
            console.log("err:",err)
        })
    var enemyMap = new Map();
    var sortEnemy = [];
    HpofEnemysRecords.forEach((e)=>{
        console.log(e);
        var cur = enemyMap.get(e.enemyId)||[];
        cur.push(e);
        enemyMap.set(e.enemyId,cur);
        if(!sortEnemy.includes(e.enemyId))
            sortEnemy.push(e.enemyId);    
    })
    sortEnemy.sort();
    console.log(sortEnemy);
    sortEnemy.forEach((e)=>{
        console.log("enemyid",e);
        ans.xLabel.push('enemyID'+ e);
        var userMap = new Map();
        enemyMap.get(e).forEach((record)=>{
            userMap.set(record.userId,(userMap.get(record.userId)||0)+record.hp);
        })
        var userNums = userMap.size;
        var sum = 0;
        userMap.forEach((v,k)=>{
            sum += v
        })
        sum/=userNums;
        ans.data.push(sum);
    })
    console.log('enemyID:')
    console.log(ans)
    res.send(ans);
})
//
//
app.post("/logPeopleEnterSuccesses",async (req,res)=>{
    const level = req.body['level'];
    const status = req.body['status'];
    var skillUse = new SkillUse({level:level,status:status});
    console.log("logPeopleEnterSuccesses:")
    console.log("level:",level)
    console.log("status:",status)
    skillUse.save();
    res.send("success!")
})
app.post("/getPeopleEnterSuccesses",async (req,res)=>{
    var ans = {
        xLabel:[],
        data:[]
    };
    var PeopleEnterSuccesses;
    await SkillUse.find({})
        .then(data=>{
            PeopleEnterSuccesses = data;
        })
        .catch(err=>{
            console.log("err:",err)
        })
    var map = new Map();
    var sortES = [];
    PeopleEnterSuccesses.forEach((e)=>{
        map.set(e.level,(map.get(e.level)||0)+e.status);
        if(!sortES.includes(e.level))
        sortES.push(e.level);
    })
    // var mapAsc = new Map([...map.entries()].sort());
    sortES.forEach((e)=>{
        ans.xLabel.push('level '+ e);
        ans.data.push(map.get(e));
    })
    console.log('level:')
    console.log('ans')
    res.send(ans);
})
//

app.listen(port, () => {
    console.log(`App running on PORT ${port}`);
});
