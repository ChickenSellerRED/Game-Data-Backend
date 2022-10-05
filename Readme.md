## server地址：https://test526.wn.r.appspot.com/
# API：
### 上传数据(log)：
#### logEnterSuccess:进入/通关信息
```json
{
  "userId": String,
  "level": int,
  "status": "enter"/"success",
}
```
#### logGearUses:装备的使用次数
```json
{
  "userId": String,
  "gearId":int,
  "status": "plain use"/"charge"/"combo"
}
```
#### logGearobtains:装备的获取次数
```json
{
  "userId": String,
  "gearId":int
}
```
#### logHpofEnemies:面对敌人,玩家消耗的血量
```json
{
  "userId": String,
  "enemyId": int,
  "hp": int
}
```
#### logHitofBalls:球的击中次数
```json
{
  "userId": String,
  "ballId": int,
  "hitCount": int
}
```
### 获取数据(get):
#### /getEnterSuccess:每一关的enter/success 
```json
{
  "xLabel": ["level 1","level 2",...],
  "data":[
    {"enter": int,"success": int},
    {"enter": int,"success": int},
    ...
  ]
}
```
#### /getGearUses:每种装备的使用比例
```json
{
  "xLabel": ["gear 1","gear 2",...],
  "data":[
    [int,int,int],//(plainuse,charge,combo)
    [int,int,int],//(plainuse,charge,combo)
    ...
  ]
}
```
#### /getGearobtains:装备的获取次数
```json
{
  "xLabel": ["gear 1","gear 2",...],
  "data":[
    int,//(Obtain)
    int,//(Obtain)
    ...
  ]
}
```
#### /getHpofEnemies:每种敌人造成伤害的平均值
```json
{
  "xLabel": ["enemy 1","enemy 2",...],
  "data":[
    int,//(damage)
    int,//(damage)
    ...
  ]
}
```
#### /getHitofBalls:集中球种类的比例分布
```json
{
  "xLabel": ["ball 1","ball 2",...],
  "data":[
    int,//(ball hits)
    int,//(ball hits)
    ...
  ]
}
```





