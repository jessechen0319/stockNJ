-- ----------------------------
-- 水上金叉
-- ----------------------------

SELECT 
    *
FROM
    t_stock_tools t
WHERE
    t.macd_dif > 0 AND t.macd_dea > 0
        AND t.macd_bar > 0
        AND t.macd_bar < 0.03
        AND t.date = '2017-04-11 00:00:00'
        AND EXISTS( SELECT 
            1
        FROM
            t_stock_tools m
        WHERE
            t.stock_code = m.stock_code
                AND m.date = '2017-04-10 00:00:00'
                AND m.macd_bar < 0)

-- ----------------------------
-- diff转红
-- ----------------------------

select * from t_stock_tools t where t.date='2017-04-11 00:00:00'
and t.macd_dif>0
and not exists 
(select 1 from t_stock_tools m where m.date<='2017-04-10 00:00:00'
and m.date>'2017-03-05 00:00:00'
and m.stock_code=t.stock_code
and m.macd_dif>0)