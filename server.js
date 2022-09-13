import express from 'express'
import bodyParser from 'body-parser'
import fs from "fs"
import dotenv from "dotenv"
import mongoose from "mongoose"
import {ClearanceRecordsSchema,SkillUsesSchema } from "./db/Schema.js"
//import {Int32} from "mongodb";

dotenv.config()

console.log(process.env.MONGO_URI)
mongoose.connect(process.env.MONGO_URI)
var SuccessInLevelsSchema = mongoose.Schema({
    level:Number,
    status:String,
    time:Number,
})
let levelNum = 4;
let itemNum = 4;

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
app.get('/getTimeOfLevels', async (req,res) =>{
    let timeArr = []
    await fs.readFile('timeOfLevels.txt', 'utf8', function(err, data){
        timeArr = data.split(',').map(x=>parseInt(x));
        console.log(timeArr)
        res.send(timeArr);
    })

});

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

app.post("/logClearanceRecord",async (req,res)=>{
    const level = req.body['level'];
    const status = req.body['status'];
    const time = req.body['time'];
    var record = new ClearanceRecord({level:level,status:status,time:time});
    record.save();
})

app.post("/getClearanceRecords",async (req,res)=>{
    var ans = [];
    var records;
    var ClearanceRecord = mongoose.model('ClearanceRecord',ClearanceRecordsSchema,'ClearanceRecords');
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

    for(var  level=1;level<=4;level++){

        var timeInLevel = records.filter((e)=>e.level === level);
        console.log("level:",level);
        console.log("timeInLevel:",timeInLevel)
        timeInLevel = timeInLevel.map((e)=>e.time);
        timeInLevel.sort();
        var  n = timeInLevel.length;
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
app.post("/getSkillUses",async (req,res)=>{
    var ans = [];
    var SkillUse = mongoose.model('SkillUse',SkillUsesSchema,'SkillUses');
    SkillUse.find({});
})
app.listen(port, () => {
    console.log(`App running on PORT ${port}`);
});
