export class fakeClient{
    send(data){
        console.log("收到了信息:",JSON.stringify(JSON.parse(data),null,2));
    }
}