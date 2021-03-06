CREATE DATABASE stock;


CREATE TABLE `t_stock_name` (
`code`  varchar(255) NOT NULL ,
`market`  varchar(255) NOT NULL ,
PRIMARY KEY (`code`)
);

--**********************job************************

CREATE TABLE `t_job_status` (
`status_id`  int NOT NULL ,
`status_desc`  varchar(255) NOT NULL ,
PRIMARY KEY (`status_id`)
)
;


CREATE TABLE `t_job_type` (
`type_id`  int NOT NULL ,
`type_desc`  varchar(255) NOT NULL ,
PRIMARY KEY (`type_id`)
)
;

CREATE TABLE `t_job` (
`job_id`  int NOT NULL ,
`job_type_id`  int NULL ,
`job_status_id`  int NULL ,
PRIMARY KEY (`job_id`),
CONSTRAINT `f_type` FOREIGN KEY (`job_type_id`) REFERENCES `t_job_type` (`type_id`),
CONSTRAINT `f_status` FOREIGN KEY (`job_status_id`) REFERENCES `t_job_status` (`status_id`)
)
;

ALTER TABLE `stock`.`t_job` 
ADD COLUMN `date` DATE NULL AFTER `job_status_id`;
ALTER TABLE `stock`.`t_job` 
ADD COLUMN `source` VARCHAR(255) NULL AFTER `date`;

ALTER TABLE `t_job`
MODIFY COLUMN `job_id`  int(11) NOT NULL AUTO_INCREMENT FIRST ;

insert into t_job_status (status_id, status_desc) values (1, "New");
insert into t_job_status (status_id, status_desc) values (2, "Running");
insert into t_job_status (status_id, status_desc) values (3, "Finished");
insert into t_job_status (status_id, status_desc) values (4, "Failed");

insert into t_job_type (type_id, type_desc) values (1, "Stock Name Fetch");
insert into t_job_type (type_id, type_desc) values (2, "Stock detail initial Fetch");
--**********************job************************

/*
Navicat MySQL Data Transfer

Source Server         : cloud
Source Server Version : 80000
Source Host           : 115.159.68.208:3306
Source Database       : stock

Target Server Type    : MYSQL
Target Server Version : 80000
File Encoding         : 65001

Date: 2016-12-21 20:24:58
*/

-- ----------------------------
-- Table structure for t_stock_detail
-- ----------------------------
DROP TABLE IF EXISTS `t_stock_detail`;
CREATE TABLE `t_stock_detail` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `stock_code` varchar(255) NOT NULL,
  `begin_price` float(30,4) NOT NULL,
  `last_day_price` float(30,4) NOT NULL,
  `price` float(30,4) NOT NULL,
  `top_price` float(30,4) NOT NULL,
  `low_price` float(30,4) NOT NULL,
  `amount_stock` float(30,4) NOT NULL,
  `amount_money` float(30,4) NOT NULL,
  `date` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniqui` (`stock_code`,`date`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=latin1;

/*
Navicat MySQL Data Transfer

Source Server         : 115.159.68.208
Source Server Version : 80000
Source Host           : 115.159.68.208:3306
Source Database       : stock

Target Server Type    : MYSQL
Target Server Version : 80000
File Encoding         : 65001

Date: 2017-03-08 22:04:08
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for t_stack_tools
-- ----------------------------
DROP TABLE IF EXISTS `t_stock_tools`;
CREATE TABLE `t_stack_tools` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `detail_id` int(11) NOT NULL,
  `macd_dif` float(10,2) DEFAULT NULL,
  `macd_dea` float(10,2) DEFAULT NULL,
  `macd_bar` float(10,2) DEFAULT NULL,
  `macd_ema12` float(10,2) DEFAULT NULL,
  `macd_ema26` float(10,2) DEFAULT NULL,
  `price_day_10` float(255,2) DEFAULT NULL,
  `price_day_20` float(255,2) DEFAULT NULL,
  `price_day_30` float(255,2) DEFAULT NULL,
  `price_day_60` float(255,2) DEFAULT NULL,
  `price_day_120` float(255,2) DEFAULT NULL,
  `price_day_250` float(255,2) DEFAULT NULL,
  `price_day_13` float(255,2) DEFAULT NULL,
  `price_day_34` float(255,2) DEFAULT NULL,
  `price_day_55` float(255,2) DEFAULT NULL,
  `price_day_89` float(255,2) DEFAULT NULL,
  `amount_day_10` float(255,2) DEFAULT NULL,
  `price_day_144` float(255,2) DEFAULT NULL,
  `amount_day_20` float(255,2) DEFAULT NULL,
  `amount_day_30` float(255,2) DEFAULT NULL,
  `amount_day_60` float(255,2) DEFAULT NULL,
  `amount_day_120` float(255,2) DEFAULT NULL,
  `amount_day_250` float(255,2) DEFAULT NULL,
  `amount_day_13` float(255,2) DEFAULT NULL,
  `amount_day_34` float(255,2) DEFAULT NULL,
  `amount_day_55` float(255,2) DEFAULT NULL,
  `amount_day_89` float(255,2) DEFAULT NULL,
  `amount_day_144` float(255,2) DEFAULT NULL,
  `stock_code` varchar(255) NOT NULL,
  `boll_mid` float(255,2) DEFAULT NULL,
  `date` datetime NOT NULL,
  `boll_uper` float(255,2) DEFAULT NULL,
  `boll_down` float(255,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `f_detail_id` (`detail_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

