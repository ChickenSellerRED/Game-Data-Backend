//客户端发送给服务器的数据格式，主要用来转发（说书人-》服务器-》玩家，或者玩家-》服务器-》说书人）
//被动型技能的
//  信息：说书人-》服务器-》玩家
//主动型技能的：
//  参数：玩家-》服务器-》说书人
//  信息：说书人-》服务器-》玩家
//两轮发送中，前面部分是客户端的发送，后面部分是转发


// 洗衣妇,Washerwoman
var information = {
    "from_seat_number":5,
    "users":[1,2],
    "character":"杀手"
}

// 图书管理员,Librarian
var information = {
    "from_seat_number":5,
    "users":[1,2] || [],
    "character":"圣徒" || "没有外来者"
}

// 调查员,Investigator
var information = {
    "from_seat_number":5,
    "users":[1,2],
    "character":"男爵"
}

// 厨师,Chef
var information = {
    "from_seat_number":5,
    "neighborNumber":1
}

// 共情者,Empath
var information = {
    "from_seat_number":5,
    "evilNumber":1
}

// 占卜师,Fortuneteller
var argument = {
    "from_seat_number":5,
    "users":[1,2]
}

var information = {
    "from_seat_number":5,
    "users":[1,2],
    "isThereADevil":true
}

// 送葬者,Undertaker
var information = {
    "from_seat_number":5,
    "user":1,
    "character":"男爵"
}

// 渡鸦守护者,Ravenkeeper
var argument = {
    "from_seat_number":5,
    "user":1
}

var information = {
    "from_seat_number":5,
    "user":1,
    "character":"市长"
}

// 僧侣,Monk
var argument = {
    "from_seat_number":5,
    "user":1
}

// 杀手,Slayer
var json = {
    "verb":"want_shot",
    "body":{
        "from_seat_number":1,
        "to_seat_number":2,
    }
}
var json = {
    "verb":"shot_result",
    "body":{
        "from_seat_number":1,
        "to_seat_number":2,
        "result": true || false
    }
}
// 圣女,Virgin
var json = {
    "verb":"virgin_result",
    "body":{
        "from_seat_number":1,
        "dead_user_number":1
    }
}
// 市长,Mayor
// 士兵,Soldier
// 管家,Butler
var argument = {
    "from_seat_number":1,
    "user":1
}

// 酒鬼,Drunk
// 隐士,Recluse
// 圣徒,Saint
// 投毒者,Poisoner
var argument = {
    "from_seat_number":1,
    "user":1
}

// 间谍,Spy
///todo:发送给间谍的数据格式
var json = {
    "verb":"spy_information_give",
    "body":{
        "characters":["小恶魔","僧侣","共情者","圣女","圣徒","间谍","",""],
        "poison_user":2 || -1,
        "drunk":2||-1,
        "skill_order":[1,3,2,5],
        "is_alive":[true,true,true,false,],
        "fortuneteller_foe":3,
        //todo: 当晚所有行动

    }
}
// 红唇女郎,Scarletwoman
// 男爵,Baron
// 小恶魔,Imp
var argument = {
    "user":1
}

////提名json
var json = {
    "verb":"nominate",
    "body":{
        "from_seat_number":1,
        "to_seat_number":2,
    }
}
////投票json
var json = {
    "verb":"vote",
    "body":{
        "from_seat_number":1,
        "to_seat_number":2,
        "result":true || false
    }
}