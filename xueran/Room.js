import {User} from "./User.js";
import {Global} from "./Global.js";
import {Game} from "./Game.js";
import {fakeClient} from "./test/fakeClient.js";

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

    constructor(homeOwner, maxPeople, name) {
        this.homeOwner = homeOwner;
        this.curPeople = 1;
        this.maxPeople = maxPeople;
        this.seats = Array.from({length:maxPeople});
        this.name = name;
        //todo:roomNumber赋值时要查重
        //todo:roomNumber取随机值
        // this.roomNumber = Math.ceil(Math.random()*10000);
        this.roomNumber = 2018
        this.members = [];
        this.seats = Array(maxPeople)
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
            user.curRoom = this;
            this.takeASeatAndNotify(user);
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
        this.seats[user.seatNumber] = undefined;
        this.notifyAll({
            "verb":"someone_exited",
            "body":{
                "user":user.toJSON(),
                "seat_number":user.seatNumber
            }
        });
    }

    shuffleCharacters(townsfolk,outsiders,minions,demons){
        this.townsfolk = townsfolk;
        this.outsiders = outsiders;
        this.minions = minions;
        this.demons = demons;
        var characterList = townsfolk.concat(outsiders,minions,demons);
        var n = characterList.length;
        for(var i=0;i<n;i++){
            var j = Math.floor(Math.random()*n);
            var tem = characterList[i];
            characterList[i] = characterList[j];
            characterList[j] = tem;
        }
        this.characters = characterList;
        this.homeOwner.notify({
            "verb":"character_assign_result",
            "body":{
                "characterList":characterList
            }
        })

    }
    startGame(body){
        this.game = new Game(body);
        this.game.room = this;
        this.notifyAll({
            "verb":"game_started"
        });
        this.shuffleCharacters(
            body.townsfolk,
            body.outsiders,
            body.minions,
            body.demons
        );
        this.game.start();

    }
    isFull(){
        return this.maxPeople === this.members.length;
    }
    takeASeatAndNotify(user){
        this.members.push(user);
        var newIndex = -1;
        for(var i=0;i<this.seats.length;i++){
            if(this.seats[i] === undefined){
                newIndex = i;
                break;
            }
        }
        this.notifyAll({
            "verb":"someone_joined",
            "body":{
                "user":user.toJSON(),
                "seat_number":newIndex,
            }
        });
        this.seats[newIndex] = user;
        user.seatNumber = newIndex;
        this.seats[newIndex].notify({
            "verb":"join_room_success",
            "body":{
                "seat_number":newIndex
            }
        });

    }
    notifyAll(data){
        this.homeOwner.notify(data);
        this.members.forEach((u)=>{
            u.notify(data);
        })
    }
    switchSeats(seatA,seatB){
        var u = this.seats[seatA];
        this.seats[seatA] = this.seats[seatB];
        this.seats[seatB] = u;
        console.log("人数:"+this.members.length);
        this.members.forEach((u)=>{
            u.notify({
                "verb":"switch_seats",
                "body":{
                    "seatA":seatA,
                    "seatB":seatB
                }
            })
        })
    }
}