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
 * [Create] 책
 * @param {*} isTransaction 트랜젝션 여부
 * @param {*} next 
 * @param {*} params 변수
 * @param {*} callback 콜백
 */
const insertBook = (isTransaction, next, params, callback) => {
    const CURRENT_TIMESTAMP = { toSqlString: function() { return 'CURRENT_TIMESTAMP()'; } };
    const sql = {
        sql: 'INSERT INTO `BOOK` SET ?',
        values: {
            m_seq: params.m_seq,
            f_seq: params.f_seq,
            bc_seq: params.bc_seq,
            title: params.title,
            author: params.author,
            summary: params.summary,
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
 * [Read] 전체 카운트
 * @param {*} next 
 * @param {*} params 변수
 * @param {*} callback 콜백
 */
const selectCount = (next, params, callback) => {
    const sql = {
        sql: 'SELECT COUNT(book.b_seq) AS `count` ' +
             'FROM `BOOK` AS book ' +
             'LEFT JOIN `BOOK_READ` AS `read` ON (book.b_seq = `read`.b_seq AND `read`.m_seq = ?) ' +
             'LEFT JOIN `BOOK_FAVORITE` AS favorite ON (book.b_seq = favorite.b_seq AND favorite.m_seq = ?) ' +
             'WHERE book.remove = "N" ',
        values: []
    }
    if(params.br_m_seq) {
        sql.values.push(params.br_m_seq);
    } else {
        sql.values.push('');
    }
    if(params.bf_m_seq) {
        sql.values.push(params.bf_m_seq);
    } else {
        sql.values.push('');
    }
    if(params.query) { // 제목 검색
        const query = { toSqlString: function() { return params.query; } };
        sql.sql += 'AND (book.title LIKE "%?%" OR book.author LIKE "%?%") ';
        sql.values.push(query);
        sql.values.push(query);
    }
    if(params.bc_seq && params.bc_seq > 0) { // 카테고리 검색
        sql.sql += 'AND book.bc_seq = ? ';
        sql.values.push(params.bc_seq);
    }
    if(params.b_seq) { // 시퀀스 검색
        sql.sql += 'AND book.b_seq = ? ';
        sql.values.push(params.b_seq);
    }
    if(params.m_seq) { // 회원 시퀀스 검색
        sql.sql += 'AND book.m_seq = ? ';
        sql.values.push(params.m_seq);
    }
    // group by
    sql.sql += 'ORDER BY book.create_date DESC';
    connection.query(sql, function(error, results, fields) {
        if(error) {
            next(new Error(error.code));
        } else { 
            if (typeof callback === "function") callback(results);
        }
    });
}

/**
 * [Read] 책
 * @param {*} next 
 * @param {*} params 변수
 * @param {*} callback 콜백
 */
const selectBook = (next, params, callback) => {
    const sql = {
        sql: 'SELECT book.*, ' +
             'writer.account, ' +
             'writer.name, ' +
             'IF(writer.f_seq IS NULL, writer.picture, CONCAT(picture.path, "/", picture.name)) AS writer_picture, ' +
             'thumbnail.*, ' +
             'category.* , ' + 
             'AVG(IFNULL(rating.rating, 0)) AS avg_rating, ' +
             'IF(`read`.br_seq IS NULL, 0, 1) AS `read`, ' +
             'IF(favorite.bf_seq IS NULL, 0, 1) AS favorite ' +
             'FROM `BOOK` AS book ' +
             'LEFT JOIN `MEMBER` AS writer ON book.m_seq = writer.m_seq ' +
             'LEFT JOIN `FILE` AS picture ON writer.f_seq = picture.f_seq ' +
             'LEFT JOIN `FILE` AS thumbnail ON book.f_seq = thumbnail.f_seq ' +
             'LEFT JOIN `BOOK_CATEGORY` AS category ON book.bc_seq = category.bc_seq ' +
             'LEFT JOIN `BOOK_RATING` AS rating ON book.b_seq = rating.b_seq ' +
             'LEFT JOIN `BOOK_READ` AS `read` ON (book.b_seq = `read`.b_seq AND `read`.m_seq = ?) ' +
             'LEFT JOIN `BOOK_FAVORITE` AS favorite ON (book.b_seq = favorite.b_seq AND favorite.m_seq = ?) ' +
             'WHERE book.remove = "N" ',
        values: [],
        nestTables: true
    }
    if(params.br_m_seq) {
        sql.values.push(params.br_m_seq);
    } else {
        sql.values.push('');
    }
    if(params.bf_m_seq) {
        sql.values.push(params.bf_m_seq);
    } else {
        sql.values.push('');
    }
    if(params.query) { // 제목 검색
        const query = { toSqlString: function() { return params.query; } };
        sql.sql += 'AND (book.title LIKE "%?%" OR book.author LIKE "%?%") ';
        sql.values.push(query);
        sql.values.push(query);
    }
    if(params.bc_seq && params.bc_seq > 0) { // 카테고리 검색
        sql.sql += 'AND book.bc_seq = ? ';
        sql.values.push(params.bc_seq);
    }
    if(params.b_seq) { // 시퀀스 검색
        sql.sql += 'AND book.b_seq = ? ';
        sql.values.push(params.b_seq);
    }
    if(params.m_seq) { // 회원 시퀀스 검색
        sql.sql += 'AND book.m_seq = ? ';
        sql.values.push(params.m_seq);
    }
    // group by
    sql.sql += 'GROUP BY book.b_seq ';
    sql.sql += 'ORDER BY book.create_date DESC ';
    if(typeof params.start_num !== "undefined"
        && params.start_num >= 0
        && typeof params.end_num !== "undefined"
        && params.end_num >= 0) {
        sql.sql += 'LIMIT ?, ?'
        sql.values.push(params.start_num);
        sql.values.push(params.end_num);
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
 * [Update] 책
 * @param {*} isTransaction 트랜젝션 여부
 * @param {*} next 
 * @param {*} params 변수
 * @param {*} callback 콜백
 */
const updateBook = (isTransaction, next, params, callback) => {
    const CURRENT_TIMESTAMP = { toSqlString: function() { return 'CURRENT_TIMESTAMP()'; } };
    const sql = {
        sql: 'UPDATE `BOOK` SET ? WHERE b_seq = ?',
        values: [{
            update_date: CURRENT_TIMESTAMP
        }, params.b_seq]
    }
    if(params.f_seq) sql.values[0].f_seq = params.f_seq;
    if(params.bc_seq) sql.values[0].bc_seq = params.bc_seq;
    if(params.title) sql.values[0].title = params.title;
    if(params.author) sql.values[0].author = params.author;
    if(params.summary) sql.values[0].summary = params.summary;
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
    insertBook: insertBook,
    selectCount: selectCount,
    selectBook: selectBook,
    updateBook: updateBook
}