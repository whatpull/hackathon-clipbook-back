// 서비스
const ratingSvc = require('../service/ratingSvc');

// [평점 등록]
const regist = (req, res, next) => {
    // 데이터베이스 설정
    const connection = req.app.locals.connection;
    ratingSvc.setConnection(connection);

    const body = req.body;
    const rating = body.rating;
    if(rating && (parseInt(rating) > 0 && parseInt(rating) < 6 )) {
        ratingSvc.insertRating(false, next, body, (results) => {
            res.status(200).json({
                result: "success",
                code: 200,
                message: "평점 등록이 완료되었습니다.",
                data: results
            });
        });
    } else {
        res.status(200).json({
            result: "error",
            code: 5001,
            message: "평점은 1부터 5까지 숫자로 지정되어야 합니다."
        });
    }
}

// [평점 수정]
const update = (req, res, next) => {
    // 데이터베이스 설정
    const connection = req.app.locals.connection;
    ratingSvc.setConnection(connection);

    const body = req.body;
    const br_seq = body.br_seq;
    const fk_br_seq = body.fk_br_seq;
    const rating = body.rating;
    if(br_seq || fk_br_seq) {
        if(rating && (parseInt(rating) > 0 && parseInt(rating) < 6 )) {
            ratingSvc.updateRating(false, next, body, (results) => {
                res.status(200).json({
                    result: "success",
                    code: 200,
                    message: "평점 수정이 완료되었습니다.",
                    data: results
                });
            });
        } else {
            res.status(200).json({
                result: "error",
                code: 5001,
                message: "평점은 1부터 5까지 숫자로 지정되어야 합니다."
            });
        }
    } else {
        res.status(200).json({
            result: "error",
            code: 6001,
            message: "수정 대상 정보가 없습니다."
        });
    }
}

module.exports = {
    regist: regist,
    update: update
}