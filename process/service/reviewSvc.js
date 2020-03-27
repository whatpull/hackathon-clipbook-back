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
 * [Create] 리뷰
 * @param {*} isTransaction 트랜젝션 여부
 * @param {*} next 
 * @param {*} params 변수
 * @param {*} callback 콜백
 */
const insertReview = (isTransaction, next, params, callback) => {
    const CURRENT_TIMESTAMP = { toSqlString: function() { return 'CURRENT_TIMESTAMP()'; } };
    const sql = {
        sql: 'INSERT INTO `BOOK_REVIEW` SET ?',
        values: {
            b_seq: params.b_seq,
            m_seq: params.m_seq,
            review: params.review,
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
 * [Read] 리뷰
 * @param {*} next 
 * @param {*} params 변수 
 * @param {*} callback 콜백
 */
const selectReview = (next, params, callback) => {
    const sql = {
        sql: 'SELECT * ' +
             'FROM `BOOK_REVIEW` AS review ' +
             'LEFT JOIN `BOOK` AS book ON review.b_seq = book.b_seq ' + 
             'LEFT JOIN `FILE` AS thumbnail ON book.f_seq = thumbnail.f_seq ' + 
             'LEFT JOIN `MEMBER` AS writer ON review.m_seq = writer.m_seq ' +
             'LEFT JOIN `BOOK_RATING` AS rating ON review.br_seq = rating.fk_br_seq ' +
             'WHERE review.remove = "N" AND book.remove = "N" ',
        values: [],
        nestTables: true
    }
    if(params.m_seq) {
        sql.sql += 'AND review.m_seq = ? ';
        sql.values.push(params.m_seq);
    }
    if(params.b_seq) {
        sql.sql += 'AND review.b_seq = ? ';
        sql.values.push(params.b_seq);
    }
    sql.sql += 'ORDER BY review.create_date DESC';
    connection.query(sql, function(error, results, fields) {
        if(error) {
            next(new Error(error.code));
        } else { 
            if (typeof callback === "function") callback(results);
        }
    });
}

/**
 * [Update] 리뷰 수정
 * @param {*} isTransaction 트랜젝션 여부
 * @param {*} next 
 * @param {*} params 변수
 * @param {*} callback 콜백
 */
const updateReview = (isTransaction, next, params, callback) => {
    const CURRENT_TIMESTAMP = { toSqlString: function() { return 'CURRENT_TIMESTAMP()'; } };
    const sql = {
        sql: 'UPDATE `BOOK_REVIEW` SET ? WHERE br_seq = ?',
        values: [{
            update_date: CURRENT_TIMESTAMP
        }, params.br_seq]
    }
    if(params.b_seq) sql.values[0].b_seq = params.b_seq;
    if(params.m_seq) sql.values[0].m_seq = params.m_seq;
    if(params.review) sql.values[0].review = params.review;
    if(params.remove) {
        sql.values[0].remove = params.remove;
        if(params.remove === "Y") {
            sql.values[0].remove_date = CURRENT_TIMESTAMP;
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
    insertReview: insertReview,
    selectReview: selectReview,
    updateReview: updateReview
}