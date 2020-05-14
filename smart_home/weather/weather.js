var request = require('request');
const mqtt= require('mqtt');
var convert = require('xml-js');
const utf8 = require('utf8');
var express = require('express');
var bodyParser = require('body-parser');

var app = express();
app.use(bodyParser.urlencoded({ extended: false }))
 
// parse application/json
app.use(bodyParser.json())

const option = {
    host : '175.127.43.131',
    port : 3883,
    protocol : 'mqtt',
}

var url = 'http://apis.data.go.kr/1360000/VilageFcstInfoService/getVilageFcst';
            
var url2 = 'http://openapi.airkorea.or.kr/openapi/services/rest/ArpltnInforInqireSvc/getMsrstnAcctoRltmMesureDnsty';
var queryParams2 = '?' + encodeURIComponent('ServiceKey') + '=kkQwGMBlEgLW4iNPukU67RiMdC3ddvj0+HTklw9isxJwpcPZf5IwsR+OTpdEmb7RtSWB3IDpDAjFWuQ/SdlTXA=='; /* Service Key*/
queryParams2 += '&' + encodeURIComponent('numOfRows') + '=' + encodeURIComponent('10'); /* 한 페이지 결과 수 */
queryParams2 += '&' + encodeURIComponent('pageNo') + '=' + encodeURIComponent('1'); /* 페이지 번호 */
queryParams2 += '&' + encodeURIComponent('itemCode') + '=' + encodeURIComponent('PM10'); /* 측정항목 구분 (SO2, CO, O3, NO2, PM10, PM25) */
queryParams2 += '&' + encodeURIComponent('dataGubun') + '=' + encodeURIComponent('HOUR'); /* 요청 자료 구분 (시간평균 : HOUR, 일평균 : DAILY) */
queryParams2 += '&' + encodeURIComponent('searchCondition') + '=' + encodeURIComponent('MONTH'); /* 요청 데이터기간 (일주일 : WEEK, 한달 : MONTH) */

var seoulDust;
    var condition;
    var dust;
    var water;
    var water_type;
    var humidity;
    var sky;
    var temperature;
    var count=0;

const client = mqtt.connect(option);

client.on("connect", () => {
    console.log("subConnected : "+ client.connected);
})

client.on("error", () => {
    console.log("Can't connect Sub : " + error);
})

client.subscribe("req/weather/dust");
client.subscribe("req/weather/weather");
client.subscribe("req/weather/sun");

client.on('message', async function (topic, message, packet) {
    console.log("메세지 받음")

    if (topic == "req/weather/dust") {
        Promise.resolve()
        .then(getDust)
    }
    else if (topic == "req/weather/weather") {
        try {
            Promise.resolve()
            .then(getWeather)
        } catch(e) {
            console.log(e);
        } 
    }
    else if (topic == "req/weather/sun") {
        Promise.resolve()
        .then(getSun)
    }
})

function getDate() {
    var date = new Date();
    var y = date.getFullYear();
    var m = date.getMonth();
    var d = date.getDate();
    var hour = date.getHours() + 9;
    var minute = date.getMinutes();
    var weatherInfo;
    var hm;

    if ((m+1)<10) {
        m = "0" + (m+1).toString();
    }

    if (d<10) {
        d = "0" + d.toString();
    }
        
    if (hour >= 24) {
        hour -= 24;
    }

    if (hour >= 0 && hour < 5) {
        hour = "오전 5시 이후에 해주세요.";
        hm = hour;
    }
    else if (hour >=5 && hour < 8) {
        hour = "05";
    }
    else if (hour >=8 && hour < 11) {
        hour = "08";
    }
    else if (hour >=11 && hour < 14) {
        hour = "11";
    }
    else if (hour >=14 && hour < 17) {
        hour = "14";
    }
    else if (hour >=17 && hour < 20) {
        hour = "17";
    }
    else if (hour >=20 && hour <23) {
        hour = "20";
    }
    else if (hour >=23) {
        hour = "23";
    }

    hm = hour + "00";
    var ymd = y.toString() + m.toString() + d.toString();

    var now = {
        "ymd":ymd,
        "hm":hm
    };

    return now;
}

function getDust() {
    var dust;

    request({
        url: url2 + queryParams2,
        method: 'GET'
    }, function (error, response, body) {

        var xmlToJson = convert.xml2json(body, {compact: false, spaces: 4});
        xmlToJson = JSON.parse(xmlToJson);

        seoulDust = xmlToJson.elements[0].elements[0].elements[0].elements[0].text;
        condition = parseInt(seoulDust);

        seoulDust += "㎍/㎥";

        if (condition >= 0 && condition <= 15) {
            condition = "좋음";
        }
        else if (condition > 15 && condition <=35) {
            condition = "보통";
        }
        else if (condition > 35 && condition <=75) {
            condition = "나쁨";
        }
        else if (condition > 75) {
            condition = "매우나쁨";
        }

        dust = {
            "data":"dust",
            "dust":seoulDust,
            "condition":condition
        };
        console.log(dust);
        client.publish("res/weather/dust", JSON.stringify(dust));
    });
}

