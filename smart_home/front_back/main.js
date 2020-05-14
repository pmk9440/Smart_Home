const mqtt = require('mqtt');
var http = require('http');
var fs = require('fs');
var express =  require('express');
var app = express();
var path = require('path');
const WebSocket_init = require('ws');
const WebSocket_weather = require('ws');
const init_wss = new WebSocket_init.Server({
    port: 8001
});
const wss = new WebSocket_weather.Server({
    port: 8002
});

const option = {
    host : '175.127.43.131',
    port : 3883,
    protocal : 'mqtt',
}

const client = mqtt.connect(option);

client.on("connect", () => {
    console.log("connected : "+ client.connected);
})

client.on("error", () => {
    console.log("Can't connect : " + error);
})

//변수 설정
var dust = null;
var weather = {
    "time" : "0000"
};
var sun = {
    "date" : "0000"
};
var hue_state = [];
var humidity = null;
var temperature = {
    "tem" : -1
};
var hue_state_check=0;
var alarm = {
    "data" : "alarm",
    "alarm_list" : [],
};

//client subscribe
client.subscribe("res/weather/dust");
client.subscribe("res/weather/weather");
client.subscribe("res/weather/sun");
client.subscribe("res/hue/state");
client.subscribe("res/arduino/humidity");
client.subscribe("res/arduino/temperature");

app.use('/css_st', express.static(path.join(__dirname,'css_st')));
app.use('/js', express.static(path.join(__dirname,'js')));
app.use('/html', express.static(path.join(__dirname,'html')));
app.use('/media', express.static(path.join(__dirname,'media')));

app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});
 
//상태 값 받아오는 페이지
app.get("/",  function(req, res){

    hue_state = [];

    client.publish("req/weather/dust", "");
    client.publish("req/weather/weather", "");
    client.publish("req/weather/sun", "");
    client.publish("req/hue", "");
    client.publish("req/arduino/humidity", "");
    client.publish("req/arduino/temperature", "");

    client.publish("req/arduino/buzzer", "off");

    res.redirect("/html/index2.html");
});

client.on("message", function (topic, message) {
    console.log(topic);
    if (topic == "res/weather/dust") {
        dust = JSON.parse(message);
    }
    else if (topic == "res/weather/weather") {
        console.log("weather");
        weather = JSON.parse(message);
    }
    else if (topic == "res/weather/sun") {
        sun = JSON.parse(message);
    }
    else if (topic == "res/hue/state") {
        var temp = JSON.parse(message);
        console.log(hue_state_check);
        if (hue_state_check == 0) {
            hue_state.push(temp);
            hue_state_check++;
        }
        else {
            if (hue_state_check == 2) {

            }
            else if (temp.data != hue_state[hue_state_check-1].data) {
                hue_state.push(temp);
                hue_state_check++;
            }
        }
    }
    else if (topic == "res/arduino/temperature") {
        temperature = message.toString();
        temperature = parseInt(temperature);
        temperature = {
            "data" : "temperature",
            "tem" : temperature
        }
    }
    else if (topic == "res/arduino/humidity") {
        humidity = message.toString();
    }
})

init_wss.on("connection", function(ws) {
    console.log("init 웹소켓 connection");

    console.log(temperature);
    console.log(weather);
    console.log(dust);
    ws.send(JSON.stringify(temperature));
    ws.send(JSON.stringify(weather));
    ws.send(JSON.stringify(dust));
})

