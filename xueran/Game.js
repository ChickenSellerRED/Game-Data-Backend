const Stage = {
    freeTalking:0,
    nominating:1,
    voting:2,
    night:3
}

export class Game{
    room
    days
    stage
    gameLog
    nominatingUser
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
            user.notify(body.data);
        }
    }
    sendProactiveArgument(body){

    }
    sendProactiveInformation(body){

    }


}