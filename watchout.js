// start slingin' some d3 here.

var gameObject = {
  height  : 450 ,
  width   : 700,
  nEnemies: 30,
  padding : 5,
  deathTimer: 0
};

var gameStats = {
  score     :  0,
  bestScore : 0,
  collisions: 0
};

var axes = {
  x: d3.scale.linear().domain([0, 100]).range([0, gameObject.width]),
  y: d3.scale.linear().domain([0, 100]).range([0, gameObject.height])
};

var axesReverse = {
  x: d3.scale.linear().domain([0, gameObject.width]).range([0, 100]),
  y: d3.scale.linear().domain([0, gameObject.height]).range([0, 100])
};


var gameBoard = d3.select('.container').append('svg')
                  .attr('width', gameObject.width + "px")
                  .attr('height', gameObject.height + "px")
                  .style('border', '1px solid black')
                  .style('background-color', '#777777');

var enemyPositions = [];
//constructor enemies from gameObject
var createEnemies = function() {
  var enemies = [];
  for(var i=0; i < gameObject.nEnemies; i++){
    var posEnemy = {
          x : Math.random()*(100-gameObject.padding*2) + gameObject.padding,
          y : Math.random()*(100-gameObject.padding*2) + gameObject.padding
    };
    enemies.push(posEnemy);
  }
  enemyPositions = enemies;
  return enemies;
};

gameBoard.selectAll('.enemy').data(createEnemies(gameObject.nEnemies))
                        .enter().append('circle')
                        .attr('class', 'enemy')
                        .style('opacity', 0)
                        .style('fill', '#4444cc')
                        .attr('cx', function(d){
                          return axes.x(d.x) + "px";
                        })
                        .attr('cy', function(d){
                          return axes.y(d.y) + "px";
                        })
                        .attr('r', 10)
                        .transition().duration(1000)
                        .style('opacity', .6)

var player = {
  fill: 'red',
  x: 50,
  y: 50,
  r: 10
};

var dragstarted = function(d) {
  d3.event.sourceEvent.stopPropagation();
  d3.select(this).classed('dragging', true);
};

var dragged = function(d) {
  d3.select(this).attr('cx', d.x = Math.max(axes.x(gameObject.padding), Math.min(gameObject.width-axes.x(gameObject.padding), d3.event.x)))
                .attr('cy', d.y = Math.max(axes.y(gameObject.padding), Math.min(gameObject.height-axes.y(gameObject.padding), d3.event.y)));
};

var dragended = function(d) {
  d3.select(this).classed('dragging', false);
};

var drag = d3.behavior.drag()
                      .origin(function(d) { return d; })
                      //.on('dragstart', dragstarted)
                      .on('drag', dragged)
                      //.on('dragend', dragended);


gameBoard.selectAll('.pacman').data([player])
  .enter().append('circle')
    .attr('class', 'pacman')
    .attr('cx', function(d) { return axes.x(d.x) + 'px'; })
    .attr('cy', function(d) { return axes.y(d.y) + 'px'; })
    .attr('r', function(d) { return d.r; })
    .attr('fill', '#faf703')
    .call(drag);

var collisionCheck = function() {
  var pacmanX = parseFloat(gameBoard.select('.pacman').attr('cx'));
  var pacmanY = parseFloat(gameBoard.select('.pacman').attr('cy'));
  var enemies = gameBoard.selectAll('.enemy');
  var collides = false;
  enemies.each(function(enemy) {
    var enemy = d3.select(this);
    var distance = Math.sqrt(
                          Math.pow((parseFloat(enemy.attr('cy')) - pacmanY), 2)
                          +
                          Math.pow((parseFloat(enemy.attr('cx')) - pacmanX), 2)
                          );
    if(distance < (player.r * 2)){
      collides = true;
    }
  })
  return collides;
};

// update enemies on board
var update = function() {
  gameBoard.selectAll('.enemy').data(createEnemies(gameObject.nEnemies))
                        .transition().duration(1000)
                        .attr('cx', function(d){
                          return axes.x(d.x) + "px";
                        })
                        .attr('cy', function(d){
                          return axes.y(d.y) + "px";
                        });
};
var updateStats = function() {
  d3.select('.collision-count').text(''+gameStats.collisions);
};

var updateScore = function() {
  d3.select('.score').text(''+gameStats.score);
};

var highScore = function() {
  if(gameStats.score >= gameStats.bestScore){
    gameStats.bestScore = gameStats.score;
    d3.select('.bestScore').text(''+gameStats.bestScore);
  }
};


setInterval(function() {
  update();
}, 2000);

setInterval(function() {
  //console.log(collisionCheck());
  //console.log(gameStats.collisions);
  if(gameObject.deathTimer < 0)
    gameStats.score++;
  if(collisionCheck() && gameObject.deathTimer < 0){
    highScore();
    gameStats.score = 0;
    gameStats.collisions++;
    gameObject.deathTimer = 20;
  }
  gameObject.deathTimer--;
  updateScore();
  updateStats();
}, 50);

