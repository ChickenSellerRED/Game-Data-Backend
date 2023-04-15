import {User} from "./User.js";
import {Global} from "./Global.js";
import {Game} from "./Game.js";

export class Room{
    homeOwner;
    curPeople;
    maxPeople;
    name;
    roomNumber;
    members = []; // list of User
    seats = []
    characters = [];
    townsfolk;
    outsiders;
    minions;
    demons;
    game

    constructor(homeOwner, maxpeople, name) {
        this.homeOwner = homeOwner;
        this.curPeople = 1;
        this.maxPeople = maxpeople;
        this.name = name;
        //todo:roomNumber赋值时要查重
        //todo:roomNumber取随机值
        // this.roomNumber = Math.ceil(Math.random()*10000);
        this.roomNumber = 2018
        this.members = [];
        this.seats = Array(maxpeople)
        Global.num2rooms.set(this.roomNumber,this);

        //todo:将room注册到global的roomlist中

    }

    membersJSON() {
        var ans = [];
        this.members.forEach((u)=>{
            ans.push(u.toJSON());
        })
        return ans;
    }

    toJSON(){
        var ans = {
            homeOwner:this.homeOwner.toJSON(),
            maxPeople:this.maxPeople,
            name:this.name,
            roomNumber:this.roomNumber
        }
        return ans;
    }

    addMember(user){
        if(this.maxPeople === this.members.length){
            user.notify(JSON.stringify({
                verb:"join_room_fail",
                reason:"room full"
            }));
        }
        else{
            this.members.forEach((u)=>{
                u.notifyMembersChange(user)
            })
            this.members.push(user);
            user.curRoom = this;
            user.notify(JSON.stringify({
                verb:"join_room_success",
                room:this.toJSON()
            }));
        }
    }
    toString(){
        return "room " + this.name;
    }
    removeMember(user){
        if(user.equals(this.homeOwner)){
            //如果是房主退出
            this.members.forEach((u)=>{
                u.notify({
                    "verb":"room_close",
                    "reason":"Home Owner closed the room"
                })
            })
            Global.num2rooms.delete(this.roomNumber);
            return;
        }
        this.members = this.members.filter((u)=>!u.equals(user));
            this.members.forEach((u)=>{
            u.notifyMembersChange(user,false);
        })
    }

    shuffleCharacters(townsfolk,outsiders,minions,demons){
        this.townsfolk = townsfolk;
        this.outsiders = outsiders;
        this.minions = minions;
        this.demons = demons;
        var characterList = townsfolk.concat(outsiders,minions,demons);
        var n = characterList.length;
        for(var i=0;i<n;i++){
            var j = Math.ceil(Math.random()*n);
            var tem = characterList[i];
            characterList[i] = characterList[j];
            characterList[j] = tem;
        }
        this.characters = characterList;
        this.homeOwner.notify({
            "verb":"character_assign_result",
            "characterList":characterList
        })

    }
    startGame(json){
        this.game = new Game(json.body);
        this.members.forEach((u)=>{
            u.notify({
                "verb":"game_started"
            })
        });
        this.shuffleCharacters(
            json.body.townsfolk,
            json.body.outsiders,
            json.body.minions,
            json.body.demons
        );
    }
}