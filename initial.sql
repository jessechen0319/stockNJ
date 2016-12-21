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

ALTER TABLE `t_job`
MODIFY COLUMN `job_id`  int(11) NOT NULL AUTO_INCREMENT FIRST ;

insert into t_job_status (status_id, status_desc) values (1, "New");
insert into t_job_status (status_id, status_desc) values (2, "Running");
insert into t_job_status (status_id, status_desc) values (3, "Finished");
insert into t_job_status (status_id, status_desc) values (4, "Failed");

insert into t_job_type (type_id, type_desc) values (1, "Stock Name Fetch");

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

SET FOREIGN_KEY_CHECKS=0;

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

