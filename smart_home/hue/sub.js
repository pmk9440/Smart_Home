const mqtt = require('mqtt');
var request = require('request');
var fs = require('fs');

// var jsonfile = fs.readFileSync('property.json');
// var jsonparse = JSON.parse(jsonfile);
// var pro = JSON.stringify(jsonparse);

var urll = 'http://210.107.205.200:8080/api/wkcBD-lTULsGrCJ2hqZZqgeQsfathjs6zc3Rul1O/lights/18'
var url2 = 'http://210.107.205.200:8080/api/wkcBD-lTULsGrCJ2hqZZqgeQsfathjs6zc3Rul1O/lights/15'

const options = {
    host: '13.125.134.65',
    port: 1883,
    protocol: 'mqtt',
}
  
const client = mqtt.connect(options);

client.on("connect", () => {	
    console.log("connected : "+ client.connected);
})

client.on("error", (error) => { 
    console.log("Can't connect : " + error);
})

client.subscribe("reqproperty");
client.subscribe("hue1");
client.subscribe("test1");
client.subscribe("bright1");
client.subscribe("temperature1");
client.subscribe("hue2");
client.subscribe("test2");
client.subscribe("bright2");
client.subscribe("temperature2");


client.on('message', (topic, message, packet) => {

    console.log(topic);

    if (topic == "hue1") {
        
        if (message == "power_on") {
            console.log("power_on")
            request({   
                url: urll + "/state",    //16번 그룹 전등 제어
                method: 'PUT',
                body: JSON.stringify({"on":true})  //on : ture 켜기, on : false 끄기
            })
        }
        else if( message == "power_off")
        {
            console.log("power_off");
            request({   
                url: urll + "/state",    //16번 그룹 전등 제어
                method: 'PUT',
                body: JSON.stringify({"on":false})  //on : ture 켜기, on : false 끄기
            })
        }
        
        
        else if(message =="state")
        {
            console.log("state");
            var state;
            var on;
            var bri;
            var hue;
            var sat;
            var name;
            var ct;

            request({ 
                url: urll ,    //1번 그룹 전등 상태 확인
                method: 'GET',
                }, function(err, response, body) {
                    var group1status = JSON.parse(body)
    
                    //console.log(group1status);

                    on = group1status.state.on;
                    bri = group1status.state.bri;
                    hue = group1status.state.hue;
                    sat = group1status.state.sat;
                    name = group1status.name;
                    ct = group1status.state.ct;
                    state = on.toString() + "," + bri.toString() + "," + hue.toString() + "," + sat.toString() + "," + name.toString()+","+ ct.toString();

                    // var temp = {
                    //     "on" : on,
                    //     "bri" : bri,
                    //     "hue" : hue,
                    //     "sat" : sat,
                    //     "name" : name,
                    // }

                    // console.log(temp);

                    client.publish("state1", state);
                   
                }
            )
        }
    }

    else if (topic == "test1") {
        console.log("test1");
        console.log(message.toString());
        var light = message.toString().split(",");
        console.log(light[0]);

        request({   
            url: urll + "/state",    //16번 그룹 전등 제어
            method: 'PUT',
            body: JSON.stringify({ "hue" : parseInt(light[1]), "sat" : parseInt(light[2])}),
        })
    }
    else if (topic == "bright1") {
        console.log("bright1");
        var bright = message.toString().split(",");
        //var bright = parseInt(message.toString());
        request({   
            url: urll + "/state",    //16번 그룹 전등 제어
            method: 'PUT',
            body: JSON.stringify({ "bri" : parseInt(bright[1])}),
        })
    }
    else if (topic == "temperature1") {
        console.log("temperature1");
        var temperature = message.toString().split(",");
        
        //var bright = parseInt(message.toString());
        request({   
            url: urll + "/state",    //16번 그룹 전등 제어
            method: 'PUT',
            body: JSON.stringify({ "ct" : parseInt(temperature[1])}),
        })
    }
    else if (topic == "hue2") {

        if (message == "power_on") {
            console.log("power_on")
            request({   
                url: url2 + "/state",    //16번 그룹 전등 제어
                method: 'PUT',
                body: JSON.stringify({"on":true})  //on : ture 켜기, on : false 끄기
            })
        }
        else if( message == "power_off")
        {
            console.log("power_off");
            request({   
                url: url2 + "/state",    //16번 그룹 전등 제어
                method: 'PUT',
                body: JSON.stringify({"on":false})  //on : ture 켜기, on : false 끄기
            })
        }
        
        
        else if(message =="state")
        {
            console.log("state2");
            var state;
            var on;
            var bri;
            var hue;
            var sat;
            var name;
            var ct;

            request({ 
                url: url2 ,    //1번 그룹 전등 상태 확인
                method: 'GET',
                }, function(err, response, body) {
                    var group1status = JSON.parse(body)
    
                    // console.log(group1status);

                    on = group1status.state.on;
                    bri = group1status.state.bri;
                    hue = group1status.state.hue;
                    sat = group1status.state.sat;
                    name = group1status.name;
                    ct = group1status.state.ct;
                    state = on.toString() + "," + bri.toString() + "," + hue.toString() + "," + sat.toString() + "," + name.toString()+","+ ct.toString();

                    // var temp = {
                    //     "on" : on,
                    //     "bri" : bri,
                    //     "hue" : hue,
                    //     "sat" : sat,
                    //     "name" : name,
                    // }

                    // console.log(temp);

                    client.publish("state2", state);
                   
                }
            )
        }
    }
    else if (topic == "test2") {
        console.log("test2");
        console.log(message.toString());
        var light = message.toString().split(",");
        console.log(light[0]);

        request({   
            url: url2 + "/state",    //16번 그룹 전등 제어
            method: 'PUT',
            body: JSON.stringify({ "hue" : parseInt(light[1]), "sat" : parseInt(light[2])}),
        })
    }
    else if (topic == "bright2") {
        console.log("bright2");
        var bright = message.toString().split(",");
        //var bright = parseInt(message.toString());
        request({   
            url: url2 + "/state",    //16번 그룹 전등 제어
            method: 'PUT',
            body: JSON.stringify({ "bri" : parseInt(bright[1])}),
        })
    }
    else if (topic == "temperature2") {
        console.log("temperature2");
        var temperature = message.toString().split(",");
        
        //var bright = parseInt(message.toString());
        request({   
            url: url2 + "/state",    //16번 그룹 전등 제어
            method: 'PUT',
            body: JSON.stringify({ "ct" : parseInt(temperature[1])}),
        })
    }
    else if (topic == "reqproperty") {
        // console.log(message.toString());
        // console.log(jsonparse.toString());
        // client.publish("resproperty", pro);
    }

})
  
    