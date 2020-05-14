#include <WiFi.h>
#include <PubSubClient.h>
#include <Servo.h>
Servo myservo;
char* ssid = "ajou_IOT_200";
const char* password = "";
const char* nodeName = "Factory-A-0";

char* topic = "req/arduino/motor";
char* topic1 = "req/arduino/buzzer";
char* topic2 = "res/arduino/temperature";
char* server = "175.127.43.131"; /*broker IP*/
char message_buff[100];
int servobutton;
const int buzzPin = 13;
int buttonState;
void callback(char* topic, byte* payload, unsigned int length) {
  int i = 0;

  Serial.println("Message arrived: topic: " + String(topic));
  Serial.println("Length: " + String(length, DEC));

  for(i=0; i<length; i++){
    message_buff[i] = payload[i];
  }
  message_buff[i] = '\0';

  String msgString = String(message_buff);
  Serial.println("Payload: " + msgString);
  if(String(topic) == "req/arduino/motor"){
    servobutton = (msgString == "on") ? HIGH : LOW;
    Serial.println("111");
    if(servobutton ==HIGH){ 
      myservo.write(100);
    }
    else{
      myservo.write(0);
    }
  }
  if(String(topic) =="req/arduino/buzzer"){
    buttonState = (msgString == "on") ? HIGH : LOW;
    Serial.println("222");
    if(buttonState ==HIGH){ 
      digitalWrite(buzzPin, HIGH);
    }
    else{
      digitalWrite(buzzPin, LOW);
    }
  }
}

WiFiClient wifiClient;
PubSubClient client(server, 3883, callback, wifiClient);

char data[10];

void setup() {
   Serial.begin(9600);

  WiFi.begin(ssid);
  
  while ( WiFi.status() != WL_CONNECTED) {
    Serial.print("."); delay(500);
  }

  while( !client.connect(nodeName) ) {
    Serial.print(";"); delay(1000);
  }
  
  client.subscribe(topic);
  client.subscribe(topic1);
  myservo.attach(5); //5번핀에 서보 모터 연결
  pinMode(buzzPin, OUTPUT);
}
void loop() {
  client.loop();
  int val;
  int temp;


  val=analogRead(A0);
  temp=((500*val)/1024);
  Serial.print("Temperature value:");
  Serial.println(temp);

  String Str = String(temp);

  Str.toCharArray(data, Str.length()+1);
  Serial.println(data);
  client.publish(topic2,data);

 delay(2000);
}
