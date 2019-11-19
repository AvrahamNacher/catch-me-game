"use strict";

var score;
var level;
var hitsToNextLevel;
var positiveHits, negativeHits;
var timeLeft;
var list = document.querySelector('ul');
var gameArea = document.querySelector("#game-area");
var player = document.querySelector("#player");
var scoreElement = document.querySelector("#score");
var levelElement = document.querySelector("#level");
var hitstoNextLevelElement = document.querySelector("#hitsToNextLevel");
var positiveHitsElement = document.querySelector("#positiveHits");
var negativeHitsElement = document.querySelector("#negativeHits");
var timeLeftElement = document.querySelector("#timeLeft");
var highScoresElement = document.querySelector("#highScores");
var highScoresText;
var highScoresArray;

//var paddleWidth = 100;
var playerPosition;
var playerSpeed;
var targets;
var targetSpeed;
var gameSpeed;
var gameInterval, timeLeftInterval;
var targetGenerationMax, targetGenerationMin;
var generateTargetsTimeout;
var gameOver;

const levels = [{
  // level 1 - green large
  gameSpeed: 100,
  playerSpeed: 40,
  paddleWidth: 100,
  probabilityOfTarget: 70,
  targetSizeMax: 110,
  targetSizeMin: 50,
  enemySizeMax: 70,
  enemySizeMin: 15,
  targetGenerationMax: 10,
  targetGenerationMin: 4,
  drift: 0,
  hitsToNextLevel: 10,
  backgroundColor: "#4e54c8"
},
{
  // level 2 - all green small, probabilityOfTarget less
  gameSpeed: 100,
  playerSpeed: 60,
  paddleWidth: 100,
  probabilityOfTarget: 60,
  targetSizeMax: 30,
  targetSizeMin: 15,
  enemySizeMax: 70,
  enemySizeMin: 15,
  targetGenerationMax: 10,
  targetGenerationMin: 4,
  drift: 0,
  hitsToNextLevel: 15,
  backgroundColor: "#c84eb3"
},
{
  // level 3 - all red large, probabilityOfTarget less, small drift
  gameSpeed: 100,
  playerSpeed: 80,
  paddleWidth: 100,
  probabilityOfTarget: 50,
  targetSizeMax: 30,
  targetSizeMin: 15,
  enemySizeMax: 140,
  enemySizeMin: 70,
  targetGenerationMax: 10,
  targetGenerationMin: 4,
  drift: 100,
  hitsToNextLevel: 20,
  backgroundColor: "#1f9b5d"
},
{
  // level 4 - larger drift  - smaller paddle!
  gameSpeed: 100,
  playerSpeed: 100,
  paddleWidth: 70,
  probabilityOfTarget: 40,
  targetSizeMax: 30,
  targetSizeMin: 15,
  enemySizeMax: 140,
  enemySizeMin: 70,
  targetGenerationMax: 10,
  targetGenerationMin: 4,
  drift: 150,
  hitsToNextLevel: 25,
  backgroundColor: "#d6c31a"
},
{
  // level 5 - very large drift
  gameSpeed: 120,
  playerSpeed: 60,
  paddleWidth: 40,
  probabilityOfTarget: 30,
  targetSizeMax: 30,
  targetSizeMin: 15,
  enemySizeMax: 140,
  enemySizeMin: 70,
  targetGenerationMax: 10,
  targetGenerationMin: 4,
  drift: 300,
  hitsToNextLevel: 0,  // only 5 levels so doesn't matter
  backgroundColor: "#411a14"
}]

// class Targets {
//   constructor(x, y, velX, velY, color, size) {
//     this.x = x;
//     this.y = y;
//     this.velX = velX;
//     this.velY = velY;
//     this.color = color;
//     this.size = size;
//   }
// }

