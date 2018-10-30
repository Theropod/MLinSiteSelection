/***************************************************************
备注：进行查询操作前请参考《Data Lab说明文档》中的查询注意事项
***************************************************************/

-----按区域经纬度获取月度驻留记录
drop table if exists example_temp1;
create table example_temp1
row format delimited fields terminated by ',' Lines terminated by '\n' null defined as '' stored as textfile
as 
select a.uid,a.poi_id
  from stay_poi a
where a.weighted_centroid_lat between 39.86060686 and 39.86650381
  and a.weighted_centroid_lon between 116.36877643 and 116.37681382
  and a.date=20170901 
  and a.city='beijing';
  
-----根据记录筛选月驻留表
drop table if exists example_temp2;
create table example_temp2
row format delimited fields terminated by ',' Lines terminated by '\n' null defined as '' stored as textfile
as 
select s.date,
       s.uid,
       s.stime,
       s.etime,
       s.ptype
from stay_month s
inner join example_temp1 t on (s.uid = t.uid and s.poi_id = t.poi_id)
where s.date >= 20170901
  and s.date <= 20170930
  and s.city='beijing';

-----按天统计该区域用户出现频次
select date,uid,count(1) as cnt
  from example_temp2 t
 group by date,uid;
--limit 10;

-----按天统计该地区各属性的人数、加权人数（以性别、年龄为例）   --注意：属性中有性别年龄时建议使用gw，如不含，可使用weight
select a.date,
       --b.area,  --手机来源地
       b.gender,
       b.age,
       --b.arpu,  --通讯费用
       --b.brand, --手机品牌
       --b.type,  --手机型号
       count(1) as cnt,
       cast(round(sum(b.gw)) as bigint) as weight_cnt    
from example_temp2 a
inner join user_attribute b on (a.uid = b.uid and b.date=20170901 and b.city = 'beijing')
group by a.date,b.gender,b.age;
--limit 10;


-----按天统计上网标签的人数、流量、时长
select m.date,
       n.lname,
       m.cnt,
       m.duration,
       m.flux
  from (select a.date,
               b.lcode,
               count(1) as cnt,
               round(avg(b.ltime / 60), 1) as duration,  --数据单位为秒，此处统计单位为分钟
               round(avg(b.lflux / 1024 / 1024), 2) as flux  --数据单位为b，此处统计单位为MB
          from user_label_info b
        inner join example_temp2 a on (a.uid = b.uid)
        where b.date=20170901
          and b.city='beijing'
        group by a.date,b.lcode
        ) m
inner join label_codes n on m.lcode = n.lcode;
--limit 10;


-----关联标准格网（居住人口），num为人数，wnum为加权人数
select t.fnid,count(1) as num,cast(round(sum(t.weight)) as bigint) as wnum from
(select g.fnid,s.uid,a.weight
from stay_poi s 
inner join user_attribute a on s.uid = a.uid and a.city = 'V0110000' and a.date = '20170901'
inner join ss_grid_wgs84 g on s.city = g.city_code 
and ceil((s.weighted_centroid_lon - 115.42341096)/0.00292887)= g.gcol_4326 
and ceil((s.weighted_centroid_lat - 39.44275803)/0.00225356) = g.grow_4326
where s.date = 20170901 and s.city = 'V0110000' and s.ptype = 1) t
group by t.fnid;
