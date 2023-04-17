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
    willBeExecutedUser //整数 在这一轮，将被处决的玩家
    executedUser //整数 被处决的玩家
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
    poisonedUser = -1;//整数 在这一轮被毒的玩家 // 添加中毒信息到user中
    beKilledUser = -1;//整数 在这一轮被杀的玩家

    isVirginValid = true;//bool 圣女技能是否还在
    isKillerValid = true;//bool 杀手技能是否还在




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
        if(this.actionIndex < this.actionOrder.length){
            var curSkillUser = this.actionOrder[this.actionIndex++];
            if(!this.room.seats[curSkillUser].isAlive)
                this.dealAction();
            else
                this.room.seats[curSkillUser].useSkill();
        }
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
            else if(role === "酒鬼")
                fakeCharacter = this.drunkFakeCharacter;
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
                "verb":"passive_information_give",
                "body":body
            });
            this.logAndNotify({
                "type":"information_passive",
                "body":body
            },"homeOwner");
        }
        this.dealAction();

    }
    sendProactiveArgument(body){
        var roleName = this.room.seats[body.from_seat_number].character;
        var isLazy = Global.lazyProactiveCharacterList.includes(roleName);
        if(!isLazy)
        this.room.homeOwner.notify({
            "verb":"proactive_information_need",
            "body":body
        });
        else if(isLazy){
            //处理daysLog
            this.logAndNotify({
                "type":"information_proactive",
                "body":body
            },"homeOwner");
        }
    }
    sendProactiveInformation(body){
        //只有可能是占卜师和渡鸦守护者
        var roleName = body.character;
        var userSeatNumber = this.isExistAndAlive(roleName);
        if(userSeatNumber!==-1){
            this.room.seats[userSeatNumber].notify({
                "verb":"proactive_information_give",
                "body":body
            });
            this.logAndNotify({
                "type":"information_proactive",
                "body":body
            },"homeOwner");
        }
        this.dealAction();
    }
    dealNominate(body){
        var fromUser = body.from_seat_number;
        var toUser = body.to_seat_number;
        if(!this.room.seats[fromUser].canNominate || !this.room.seats[toUser].canBeNominated){
            //提名失败
            return;
        }
        if(this.room.seats[toUser].character === "圣女" && this.isVirginValid){
            this.isVirginValid = false;
            if(this.room.seats[fromUser].isTownsfolk() && this.poisonedUser !== fromUser){
                this.execute((toUser));
                return;
            }
        }
        //通知所有人开始提名投票
        this.logAndNotify({
                "type":"vote_start",
                "body":{
                    "from_seat_number":fromUser,
                    "to_seat_number":toUser
                }
            },
            "all"
        )
        this.initNominate(fromUser,toUser);
        this.room.seats[(toUser+1)%this.room.maxPeople].plsVote(this.nominatingUser);

    }
    initNominate(fromUser,toUser){

        //todo:进行提名和被提名限制
        //todo:设置投票发起者
        this.nominatingUser = toUser;
        this.vote = Array.from({length:this.room.maxPeople});
    }
    initExecute(){
        this.maxVote = -1;
        this.voteList = Array.from({length:this.room.maxPeople});
    }
    execute(userNumber){
        this.room.seats[userNumber].die();
        //通知所有人
        this.logAndNotify({
                "type":"execute_user",
                "body":{
                    "seat_number":userNumber,
                    "character":this.room.seats[userNumber].character
                }
            },
            "all"
        );
        //如果是圣徒，游戏结束
        if(this.room.seats[userNumber].character === "圣徒" && this.poisonedUser !== userNumber){
            this.game_over("evil","圣徒被处决")
            return;
        }
        //小恶魔被处决逻辑（即好人胜利逻辑）
        if(this.room.seats[userNumber].character === "小恶魔"){
            //红唇女郎继承
            if(!this.dealSecretwoman()){
                this.game_over("justice","小恶魔被处决");
                return;
            }
        }
        //恶魔胜利逻辑
        var cList = this.livingCharacters();
        if(cList.length === 2 && cList.includes("小恶魔"))
            this.game_over("evil","场上仅有两人且恶魔在场");
        else if(cList.filter((u)=>{return Global.townsfolk.includes(u) || Global.outsiders.includes(u)}) === 0){
            this.game_over("evil","正义阵营全部阵亡");
        }else{
            this.startNight();
        }
    }
    dealSecretwoman(){
        var secretwomanNumber = this.isExistAndAlive("红唇女郎");
        if(this.livingNumbers()>=4 && secretwomanNumber !== -1 && this.poisonedUser !== secretWomanNumber){
            this.room.seats[secretwomanNumber].becomeImp();
            this.logAndNotify({
                "type":"someone_become_imp",
                "body":{
                    "seat_number":secretwomanNumber,
                    "character":"红唇女郎"
                }
            },"homeOwner");
            return true;//继承成功
        }else{
            return false;//继承失败，一般恶魔会失败
        }
    }
    game_over(winner,reason){
        this.notifyAll({
            "verb":"game_over",
            "body":{
                "winner":winner,
                "reason":reason
            }
        })
    }
    impSuicide(){

    }
    endNominate(){
        var voteCount = 0;
        var result = "";
        for(var i=0;i<this.vote.length;i++)
            if(this.vote[i] === true)
                voteCount ++;
        this.voteList[this.nominatingUser] = voteCount;
        if(voteCount < this.livingNumbers()/2 || voteCount < this.maxVote){
            //投票不成功
            //通知所有人
            result = "fail";
        }
        else if(voteCount > this.maxVote){//得票最高，上处刑台
            this.maxVote = voteCount;
            this.willBeExecutedUser = this.nominatingUser
            result = "success";
        }else if(voteCount === this.maxVote){//最高票平票，清空处刑台
            this.willBeExecutedUser = -1;
            result = "draw";

        }
        //通知所有人
        this.logAndNotify({
            "type":"vote_end",
            "body":{
                "seat_number":this.nominatingUser,
                "vote_count":voteCount,
                "result":result
            }
        },"all");
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
            //通知所有人有人用了死人票
            this.notifyAll({
                "verb":"someone_use_deadvote",
                "seat_number":index
            });
        }
        this.notifyAll({
            "verb":"someone_voted",
            "body":{
                "seat_number":index,
                "result":body.result
            }
        })
        if(index === this.nominatingUser)
            this.endNominate();
        else
            this.room.seats[(index+1)%this.room.maxPeople].plsVote(nominatingUser);
    }
    livingNumbers(){
        return this.livingCharacters().length;
    }
    livingCharacters(){
        var characters = [];
        for(var i=0;i<this.room.seats.length;i++){
            if(this.room.seats[i].isAlive)
                characters.push(this.room.seats[i].character);
        }
        return characters;
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
        if(this.room.seats[from].character === "杀手"){
            if((this.room.seats[to].character === "小恶魔" || this.room.seats[to].fakeCharacter === "小恶魔") &&
                this.poisonedUser !== from &&
                this.isKillerValid === true){
                    shotSuccess = true;
                    this.room.seats[to].die();
            }
            this.isKillerValid = false;
            if(this.isExistAndAlive("小恶魔") == -1){
                if(!this.dealSecretwoman()){
                    this.game_over("justice","小恶魔被枪杀");
                }
            }
        }
        this.logAndNotify({
            "verb":"shot_result",
            "body":{
                "from_seat_number":from,
                "to_seat_number":to,
                "result": shotSuccess
            }
        },"all");
    }
    startNight(){
        //todo:开始新的晚上
        //todo:处决玩家，初始化死人票
        this.initNight();
    }
    startNextDay(){
        //进入下一天
        this.initDay();
    }
    sendSpyInformation(){
        var user = this.isExistAndAlive("间谍");
        this.room.seats[user].notify({
            "verb":"spy_information",
            "body":{
                "character":this.room.characters,
                "foe":this.foe,
                "drunk_fake_character":this.drunkFakeCharacter,
                "spy_fake_character":this.spyFakeCharacter,
                "recluse_fake_character":this.recluseFakeCharacter,
                "game_log":this.daysLog,
            }
        })
    }
    logAndNotify(data,notify){
        data.verb = data.type;
        delete data.type;
        this.daysLog.push(data);
        if(notify === "all")
            this.notifyAll(data);
        else if(notify === "homeOwner")
            this.room.homeOwner.notify(data);
        else if(notify === 0)
            return;
        else if(typeof notify === "number")
            !this.room.seats[notify].notify(data);

    }
}