function rand(max, min) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function addTarget() {
  if (!gameOver) {
    let newTarget = (rand(100,0) < levels[level].probabilityOfTarget) ? "green" : "red"
    let newTargetElement = document.createElement("div");
    newTargetElement.classList.add("target");
    newTargetElement.style.height = newTargetElement.style.width = (newTarget == "green") 
    ? rand(levels[level].targetSizeMax, levels[level].targetSizeMin) + "px" 
    : rand(levels[level].enemySizeMax, levels[level].enemySizeMin) + "px" ;
    newTargetElement.style.backgroundColor = newTarget;
    let xPos = rand(gameArea.getBoundingClientRect().width - levels[level].paddleWidth, levels[level].paddleWidth);
    // let xPos = rand(gameArea.getBoundingClientRect().width - paddleWidth, paddleWidth);
    newTargetElement.style.left = xPos + "px";
    newTargetElement.style.top = "-100px";  // start target off top of screen
    let timer = setTimeout(function() {
      newTargetElement.style.top = "100vh"; // move target off bottom of screen
      // 50% chance of drift left or right
      newTargetElement.style.left = rand(1,0) ? xPos + levels[level].drift + "px" : xPos - levels[level].drift + "px";
      clearTimeout(timer);
    }, 100);
  
    targets.push(newTargetElement);
  
    player.before(newTargetElement);
  }
}

function generateMoreTargets() {
  let interval = rand(levels[level].targetGenerationMax, levels[level].targetGenerationMin);
  if (!gameOver) {
    generateTargetsTimeout = setTimeout(function() {
      addTarget();
      generateMoreTargets();
      // clearTimeout(generateTargetsTimeout);  // only clearTimeout when game over
    }, interval * 100);
  }

}

function checkCollision() {
// thanks to https://codepen.io/dropinks/pen/MrzPXB
    var object_2 = player.getBoundingClientRect();
    
    targets.forEach(function(target) {
      var object_1 = target.getBoundingClientRect();

      if (object_1.left < object_2.left + object_2.width  
        && object_1.left + object_1.width  > object_2.left 
        && object_1.top < object_2.top + object_2.height 
        && object_1.top + object_1.height > object_2.top) {
          if (target.style.border=="") { // only increment once per catch
            target.style.border = "1px solid black";
            updateScore(target);
            target.remove();
          };
      }
      else if (target.offsetTop > document.body.clientHeight) {   // if target moves off screen
            target.remove();
      }

    });
}

function updateLevel() {
  if (level < 4) {  // only 5 levels [0,1,2,3,4]
    level++;
    levelElement.innerHTML = "Level: " + (level+1);
    gameArea.style.backgroundColor = levels[level].backgroundColor;
    player.style.width = levels[level].paddleWidth + "px";
    timeLeft += 15;
  }
}

function updateHitsToNextLevel() {
  if (level < 4) { // only track hits for until level 5 [0,1,2,3,4]
    hitsToNextLevel--;
    if (hitsToNextLevel == 0) {
      updateLevel();
      hitsToNextLevel = levels[level].hitsToNextLevel;
    }
    hitstoNextLevelElement.innerHTML = "Hits to Next Level: " + hitsToNextLevel;
  }
}

function updateScore(targetHit) {
  console.log(targetHit.style.backgroundColor);
  if (targetHit.style.backgroundColor == "green") {
    score += ((level+1) * 10);
    positiveHits++
    positiveHitsElement.innerHTML = "Positive Hits: " + positiveHits;
  } else if (targetHit.style.backgroundColor == "red") {
    score -=(level+1);
    negativeHits++;
    negativeHitsElement.innerHTML = "Negative Hits: " + negativeHits;
  }
  scoreElement.innerHTML = "Score: " + score;
  updateHitsToNextLevel();
}

function gamePlay() {
  checkCollision();
}

function updateTimeLeft() {
  timeLeft--;
  timeLeftElement.innerHTML = "Time Remaining: " + timeLeft;
  if (timeLeft == 0) {
    stopGame();
  }
}

function saveHighScores() {
  let highScoresJSON = JSON.stringify(highScoresArray);
  localStorage.setItem("catchMeHighScores", highScoresJSON);
}

function updateHighScores() {
  highScoresText =`<div id="high-score-title">High Scores:</div>`;
  highScoresArray.forEach(function(el) {
    highScoresText += `<div class="high-score"><span>${el.date}</span>${el.score} - ${el.name}</div>`;
    // highScoresText += `${el.score} - ${el.name} \n`;
  });
  highScoresElement.innerHTML = highScoresText;
  let hovers = document.querySelectorAll("#high-score");
  hovers.forEach(function(el) {
    el.addEventListener("mouseover", function() {
      this.style.backgroundColor = "white";
    })
  })
}

