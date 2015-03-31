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

	
	
	
	ctx.fillStyle = "#ffffff";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.drawImage(imageObj, 0, 0,canvas.width,canvas.height);
	
	
}


function getMousePos(canvas, evt) {
       
 var rect = canvas.getBoundingClientRect();
       
 return {
         
	 x: evt.clientX - rect.left,
       
         y: evt.clientY - rect.top
       
 };
     
 }