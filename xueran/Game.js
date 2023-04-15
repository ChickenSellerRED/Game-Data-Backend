import {Global} from "./Global.js";
const Stage = {
    freeTalking:0,
    voting:1,
    night:2
}

export class Game{
    room //房间的引用
    days //当前是第几天，从0开始
    stage //当前状态，是Stage的枚举类
    daysLog //json数组 游戏日志，每天清空
    nominatingUser //整数 在这一轮，正在被提名的玩家
    voteList //整数数组 在这一轮， 所有玩家获得的票数。若未被提名过则为undefined
    willBeExecutedUsers //整数 在这一轮，将被处决的玩家
    maxVote = 0;//整数 在这一轮的最大得票数
    actionOrder = [];//整数数组 夜晚玩家的行动顺序
    actionIndex = 0; //整数 标志当前行动的玩家
    bluffs;

    foe = -1; // 整数 占卜师的仇人号码
    drunkFakeCharacter; //string 酒鬼的假身份
    spyFakeCharacter;//string 间谍的假身份
    recluseFakeCharacter;//string 隐士的假身份
    deadUsers

    monkProtect = -1;//整数 在这一轮被保护的玩家
    butlerMaster = -1;//整数 在这一轮管家的主人
    poisonedUser = -1;//整数 在这一轮被毒的玩家
    beKilledUser = -1;//整数 在这一轮被杀的玩家



    constructor(body) {
        this.bluffs = body.bluffs;
        this.foe = body.foe;
        this.drunkFakeCharacter = body.drunkFakeCharacter;
        this.spyFakeCharacter = body.spyFakeCharacter;
        this.recluseFakeCharacter = body.recluseFakeCharacter;

        this.stage = Stage.night;
        this.initNight();
        this.startFirstNight();
    }

