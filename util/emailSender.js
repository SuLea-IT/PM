const nodemailer = require('nodemailer');
const ejs = require('ejs');
const path = require('path');
const archiver = require('archiver');
const fs = require('fs');
require('dotenv').config();

const sendEmail = async (to, dirPath) => {
    const subject = process.env.EMAIL_SUBJECT || 'Plant Single Cell Spatial Atlas results';
    const templateData = {
        title: process.env.EMAIL_TITLE || '您好，您的数据已经运行完成',
        message: process.env.EMAIL_MESSAGE || '您的数据结果已整理为压缩包附件，请注意查收。',
    };

    try {
        const zipFileName = `${new Date().toISOString().split('T')[0]}.zip`;
        const zipFilePath = path.join(__dirname, '../', zipFileName);

        const archive = archiver('zip', {
            zlib: { level: 9 },
        });

        const output = fs.createWriteStream(zipFilePath);
        archive.pipe(output);
        archive.directory(path.resolve(dirPath), path.basename(dirPath));

        await new Promise((resolve, reject) => {
            output.on('close', resolve);
            archive.on('error', reject);
            archive.finalize();
        });

        const smtpHost = process.env.SMTP_HOST || 'smtp.163.com';
        const smtpPort = Number(process.env.SMTP_PORT || 465);
        const smtpSecure = String(process.env.SMTP_SECURE || 'true') !== 'false';

        const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure: smtpSecure,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const templatePath = path.join(__dirname, 'templates', 'emailTemplate.ejs');
        const htmlContent = await ejs.renderFile(templatePath, templateData);

        const mailOptions = {
            from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
            to,
            subject,
            html: htmlContent,
            attachments: [
                {
                    filename: zipFileName,
                    path: zipFilePath,
                },
            ],
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`邮件发送成功: ${info.response}`);
        fs.unlinkSync(zipFilePath);
    } catch (error) {
        console.error(`处理邮件时出错: ${error.message || error}`);
        throw error;
    }
};

module.exports = sendEmail;
