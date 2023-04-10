const Stage = {
    freeTalking:0,
    voting:1,
    night:2
}

export class Game{
    room //房间的引用
    days //当前是第几天，从0开始
    stage //当前状态，是Stage的枚举类
    gameLog //游戏日志
    nominatingUser //整数 在这一轮，正在被提名的玩家
    voteList //整数数组 在这一轮， 所有玩家获得的票数。若未被提名过则为undefined
    willBeExecutedUsers //整数 在这一轮，将被处决的玩家
    maxVote = 0;
    deadUsers



    init(){
        this.startFirstNight();
    }
    startFirstNight(){
        //todo:给每名玩家发送对应的身份
        this.tellCharacters();
        //todo:给恶魔，爪牙和说书人发送邪恶阵营信息
        //todo:获取投毒者下毒的玩家
        this.contactRole("间谍");
        //todo:获取2名玩家，发送洗衣妇信息（村民）
        //todo:获取2名玩家，发送图书管理员信息（外来者）
        //todo:获取2名玩家，发送调查员信息（爪牙）
        //todo:发送厨师信息（邪恶阵营的邻座数量）
        //todo:发送共情者信息（与自己邻座的邪恶阵营）
        //todo:获取2名玩家（一定从占卜师获得），发送占卜师信息
        //todo:获取管家选择的玩家
        //todo:发送间谍信息
    }

    tellCharacters(){
        this.room.forEach((u, index)=>{
            u.notify({
                "verb":"your_character",
                "body":this.room.characterList[index]
            });
            u.character = this.room.characterList[index];
        }
        )
    }
    contactRole(roleName){
        var user = this.isExistAndAlive(roleName);
        if(user !== null){
           user.useSkill();
        }

    }
    isExistAndAlive(role){
        for(var i=0;i<this.room.seats.length;i++){
            var user = this.room.seats[i];
            if(user.isAlive && user.character === role)
                return user;
        }
        return null;
    }
    sendPassiveInformation(body){//发送被动型角色的信息
        var roleName = body.character;
        var user = this.isExistAndAlive(roleName);
        if(user!=null){
            user.notify({
                "verb":"passive_argument_give",
                "body":body
            });
        }
    }
    sendProactiveArgument(body){
        this.room.homeOwner.notify({
            "verb":"proactive_argument_give",
            "body":body
        })
    }
    sendProactiveInformation(body){
        var roleName = body.character;
        var user = this.isExistAndAlive(roleName);
        if(user!=null){
            user.notify({
                "verb":"proactive_information_give",
                "body":body
            });
        }
    }
    dealNominate(body){
        var index = body.to_seat_number;
        this.initNominate();
        this.nominatingUser = index;
        this.room.seats[(index+1)%this.room.maxPeople].plsVote(nominatingUser);

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
            return;
        }
        if(voteCount > this.maxVote){//得票最高，上处刑台
            this.maxVote = voteCount;
            this.willBeExecutedUsers = this.nominatingUser
        }else if(voteCount === this.maxVote){//最高票平票，清空处刑台
            this.willBeExecutedUsers = -1;
        }
    }
    dealVote(body){
        var index = body.from_seat_number;
        this.vote[index] = body.result;
        if(index === this.nominatingUser)
            ths.endNominate();
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
}

