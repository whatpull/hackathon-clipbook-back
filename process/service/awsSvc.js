const AWS = require('aws-sdk');
const uuid = require('uuid');
const BUCKET = 'clipbook-file/image';

// [연결] 연결확인
const configConfirm = () => {
    AWS.config.getCredentials((error) => {
        if(error) console.log(error);
        // credencial not load
        else {
            console.log('Access key : ', AWS.config.credentials.accessKeyId);
            console.log('Secret access key : ', AWS.config.credentials.secretAccessKey);
        }
    });
}

/**
 * [파일] 파일업로드
 * @param {*} extension 
 * @param {*} type 
 * @param {*} body 
 */
const upload = (extension, type, body, callback) => {
    const key = uuid.v4() + extension;
    const bucket = BUCKET + (typeof type === "undefined" ? "" : "/" + type);
    const object = {
        Bucket: bucket,
        Key: key, 
        Body: body,
        ACL: "public-read-write"
    }
    const upload = new AWS.S3().putObject(object).promise();
    upload.then((data) => {
        if(typeof callback === "function") {
            callback(bucket, key);
        }
    })
}

module.exports = {
    configConfirm: configConfirm,
    upload: upload
}