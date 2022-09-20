服务器地址：https://test526.wn.r.appspot.com/

API 接口：
上传数据：
logClearanceRecord:上传通关记录
```json
{
    "level":关卡id,
    "status":"success"或者"fail",
    "time":通关时间
}
```
logSkillUses:上传技能的使用次数
```json
{
  "skillId":技能id,
  "uses": 使用次数
}
```
logItemInteract:上传装备的获取/使用
```json
{
  
}
```