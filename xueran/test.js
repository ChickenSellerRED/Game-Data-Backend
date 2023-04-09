//客户端发送给服务器的数据格式，主要用来转发（说书人-》服务器-》玩家，或者玩家-》服务器-》说书人）
//被动型技能的
//  信息：说书人-》服务器-》玩家
//主动型技能的：
//  参数：玩家-》服务器-》说书人
//  信息：说书人-》服务器-》玩家
//两轮发送中，前面部分是客户端的发送，后面部分是转发


// 洗衣妇,Washerwoman
var information = {
    "users":[1,2],
    "character":"杀手"
}

// 图书管理员,Librarian
var information = {
    "users":[1,2] || [],
    "character":"圣徒" || "没有外来者"
}

// 调查员,Investigator
var information = {
    "users":[1,2],
    "character":"男爵"
}

// 厨师,Chef
var information = {
    "neighborNumber":1
}

// 共情者,Empath
var information = {
    "evilNumber":1
}

// 占卜师,Fortuneteller
var argument = {
    "users":[1,2]
}

var information = {
    "users":[1,2],
    "isThereADevil":true
}

// 送葬者,Undertaker
var information = {
    "user":1,
    "character":"男爵"
}

// 渡鸦守护者,Ravenkeeper
var argument = {
    "user":1
}

var information = {
    "user":1,
    "character":"市长"
}

// 僧侣,Monk
var argument = {
    "user":1
}

// 杀手,Slayer
// 圣女,Virgin
// 市长,Mayor
// 士兵,Soldier
// 管家,Butler
var argument = {
    "user":1
}

// 酒鬼,Drunk
// 隐士,Recluse
// 圣徒,Saint
// 投毒者,Poisoner
var argument = {
    "user":1
}

// 间谍,Spy
//todo:发送给间谍的数据格式
// 红唇女郎,Scarletwoman
// 男爵,Baron
// 小恶魔,Imp
var argument = {
    "user":1
}
