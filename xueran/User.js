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
    notifyMembersChange(user,isMemberInc = true){
        this.client.send(JSON.stringify({
            verb:isMemberInc?"someone_join_room":"someone_exit_room",
            user:user.toJSON()
        }));
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
        this.client.send(JSON.stringify(data));
    }
    startGame(){
        if(this.curRoom == null){
            this.notify({
                "verb":"start_game_fail",
                "reason":"You are not in a room"
            })
            return;
        }
        if(!this.equals(this.curRoom.homeOwner)){
            this.notify({
                "verb":"start_game_fail",
                "reason":"You are not homeOwner"
            })
            return;
        }
        this.curRoom.startGame();
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
            else if(this.character === "红唇女郎"){
                //todo:判断是否继承
            }
        }
    }
    characterType(){
        var role = this.character;
        if(role === "酒鬼")
            role = this.fakeCharacter;
        if(role in Global.passiveCharacterList)
            return "passive";
        else if(role in Global.proactiveCharacterList)
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
        this.room.homeOwner.notify({
            "verb":"someone_become_imp",
            "body":{
                "seat_number":this.seatNumber,
                "character":this.character
            }
        })
        this.character = "小恶魔";
    }
}