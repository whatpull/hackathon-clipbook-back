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
 * [Create] OAuth2
 * @param {*} isTransaction 트랜젝션 여부 
 * @param {*} next 
 * @param {*} params 변수
 * @param {*} callback 콜백
 */
const insertOAuth2 = (isTransaction, next, params, callback) => {
    const CURRENT_TIMESTAMP = { toSqlString: function() { return 'CURRENT_TIMESTAMP()'; } };
    const sql = {
        sql: 'INSERT INTO `OAUTH2` SET ?',
        values: {
            m_seq: params.m_seq,
            provider: params.provider,
            access_token: params.access_token,
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
 * [Upadate] OAuth2
 * @param {*} isTransaction 트랜젝션 여부 
 * @param {*} next 
 * @param {*} params 변수
 * @param {*} callback 콜백
 */
const updateOAuth2 = (isTransaction, next, params, callback) => {
    const CURRENT_TIMESTAMP = { toSqlString: function() { return 'CURRENT_TIMESTAMP()'; } };
    const sql = {
        sql: 'UPDATE `OAUTH2` SET ? WHERE m_seq = ? AND provider = ?',
        values: [{
            update_date: CURRENT_TIMESTAMP
        }, params.m_seq, params.provider]
    }

    if(params.access_token) sql.values[0].access_token = params.access_token;

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
    insertOAuth2: insertOAuth2,
    updateOAuth2: updateOAuth2
}