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
#### logGearshows:装备的展示次数
```json
{
  "userId": String,
  "gearId":int
}
```
#### logGearobtains:装备的获取次数
```json
{
  "userId": String,
  "gearId":int
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
    [int,int],//[enter,success],
    [int,int],//[enter,success],
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
#### /getGearShowsVsObtains:装备的展示对比获取次数
```json
{
  "xLabel": ["gear 1","gear 2",...],
  "data":[
    [int,int],//(Show,Obtain)
    [int,int],//(Show,Obtain)
    ...
  ]
}
```
#### /getGearObtainsVsUses:装备的获取对比使用次数
```json
{
  "xLabel": ["gear 1","gear 2",...],
  "data":[
    [int,int],//(Obtain,Use)
    [int,int],//(Obtain,Use)
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
#### /getHitofBalls:击中球种类的比例分布
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





