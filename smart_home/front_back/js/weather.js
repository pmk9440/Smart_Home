var ws = new WebSocket("ws://13.209.35.11:8002");

  function getDust() {
      console.log("메세지 보냄");
      ws.send("reqWeather");
  }

  var today = new Date();
  var date = today.getDate();
  var month = today.getMonth()+1; //January is 0!
  var year = today.getFullYear();
  var day = today.getDay();
  if(today.getDay() == "0"){
    day = "일";
  } else if(today.getDay() == "1"){
    day = "월";
  }else if(today.getDay() == "2"){
    day = "화";
  }else if(today.getDay() == "3"){
    day = "수";
  }else if(today.getDay() == "4"){
    day = "목";
  }else if(today.getDay() == "5"){
    day = "금";
  }else if(today.getDay() == "6"){
    day = "토";
  }
  
  // ttoday = mm+'/'+dd+'/'+yyyy;
  ttoday = month+'. '+date+' '+day;

  document.getElementById("todaydate").innerHTML = ttoday;



  ws.onmessage = function (event) {
      console.log("날씨 정보 받음");
      var msg = event.data.toString().split(",");
      console.log(msg.toString());

      if (msg[0] == "weather") {
          console.log("weather");
          document.getElementById("water").innerHTML = msg[1];
          document.getElementById("water_type").innerHTML = msg[2];
          document.getElementById("humidity").innerHTML = msg[3];
          document.getElementById("sky").innerHTML = msg[4];
          document.getElementById("temperature").innerHTML = msg[5];

          if(msg[3] >= "1" && msg[3] <= "5" && msg[1] == "0"){
              // document.getElementById("water_type").innerHTML = "없음";
              document.getElementById("sky").innerHTML = "맑음";
              document.getElementById("weatherimage").src = "/media/sun.png";
          }else if(msg[3] >= "6" && msg[3]=="8"){
              document.getElementById("sky").innerHTML = "구름 많음";
              document.getElementById("weatherimage").src = "/media/cloudcloud.png";
          }else if(msg[3] == "9"||"10"){
              document.getElementById("sky").innerHTML = "흐림";
              document.getElementById("weatherimage").src = "/media/cloud.png";
          }else if(msg[1] == "1" || msg[1] == "4"){
              // document.getElementById("water_type").innerHTML = "비";
              // document.getElementById("water_type").innerHTML = "소나기";
              document.getElementById("weatherimage").src = "/media/cloudrain.png";
          }else if(msg[1] == "2"){
              // document.getElementById("water_type").innerHTML = "비/눈";
              document.getElementById("weatherimage").src = "/media/cloudrain.png";
              // document.getElementById("weatherimage2").src = "/media/cloudsnow.png";
          }else if(msg[1] == "3"){
              // document.getElementById("water_type").innerHTML = "눈";
              document.getElementById("weatherimage").src = "/media/cloudsnow.png";
          }
      }
      

      


      // if(msg[3] == "1"||"2"||"3"||"4"||"5"){
      // if(msg[3] >= "1" && msg[3] <= "5"){
      //     document.getElementById("sky").innerHTML = "맑음";
      //     document.getElementById("weatherimage").src = "/media/sun.png";
      // }else if(msg[3] >= "6" && msg[3]=="8"){
      //     document.getElementById("sky").innerHTML = "구름 많음";
      //     document.getElementById("weatherimage").src = "/media/cloudcloud.png";
      // }else if(msg[3] == "9"||"10"){
      //     document.getElementById("sky").innerHTML = "흐림";
      //     document.getElementById("weatherimage").src = "/media/cloud.png";
      // }
      // if(msg[1] == "0"){
      //     document.getElementById("water_type").innerHTML = "없음";
      // }else if(msg[1] == "1"){
      //     document.getElementById("water_type").innerHTML = "비";
      // }else if(msg[1] == "2"){
      //     document.getElementById("water_type").innerHTML = "비/눈";
      // }else if(msg[1] == "3"){
      //     document.getElementById("water_type").innerHTML = "눈";
      // }else if(msg[1] == "4"){
      //     document.getElementById("water_type").innerHTML = "소나기";
      // }
  }