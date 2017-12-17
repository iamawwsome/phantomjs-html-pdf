const express = require('express');
const validator = require('validator');
const fs = require('fs');
const uniqid = require('uniqid');

const { spawn } = require('child_process');

const app = express();
let isFailed = false;

app.use(express.json({
  strict: true,
}));

app.post('/', (req, res) => {
  if (req.body.url === undefined) {
    res.setHeader('Content-Type', 'application/json');
    res.status(400).send(JSON.stringify({
      error: 'JSON is missing url key.',
    }));
  } else {
    const { url } = req.body;

    if (!validator.isURL(url)) {
      res.setHeader('Content-Type', 'application/json');
      res.status(400).send(JSON.stringify({
        error: 'URL is invalid.',
      }));
    } else {
      const output = `${uniqid()}.pdf`;
      const phantom = spawn('./bin/phantomjs', ['html-to-pdf.js', url, output], { timeout: 300 });

      phantom.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
      });

      phantom.stderr.on('data', (data) => {
        console.log(`stderr: ${data}`);

        isFailed = true;

        res.setHeader('Content-Type', 'application/json');
        res.status(500).send(JSON.stringify({
          error: 'Failed to convert html to pdf.',
        }));
      });

      phantom.on('close', () => {
        if (!isFailed) {
          res.setHeader('Content-Type', 'text/plain');
          const pdf = fs.createReadStream(output, { encoding: 'base64' });

          pdf.on('close', () => fs.unlink(output));

          pdf.pipe(res);
        }
      });
    }
  }
});

app.listen(3000, () => {
  console.log('app is listening on port 3000.');
});
