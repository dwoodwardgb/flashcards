PRAGMA encoding = "UTF-8";

CREATE TABLE phrases (
    id integer not null primary key autoincrement,
    traditional text,
    pinyin text,
    english text,
    created_at datetime,
    updated_at datetime,
    pronunciation_url varchar(255) null
);
CREATE INDEX phrases_traditional_index on phrases (traditional);
CREATE INDEX phrases_pinyin_index on phrases (pinyin);
CREATE INDEX phrases_english_index on phrases (english);

INSERT INTO phrases VALUES(1,'我','wǒ','I','2024-08-21 01:35:25','2024-08-21 01:35:25',NULL);
INSERT INTO phrases VALUES(2,'你','nǐ','you','2024-08-21 01:35:25','2024-08-21 01:35:25',NULL);
INSERT INTO phrases VALUES(3,'再','zài','again','2024-08-21 01:35:25','2024-08-21 01:35:25',NULL);
INSERT INTO phrases VALUES(4,'見','jiàn','meet','2024-08-21 01:35:25','2024-08-21 01:35:25',NULL);
INSERT INTO phrases VALUES(5,'好','hǎo','good','2024-08-21 01:35:25','2024-08-21 01:35:25',NULL);
INSERT INTO phrases VALUES(6,'魚','yú','fish','2024-08-21 01:35:25','2024-08-21 01:35:25',NULL);
INSERT INTO phrases VALUES(7,'牛','niú','cow','2024-08-21 01:35:25','2024-08-21 01:35:25',NULL);
INSERT INTO phrases VALUES(8,'肉','roù','meat','2024-08-21 01:35:25','2024-08-21 01:35:25',NULL);
INSERT INTO phrases VALUES(9,'雞','jī','chicken','2024-08-21 01:35:25','2024-08-21 01:35:25',NULL);
INSERT INTO phrases VALUES(10,'一','yī','one','2024-08-21 01:35:25','2024-08-21 01:35:25',NULL);
INSERT INTO phrases VALUES(11,'二','èr','two','2024-08-21 01:35:25','2024-08-21 01:35:25',NULL);
INSERT INTO phrases VALUES(12,'三','san','three','2024-08-21 01:35:25','2024-08-21 01:35:25',NULL);
INSERT INTO phrases VALUES(13,'四','sì','four','2024-08-21 01:35:25','2024-08-21 01:35:25',NULL);
INSERT INTO phrases VALUES(14,'五','wǔ','five','2024-08-21 01:35:25','2024-08-21 01:35:25',NULL);
INSERT INTO phrases VALUES(15,'六','liù','six','2024-08-21 01:35:25','2024-08-21 01:35:25',NULL);
INSERT INTO phrases VALUES(16,'七','qī','seven','2024-08-21 01:35:25','2024-08-21 01:35:25',NULL);
INSERT INTO phrases VALUES(17,'八','bā','eight','2024-08-21 01:35:25','2024-08-21 01:35:25',NULL);
INSERT INTO phrases VALUES(18,'九','jiǔ','nine','2024-08-21 01:35:25','2024-08-21 01:35:25',NULL);
INSERT INTO phrases VALUES(19,'十','shí','ten','2024-08-21 01:35:25','2024-08-21 01:35:25',NULL);
INSERT INTO phrases VALUES(20,'零','líng','zero','2024-08-21 01:35:25','2024-08-21 01:35:25',NULL);
INSERT INTO phrases VALUES(21,'百','bǎi','hundred','2024-08-21 01:35:25','2024-08-21 01:35:25',NULL);
INSERT INTO phrases VALUES(22,'元','yuán','Yuan','2024-08-21 01:35:25','2024-08-21 01:35:25',NULL);
INSERT INTO phrases VALUES(23,'邀請','yāoqǐng','invite','2024-08-21 01:35:25','2024-08-21 01:35:25',NULL);
INSERT INTO phrases VALUES(24,'說','shuō','say','2024-08-21 01:35:25','2024-08-21 01:35:25',NULL);
INSERT INTO phrases VALUES(25,'姐','Jiě','sister','2024-08-21 01:35:25','2024-08-21 01:35:25',NULL);
INSERT INTO phrases VALUES(26,'弟','dì','brother','2024-08-21 01:35:25','2024-08-21 01:35:25',NULL);
INSERT INTO phrases VALUES(27,'禱告','dǎogào','Pray','2024-08-21 01:35:25','2024-08-21 01:35:25',NULL);
INSERT INTO phrases VALUES(28,'想','xiǎng','want','2024-08-21 01:35:25','2024-08-21 01:35:25',NULL);
INSERT INTO phrases VALUES(29,'上','shàng','up','2024-08-21 01:35:25','2024-08-21 01:35:25',NULL);
INSERT INTO phrases VALUES(30,'樓上','lóushàng','upstairs','2024-08-21 01:35:25','2024-08-21 01:35:25',NULL);
INSERT INTO phrases VALUES(31,'黑','hēi','black','2024-08-31 14:04:16','2024-08-31 14:04:16',NULL);
INSERT INTO phrases VALUES(32,'包','bāo','wrap','2024-08-31 14:05:46','2024-08-31 14:05:46',NULL);
INSERT INTO phrases VALUES(33,'抱','bào','carry','2024-08-31 14:06:30','2024-08-31 14:06:30',NULL);
INSERT INTO phrases VALUES(34,'寶','bǎo','treasure','2024-08-31 14:09:18','2024-08-31 14:09:18',NULL);
INSERT INTO phrases VALUES(35,'白','bái','white','2024-08-31 14:11:06','2024-08-31 14:11:06',NULL);

