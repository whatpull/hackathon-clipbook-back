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
 * [Create] 평점
 * @param {*} isTransaction 트랜젝션 여부
 * @param {*} next 
 * @param {*} params 변수
 * @param {*} callback 콜백
 */
const insertRating = (isTransaction, next, params, callback) => {
    const CURRENT_TIMESTAMP = { toSqlString: function() { return 'CURRENT_TIMESTAMP()'; } };
    const sql = {
        sql: 'INSERT INTO `BOOK_RATING` SET ?',
        values: {
            m_seq: params.m_seq,
            b_seq: params.b_seq,
            rating: params.rating,
            create_date: CURRENT_TIMESTAMP
        }
    }
    if(params.fk_br_seq) sql.values.fk_br_seq = params.fk_br_seq;
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
 * [Update] 평점
 * @param {*} isTransaction 트랜젝션 여부 
 * @param {*} next 
 * @param {*} params 변수
 * @param {*} callback 콜백
 */
const updateRating = (isTransaction, next, params, callback) => {
    const CURRENT_TIMESTAMP = { toSqlString: function() { return 'CURRENT_TIMESTAMP()'; } };
    const sql = {
        sql: 'UPDATE `BOOK_RATING` SET ? WHERE ?',
        values: [{
            update_date: CURRENT_TIMESTAMP
        }, {}]
    }
    if(params.rating) sql.values[0].rating = params.rating;
    // 조건절은 2가지중 한가지만
    if(params.br_seq) {
        sql.values[1].br_seq = params.br_seq;
    } else if(params.fk_br_seq) { 
        sql.values[1].fk_br_seq = params.fk_br_seq;
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
    insertRating: insertRating,
    updateRating: updateRating
}