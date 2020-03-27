// JWT
const jwt = require('jsonwebtoken');

/**
 * [Read] 토큰
 * @param {*} results 쿼리 결과
 * @param {*} key 비밀 키
 */
const getToken = (results, key) => {
    const result = results[0];
    const token = jwt.sign(
        {
            m_seq : result.m_seq,
            account: result.account,
            name : result.name,
            picture: result.picture
        },
        key,
        {
            expiresIn: '1h',
            issuer: 'clipbound.com',
            subject: 'writer'
        }
    );
    return token;
}

module.exports = {
    getToken: getToken
}