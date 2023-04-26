import { WebSocketServer } from 'ws';
import {User} from './xueran/User.js';
import {Room} from './xueran/Room.js';
import {Global} from './xueran/Global.js'
import {fakeClient} from "./xueran/test/fakeClient.js";

Global.init();
const xueran = new WebSocketServer({ port: 3000 });

xueran.on('connection', function connection(ws,req) {
    console.log('success');
    ws.send("connect success");
    // ws.close(3001,"server is full")
    var curUser = new User(req.headers.name,req.headers.avatar_uri,
        // req.headers.friend_code,
        req.headers.uuid,
        ws);
    Global.ws2users.set(ws,curUser);
    ws.on('error', console.error);
    ws.on('message', function message(data) {
        data = JSON.parse(data);
        console.log(data)
        var body = data.body;
        // var curUser = Global.ws2users.get(ws);
        // console.log(curUser)
        switch (data.verb){
            case "create_room":
                var curRoom = new Room(curUser,data.body.max_people,data.body.name);
                curUser.curRoom = curRoom;
                ws.send(JSON.stringify({
                    verb:"create_room_success",
                    room:curRoom.toJSON()
                }));
                //新建11个假人加进来
                for(var i=0;i<11;i++){
                    var u = new User("玩家#"+i,"images/avatar_0.png","uuid_"+i,new fakeClient());
                    u.joinRoom(curRoom);
                }
                console.log(curRoom.roomNumber)
                break;
            case "join_room":
                if(!Global.num2rooms.has(data.body.room_number)){
                    ws.send(JSON.stringify({
                        verb:"join_room_fail",
                        reason:"Room not exists"
                    }));
                    break;
                }
                var roomToJoin = Global.num2rooms.get(data.body.room_number);
                curUser.joinRoom(roomToJoin);
                break;
            case "exit_room":
                curUser.exitRoom();
                break;
            case "switch_seats":
                curUser.curRoom.switchSeats(data.body.seatA,data.body.seatB);
                break;
            case "check_start_game":
                curUser.checkGameCanStart(data);
                break;
            case "start_game":
                curUser.curRoom.startGame(data.body);
                break;
            case "passive_information_give":
                curUser.curRoom.game.sendPassiveInformation(data.body);
                break;
            case "proactive_argument_give":
                curUser.curRoom.game.sendProactiveArgument(data.body);
                break;
            case "proactive_information_give":
                curUser.curRoom.game.sendProactiveInformation(data.body);
                break;
            case "nominate":
                curUser.curRoom.game.dealNominate(data.body);
                break;
            case "vote":
                curUser.curRoom.game.dealVote(data.body);
                break;
            case "want_shot":
                curUser.curRoom.game.dealShot(data.body);
                break;
            case "die_for_mayor":
                curUser.curRoom.game.dieForMayor(body);
                break;
            case "end_night":
                curUser.curRoom.game.startNextDay();
                break;
            case "test_root":
                curUser.curRoom.homeOwner.notify(body);

            default: break;
        }
    });
    ws.on('open', function () {
        console.log('open!!');
    });
    ws.on('close',function(code,reason){
        let curUser = Global.ws2users.get(ws);
        curUser.exitRoom();
        console.log("Code:\t" + code);
        console.log("Reason:\t" + reason);
        Global.ws2users.delete(ws);
    })
});
