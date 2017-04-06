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
        AND t.date >= '2017-04-06 00:00:00'
        AND EXISTS( SELECT 
            1
        FROM
            t_stock_tools m
        WHERE
            t.stock_code = m.stock_code
                AND m.date > '2017-03-29 00:00:00'
                AND m.date <= '2017-04-05 00:00:00'
                AND m.macd_bar < 0)

-- ----------------------------
-- diff转红
-- ----------------------------

SELECT 
    *
FROM
    t_stock_tools t
WHERE
    t.macd_dif > 0
        AND t.date = '2017-04-06 00:00:00'
        AND EXISTS( SELECT 
            1
        FROM
            t_stock_tools m
        WHERE
            t.stock_code = m.stock_code
                AND m.date = '2017-04-05 00:00:00'
                AND m.macd_dif < 0)        