// 서비스
const reviewSvc = require('../service/reviewSvc');
const ratingSvc = require('../service/ratingSvc');

// [리뷰 등록]
// 트랜젝션 처리
// 이미 평점이 등록되어 있는 경우 - update 처리
// 위의 경우 별도의 평점 등록이 존재하는 경우
const regist = (req, res, next) => {
    // 데이터베이스 설정
    const connection = req.app.locals.connection;
    reviewSvc.setConnection(connection);
    ratingSvc.setConnection(connection);

    const body = req.body;
    const rating = body.rating;
    if(rating && (parseInt(rating) > 0 && parseInt(rating) < 6 )) {
        // 트랜젝션 시작
        connection.beginTransaction(function(error) {
            if (error) { 
                next(new Error(error)); 
            } else {
                reviewSvc.insertReview(true, next, body, (results) => {
                    const params = {
                        fk_br_seq: results.insertId,
                        b_seq: body.b_seq,
                        m_seq: body.m_seq,
                        rating: rating
                    }
                    ratingSvc.insertRating(true, next, params, (results) => {
                        connection.commit(function(error) {
                            if (error) {
                                return connection.rollback(function() {
                                    next(new Error(error));
                                });
                            } else {
                                res.status(200).json({
                                    result: "success",
                                    code: 200,
                                    message: "리뷰 등록이 완료되었습니다.",
                                    data: results
                                });
                            }
                        });
                    });
                });
            }
        });
    } else {
        res.status(200).json({
            result: "error",
            code: 5001,
            message: "평점은 1부터 5까지 숫자로 지정되어야 합니다."
        });
    }
}

// [리뷰 리스트]
const list = (req, res, next) => {
    // 데이터베이스 설정
    const connection = req.app.locals.connection;
    reviewSvc.setConnection(connection);
    ratingSvc.setConnection(connection);

    const query = req.query;
    reviewSvc.selectReview(next, query, (results) => {
        res.status(200).json({
            result: "success",
            code: 200,
            message: "리뷰 리스트 조회가 완료되었습니다.",
            data: results
        });
    });
}

// [리뷰 수정]
// 트랜젝션 처리
const update = (req, res, next) => {
    // 데이터베이스 설정
    const connection = req.app.locals.connection;
    reviewSvc.setConnection(connection);
    ratingSvc.setConnection(connection);
    
    const body = req.body;
    const br_seq = body.br_seq;
    if(br_seq) {
        const rating = body.rating;
        if(rating && (parseInt(rating) > 0 && parseInt(rating) < 6 )) {
            // 트랜젝션 시작
            connection.beginTransaction(function(error) {
                if (error) { 
                    next(new Error(error)); 
                } else {
                    reviewSvc.updateReview(true, next, body, (results) => {
                        const params = {
                            fk_br_seq: br_seq,
                            rating: rating
                        }
                        ratingSvc.updateRating(true, next, params, (results) => {
                            connection.commit(function(error) {
                                if (error) {
                                    return connection.rollback(function() {
                                        next(new Error(error));
                                    });
                                } else {
                                    res.status(200).json({
                                        result: "success",
                                        code: 200,
                                        message: "리뷰 수정이 완료되었습니다.",
                                        data: results
                                    });
                                }
                            });
                        });
                    });
                }
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
    list: list,
    update: update
}