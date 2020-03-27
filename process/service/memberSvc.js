// 암호화
const bcrypt = require('bcrypt');
const saltRounds = 10;
// 데이터베이스 컨넥션
let connection;

/**
 * [시스템] 연결
 * @param {*} connection 연결 
 */
const setConnection = (param_connection) => {
    connection = param_connection;
}

/**
 * [Create] 회원
 * @param {*} isTransaction 트랜젝션 여부 
 * @param {*} next 
 * @param {*} param 변수 
 * @param {*} callback 콜백
 */
const insertMember = (isTransaction, next, params, callback) => {
    const CURRENT_TIMESTAMP = { toSqlString: function() { return 'CURRENT_TIMESTAMP()'; } };
    const password_bcrypt = typeof params.password === "undefined" ? undefined : bcrypt.hashSync(params.password, saltRounds);
    const sql = {
        sql: 'INSERT INTO `MEMBER` SET ?',
        values: {
            name: params.name,
            picture: params.picture,
            account: params.account,
            password: password_bcrypt,
            create_date: CURRENT_TIMESTAMP
        }
    }
    connection.query(sql, function(error, results, fields) {
        if(error) {
            if(isTransaction) {
                return connection.rollback(function() {
                    next(new Error(error.code));
                });
            } else {
                next(new Error(error.code));
            }
        } else { 
            if (typeof callback === "function") callback(results);
        }
    });
}

/**
 * [Read] 회원
 * @param {*} next 
 * @param {*} param 변수 
 * @param {*} callback 콜백
 */
const selectMember = (next, params, callback) => {
    const sql = {
        sql: 'SELECT A.*, ' +
             'IF(A.f_seq IS NULL, A.picture, CONCAT(B.path, "/", B.name))  AS picture ' +
             'FROM `MEMBER` AS A ' +
             'LEFT JOIN `FILE` AS B ON A.f_seq = B.f_seq ' +
             'WHERE A.withdraw = "N" ',
        values: []
    }
    if(params.account) {
        sql.sql += 'AND A.account = ? ';
        sql.values.push(params.account);
    }
    if(params.m_seq) {
        sql.sql += 'AND A.m_seq = ? ';
        sql.values.push(params.m_seq);
    }
    connection.query(sql, function(error, results, fields) {
        if(error) {
            next(new Error(error.code));
        } else { 
            if (typeof callback === "function") callback(results);
        }
    });
}

/**
 * [Update] 회원
 * @param {*} isTransaction 트랜젝션 여부 
 * @param {*} next 
 * @param {*} params 변수
 * @param {*} callback 콜백
 */
const updateMember = (isTransaction, next, params, callback) => {
    const CURRENT_TIMESTAMP = { toSqlString: function() { return 'CURRENT_TIMESTAMP()'; } };
    const sql = {
        sql: 'UPDATE `MEMBER` SET ? WHERE m_seq = ?',
        values: [{
            update_date: CURRENT_TIMESTAMP
        }, params.m_seq]
    }
    if(params.f_seq) sql.values[0].f_seq = params.f_seq;
    if(params.name) sql.values[0].name = params.name;
    if(params.password) sql.values[0].password = bcrypt.hashSync(params.password, saltRounds);
    if(params.withdraw) {
        sql.values[0].withdraw = params.withdraw;
        if(params.withdraw === "Y") {
            sql.values[0].withdraw_date = CURRENT_TIMESTAMP;
        }
    }
    connection.query(sql, function(error, results, fields) {
        if(error) {
            if(isTransaction) {
                return connection.rollback(function() {
                    next(new Error(error.code));
                });
            } else {
                next(new Error(error.code));
            }
        } else { 
            if (typeof callback === "function") callback(results);
        }
    });
}

module.exports = {
    setConnection: setConnection,
    insertMember: insertMember,
    selectMember: selectMember,
    updateMember: updateMember,
}