const express = require('express');
const axios = require('axios');
const serverless = require("serverless-http");
require('dotenv').config();
const owner = process.env.OWNER;
const repo = process.env.REPO;
const path = process.env.GPATH; // 注意：环境变量中的变量名通常大写
const token = process.env.GTOKEN;
const port = process.env.PORT;

const app = express();
const router = express.Router();

router.get("/", (req, res) => {
  res.send("App is running..");
});


const getContentsUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
const numbers = [1, 2];


app.use("/.netlify/functions/app", router);

const CommitIt = async ()=>{
  try {
    const response = await axios.get(getContentsUrl, {
      headers: { 
          'Authorization': `token ${token}`
      }});
    const content = Buffer.from(response.data.content, 'base64').toString('utf-8');
    const sha = response.data.sha;
    const numbers = content.split(',')
      .map(s => s.match(/\d+/g) ? parseInt(s.match(/\d+/g)[0], 10) : NaN)
      .filter(n => !isNaN(n));

    const lastNumber = numbers.length ? numbers[numbers.length - 1] : 0;
    const newContent = `${content}\n${lastNumber + 1}(+),`;
    // console.log('新內容:',newContent);
    
    const encodedContent = Buffer.from(newContent).toString('base64');
    let date_ob = new Date();
    const commitMsg = `${date_ob.getMonth() + 1}/${date_ob.getDate()}`;
    const updateResponse = await axios.put(getContentsUrl, {
        message: commitMsg,
        content: encodedContent,
        sha: sha,
    }, {
        headers: { 
            'Authorization': `token ${token}`,
            'Content-Type': 'application/json'
        }
    });
    console.log('文件更新成功:', updateResponse.data.content.path);
  } catch (err) {
    throw err;
  }

}


app.get('/hehe', async (req, res) => {
  const randomIndex = Math.floor(Math.random() * numbers.length);
  const total_fake_time = numbers[randomIndex];
  try {
    for(i=0;i<total_fake_time;i++){
      await CommitIt();
    }
    res.status(200).send(`<h1>Finished ${total_fake_time} times.</h1>`);
  } catch (error) {
    console.log('error',error);
    
    res.status(500).send({"msg": "error."});
  }
});

app.listen(port, () => {
  console.log(`應用正在監聽 port:${port}`);
});
module.exports.handler = serverless(app);
// 取得最近一天的 commits 數量：
// https://api.github.com/repos/advancedor96/udemy_1007/commits?since=2024-04-05T11:21:00+08:00&until=2024-04-06T11:21:00+08:00