function getWeather() {

    const now = getDate();
    console.log(now);
    var queryParams = '?' + encodeURIComponent('ServiceKey') + '=iP8yA3m4LgQoUV2yy%2FjVSYpxOHkdJY0M7z8sORq5iJTH9VYzkUhsSLaxqUtRKMhiloq8zvnYOvMeezGGLlfTyA%3D%3D'; /* Service Key*/
    queryParams += '&' + encodeURIComponent('ServiceKey') + '=' + encodeURIComponent('-'); /* 공공데이터포털에서 받은 인증키 */
    queryParams += '&' + encodeURIComponent('pageNo') + '=' + encodeURIComponent('1'); /* 페이지번호 */
    queryParams += '&' + encodeURIComponent('numOfRows') + '=' + encodeURIComponent('10'); /* 한 페이지 결과 수 */
    queryParams += '&' + encodeURIComponent('dataType') + '=' + encodeURIComponent('JSON'); /* 요청자료형식(XML/JSON)Default: XML */
    queryParams += '&' + encodeURIComponent('base_date') + '=' + encodeURIComponent(now.ymd); /* 15년 12월 1일발표 */
    queryParams += '&' + encodeURIComponent('base_time') + '=' + encodeURIComponent(now.hm); /* 05시 발표 */
    queryParams += '&' + encodeURIComponent('nx') + '=' + encodeURIComponent('61'); /* 예보지점 X 좌표값 */
    queryParams += '&' + encodeURIComponent('ny') + '=' + encodeURIComponent('120'); /* 예보지점의 Y 좌표값 */

    request({
        url: url + queryParams,
        method: 'GET'
    }, function (error, response, body) {
        console.log("weather");
        console.log(response.statusCode);

        try {
            var data = JSON.parse(body);
            data = data.response.body.items.item;
            
            for (var i =0; i<data.length ; i++) {
                if (data[i].category == "POP") {
                    water = data[i].fcstValue + "%";
                }
                else if (data[i].category == "PTY") {
                    water_type = data[i].fcstValue;
                }
                else if (data[i].category == "SKY") {
                    sky = data[i].fcstValue;
                }
                else if (data[i].category == "T3H") {
                    temperature = data[i].fcstValue + "°C";
                }
                else if (data[i].category == "UUU") {
                    wind1 = data[i].fcstValue;
                }
                else if (data[i].category == "VVV") {
                    wind2 = data[i].fcstValue;
                }
            }
            var wind;
            
            if (water_type == "0") {
                water_type = "해쨍쨍";

            }
            else if (water_type == "1") {
                water_type = "비";
            }
            else if (water_type == "2") {
                water_type = "비";
            }
            else if (water_type == "3") {
                water_type = "비";
            }
            else if (water_type == "4") {
                water_type = "비";
            }
            
            if (sky === "1") {
                sky = "구름없음";
            }
            else if (sky === "3") {
                sky = "구름많음";
            }
            else if (sky === "4") {
                sky = "흐림";
            }

            if (parseInt(wind1) > parseInt(wind2)) {
                wind = wind1 + "m/s";
            }
            else {
                wind = wind2 + "m/s";
            }

            var weather = {
                "data" : "weather",
                "time" : now.hm,
                "water" : water,
                "water_type" : water_type,
                "sky" : sky,
                "temperature" : temperature,
                "wind" : wind
            };

            console.log(weather);

            client.publish("res/weather/weather", JSON.stringify(weather));
        } catch(e) {
            var weather = {
                "data" : "weather",
                "time" : "Weather Data ERROR"
            }
            client.publish("res/weather/weather", JSON.stringify(weather));
            console.log(e);
        }
        
    });
}

function getSun() {

    const now = getDate();
    console.log(now);

    var url3 = 'http://openapi.kasi.re.kr/openapi/service/RiseSetInfoService/getAreaRiseSetInfo';
    var queryParams3 = '?' + encodeURIComponent('ServiceKey') + '=kkQwGMBlEgLW4iNPukU67RiMdC3ddvj0+HTklw9isxJwpcPZf5IwsR+OTpdEmb7RtSWB3IDpDAjFWuQ/SdlTXA=='; /* Service Key*/
    queryParams3 += '&' + encodeURIComponent('locdate') + '=' + encodeURIComponent(now.ymd); /* */
    queryParams3 += '&' + encodeURIComponent('location') + '=' + encodeURIComponent('서울'); /* */

    request({
        url: url3 + queryParams3,
        method: 'GET'
    }, function (error, response, body) {
        var data = body;

        var xmlToJson = convert.xml2json(data, {compact: false, spaces: 4});
        xmlToJson = JSON.parse(xmlToJson);

        var sunrise = xmlToJson.elements[0].elements[1].elements[0].elements[0].elements[15].elements[0].text;
        var sunset = xmlToJson.elements[0].elements[1].elements[0].elements[0].elements[16].elements[0].text

        var sun = {
            "data" : "sun",
            "date" : now.ymd,
            "sunrise" : sunrise,
            "sunset" : sunset
        }

        console.log(sun);
        client.publish("res/weather/sun", JSON.stringify(sun));
    });
}