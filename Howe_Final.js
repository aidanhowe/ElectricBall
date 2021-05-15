var captureCam;

var mic;
var micAmplitude;
var micE;

var onEdge = false; //Prevents looping of edge-hit sound.
var lives = 3; //Chances
var score = 0;
var highScore = 0;
var scoreCollection = true; //game running?

var accel = 2; //Scaling difficulty
var invincibility = 0; //length remaining of invincibility 'frames'

var explosionSound;
var dinkSound;
var burstReadySound;
var burstSound;

var obs1x = 750; //Obstacle 1 values
var obs1y = 500;
var obs2x = 250; //Obstacle 2 values
var obs2y = 500;
var obs3x = 500; //Obstacle 3 values
var obs3y = 388;

var burstAvailable = false; //special move, hit space when circle is green.
var burstCooldown = 0;
var lightningPresent = 0;

function preload(){
	dinkSound = loadSound("Dink.wav"); //Hit edge sound
	explosionSound = loadSound("Explosion.wav"); //Lose Sound
	burstReadySound = loadSound("BurstReady.wav"); //Ability ready
	burstSound = loadSound("Burst.wav"); //Ability
}

function setup() {
	createCanvas(1080, 1920);
	captureCam = createCapture();
	captureCam.hide();

	mic = new p5.AudioIn();
	mic.start();

	micAmplitude = new p5.Amplitude();
	micAmplitude.setInput(mic);

	textFont("Calibri");

	colorMode(RGB);
}


function draw() {
	var aspectRatio = captureCam.height/captureCam.width;
	image(captureCam, 0, 0, width, 500);
	fill(100,100,100);
	rect(0,388,1100,114);
	rect(90,55,300,114);

	//text
	textSize(50);
	if(lives >= 1) fill(0,100,0);
	else fill(255,0,0);
	text(("Score: " + score),100,100);
	text(("Hi-Score: " + highScore),100,150);

	
	if(burstAvailable == true)
	{
		fill(0,255,0);
		circle(750,125,50);
		textSize(25);
		text(("BURST READY [B]"),485,133);
		lightningPresent = 100;
	}
	else if (burstAvailable == false)
	{
		filter(GRAY);
		fill(90,90,90);
		circle(750,125,50);
		fill(255,70,70);
		textSize(25);
		text(("Burst charging... [" + round((burstCooldown/2000)*100) + "%]"),480,133);
		if(burstCooldown>=2000) 
			{
				burstReadySound.play();
				burstAvailable = true;
			}
		else burstCooldown+=(map(micAmplitude.getLevel(), 0, 1.0, 1, 20));

	}

	if(invincibility>0) strokeWeight(invincibility);
	else strokeWeight(1);
	if(lives > 3) {

		fill(255,255,255);
	}
	else if(lives == 3) fill(0,200,0);
	else if(lives == 2) fill(200,200,0);
	else if(lives ==1) fill(200,0,0);
	else{ //GAME OVER
		fill(0,0,0);
		scoreCollection = false;
		if (score>highScore)
		{
			highScore = score;
		} 
		textSize(25);
		text(("To play again, click your score!"),90,55);
	}

	stroke(1);
	micE = map(micAmplitude.getLevel(), 0, 1.0, 10, width);
	if(micE >= 100){ 
		if(!onEdge) {
			onEdge = true;
			dinkSound.play();
		}
		micE = 100;
	}
	else if(micE <= 15){
		if(!onEdge) {
			onEdge = true;
			dinkSound.play();
		}
	}
	else onEdge = false;
	ellipse(25, 500-micE, 25, 25);

	//Move obstacles
	if(obs1x <= accel) //loop
	{
		obs1x = random(900,1010);
		if (accel >= 20) accel=random(17,25);
		else accel+=(random(1,2));
		if (scoreCollection==true) score++;
	}
	else 
	{
		obs1x -= accel
	}
	obstacleBottom(obs1x, obs1y+2);
	if(obs2x <= accel) //loop
	{
		obs2x = random(900,1010);
		if (scoreCollection==true) score++;
	}
	else 
	{
		obs2x -= accel
	}
	obstacleBottom(obs2x, obs2y+2);
	if(obs3x <= accel) //loop
	{
		obs3x = random(950,1010);
		if (scoreCollection==true) score++;
	}
	else 
	{
		obs3x -= accel
	}
	obstacleTop(obs3x, obs3y);
	//check touching
	if(500-micE >= obs1y-26 && obs1x-15 <= 25 && invincibility == 0){
		lives--;
		explosionSound.play();
		invincibility = 50;
	}
	if(500-micE >= obs2y-26 && obs2x-15 <= 25 && invincibility == 0){
		lives--;
		explosionSound.play();
		invincibility = 50;
	}
	if(500-micE <= obs3y+26 && obs3x-15 <= 25 && invincibility == 0){
		lives--;
		explosionSound.play();
		invincibility = 50;
	}
	if (invincibility>0) invincibility--;
	if(lightningPresent > 0) 
		{
			fill(255,255,255);
			stroke(255,255,255);
			curve(50,500-micE,random(50-50,50+50),random(500-micE-50,500-micE+25),random(50-50,50+50),random(500-micE-50,500-micE+50),random(50-50,50+50),random(500-micE-50,500-micE+50));
			lightningPresent--;
		}
}

function obstacleBottom(x,y){ //obstacle object creator
	fill(255, 0, 0);
	triangle(x-15,y,x,y-25,x+15,y); //triangle points up
}
function obstacleTop(x,y){ //obstacle object creator
	fill(255, 0, 0);
	triangle(x-15,y,x,y+25,x+15,y); //triangle points down
}
function keyPressed(){ //Activate Burst
	if(keyCode === 66 && burstAvailable == true){
		burstSound.play();
		filter(INVERT);
		fill(0,0,255);
		lives++;
		burstAvailable = false;
		burstCooldown = 0;
		obs1x = 1500;
		obs2x = 1000;
		obs3x = 1250;
		accel-=3;
		if(accel <= 0) accel=1;
	}
}

function mouseClicked(){
	if(mouseX < 390 && mouseX > 90 && mouseY<169 && mouseY>55 && lives <= 0)
	{
		restartGame();
	}
}


function restartGame(){
onEdge = false; //Prevents looping of edge-hit sound.
lives = 3; //Chances
score = 0;
scoreCollection = true; //game running?

accel = 2; //Scaling difficulty
invincibility = 0; //length remaining of invincibility 'frames'

obs1x = 750; //Obstacle 1 values
obs1y = 500;
obs2x = 250; //Obstacle 2 values
obs2y = 500;
obs3x = 500; //Obstacle 3 values
obs3y = 388;

burstAvailable = false; //special move, hit space when circle is green.
burstCooldown = 0;
lightningPresent = 0;
}
