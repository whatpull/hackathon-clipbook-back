const jwt = require('jsonwebtoken');

/**
 * [미들웨어] JWT 토큰 검증
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function check(req, res, next) {
    const secret = req.app.get('key');
    const token = req.headers['x-access-token'] || req.query.token;

    if(token) {
        const verify = new Promise((resolve, reject) => {
            jwt.verify(token, secret, (err, decoded) => {
                if(err) reject(err);
                resolve(decoded);
            })
        });
        
        verify.then((decoded) => {
            req.member = decoded;
            console.log("토큰인증 성공");
            next();
        }).catch((err) => {
            res.status(200).json(
                {
                    "result": "error",
                    "code": 4002,
                    "message": "유효한 토큰이 아닙니다."
                }
            );
        })
    } else {
        res.status(200).json(
            {
                "result": "error",
                "code": 4001,
                "message": "토큰값이 존재하지 않습니다."
            }
        );
    }
}

module.exports = {
    check: check
}