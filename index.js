const express=require('express');
const app=express();
var bodyParser = require('body-parser');
const { Client } = require('pg');

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
    query(`SELECT pass FROM pass_list WHERE service='${ser}';`).then((resp)=>{
        var row=resp.rows[0]
        console.log(row)
        res.send(row["pass"]);
    })
});

app.post('/set_encr',function (req,res) {
    var sers=req.body.name;
    var pas=req.body.pass_encr;
    query(`INSERT INTO pass_list (service,pass) VALUES ('${sers}','${pas}');`).then((resp)=>{
        res.send("Done")
    })
})

app.get('/',function (req,res) {
    var key=[];
    query('SELECT service FROM pass_list;').then((resp)=>{
        for (let row of resp.rows) {
            key.push(row["service"]);
        }
        res.send(key.toString())
    })
})

app.post('/delete_encr',function (req,res){
    query(`DELETE FROM pass_list WHERE service='${req.body.name}';`).then((resp)=>{
        console.log(resp)
        res.send("Done")
    })
})

app.listen(PORT, ()=>console.log(`Server is up at http://127.0.0.1:${PORT}`) );
