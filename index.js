const express = require('express');
const app = express();
const PORT = 3000 || process.env.PORT;

const fs = require('fs');
const multer = require('multer');
const { TesseractWorker } = require('tesseract.js');
const worker = new TesseractWorker();

app.set('view engine', 'ejs');

const storage = multer.diskStorage({
    destination: (req,res,cb) => {
        cb(null, './uploads')
    },
    filename: (req,file,cb) => {
        cb(null, file.originalname)
    }
})

const upload = multer({ storage : storage}).single('image');

app.get('/', (req,res) => {
    res.render('index')
})

app.post('/upload', (req,res) => {
    upload(req, res, err => {
        fs.readFile(`./uploads/${req.file.originalname}`, (err, data) => {
            if(err) throw err;
            worker
            .recognize(data, 'pol', {tessjs_create_pdf: '1'})
            .progress(progress => {
                console.log(progress)
            })
            .then(result => {
                console.log(result.text)
                res.redirect('/download')
            })
            .finally(()=> worker.terminate())
        })
    })
})

app.get('/download', (req,res) => {
    const file = `${__dirname}/tesseract.js-ocr-result.pdf`
    res.download(file)
})

app.listen(PORT, () => console.log(`Server listeing on ${PORT}`))