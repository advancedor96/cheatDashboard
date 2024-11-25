const express = require('express');
const axios = require('axios');
const serverless = require("serverless-http");
const node_path = require('path');
const { log } = require('console');
require('dotenv').config();
const owner = process.env.OWNER;
const repo = process.env.REPO;
const path = process.env.GPATH; // 注意：环境变量中的变量名通常大写
const token = process.env.GTOKEN;
const port = process.env.PORT;

const app = express();
const router = express.Router();

app.set('view engine', 'ejs');

router.get("/he", (req, res) => res.send("Hello World!"));

router.get("/", (req, res) => {
  res.send("App is running..");
});


const getContentsUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
const numbers = [0, 1, 2, 3, 4,5,6, 7, 8,9,10, 0, 0,0];
let randomIndex = 0;


const CommitIt = async (i)=>{
  try {
    // 添加延遲以避免 API 限流
    // await new Promise(resolve => setTimeout(resolve, 1000));
    const response = await axios.get(getContentsUrl, {
      headers: { 
          'Authorization': `token ${token}`
      }});
    const content = Buffer.from(response.data.content, 'base64').toString('utf-8');
    const sha = response.data.sha;

    let date_ob = new Date();
    const dateStr = `${date_ob.getMonth() + 1}/${date_ob.getDate()}`;
    const newContent = `${content}\n${dateStr}`;


    
    const encodedContent = Buffer.from(newContent).toString('base64');
    const commitMsg = `${dateStr}-${i+1}`;
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
  } catch (err) {
    console.error('CommitIt 錯誤,檢查Netilify裡的env:', err.message);
    // throw new Error(`提交失敗: ${err.message}`);
  }

}

router.get("/hehe/getRandomNumberCommit", async (req, res) => {
  randomIndex = Math.floor(Math.random() * numbers.length);
  const total_fake_time = numbers[randomIndex];
  res.json({ count: total_fake_time });
});
router.get("/hehe/commit", async (req, res) => {
  console.log('進入 /hehe/commit');

  const total_fake_time = parseInt(req.query.count);
  if (isNaN(total_fake_time)) {
    return res.status(400).json({ 
      error: '無效的 count 參數' 
    });
  }

  console.log('執行次數:', total_fake_time);


  // 在背景執行 commit
  try {
    for(let i = 0; i < total_fake_time; i++){
      await CommitIt(i);
    }
    console.log('所有 commit 完成');
  } catch (error) {
    console.error('Commit 執行錯誤:', error);
  }
  
  // 立即回應前端
  res.json({ status: 'finished' });
});

router.get("/hehe", async (req, res) => {
  console.log('進入 /hehe');
  
  const randomIndex = Math.floor(Math.random() * numbers.length);
  
  let total_fake_time = numbers[randomIndex];
  total_fake_time = 0;
  console.log('準備做次數:', total_fake_time);
  
  // res.send(`<h1> peace </h1>`);
  // return;
  
  try {
    for(let i=0;i<total_fake_time;i++){
      await CommitIt(i);
    }
    res.send(`<h1>Finished(real) ${total_fake_time} times. <br />
      <a href="/">Go Back</a></h1>`);
  } catch (error) {
    console.log('執行錯誤:',error);
    
    // res.status(500).send({"msg": "error."});
    res.status(500).json({
      msg: "error",
      detail: error.message
    });
  }
});

// app.listen(port, () => {
//   console.log(`應用正在監聽 port:${port}`);
// });

app.use("/api/", router);
module.exports.handler = serverless(app);
// 取得最近一天的 commits 數量：
// https://api.github.com/repos/advancedor96/udemy_1007/commits?since=2024-04-05T11:21:00+08:00&until=2024-04-06T11:21:00+08:00

