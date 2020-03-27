// 서비스
const memberSvc = require('../service/memberSvc');
const tokenSvc = require('../service/tokenSvc');
const awsSvc = require('../service/awsSvc');
const fileSvc = require('../service/fileSvc');
const oauth2Svc = require('../service/oauth2Svc');
// 암호화
const bcrypt = require('bcrypt');

// [로그인]
const signin = (req, res, next) => {
    // 데이터베이스 설정
    const connection = req.app.locals.connection;
    memberSvc.setConnection(connection);
    fileSvc.setConnection(connection);
    oauth2Svc.setConnection(connection);

    const body = req.body;
    if(body.account.length == 0 || body.password.length == 0) {
        res.status(200).json({
            result: "error",
            code: 1001,
            message: "계정 또는 비밀번호를 입력해 주세요."
        });
    } else {
        memberSvc.selectMember(next, body, (results) => {
            if(results.length > 0) {
                const result = results[0];
                if(result.withdraw == "N") {
                    if(result.password) {
                        const compare = bcrypt.compareSync(body.password, result.password);
                        if(compare) {
                            const token = tokenSvc.getToken(results, req.app.get("key"));
                            res.status(200).json({
                                result: "success",
                                code: 200,
                                message: "로그인에 성공하였습니다.",
                                data: {
                                    token: token
                                }
                            });
                        } else {
                            res.status(200).json({
                                result: "error",
                                code: 1003,
                                message: "비밀번호가 일치하지 않습니다."
                            });
                        }
                    } else {
                        res.status(200).json({
                            result: "error",
                            code: 1004,
                            message: "소셜 계정으로 가입된 계정입니다."
                        });
                    }
                } else {
                    res.status(200).json({
                        result: "error",
                        code: 1005,
                        message: "회원 탈퇴가 처리된 계정입니다."
                    });
                }
            } else {
                res.status(200).json({
                    result: "error",
                    code: 1002,
                    message: "존재하지 않는 계정입니다."
                });
            }
        });
    }
}

// [회원가입]
const signup = (req, res, next) => {
    // 데이터베이스 설정
    const connection = req.app.locals.connection;
    memberSvc.setConnection(connection);
    fileSvc.setConnection(connection);
    oauth2Svc.setConnection(connection);

    const body = req.body;
    const name = body.name;
    const account = body.account;
    const password = body.password;
    if(name || account || password) {
        memberSvc.insertMember(false, next, body, (results) => {
            res.status(200).json({
                result: "success",
                code: 200,
                message: "회원가입에 성공하였습니다.",
                data: results
            });
        });
    } else {
        res.status(200).json({
            result: "error",
            code: 2002,
            message: "이름, 계정 또는 비밀번호를 입력해 주세요."
        });
    }
}

