// [서버 실행 피그렛 설정 관련]
const chalk = require('chalk');
const figlet = require('figlet');
const fs = require('fs');
const path = require('path');
const os = require('os');

// [서버 설정 관련]
const express = require('express');
const cors = require('cors');
const parser = require('body-parser');
const port = os.hostname() === "DESKTOP-OEFVDTK" ? 3000 : 80;

const app = express();

// [미들웨어 설정 관련]
// 미들웨어 설정
// Step1. JSON BODY 파서
app.use(parser.json());
// Step2. 크로스 오리진
app.use(cors());
// Step3. JWT 세션체크
var jwt = require('./middlewares/jwt');
app.set('key', "");
app.use('/private', jwt.check);
// Step4. DB
const db = require('./conf/db_mysql');
const connection = db.init();
db.open(connection);
app.locals.connection = connection;

// 라우터 설정
const memberRouter = require('./process/router/memberRt');
const bookRouter = require('./process/router/bookRt');
const reviewRouter = require('./process/router/reviewRt');
const ratingRouter = require('./process/router/ratingRt');
const readRouter = require('./process/router/readRt');
const favoriteRouter = require('./process/router/favoriteRt');
const categoryRouter = require('./process/router/categoryRt')
app.use(memberRouter);
app.use(bookRouter);
app.use(reviewRouter);
app.use(ratingRouter);
app.use(readRouter);
app.use(favoriteRouter);
app.use(categoryRouter);

// 에러 처리
app.use((error, req, res, next) => {
    console.error(error.stack);
    if(error.message === "ECONNRESET" || error.message === "PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR") {
        const reconnection = db.init();
        db.open(reconnection);
        app.locals.connection = reconnection;
    } else {
        res.status(200).json({
            result: "error",
            code: "9001",
            message: error.message
        });
    }
});

// 서버 실행
app.listen(port, () => {
    // 피그렛 생성
    const data = fs.readFileSync(path.join(__dirname, '/etc/3d.flf'), 'utf8');
    figlet.parseFont('myfont', data);

    const title = chalk.magenta.bold(
        figlet.textSync('CLIP BOOK API', {
            font: "myfont",
            horizontalLayout: "default",
            verticalLayout: "default"
        })
    );
    console.log(title);
    console.log(chalk.white("clip book api back-end server. Copyright 'yeonsu'."));
});