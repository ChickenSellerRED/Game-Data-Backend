import {Global} from "./Global.js";

export class User{
    name;
    avatarUri;
    friendCode
    uuid;
    curRoom
    character
    isAlive
    seatNumber
    fakeCharacter
    canDeadVote = true;
    canNominate = true;
    canBeNominated = true;
    client; // its ws variable


    constructor(name, avatarUri, uuid, client) {
        //todo: add friendCode constructor
        this.name = name;
        this.avatarUri = avatarUri;
        this.client = client;
        this.uuid = uuid;
        this.curRoom = null;
        this.isAlive = true;
    }

    get uuid() {
        return this.uuid;
    }


    toJSON(){
        var ans = {
            name:this.name,
            avatar_uri: this.avatarUri,
            //todo: add friendCode
            uuid: this.uuid
        };
        return ans;
    }

    notifyOwnerChange(user){
        this.client.send(JSON.stringify({
            verb:"home_owner_changed",
            user:user.toJSON()
        }))
    }
    equals(user){
        return this.uuid === user.uuid;
    }
    toString(){
        return "User " + this.name;
    }
    joinRoom(roomToJoin){
        if(this.curRoom != null){
            this.client.send(JSON.stringify({
                verb:"join_room_fail",
                reason:"You are already in another room"
            }));
            return;
        }
        roomToJoin.addMember(this)
    }
    exitRoom(){
        if(this.curRoom !== null){
            this.curRoom.removeMember(this);
            this.curRoom = null;
            console.log(this.toString()+" leave the room");
        }
        console.log(this.toString() + " doesn't in a room");
    }
    notify(data){
        console.log(this.name+"收到了信息:"+JSON.stringify(data,null,2))
        this.client.send(JSON.stringify(data));
    }
    checkGameCanStart(){
        if(this.curRoom == null){
            this.notify({
                "verb":"start_game_fail",
                "body": {
                    "reason": "你不在任何一个房间里"
                }
            })
            return;
        }
        if(!this.equals(this.curRoom.homeOwner)){
            this.notify({
                "verb":"start_game_fail",
                "body": {
                    "reason": "你不是房主哦"
                }
            })
            return;
        }
        if(!this.curRoom.isFull()){
            this.notify({
                "verb":"start_game_fail",
                "body":{
                    "reason":"房间没满"
                }
            })
            return;
        }
        this.notify({
            "verb":"game_can_start",
            "body":{}
        })
    }

    useSkill(){
        var ct = this.characterType();
        if(ct === "passive")
            this.dealPassive();
        else if(ct === "proactive")
            this.dealProactive();
        else if(ct === "other"){
            if(this.character === "间谍"){
                //发送间谍信息
                this.room.game.sendSpyInformation();
            }
        }
    }
    characterType(){
        var role = this.character;
        if(role === "酒鬼")
            role = this.fakeCharacter;
        if(Global.passiveCharacterList.includes(role))
            return "passive";
        else if(Global.proactiveCharacterList.includes(role))
            return "proactive";
        else return "other";
    }
    dealPassive(){
        this.curRoom.homeOwner.notify({
            "verb":"passive_information_need",
            "body":{
                "seat_number":this.seatNumber,
                "character":this.character,
            }
        });
    }
    dealProactive(){
        this.notify({
            "verb":"proactive_argument_need",
            "body":{
                "seat_number":this.seatNumber,
                "character":this.character,
            }
        });
    }
    plsVote(seatNumber){
        this.notify({
            "verb":"pls_vote",
            "nominatee_seat_number":seatNumber
        })
    }
    isTownsfolk(){
        return Global.townsfolk.includes(this.character);
    }
    becomeImp(){
        this.notify({
            "verb":"you_become_imp"
        });
        this.character = "小恶魔";
    }
    die(){
        this.isAlive = false;
        this.canDeadVote = true;
        this.canNominate = false;
        this.canBeNominated = false;
    }
    wakeUp(){
        if(this.isAlive){
            this.canNominate = true;
            this.canBeNominated = true;
        }
    }
    beKilled(){
        //僧侣
        if(this.curRoom.game.monkProtect === this.seatNumber)
            return;
        //士兵
        if(this.character === "士兵"){
            if(this.curRoom.game.poisonedUser === this.seatNumber){
                this.curRoom.game.willBeExecutedUser = this.seatNumber;
                this.die();
            }
            else
                return;
        }else if(this.character === "小恶魔"){
            this.curRoom.game.willBeExecutedUser = this.seatNumber;
            this.die();

        }
    }
    beExecuted(){

}
}