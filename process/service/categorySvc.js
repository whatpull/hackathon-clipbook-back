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
 * [Read] 카테고리
 * @param {*} next 
 * @param {*} callback 콜백
 */
const selectCategory = (next, callback) => {
    const sql = {
        sql: 'SELECT * FROM `BOOK_CATEGORY` AS category ORDER BY category.kr_name',
        values: [],
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

module.exports = {
    setConnection: setConnection,
    selectCategory: selectCategory
}