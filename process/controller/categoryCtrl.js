// 서비스
const categorySvc = require("../service/categorySvc");

// [카테고리 리스트 조회]
const list = (req, res, next) => {
    // 데이터베이스 설정
    const connection = req.app.locals.connection;
    categorySvc.setConnection(connection);

    categorySvc.selectCategory(next, (results) => {
        res.status(200).json({
            result: "success",
            code: 200,
            message: "책 카테고리 리스트 조회가 완료되었습니다.",
            data: results
        });
    })
}

module.exports = {
    list: list
}