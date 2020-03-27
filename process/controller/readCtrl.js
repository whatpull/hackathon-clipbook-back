// 서비스
const readSvc = require('../service/readSvc');

// [읽은책 등록]
const regist = (req, res, next) => {
    // 데이터베이스 설정
    const connection = req.app.locals.connection;
    readSvc.setConnection(connection);

    const body = req.body;
    readSvc.insertRead(false, next, body, (results) => {
        res.status(200).json({
            result: "success",
            code: 200,
            message: "읽기 설정이 완료되었습니다.",
            data: results
        });
    });
}

// [읽은책 리스트]
const list = (req, res, next) => {
    // 데이터베이스 설정
    const connection = req.app.locals.connection;
    readSvc.setConnection(connection);

    const query = req.query;
    readSvc.selectRead(next, query, (results) => {
        res.status(200).json({
            result: "success",
            code: 200,
            message: "읽은책 리스트 조회가 완료되었습니다.",
            data: results
        });
    });
}

// [읽은책 취소]
const remove = (req, res, next) => {
    // 데이터베이스 설정
    const connection = req.app.locals.connection;
    readSvc.setConnection(connection);

    const query = req.query;
    const b_seq = query.b_seq;
    const m_seq = query.m_seq;
    if(b_seq && m_seq) {
        readSvc.deleteRead(false, next, query, (results) => {
            res.status(200).json({
                result: "success",
                code: 200,
                message: "읽기 설정이 취소되었습니다.",
                data: results
            });
        });
    } else {
        res.status(200).json({
            result: "error",
            code: 6001,
            message: "취소 대상 정보가 없습니다."
        });
    }
}

module.exports = {
    regist: regist,
    list: list,
    remove: remove
}