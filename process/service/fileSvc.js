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
 * [Create] 파일
 * @param {*} isTransaction 트랜젝션 여부 
 * @param {*} next 
 * @param {*} params 변수 
 * @param {*} callback 콜백
 */
const insertFile = (isTransaction, next, params, callback) => {
    const CURRENT_TIMESTAMP = { toSqlString: function() { return 'CURRENT_TIMESTAMP()'; } };
    const sql = {
        sql: 'INSERT INTO `FILE` SET ?',
        values: {
            original: params.original,
            name: params.name,
            path: params.path,
            type: params.type,
            mime: params.mime,
            size: params.size,
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

module.exports = {
    setConnection: setConnection,
    insertFile: insertFile
}