function getNewHighScoreInfo(position) {
  let newHighScoreElement = document.createElement("div");
  newHighScoreElement.setAttribute("id", "new-high-score")
  gameArea.appendChild(newHighScoreElement);

  let congrats = document.createElement("div");
  congrats.innerHTML = "New High Score!";
  congrats.setAttribute("id", "congrats-message")
  newHighScoreElement.appendChild(congrats);
  
  let playerNameElement = document.createElement("input");
  playerNameElement.type = "text";
  playerNameElement.setAttribute("id", "player-name");
  newHighScoreElement.appendChild(playerNameElement);
  playerNameElement.placeholder = "Enter Your Name Here";
  playerNameElement.focus();

  var today = new Date(); 
  var date = (today.getMonth()+1)+'/'+today.getDate()+'/'+today.getFullYear();

  playerNameElement.addEventListener("blur", function() {  // check if click off input field

    if (playerNameElement.value == "") {
      playerNameElement.value = "Avraham Nacher 😊";
    }
    highScoresArray.splice (position, 0,  {  // add new high score, moving other scores down
      name: playerNameElement.value,
      score: score,
      date: "Date: " + date
    })
    highScoresArray.pop();  // remove the lowest score in the array
      
    newHighScoreElement.remove();
    updateHighScores();
    saveHighScores();
    displayReplayButton();
    
  })
  
  playerNameElement.addEventListener("keydown", function() {
    if(event.key === "Enter") {  // check if 'enter' from input field
      playerNameElement.blur();
    }
  })
}

function newHighScoreInfoDone() {
  alert("hi");
}
function checkForNewHighScore() {
  let newHighScore = false;
  let i = 4;
  while ((score >= highScoresArray[i].score) && (i>=0)) {
    newHighScore = true;
    i--;
    if (i == -1) {  // player has top score; stop searching
      break;
    }
  }
  if (newHighScore) {
    i++; // location of newScore
    getNewHighScoreInfo(i);
  } else {  // no new high score, Do they want to play again?
    displayReplayButton();
  }

}

function displayReplayButton() {
  let replayButton = document.createElement("div");
  replayButton.setAttribute("id", "replay-button");
  replayButton.innerHTML = "PLAY AGAIN!";
  replayButton.addEventListener("click", playAgain);
  gameArea.appendChild(replayButton);
}

function displayGameOver() {
  let gameOverElement1 = document.createElement("div");
  gameOverElement1.classList.add("game-over-text");
  gameOverElement1.setAttribute("id", "game-over-top");
  gameOverElement1.innerHTML = "GAME";

  let gameOverElement2 = document.createElement("div");
  gameOverElement2.classList.add("game-over-text");
  gameOverElement2.setAttribute("id", "game-over-bottom");

  gameOverElement2.innerHTML = "OVER";

  gameArea.appendChild(gameOverElement1);
  gameArea.appendChild(gameOverElement2);
  
}

function stopGame() {
  // let computedStyle;
  // let top;
  gameOver = true;
  clearInterval(gameInterval);
  clearInterval(timeLeftInterval);
  clearTimeout(generateTargetsTimeout);

  for (let target of targets) {
    // Freeze the existing targets
    let computedStyle = window.getComputedStyle(target);
    let top = computedStyle.getPropertyValue('top');
    target.style.top = top;
  }

  player.style.display = "none";
  displayGameOver();
  checkForNewHighScore();
  
}

function initHighScores() {
  let getHighScores = localStorage.getItem("catchMeHighScores");
  if (getHighScores == null) {  // no history of high scores yet, put in default high scores
    console.log("no scores in localStorage");
    highScoresArray = [{
      name: "Abe Jackson",
      score: 413,
      date: "Date: 07/12/2013"
    },
    {
      name: "Sam Smith",
      score: 400,
      date: "Date: 01/21/2010"
    },
    {
      name: "Bradley Shapiro",
      score: 300,
      date: "Date: 01/21/2010"
    },
    {
      name: "April Harrington",
      score: 200,
      date: "Date: 01/21/2010"
    },
    {
      name: "Try and Beat Me!",
      score: 30,
      date: "Date: 01/21/2010"
    }];
    saveHighScores();
    // let highScoresJSON = JSON.stringify(highScoresArray);
    // console.log(" h " + highScoresArray);
    // localStorage.setItem("catchMeHighScores", highScoresJSON);
  } else {
    highScoresArray = JSON.parse(getHighScores);
  }
  updateHighScores();
}

