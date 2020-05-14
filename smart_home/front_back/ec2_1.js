const mqtt = require('mqtt');
var http = require('http');
var fs = require('fs');
var express =  require('express');
var app = express();
var path = require('path');
const WebSocket_hue = require('ws');
const WebSocket_weather = require('ws');
const wss_hue1 = new WebSocket_hue.Server({
    port: 8000
});
const wss_hue2 = new WebSocket_hue.Server({
    port: 8001
});
const wss_weather = new WebSocket_weather.Server({
    port: 8002
});


// app.use('/dblib', express.static(path.join(__dirname,'dblib')));
// var db=require('/dblib/db'); 
// db.connect();

// var filelist=require('/dblib/filelist');




var weatherInfo;
var dustInfo;
var light_status = true;
var state1 = null;
var state2 = null;

var hue1_state;
var hue2_state;
var weather_state = 0;

app.use('/css_st', express.static(path.join(__dirname,'css_st')));
app.use('/js', express.static(path.join(__dirname,'js')));
app.use('/html', express.static(path.join(__dirname,'html')));
app.use('/media', express.static(path.join(__dirname,'media')));

app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

const option = {
    host : '175.127.43.131',
    port : 3883,
    protocal : 'mqtt',
}


app.use('/semantic', express.static(path.join(__dirname, 'semantic')));


wss_hue1.on("connection", function (ws) {
    console.log("hue1 웹소켓 시작");

    if (state1 != null) {
        ws.send(state1)
    }

    setInterval(() => {
        if (hue1_state == 1) {
            ws.send(state1);
            hue1_state = 0;
        }
    }, 100);
    

    //메세지 받는 함수
    ws.on("message", function(message) {
        
        //hue 제어
        if(message == "hue1_on") {
            console.log("on");
            client.publish("hue1", "power_on");
        }
        else if (message == "hue1_off") {
            console.log("off");
            client.publish("hue1", "power_off");
        }
        else if (message == "hue1_state") {
            console.log("2")
            client.publish("hue1", "state");
            getState_hue1();
        }
        ////////////////////////////////////////////////////////////
        else{
             var msg = message.toString().split(",");
            console.log("bbbb");
            
            if (msg[0] == "bri1") {
                client.publish("bright1", message);
            }
            else if (msg[0] == "color1") {
                client.publish("test1", message);
            }
            else if (msg[0] == "tem1") {
                console.log("1");
                client.publish("temperature1", message);
            }
        }
    });
});

wss_hue2.on("connection", function (ws) {
    console.log("hue2 웹소켓 시작");

    if (state2 != null) {
        ws.send(state2)
    }

    setInterval(() => {
        if (hue2_state == 1) {
            ws.send(state2);
            hue2_state = 0;
        }
    }, 100);
    
    //메세지 받는 함수
    ws.on("message", function(message) {
        
        //hue 제어
        if (message == "hue2_on") {
            console.log("on2");
            client.publish("hue2", "power_on");
        }
        else if (message == "hue2_off") {
            console.log("off2");
            client.publish("hue2", "power_off");
        }
        else if (message == "hue2_state") {
            client.publish("hue2", "state");
            getState_hue2();
        }
        ////////////////////////////////////////////////////////////
        else{
             var msg = message.toString().split(",");
            
            if (msg[0] == "bri2") {
                client.publish("bright2", message);
            }
            else if (msg[0] == "color2") {
                client.publish("test2", message);
            }
            else if (msg[0] == "tem2") {
                client.publish("temperature2", message);
            }
        }
    });
});

wss_weather.on("connection", function(ws) {
    console.log("날씨 웹소켓 시작");

    ws.send(weatherInfo)

    ws.on("message", function(message) {
        if (message == "reqWeather") {
            console.log("weather 메세지 받음");
            client.publish("reqWeather", "reqWeather");

            getWeather();
        }
    })
})

const client = mqtt.connect(option);

client.on("connect", () => {
    console.log("connected : "+ client.connected);
})

client.on("error", () => {
    console.log("Can't connect : " + error);
})

var a = 1;
app.get("/", function(req, res){

    console.log(a+"번째 화면 실행")

    console.log("여기1");
    client.publish("reqWeather", "asdf")
    init_getWeather();
    client.publish("hue1", "state");
    init_getState_hue1();

    client.publish("hue2", "state");
    init_getState_hue2();
    res.writeHead(200,{"Content-Type":"text/html"});
    fs.createReadStream("./html/hue2.html").pipe(res); 

    client.publish("IOT_device1", "off");
    console.log("메세지 보냄")

    // client.publish("init", "front");
    // client.on("message", (topic, message, error) => {
    //     if (topic == "resInit") {
    //         console.log(message.toString());
    //     }
    // })
    // console.log("1");
});

app.get("/weather", function(req, res) {
    res.redirect("/html/weather.html")
})

app.get("/hue2", function(req,res){
    res.redirect("/html/hue2.html")
})


app.get("/alarm", function(req,res){
    res.redirect("/html/alarm.html")
})


app.get("/buzzer_on", function(req,res){
    client.publish("IOT_sound", "buzzer_on")
    res.redirect("/html/alarm.html")
    console.log("부저 on");
})

app.get("/buzzer_off", function(req,res){
    client.publish("IOT_sound", "buzzer_off")
    res.redirect("/html/alarm.html")
    console.log("부저 off");
})

app.post("/", function(req, res) {
    console.log("여기2");
})

client.subscribe("resInit");
client.subscribe("state1");
client.subscribe("state2");
client.subscribe("resDust");
client.subscribe("resWeather");

function getState_hue1() {
    client.on('message', (topic, message, packet) => {
        if (topic == "state1") {
            state1 = message.toString() + "," + "hue1";
        }
    })
    console.log(hue1_state)
    hue1_state = 1;
}

function getState_hue2() {
    client.on('message', (topic, message, packet) => {
        if (topic == "state2") {
            state2 = message.toString() + "," + "hue2";
        }
    })
    console.log(hue2_state)
    hue2_state = 1;
}

function getWeather() {
    client.on('message', (topic, message, packet) => {
        if (topic == "resWeather") {
            weatherInfo = "weather" + "," + message.toString();
        }
    })
    weather_state=1;
}

function init_getState_hue1() {
    client.on('message', (topic, message, packet) => {
        if (topic == "state1") {
            state1 = message.toString() + "," + "hue1";
            hue1_state = 1;
        }
    })
}

function init_getState_hue2() {
    client.on('message', (topic, message, packet) => {
        if (topic == "state2") {
            state2 = message.toString() + "," + "hue2";
            hue2_state = 1;
        }
    })
}

function init_getWeather() {
    client.on('message', (topic, message, packet) => {
        console.log(topic);
        if (topic == "resWeather") {
            weatherInfo = "weather" + "," + message.toString();
            weather_state=1;

            console.log(weatherInfo)
        }
    })
}

http.createServer(app).listen(8080);