    initDay(){
        this.daysLog = [];
    }
    initNight(){
        this.actionIndex = 0;
        this.monkProtect = -1;
        this.butlerMaster = -1;
        this.poisonedUser = -1;
        this.beKilledUser = -1;
        this.initActionOrder();
    }
    initActionOrder(){
        this.actionIndex = 0;
        this.actionOrder.push(this.isExistAndAlive("投毒者"));
        if(this.days>0){
            this.actionOrder.push(this.isExistAndAlive("僧侣"));
            this.actionOrder.push(this.isExistAndAlive("红唇女郎"));
            this.actionOrder.push(this.isExistAndAlive("小恶魔"));
            this.actionOrder.push(this.isExistAndAlive("渡鸦守护者"));
        }
        if(this.days === 0){
            this.actionOrder.push(this.isExistAndAlive("洗衣妇"));
            this.actionOrder.push(this.isExistAndAlive("图书管理员"));
            this.actionOrder.push(this.isExistAndAlive("调查员"));
            this.actionOrder.push(this.isExistAndAlive("厨师"));
        }
        this.actionOrder.push(this.isExistAndAlive("共情者"));
        this.actionOrder.push(this.isExistAndAlive("占卜师"));
        this.actionOrder.push(this.isExistAndAlive("管家"));
        if(this.days > 0){
            this.actionOrder.push(this.isExistAndAlive("送葬者"));
        }
        this.actionOrder.push(this.isExistAndAlive("间谍"));
        this.actionOrder = this.actionOrder.filter((e)=>{return e!==-1});
    }
    startFirstNight(){
        //给每名玩家发送对应的身份
        this.tellCharacters();
        //给恶魔，爪牙和说书人发送邪恶阵营信息
        this.tellEvilInformation();
        //初始化行动顺序并开始行动
        this.initActionOrder();
        this.dealAction();
    }
    tellEvilInformation(){
        var evil = [];
        this.room.seats.forEach((u,index)=>{
            if(Global.evilCharacter.contains(u.character)){
                evil.push({
                    "seatNumber":index,
                    "character":u.character
                })
            }
        });
        this.room.seats.forEach((u,index)=>{
            if(Global.evilCharacter.contains(u.character)){
                u.notify({
                    "verb":"evil_users",
                    "body":{
                        "evil_users":evil,
                        "bluffs":this.bluffs
                    }
                });
            }
        });
    }
    dealAction(){
        if(this.actionIndex < this.actionOrder.length)
            this.room.seats[this.actionOrder[this.actionIndex++]].useSkill();
        else{
            this.room.homeOwner.notify({
                "verb":"night_action_over"
            })
        }
    }
    tellCharacters(){
        this.room.seats.forEach((u, index)=>{
            var role = this.room.characters[index];
            var fakeCharacter = "无";
            if(role === "隐士")
                fakeCharacter = this.recluseFakeCharacter;
            else if(role === "间谍")
                fakeCharacter = this.spyFakeCharacter;
            u.character = this.room.characters[index];
            u.fakeCharacter = fakeCharacter;
            u.isAlive = true;
            u.seatNumber = index;
            u.canDeadVote = true;
            u.notify({
                "verb":"your_character",
                "body": {
                    "character":role==="酒鬼"?this.drunkFakeCharacter:role,
                    "fakeCharacter":fakeCharacter
                }
            });
        }
        )
    }
    contactRole(roleName){
        var userSeatNumber = this.isExistAndAlive(roleName);
        if(userSeatNumber !== -1){
           this.room.seats[userSeatNumber].useSkill();
        }

    }
    isExistAndAlive(role){
        for(var i=0;i<this.room.seats.length;i++){
            var user = this.room.seats[i];
            if(user.isAlive && user.character === role)
                return i;
        }
        return -1;
    }
    sendPassiveInformation(body){//发送被动型角色的信息
        var roleName = body.character;
        var userSeatNumber = this.isExistAndAlive(roleName);
        if(userSeatNumber!==-1){
            this.room.seats[userSeatNumber].notify({
                "verb":"passive_argument_give",
                "body":body
            });
        }
        this.daysLog.push({
            "type":"information_passive",
            "character":
        })
        this.dealAction();

    }
    sendProactiveArgument(body){
        var roleName = this.room.seats[body.from_seat_number].character;
        var isLazy = Global.lazyProactiveCharacterList.includes(roleName);
        this.room.homeOwner.notify({
            "verb":isLazy?"proactive_notify":"proactive_information_need",
            "body":body
        });
        if(isLazy){
            //todo:处理daysLog

        }
    }
    sendProactiveInformation(body){
        var roleName = body.character;
        var userSeatNumber = this.isExistAndAlive(roleName);
        if(userSeatNumber!==-1){
            this.room.seats[userSeatNumber].notify({
                "verb":"proactive_information_give",
                "body":body
            });
        }
        this.dealAction();
    }
    dealNominate(body){
        var index = body.to_seat_number;
        this.initNominate();
        this.nominatingUser = index;
        this.room.seats[(index+1)%this.room.maxPeople].plsVote(this.nominatingUser);

    }
    initNominate(){
        this.nominatingUser = -1;
        this.vote = Array.from({length:this.room.maxPeople});
    }
    initExecute(){
        this.maxVote = -1;
        this.voteList = Array.from({length:this.room.maxPeople});
    }
    endNominate(){
        var voteCount = 0;
        for(var i=0;i<this.vote.length;i++)
            if(this.vote[i] === true)
                voteCount ++;
        this.voteList[this.nominatingUser] = voteCount;
        if(voteCount < this.livingNumbers()/2 || voteCount < this.maxVote){
            //投票不成功
            this.initNominate();
            return;
        }
        if(voteCount > this.maxVote){//得票最高，上处刑台
            this.maxVote = voteCount;
            this.willBeExecutedUsers = this.nominatingUser
        }else if(voteCount === this.maxVote){//最高票平票，清空处刑台
            this.willBeExecutedUsers = -1;
        }
        this.initNominate();
    }
    dealVote(body){
        var index = body.from_seat_number;
        this.vote[index] = body.result;
        //死人票用过了则不能再投票 防bug
        if(body.result === true && this.room.seats[index].canDeadVote === false)
            this.vote[index] = false;
        else if(body.result === true
            && this.room.seats[index].isAlive === false
            && this.room.seats[index].canDeadVote === true){
            this.room.seats[index].canDeadVote = false;
            //通知说书人有人用了死人票
            this.room.homeOwner.notify({
                "verb":"someone_user_deadvote",
                "seat_number":index
            });
        }
        if(index === this.nominatingUser)
            this.endNominate();
        else
            this.room.seats[(index+1)%this.room.maxPeople].plsVote(nominatingUser);

    }
    livingNumbers(){
        var cnt = 0;
        for(var i=0;i<this.room.seats.length;i++){
            if(user.isAlive)
                cnt++;
        }
        return cnt;
    }
    deadNumbers(){
        return this.room.maxPeople - this.livingNumbers();
    }
    notifyAll(data){
        this.room.homeOwner.notify(data);
        this.room.seats.forEach((u)=>{u.notify(data)});
    }
    dealShot(body){
        var from = body.from_seat_number;
        var to = body.to_seat_number;
        var shotSuccess = false;
        if(this.room.seats[from].character === "杀手" && +
            this.room.seats[to].character === "小恶魔" &&
            this.poisonedUser !== from){
            shotSuccess = true;
        }
        this.notifyAll({
            "verb":"shot_result",
            "body":{
                "from_seat_number":from,
                "to_seat_number":to,
                "result": shotSuccess
            }
        })
    }
    startNextDay(){
        //进入下一天
        this.initDay();
    }
    dayEnd(){
        //todo:处决玩家，初始化死人票
        this.initNight();
    }
    sendSpyInformation(){
        var user = this.isExistAndAlive("间谍");
        // //死人票
        // var deadVotes = [];
        // this.room.seats.forEach((u)=>{
        //     if(u.isAlive || u.canDeadVote)
        //         deadVotes.push(true);
        //     else
        //         deadVotes.push(false);
        // });
        this.room.seats[user].notify({
            "verb":"spy_information",
            "body":{
                "character":this.room.characters,
                "foe":this.foe,
                "drunk_fake_character":this.drunkFakeCharacter,
                "spy_fake_character":this.spyFakeCharacter,
                "recluse_fake_character":this.recluseFakeCharacter,
                "game_log":this.daysLog,
                // "dead_vote":deadVotes
            }
        })
    }
}