// [프로필 조회]
const one = (req, res, next) => {
    // 데이터베이스 설정
    const connection = req.app.locals.connection;
    memberSvc.setConnection(connection);

    const params = req.params;
    const m_seq = params.seq;
    if(m_seq) {
        const params = {
            m_seq: m_seq
        }
        memberSvc.selectMember(next, params, (results) => {
            res.status(200).json({
                result: "success",
                code: 200,
                message: "회원 프로필 조회에 성공하였습니다.",
                data: {
                    name: typeof results[0] === "undefined" ? "Anonymous" : results[0].name,
                    picture: typeof results[0] === "undefined" ? undefined : results[0].picture,
                    account: typeof results[0] === "undefined" ? "-" :  results[0].account
                }
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

// [프로필 수정]
// 트랜젝션 처리
const update = (req, res, next) => {
    // 데이터베이스 설정
    const connection = req.app.locals.connection;
    memberSvc.setConnection(connection);
    fileSvc.setConnection(connection);
    oauth2Svc.setConnection(connection);

    const body = req.body;
    const m_seq = body.m_seq;
    if(m_seq) {
        const avatar = req.file;
        if(avatar) { // avatar 수정이 있는 경우
            const original = avatar.originalname;
            const extension = original.substring(original.lastIndexOf("."));
            const mime = avatar.mimetype;
            const size = avatar.size;
            const buffer = avatar.buffer;
            
            awsSvc.upload(extension, "profile", buffer, (bucket, key) => {
                const params = {
                    original: original,
                    name: key,
                    path: bucket,
                    type: "profile",
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
                                name: body.name,
                                password: body.password,
                                withdraw: body.withdraw,
                                m_seq: m_seq
                            }
                            memberSvc.updateMember(true, next, params, (results) => {
                                connection.commit(function(error) {
                                    if (error) {
                                        return connection.rollback(function() {
                                            next(new Error(error));
                                        });
                                    } else {
                                        res.status(200).json({
                                            result: "success",
                                            code: 200,
                                            message: "프로필 수정이 완료되었습니다.",
                                            data: results
                                        });
                                    }
                                });
                            });
                        });
                    }
                });
            });
        } else { // avatar 수정이 없는 경우
            const params = {
                name: body.name,
                password: body.password,
                withdraw: body.withdraw,
                m_seq: m_seq
            }
            memberSvc.updateMember(false, next, params, (results) => {
                res.status(200).json({
                    result: "success",
                    code: 200,
                    message: "프로필 수정이 완료되었습니다.",
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

// [소셜 로그인]
const signinSocial = (req, res, next) => {
    // 데이터베이스 설정
    const connection = req.app.locals.connection;
    memberSvc.setConnection(connection);
    fileSvc.setConnection(connection);
    oauth2Svc.setConnection(connection);

    const body = req.body;
    const account = body.account;
    if(account) {
        memberSvc.selectMember(next, body, (results) => {
            if(results.length > 0) {
                const temp_results = results;
                const m_seq = results[0].m_seq;
                const access_token = body.access_token;
                const provider = body.provider;

                const params = {
                    m_seq: m_seq,
                    provider: provider,
                    access_token: access_token
                }

                oauth2Svc.updateOAuth2(false, next, params, (results) => {
                    if(results.changedRows === 0) {
                        oauth2Svc.insertOAuth2(false, next, params, (results) => {
                            if(results.affectedRows === 1) {
                                const token = tokenSvc.getToken(temp_results, req.app.get("key"));
                                res.status(200).json({
                                    result: "success",
                                    code: 200,
                                    message: "로그인에 성공하였습니다.",
                                    data: {
                                        token: token
                                    }
                                });
                            } else {
                                next(new Error('소셜 로그인 인증 토큰 생성 에러'));
                            }
                        });
                    } else if (results.changedRows === 1) {
                        const token = tokenSvc.getToken(temp_results, req.app.get("key"));
                        res.status(200).json({
                            result: "success",
                            code: 200,
                            message: "로그인에 성공하였습니다.",
                            data: {
                                token: token
                            }
                        });
                    } else {
                        next(new Error('소셜 로그인 인증 토큰 생성 에러'));
                    }
                });
            } else {
                res.status(200).json({
                    result: "error",
                    code: 1002,
                    message: "존재하지 않는 계정입니다."
                });
            }
        });
    } else {
        res.status(200).json({
            result: "error",
            code: 1001,
            message: "계정 정보가 없습니다."
        });
    }
}

// [소셜 회원가입]
// 트랜젝션 처리
const signupSocial = (req, res, next) => {
    // 데이터베이스 설정
    const connection = req.app.locals.connection;
    memberSvc.setConnection(connection);
    fileSvc.setConnection(connection);
    oauth2Svc.setConnection(connection);

    // 트랜젝션 시작
    connection.beginTransaction(function(error) {
        if (error) { 
            next(new Error(error)); 
        } else {
            const body = req.body;
            memberSvc.insertMember(true, next, body, (results) => {
                const params = {
                    m_seq: results.insertId,
                    provider: body.provider,
                    access_token: body.access_token
                }
                oauth2Svc.insertOAuth2(true, next, params, (results) => {
                    connection.commit(function(error) {
                        if (error) {
                            return connection.rollback(function() {
                                next(new Error(error));
                            });
                        } else {
                            res.status(200).json({
                                result: "success",
                                code: 200,
                                message: "회원가입에 성공하였습니다.",
                                data: results
                            });
                        }
                    });
                })
            });
        }
    });
}

module.exports = {
    signin: signin,
    signup: signup,
    one: one,
    update: update,
    signinSocial: signinSocial,
    signupSocial: signupSocial
}