ALTER TABLE `stock`.`t_stock_tools` 
ADD UNIQUE INDEX `search` (`stock_code` ASC, `date` ASC);


CREATE TABLE `t_strategy` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `strategy_name` VARCHAR(45) NOT NULL,
  `strategy_comments` VARCHAR(255) NULL,
  PRIMARY KEY (`id`))

  CREATE TABLE `stock`.`t_strategy_tester` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `strategy_id` INT NOT NULL,
  `stock_code` VARCHAR(45) NOT NULL,
  `price` FLOAT(10,2) NOT NULL,
  `date` DATETIME NOT NULL,
  `price_5` FLOAT(10,2) NULL,
  `price_10` FLOAT(10,2) NULL,
  `price_30` FLOAT(10,2) NULL,
  `price_60` FLOAT(10,2) NULL,
  `price_180` FLOAT(10,2) NULL,
  `price_360` FLOAT(10,2) NULL,
  `strength_5` FLOAT(10,2) NULL,
  `strength_10` FLOAT(10,2) NULL,
  `strength_30` FLOAT(10,2) NULL,
  `strength_60` FLOAT(10,2) NULL,
  `strength_180` FLOAT(10,2) NULL,
  `strength_360` FLOAT(10,2) NULL,
  PRIMARY KEY (`id`),
  INDEX `f_stragegy_id_idx` (`strategy_id` ASC),
  CONSTRAINT `f_stragegy_id`
    FOREIGN KEY (`strategy_id`)
    REFERENCES `stock`.`t_strategy` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);
ALTER TABLE `stock`.`t_strategy` 
ADD COLUMN `status` INT NOT NULL AFTER `strategy_comments`;

ALTER TABLE `stock`.`t_strategy_tester` 
ADD UNIQUE INDEX `search` (`stock_code` ASC, `date` ASC, `strategy_id` ASC);



ALTER TABLE `stock`.`t_strategy_tester` 
ADD COLUMN `v1` VARCHAR(45) NULL AFTER `strength_360`,
ADD COLUMN `v2` VARCHAR(45) NULL AFTER `v1`,
ADD COLUMN `v3` VARCHAR(45) NULL AFTER `v2`;


INSERT INTO `stock`.`t_strategy` (`strategy_name`, `strategy_comments`, `status`) VALUES ('shrunk_1', '取60天数据，最近5天的成交量是平均成交量的1/3， 是头5天成交量的1/8', '1');
INSERT INTO `stock`.`t_strategy` (`strategy_name`, `strategy_comments`, `status`) VALUES ('macd_1', '取三天的数据，中间那一天是最小的值，', '2');
INSERT INTO `stock`.`t_strategy` (`strategy_name`, `strategy_comments`, `status`) VALUES ('macd_2_gold', 'MACD 金叉', '3');
INSERT INTO `stock`.`t_job_type` (`type_id`, `type_desc`) VALUES ('3', 'strategy daily fetch');