wss.on("connection", function(ws) {
    console.log("웹소켓 connection");
    console.log(alarm.alarm_list.length);

    // 초기값 설정
    var init_dust = null;
    var init_weather = {
        "time" : "00"
    };
    var init_sun = {
        "date" : "000000"
    };
    var init_hue_state = [];
    var init_humidity = null;
    var init_temperature = {
        "tem" : -1
    };

    // 시간 설정
    var date = new Date();

    var init_h = date.getHours() + 9;
    if (init_h >= 24) {
        init_h -= 24;
    }
    var init_d = date.getDate();

    // 휴 상태값
    console.log(hue_state);

    for (var i = 0 ; i<hue_state.length ; i++) {
        if (hue_state[i].data == "Hue color light 12") {
            hue_state[i].data = "hue1";
        }
        else if (hue_state[i].data == "Hue color light 9") {
            hue_state[i].data = "hue2";
        }
    }

    for (var i =0 ; i<hue_state.length ; i++) {
        console.log("여기여기");
        if (hue_state[i].data == "hue1") {
            console.log("hue1");
            ws.send(JSON.stringify(hue_state[i]));
        }
        else if (hue_state[i].data == "hue2") {
            console.log("hue2");
            ws.send(JSON.stringify(hue_state[i]));
        }

        hue_state_check = 0;
    }

    // 알람값
    if (alarm.alarm_list.length != 0) {
        ws.send(JSON.stringify(alarm));
    }

    setInterval(() => {
        // 날씨 관련
        date = new Date();
        var h = date.getHours() + 9;
        var d = date.getDate();
        var m = date.getMinutes();
        var now;

        if (h >= 24) {
            h -= 24;
        }

        if (m < 10) {
            m = "0" + m.toString();
        }

        now = h.toString() + m.toString();

        if (init_dust != dust) {
            ws.send(JSON.stringify(dust));
            console.log("dust");
            console.log(dust);
            init_dust = dust;

        }
        
        if (init_weather.time != weather.time) {
            ws.send(JSON.stringify(weather));
            console.log("weather");
            console.log(weather);
            init_weather = weather;
        }

        if (init_sun.date != sun.date) {
            ws.send(JSON.stringify(sun));
            console.log("sun");
            console.log(sun);
            init_sun = sun;
        }

        if (init_humidity != humidity) {
            // ws.send(JSON.stringify(humidity));
            console.log("humidity");
            console.log(humidity);
            init_humidity = humidity;
        }

        if (init_temperature.tem != temperature.tem) {
            ws.send(JSON.stringify(temperature));
            console.log("temperature");
            console.log(temperature);
            init_temperature = temperature;
        }

        ////////////////////////////////////////////////////

        if (init_h != h) {
            client.publish("req/weather/dust", "");
            client.publish("req/weather/weather", "");
            init_h = h;
        }
    
        if (init_d != d) {
            client.publish("req/weather/sun");
            init_d = d;
        }

        // 알람 관련
        
        for (var i =0; i<alarm.alarm_list.length; i++) {
            if (alarm.alarm_list[i].checked == true) {
                if (parseInt(alarm.alarm_list[i].time) == parseInt(now)) {
                    console.log("부저야 울려랏!!");
                    alarm.alarm_list[i].checked = false;
                    ws.send(JSON.stringify(alarm));

                    client.publish("req/arduino/motor", "on");
                    client.publish("req/arduino/buzzer", "on");
                }
            }
        }

    }, 500);

    ws.on("message", function(message) {
        var receiveMessage = JSON.parse(message);

        console.log(receiveMessage);
        
        if (receiveMessage.data.includes("hue")) {
            client.publish("req/" + receiveMessage.data + "/controller", receiveMessage.controller);

            for (var i = 0 ; i<hue_state.length ; i++) {
                if (hue_state[i].data == receiveMessage.data) {
                    if (receiveMessage.controller == "on") {
                        hue_state[i].controller = true;
                    }
                    else if (receiveMessage.controller == "off") {
                        hue_state[i].controller = false;
                    }
                }
            }
        }

        else if (receiveMessage.data.includes("motor")) {
            
            if (receiveMessage.controller == "on") {
                console.log(receiveMessage);
                client.publish("req/arduino/motor", "on");
                client.publish("req/arduino/buzzer", "off");
            }   
            else if (receiveMessage.controller == "off") {
                console.log(receiveMessage);
                client.publish("req/arduino/motor", "off");    
            }
                     
        }

        else if (receiveMessage.data.includes("sleep")) {
            client.publish("req/hue/sleep", "");
        }

        else if (receiveMessage.data.includes("alarm")) {
            console.log(receiveMessage);
            alarm = receiveMessage;
        }
    });
})

http.createServer(app).listen(8080);