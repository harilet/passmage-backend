const express=require('express');
const app=express();
const path=require('path');
var bodyParser = require('body-parser');
const fs = require("fs");

const cors=require('cors')

app.use(cors({origin:'*'}))

const PORT=process.env.PORT||5000;
app.use(bodyParser.urlencoded({extended: false}));

app.post('/get_encr',function (req, res) {
    var ser=req.body.name
    fs.readFile("./src/encr_pass.json",function (err,data) {
        var json=JSON.parse(data);
        res.send(json[ser]);
    });
});

app.post('/set_encr',function (req,res) {
    
    var sers=req.body.name;
    var pas=req.body.pass_encr;

    console.log(sers)
    console.log(pas)

    fs.readFile('./src/encr_pass.json', function (err, data) {
        if(data.length<=2){
            data='{"'+sers+'":"'+pas+'"}';
        }

        data = data.slice(0, -1);
        data=data+',"'+sers+'":"'+pas+'"}';

        fs.writeFile("./src/encr_pass.json", data,function (err) {
            console.log(err);
        });
        res.send("Done");
    })
})

app.get('/',function (req,res) {
    fs.readFile("./src/encr_pass.json",function (err,data) {
        var json=JSON.parse(data);
        console.log(json)
        var key=[];
        for(var a in json ){
                key.push(a);  
        }
        res.json(key.toString());
    });
})

app.post('/delete_encr',function (req,res){
    fs.readFile("./src/encr_pass.json",function (err,data) {
        var json=JSON.parse(data);
        delete json[req.body.name]
        fs.writeFile("./src/encr_pass.json", JSON.stringify(json),function (err) {
            console.log(err);
        });
        res.send("done");
    });
})

app.use(express.static(path.join(__dirname,'src')));
app.listen(PORT, ()=>console.log(`Server is up at http://127.0.0.1:${PORT}`) );
