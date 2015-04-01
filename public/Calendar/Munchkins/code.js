// ----------------------------------------
// Actual game code goes here.

// 
//Global 
//vars


fps = null;
canvas = null;
ctx = null;


// ----------------------------------------

// Our 'game' variables


//var person= prompt("Please enter your name",20);
var minutes = 20;
var messages="NOTHING";
var timeDisp = minutes+":00";
var level = 1;
var strength =1;
var timer = 10;
var seconds = minutes*60;
var loose = false;
var countdown = false;

var imageObj = new Image();
imageObj.src = 'Calendar/Munchkins/images/Calandar.png';







window.onload = function () {
   // alert("This design is far to clustered for my liking. I have small change I wish to implement. Expected fin date: Monday at 11pm")
	canvas = document.getElementById("screen");
    
	ctx = canvas.getContext("2d");
   
	 fps = new FPSMeter("fpsmeter", document.getElementById("fpscontainer"));
	

canvas.addEventListener('click', function(evt) {
  
	      var mousePos = getMousePos(canvas, evt);
       
	      var message = 'Mouse position: ' + mousePos.x + ',' + mousePos.y;
              mouseX = mousePos.x;
              mouseY= mousePos.y;
			
   
	   }, false);
	   

GameLoopManager.run(GameTick);

};








function GameTick(elapsed)
{
	fps.update(elapsed);

	
	var w = canvas.width;
	var h = canvas.height;
	
	ctx.fillStyle = "#ffffff";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	//ctx.drawImage(imageObj, 0, 0,canvas.width,canvas.height);
	ctx.fillStyle = "#cc5141";
	ctx.fillRect(canvas.width/9,0, canvas.width, canvas.height/11);

	for(var i=0; i<7;i++){
		ctx.beginPath();
    	ctx.moveTo(w/9+i*(79.85), 0);
    	ctx.lineTo(w/9+i*(79.85), h);
    	ctx.strokeStyle = "#cccccc";
    	ctx.stroke();
	}
	
	for(var i=0; i<12;i++){
		ctx.beginPath();
    	ctx.moveTo(w/9, i*(25));
    	ctx.lineTo(w, i*(25));
    	ctx.strokeStyle = "#cccccc";
    	ctx.stroke();
	}


	ctx.fillStyle = "#ffffff";
	ctx.font = "18px Arial";
	ctx.fillText("Mon", 73, 19);
	ctx.fillText("Tues", 149, 19);
	ctx.fillText("Wens", 227, 19);
	ctx.fillText("Thurs", 305, 19);
	ctx.fillText("Fri", 396, 19);

	ctx.fillStyle = "#656565";
	ctx.font = "14px Arial";
	ctx.fillText("8 am:", 10, 42);
	ctx.fillText("9 am:", 10, 42+25*1);
	ctx.fillText("10 am:", 2, 42+25*2);
	ctx.fillText("11 am:", 2, 42+25*3);
	ctx.fillText("12 pm:", 2, 42+25*4);
	ctx.fillText("1 pm:", 10, 42+25*5);
	ctx.fillText("2 pm:", 10, 42+25*6);
	ctx.fillText("3 pm:", 10, 42+25*7);
	ctx.fillText("4 pm:", 10, 42+25*8);
	ctx.fillText("5 pm:", 10, 42+25*9);
	ctx.fillText("6 pm:", 10, 42+25*10);


}


function getMousePos(canvas, evt) {
       
 var rect = canvas.getBoundingClientRect();
       
 return {
         
	 x: evt.clientX - rect.left,
       
         y: evt.clientY - rect.top
       
 };
     
 }