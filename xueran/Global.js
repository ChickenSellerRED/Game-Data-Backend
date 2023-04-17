export class Global{
    static num2rooms;
    static ws2users;
    static roles;
    static roles2Func = Map();
    static passiveCharacterList = [];
    static proactiveCharacterList = [];
    static lazyProactiveCharacterList = [];
    static townsfolk = [];
    static outsiders = [];
    static evilCharacter = [];
    static init(){
        Global.num2rooms = new Map();
        Global.ws2users = new Map();
        this.initRoles();
    }
    static initRoles(){
        this.roles2Func.set("洗衣妇","Washerwoman");
        this.roles2Func.set("图书管理员","Librarian");
        this.roles2Func.set("调查员","Investigator");
        this.roles2Func.set("厨师","Chef");
        this.roles2Func.set("共情者","Empath");
        this.roles2Func.set("占卜师","Fortuneteller");
        this.roles2Func.set("送葬者","Undertaker");
        this.roles2Func.set("渡鸦守护者","Ravenkeeper");
        this.roles2Func.set("僧侣","Monk");
        this.roles2Func.set("杀手","Slayer");
        this.roles2Func.set("圣女","Virgin");
        this.roles2Func.set("市长","Mayor");
        this.roles2Func.set("士兵","Soldier");
        this.roles2Func.set("管家","Butler");
        this.roles2Func.set("隐士","Recluse");
        this.roles2Func.set("酒鬼","Drunk");
        this.roles2Func.set("圣徒","Saint");
        this.roles2Func.set("投毒者","Poisoner");
        this.roles2Func.set("间谍","Spy");
        this.roles2Func.set("红唇女郎","Scarletwoman");
        this.roles2Func.set("男爵","Baron");
        this.roles2Func.set("小恶魔","Imp");

        this.passiveCharacterList = ["洗衣妇","图书管理员","调查员","厨师","共情者","送葬者"];
        this.proactiveCharacterList = ["占卜师","僧侣","管家","投毒者","渡鸦守护者","小恶魔"];
        this.lazyProactiveCharacterList = ["僧侣","管家","投毒者","小恶魔"];
        this.evilCharacter = ["小恶魔","间谍","红唇女郎","男爵"];
        this.townsfolk = ["洗衣妇","图书管理员","调查员","厨师","共情者","送葬者","占卜师","僧侣","渡鸦守护者","圣女","市长","士兵","杀手"]
        this.outsiders = ["隐士","圣徒","酒鬼","管家"]
    }

}