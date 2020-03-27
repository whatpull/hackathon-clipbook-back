// 서비스
const bookSvc = require('../service/bookSvc');
const awsSvc = require('../service/awsSvc');
const fileSvc = require('../service/fileSvc');

// [책 등록]
const regist = (req, res, next) => {
    // 데이터베이스 설정
    const connection = req.app.locals.connection;
    bookSvc.setConnection(connection);
    fileSvc.setConnection(connection);

    const body = req.body;

    const thumbnail = req.file;
    const original = thumbnail.originalname;
    const extension = original.substring(original.lastIndexOf("."));
    const mime = thumbnail.mimetype;
    const size = thumbnail.size;
    const buffer = thumbnail.buffer;
    
    awsSvc.upload(extension, "thumbnail", buffer, (bucket, key) => {
        const params = {
            original: original,
            name: key,
            path: bucket,
            type: "thumbnail",
            mime: mime,
            size: size
        }

        // 트랜젝션 시작
        connection.beginTransaction(function(error) {
            if (error) { 
                next(new Error(error)); 
            } else {
                fileSvc.insertFile(true, next, params, (results) => {
                    const params = {
                        m_seq: body.m_seq,
                        f_seq: results.insertId,
                        bc_seq: body.bc_seq,
                        title: body.title,
                        author: body.author,
                        summary: body.summary
                    }
                    bookSvc.insertBook(true, next, params, (results) => {
                        connection.commit(function(error) {
                            if (error) {
                                return connection.rollback(function() {
                                    next(new Error(error));
                                });
                            } else {
                                res.status(200).json({
                                    result: "success",
                                    code: 200,
                                    message: "책 등록이 완료되었습니다.",
                                    data: results
                                });
                            }
                        });
                    });
                });
            }
        });
    });
}

// [책 조회]
const list = (req, res, next) => {
    // 데이터베이스 설정
    const connection = req.app.locals.connection;
    bookSvc.setConnection(connection);
    fileSvc.setConnection(connection);

    const query = req.query;
    const current_page = typeof req.query.current_page === "undefined" ? 1 : req.query.current_page;
    const page_item_size = typeof req.query.page_item_size === "undefined" ? 10 : req.query.page_item_size;

    bookSvc.selectCount(next, query, (results) => {
        const total = results[0].count;
        const total_page = total / page_item_size;
        const is_next = current_page < total_page;
        // 리미트 페이지 처리
        const start_num = (current_page - 1) * page_item_size;
        const end_num = current_page * page_item_size;
        req.query.start_num = start_num;
        req.query.end_num = end_num;
        bookSvc.selectBook(next, query, (results) => {
            res.status(200).json({
                result: "success",
                code: 200,
                message: "책 리스트 조회가 완료되었습니다.",
                page: {
                    current_page: current_page,
                    page_item_size: page_item_size,
                    total: total,
                    is_next: is_next
                },
                data: results
            });
        });
    })
}

// [책 조회]
const one = (req, res, next) => {
    // 데이터베이스 설정
    const connection = req.app.locals.connection;
    bookSvc.setConnection(connection);
    fileSvc.setConnection(connection);

    const params = req.params;
    const b_seq = params.seq;
    if(b_seq) {
        const params = {
            b_seq: b_seq,
            br_m_seq: req.query.br_m_seq,
            bf_m_seq: req.query.bf_m_seq,
        }
        bookSvc.selectBook(next, params, (results) => {
            res.status(200).json({
                result: "success",
                code: 200,
                message: "책 조회가 완료되었습니다.",
                data: results
            });
        });
    } else {
        res.status(200).json({
            result: "error",
            code: 6001,
            message: "조회 대상 정보가 없습니다."
        });
    }
}

// [책 수정]
// 트랜젝션 처리
const update = (req, res, next) => {
    // 데이터베이스 설정
    const connection = req.app.locals.connection;
    bookSvc.setConnection(connection);
    fileSvc.setConnection(connection);

    const body = req.body;
    const b_seq = body.b_seq;
    console.log(b_seq);
    if(b_seq) {
        const thumbnail = req.file;
        if(thumbnail) { // thumbnail 수정이 있는 경우
            const original = thumbnail.originalname;
            const extension = original.substring(original.lastIndexOf("."));
            const mime = thumbnail.mimetype;
            const size = thumbnail.size;
            const buffer = thumbnail.buffer;

            awsSvc.upload(extension, "thumbnail", buffer, (bucket, key) => {
                const params = {
                    original: original,
                    name: key,
                    path: bucket,
                    type: "thumbnail",
                    mime: mime,
                    size: size
                }

                // 트랜젝션 시작
                connection.beginTransaction(function(error) {
                    if (error) { 
                        next(new Error(error)); 
                    } else {
                        fileSvc.insertFile(true, next, params, (results) => {
                            const params = {
                                f_seq: results.insertId,
                                bc_seq: body.bc_seq,
                                title: body.title,
                                author: body.author,
                                summary: body.summary,
                                remove: body.remove,
                                b_seq: b_seq
                            }
                            bookSvc.updateBook(true, next, params, (results) => {
                                connection.commit(function(error) {
                                    if (error) {
                                        return connection.rollback(function() {
                                            next(new Error(error));
                                        });
                                    } else {
                                        res.status(200).json({
                                            result: "success",
                                            code: 200,
                                            message: "책 수정이 완료되었습니다.",
                                            data: results
                                        });
                                    }
                                });
                            });
                        });
                    }
                });
            });
        } else { // thumbnail 수정이 없는 경우
            const params = {
                bc_seq: body.bc_seq,
                title: body.title,
                author: body.author,
                summary: body.summary,
                remove: body.remove,
                b_seq: b_seq
            }
            bookSvc.updateBook(false, next, params, (results) => {
                res.status(200).json({
                    result: "success",
                    code: 200,
                    message: "책 수정이 완료되었습니다.",
                    data: results
                });
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
    one: one,
    update: update
}