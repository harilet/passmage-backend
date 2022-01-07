const express=require('express');
const app=express();
var bodyParser = require('body-parser');
const { Client } = require('pg');
var CryptoJS = require("crypto-js");

userlist={}

setInterval(function(){
    userlist={}
},1000*60*30)

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
});

client.connect();

const cors=require('cors')
app.use(cors())

const PORT=process.env.PORT||5000;
app.use(bodyParser.urlencoded({extended: false}));

function query(que){
    return new Promise((resolve) => {
        client.query(que, (err, res) => {
            if (err) throw err;
            resolve(res);
        });
    });
}

app.post('/get_encr',function (req, res) {
    var ser=req.body.name
    var usr_id=userlist[req.body.usr_id]
    query(`SELECT pass FROM pass_list WHERE name='${ser}' AND user_id=${usr_id};`).then((resp)=>{
        var row=resp.rows[0]
        console.log(row)
        res.send(row["pass"]);
    })
});

app.post('/get_list',function (req, res) {
    var key=[];
    var usr_id=userlist[req.body.usr_id]
    query(`SELECT name FROM pass_list WHERE user_id=${usr_id} ;`).then((resp)=>{
        console.log(resp.rows)
        for (let row of resp.rows) {
            key.push(row["name"]);
        }
        res.send(key.toString())
    })
});

app.post('/set_encr',function (req,res) {
    var sers=req.body.name;
    var pas=req.body.pass_encr;
    var usr_id=userlist[req.body.usr_id]
    query(`INSERT INTO pass_list (name,pass,user_id) VALUES ('${sers}','${pas}',${usr_id});`).then((resp)=>{
        res.send("Done")
    })
})

app.post('/login',function (req,res) {
    var username=req.body.username
    var masterkey=req.body.masterkey
    console.log(username,masterkey)
    query('SELECT id,VERI_text,pass_text FROM user_list WHERE username=\''+username+'\';').then((resp)=>{
        console.log(resp.rows[0])
        var rest=resp.rows[0]
        var bytes  = CryptoJS.AES.decrypt(rest['pass_text'], masterkey);
        var originalText = bytes.toString(CryptoJS.enc.Utf8);
        console.log(originalText)
        if(originalText==rest['veri_text']+username){
            res.send(insertid(rest['id']).toString())
        }
    })
})

function insertid(usrid){
    if(Object.values(userlist).indexOf(usrid) > -1){
        return Object.keys(userlist).find(key => userlist[key] === usrid)
    }else{
        var rand=Math.floor(
            Math.random()*100
        )
        while (rand in userlist){
            rand=Math.floor(
                Math.random()*100
            )
        }
        userlist[rand]=usrid
        return rand
    }
}

app.post('/delete_encr',function (req,res){
    query(`DELETE FROM pass_list WHERE service='${req.body.name}';`).then((resp)=>{
        console.log(resp)
        res.send("Done")
    })
})

app.listen(PORT, ()=>console.log(`Server is up at http://127.0.0.1:${PORT}`) );
