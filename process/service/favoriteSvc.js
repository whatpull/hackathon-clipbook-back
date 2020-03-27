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
 * [Create] 즐겨찾기
 * @param {*} isTransaction 트랜젝션 여부 
 * @param {*} next 
 * @param {*} params 변수
 * @param {*} callback 콜백
 */
const insertFavorite = (isTransaction, next, params, callback) => {
    const CURRENT_TIMESTAMP = { toSqlString: function() { return 'CURRENT_TIMESTAMP()'; } };
    const sql = {
        sql: 'INSERT INTO `BOOK_FAVORITE` SET ?',
        values: {
            m_seq: params.m_seq,
            b_seq: params.b_seq,
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
 * [Read] 즐겨찾기
 * @param {*} next 
 * @param {*} params 변수
 * @param {*} callback 콜백
 */
const selectFavorite = (next, params, callback) => {
    const sql = {
        sql: 'SELECT book.*, thumbnail.* ' +
             'FROM `BOOK_FAVORITE` AS `favorite` ' +
             'LEFT JOIN `BOOK` AS book ON `favorite`.b_seq = book.b_seq ' +
             'LEFT JOIN `FILE` AS thumbnail ON book.f_seq = thumbnail.f_seq ' +
             'WHERE book.remove = "N" ' +
             'AND `favorite`.m_seq = ? ' +
             'ORDER BY `favorite`.create_date DESC',
        values: [params.m_seq],
        nestTables: true
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
 * [Delete] 즐겨찾기
 * @param {*} isTransaction 트랜젝션 여부
 * @param {*} next 
 * @param {*} params 변수
 * @param {*} callback 콜백
 */
const deleteFavorite = (isTransaction, next, params, callback) => {
    const sql = {
        sql: 'DELETE FROM `BOOK_FAVORITE` WHERE b_seq = ? AND m_seq = ?',
        values: [params.b_seq, params.m_seq]
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
    insertFavorite: insertFavorite,
    selectFavorite: selectFavorite,
    deleteFavorite: deleteFavorite
}