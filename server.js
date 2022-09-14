import express from 'express'
import bodyParser from 'body-parser'
import fs from "fs"
import dotenv from "dotenv"
import mongoose from "mongoose"
import {ClearanceRecordsSchema,SkillUsesSchema } from "./db/Schema.js"
//import {Int32} from "mongodb";

dotenv.config()
mongoose.connect(process.env.MONGO_URI)
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
    console.log(req.body)
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
let ClearanceRecord = mongoose.model('ClearanceRecord',ClearanceRecordsSchema,'ClearanceRecords');
let SkillUse = mongoose.model('SkillUse',SkillUsesSchema,'SkillUses');

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
})
app.post("/getClearanceRecords",async (req,res)=>{
    var ans = [];
    var records;
    await ClearanceRecord.find({status:"success"})
        .then(data=>{
            console.log("doc:")
            records = data;
        })
        .catch(err=>{
            console.log("err:",err)
        })
    //
    console.log(records);

    for(var  level=1;level<=levelNum;level++){

        var timeInLevel = records.filter((e)=>e.level === level);
        timeInLevel = timeInLevel.map((e)=>e.time);
        timeInLevel.sort((a,b)=>{if(a>b)return 1;if(a<b)return -1;return 0;});
        var  n = timeInLevel.length;
        console.log("level:",level);
        console.log("n:",n);
        console.log("timeInLevel:",timeInLevel)
        if(n == 0)
            ans.push({
                top:0,
                box_top:0,
                mid:0,
                box_bot:0,
                bot:0
            })
        else{
            ans.push({
                top:timeInLevel[n-1],
                box_top:timeInLevel[Math.floor(n*3/4)],
                mid:timeInLevel[Math.floor(n/2)],
                box_bot:timeInLevel[Math.floor(n/4)],
                bot:timeInLevel[0]
            })
        }

    }
    console.log(ans)
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
})
app.post("/getSkillUses",async (req,res)=>{
    var ans = [];
    var skillUsesRecords;
    await SkillUse.find({})
        .then(data=>{
            skillUsesRecords = data;
            // console.log("data:")
            // console.log(data);
        })
        .catch(err=>{
            console.log("err:",err)
        })
    for(var skillId=0;skillId<SkillNum;skillId++){
        var thisUsesCnt = 0;
        var thisSkillUses = skillUsesRecords.filter((e)=>e.skillId==skillId)
        console.log(thisSkillUses)
        thisUsesCnt = thisSkillUses.reduce( (a,b)=>
             a+b.uses,
            0
        )
        ans.push(thisUsesCnt);
    }
    // console.log("ans:");
    // console.log(ans);
    res.send(ans);
})

app.post("/set")
app.listen(port, () => {
    console.log(`App running on PORT ${port}`);
});
