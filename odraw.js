var mouseDown = false;
var ctx;
var lines = [];
var userLines = [];
var undoLines = [];
var moveNum = 0;
var color = {
  r: 255, g: 255, b: 255
}
var lineWidth = 5;
var mousePos = {
  x: 0,
  y: 0,
  lastX: 0,
  lastY: 0
};

function createCanvas() {
  var canvas = $("<canvas></canvas>");
  canvas.attr("width", $(window).width());
  canvas.attr("height", $(window).height());
  canvas.attr("id", "canvas");
  $("body").append(canvas);
  ctx = canvas[0].getContext("2d");
}

$(document).ready(() => {
  createCanvas();
  setInterval(tick, 1);
});

function tick() {
  clear();
  drawLines();
  if (mouseDown) {
    var line = {
      x1: mousePos.x,
      y1: mousePos.y,
      x2: mousePos.lastX,
      y2: mousePos.lastY,
      moveNum,
      style: {
        color,
        lineWidth
      }
    }
    makeLine(line);
  }
}

function undo() {
  if (moveNum == 0) return;
  let lastMove = [];
  for (let line of userLines) {
    if (line.moveNum == moveNum-1) {
      lastMove.push(line);
    }
  }

  undoLines = undoLines.concat(lastMove);
  lines = subtractArray(lines, lastMove);
  userLines = subtractArray(userLines, lastMove);
  moveNum--;
}

function redo() {
  if (undoLines.length == 0) return;
  var oldMoveNum = undoLines[undoLines.length-1].moveNum;
  var undidMove = [];
  for (let line of undoLines) {
    if (line.moveNum == oldMoveNum) {
      undidMove.push(line);
    }
  }

  undoLines = subtractArray(undoLines, undidMove);

  var newMove = undidMove.map((line) => {
    let newLine = line;
    newLine.moveNum = moveNum;
    return newLine
  });
  moveNum++;
  lines = lines.concat(newMove);
  userLines = userLines.concat(newMove);
}

function clear() {
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, $(window).width(), $(window).height());
}

function newcolor(col) {
  return `rgb(${col.r}, ${col.g}, ${col.b})`;
}

function drawLines() {
  ctx.beginPath();
  for (let line of lines) {
    ctx.strokeStyle = newcolor(line.style.color);
    ctx.lineWidth = line.style.lineWidth;
    ctx.lineCap = "round";

    ctx.moveTo(line.x1, line.y1);
    ctx.lineTo(line.x2, line.y2);
  }
  ctx.stroke();
}

function subtractArray(obj1, obj2) {
  let obj = [];
  for (let line of obj1) {
    let isInList = obj2.indexOf(line) == -1;
    if (isInList) {
      obj.push(line);
    }
  };
  return obj;
}

function makeLine(line) {
  lines.push(line);
  userLines.push(line);
}

$(document).mousedown((event) => {
  if ($(event.target).attr('id') != "canvas") return;
  mouseDown = true;
});

$(document).mouseup((event) => {
  if ($(event.target).attr('id') != "canvas") return;
  mouseDown = false;
  moveNum++;
});

$(document).mousemove(function (event) {
  var lastX = mousePos.x;
  var lastY = mousePos.y;
  mousePos = {
    x: event.pageX,
    y: event.pageY,
    lastX, lastY
  };
});

$(document).keydown((event) => {
  var char = String.fromCharCode(event.keyCode);
  if (char == "Z" && event.ctrlKey) {
    undo();
  }
  if (char == "Y" && event.ctrlKey) {
    redo();
  }
});