function init() {
  gameOver = false;
  score = 0;
  level = 0;
  positiveHits = 0;
  negativeHits = 0;
  gameArea.style.backgroundColor = levels[level].backgroundColor;
  scoreElement.innerHTML = "Score: 0";
  levelElement.innerHTML = "Level: 1";
  hitsToNextLevel = levels[level].hitsToNextLevel;
  hitstoNextLevelElement.innerHTML = "Hits to Next Level: " + hitsToNextLevel;
  positiveHitsElement.innerHTML = "Positive Hits: 0";
  negativeHitsElement.innerHTML = "Negative Hits: 0";

  playerPosition = (gameArea.offsetWidth - levels[level].paddleWidth) / 2;
  player.style.display = "inherit";
  player.style.left = playerPosition + "px";  
  player.style.width = levels[level].paddleWidth + "px";  
  targets = [];

  gameInterval = setInterval(gamePlay, levels[level].gameSpeed);
  timeLeft = 60;
  timeLeftElement.innerHTML = "Time Remaining: " + timeLeft;
  timeLeftInterval = setInterval(updateTimeLeft, 1000);

  generateMoreTargets();
}

function showInstructions() {
  let instructionsElement = document.createElement("div");
  instructionsElement.innerHTML = `
    <div id="instructions">
      <span class="title">Instructions:</span>
      <span class="instruction-text">The object of the game is to get as many points as possible before time runs out.</span>
      <span class="instruction-text">Catch <span class="green-word">GREEN</span> squares to get points.</span>
      <span class="instruction-text"><span class="red-word">RED</span> squares take away points.</span>
      <span class="instruction-text">You have 60 seconds to play, but clearing levels adds extra time.</span>
      <span class="instruction-text">Each of the 5 levels adds extra challenges to the game.</span>
      <span class="title">Good Luck!</span>
      <div id="replay-button">START THE GAME!</div>
    </div>
  `;
  gameArea.appendChild(instructionsElement);
  document.querySelector("#replay-button").addEventListener("click", function() {
    // gameArea.innerHTML = "";
    instructionsElement.remove();
    init();
  
  });
  // setTimeout(function() {
  //   document.querySelector("#replay-button").remove();
  // }, 1000);
}

function playAgain() {
  let gameOverElements = document.querySelectorAll(".game-over-text");
  gameOverElements[0].remove();
  gameOverElements[1].remove();
  document.querySelector("#replay-button").remove();
  let oldTargets = document.querySelectorAll(".target");
  oldTargets.forEach (function(el) {
    el.remove();
  })
  init();
}

document.addEventListener('keydown', function(ev) {
  let newPos;
  if (ev.key == "ArrowLeft") {
    newPos = playerPosition - levels[level].playerSpeed;
    (newPos > 15) 
      ? (playerPosition = newPos, player.style.left = playerPosition + "px")
      : (playerPosition = 15, player.style.left = "15px") 
     
    
  }
  if (ev.key == "ArrowRight") {
    newPos = playerPosition + levels[level].playerSpeed;
    let maxRight = document.getElementById("game-area").getBoundingClientRect().width - levels[level].paddleWidth - 15;
    if (newPos < maxRight) {
      playerPosition = newPos;
      player.style.left = playerPosition + "px";
    } else {
      playerPosition = maxRight;
      player.style.left = playerPosition + "px";
    }
  }
});

window.onresize = resize; // make sure paddle doesn't go off-screen if window is resized
function resize() {
  let maxWidth = gameArea.getBoundingClientRect().width - levels[level].paddleWidth;
  if (playerPosition > maxWidth) {
    console.log("resize");
    playerPosition = maxWidth - 15;  // 15 is a small padding from the edge of the window
    player.style.left = playerPosition + "px";
  }
}

// list.addEventListener('click', function(ev) {  
//     console.log("clicked on " + ev.target.tagName);
//   if (ev.target.tagName === 'LI') {
//      ev.target.classList.toggle('done'); 
//      stopGame();
//   }
// }, false);

initHighScores();
showInstructions();
// init();

