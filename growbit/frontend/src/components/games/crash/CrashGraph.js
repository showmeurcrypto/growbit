function style(theme, width) {
  function combineTheme(obj) {
    if (typeof obj[theme] === "string") {
      return obj[theme];
    } else {
      return Object.assign({}, obj.base, obj[theme]);
    }
  }

  function combineState(obj) {
    var states = {
      playing: [],
      cashed: [],
      lost: [],
      starting: [],
      startingBetting: ["starting", "playing"],
      progress: [],
      progressPlaying: ["progress", "playing"],
      progressCashed: ["progress", "cashed"],
      ended: [],
      endedCashed: ["ended", "cashed"],
      connecting: [],
    };
    var ret = {};
    Object.keys(states).forEach(function (state) {
      var sups = states[state];
      var res = Object.assign({}, obj.base || {});
      sups.forEach(function (sup) {
        Object.assign(res, obj[sup] || {});
      });
      Object.assign(res, obj[state]);
      ret[state] = res;
    });
    return ret;
  }

  function fontSizeNum(times) {
    return (times * width) / 100;
  }

  function fontSizePx(times) {
    var fontSize = fontSizeNum(times);
    return fontSize.toFixed(2) + "px";
  }
  var fillStyle = combineTheme({
    white: "black",
    black: "white",
  });
  return {
    fontSizeNum: fontSizeNum,
    fontSizePx: fontSizePx,
    axis: {
      lineWidth: 1,
      font: "16px Excon",
      textAlign: "center",
      strokeStyle: "white",
      fillStyle: fillStyle,
    },
    data: combineState({
      base: {
        textAlign: "center",
        textBaseline: "middle",
      },
      starting: {
        font: fontSizePx(5) + " Excon",
        fillStyle: "white",
      },
      progress: {
        font: fontSizePx(20) + " Excon",
        fillStyle: "#FFFFFF",
      },
      ended: {
        font: fontSizePx(15) + " Excon",
        fillStyle: "#FFFFFF",
      },
      connecting: {
        font: fontSizePx(10) + " Excon",
        fillStyle: "#9370db",
      },
    }),
    graph: combineState({
      base: {
        strokeStyle: "grey",
      },
      progress: {
        strokeStyle: "#FFFFFF",
      },
      ended: {
        strokeStyle: "#f11f5e",
      },
    }),
  };
}
let Engine = {
  gameState: "IN_PROGRESS", // either: STARTING, IN_PROGRESS,  ENDED, CONECTING
  gameCrash: 0,
  graphPayout: 1,
  visualMode: "chart",
};

var XTICK_LABEL_OFFSET = 20;
var XTICK_MARK_LENGTH = -4;
var YTICK_LABEL_OFFSET = 11;
var YTICK_MARK_LENGTH = -4;

function getEmHeight(font) {
  var sp = document.createElement("span");
  sp.style.font = font;
  sp.style.display = "inline";
  sp.textContent = "Hello world!";
  document.body.appendChild(sp);
  var emHeight = sp.offsetHeight;
  document.body.removeChild(sp);
  return emHeight;
}

function tickSeparation(s) {
  if (!Number.isFinite(s)) {
    throw new Error("Is not a number: ", s);
  }
  var r = 1;
  while (true) {
    if (r > s) {
      return r;
    }
    r *= 2;
    if (r > s) {
      return r;
    }
    r *= 5;
  }
}

function Graph() {
  this.canvas = null;
  this.ctx = null;
  this.animRequest = null;
  this.renderBound = this.render.bind(this);
}

Graph.prototype.startRendering = function (canvasNode, config) {
  console.assert(!this.canvas && !this.ctx);
  if (!canvasNode.getContext) {
    return console.error("No canvas");
  }
  this.ctx = canvasNode.getContext("2d");
  this.canvas = canvasNode;
  this.configPlotSettings(config, true);
  this.animRequest = window.requestAnimationFrame(this.renderBound);
};

Graph.prototype.stopRendering = function () {
  window.cancelAnimationFrame(this.animRequest);
  this.canvas = this.ctx = null;
};

Graph.prototype.configPlotSettings = function (config, forceUpdate) {
  var devicePixelRatio = window.devicePixelRatio || 1;
  var backingStoreRatio =
    this.ctx.webkitBackingStorePixelRatio ||
    this.ctx.mozBackingStorePixelRatio ||
    this.ctx.msBackingStorePixelRatio ||
    this.ctx.oBackingStorePixelRatio ||
    this.ctx.backingStorePixelRatio ||
    1;
  var ratio = devicePixelRatio / backingStoreRatio;
  if (
    this.canvasWidth !== config.width ||
    this.canvasHeight !== config.height ||
    this.devicePixelRatio !== devicePixelRatio ||
    this.backingStoreRatio !== backingStoreRatio ||
    forceUpdate
  ) {
    this.canvasWidth = config.width;
    this.canvasHeight = config.height;
    this.devicePixelRatio = devicePixelRatio;
    this.backingStoreRatio = backingStoreRatio;
    //this.canvas.style.width = config.width + "px";
    //this.canvas.style.height = config.height + "px";
    this.canvas.width = config.width * ratio;
    this.canvas.height = config.height * ratio;
  }
  this.ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  this.style = style(null, config.width);
  this.xMinTickSeparation = 2 * this.ctx.measureText("10000").width;
  this.yMinTickSeparation =
    getEmHeight(this.style.axis.font) *
      (config.controlsSize === "small" ? 1.75 : 4) +
    25;
  this.xStart = 30;
  this.yStart = 20;
  this.plotWidth = this.canvasWidth - this.xStart;
  this.plotHeight = this.canvasHeight - this.yStart;
  this.XDA = 800;
  this.YDA = 725;
};

Graph.prototype.calculatePlotValues = function () {
  this.growth = calcGrowthFromMulti(Engine.multi);
  this.XBEG = 1;
  this.YBEG = Math.max(this.XDA, this.growth);
  this.YPayoutBeg = 100;
  this.YPayoutEnd = Math.max(this.YDA, 100 * Engine.multi);
  this.XScale = this.plotWidth / (this.YBEG - this.XBEG);
  this.YScale = this.plotHeight / (this.YPayoutEnd - this.YPayoutBeg);

  Engine.graphPayout = 100 * Engine.multi;
};

Graph.prototype.trX = function (t) {
  return this.XScale * (t - this.XBEG);
};

Graph.prototype.trY = function (p) {
  return -(this.YScale * (p - this.YPayoutBeg));
};

Graph.prototype.render = function () {
  this.calculatePlotValues();
  this.clean();
  this.ctx.save();
  this.ctx.translate(this.xStart, this.canvasHeight - this.yStart);
  this.drawAxes();
  this.drawGraph();
  this.ctx.restore();
  this.drawGameData();
  this.animRequest = window.requestAnimationFrame(this.renderBound);
};

Graph.prototype.clean = function () {
  this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
};

Graph.prototype.drawGraph = function () {
  var style = this.style.graph;
  var ctx = this.ctx;

  if (Engine.gameState == "IN_PROGRESS") {
    Object.assign(ctx, style.progress);
  } else {
    Object.assign(ctx, style.ended);
  }

  var step = Math.floor(38 / this.XScale);

  ctx.lineWidth = 3;

  ctx.strokeStyle = "white";

  ctx.beginPath();

  for (var t = this.XBEG; t < this.growth; t += step) {
    var x = this.trX(t);
    var y = this.trY(100 * calcGamePayout(t));

    ctx.lineTo(x, y);
  }
  ctx.stroke();

  ctx.save();

  const x0 = this.trX(this.XBEG);
  const y0 = this.trY(100 * calcGamePayout(this.XBEG));

  if (Engine.gameState === "IN_PROGRESS") {
    this.ctx.fillStyle = "#5B46BC";
  } else {
    this.ctx.fillStyle = "#f11f5e";
  }

  ctx.lineTo(x, y0);
  ctx.lineTo(x0, y0);

  this.ctx.fill();

  ctx.restore();

  const _x0 = this.trX(t - step * 3);
  const _y0 = this.trY(100 * calcGamePayout(t - step * 3));
  var angle = Math.atan2(_y0 - y, _x0 - x);

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle + 0.5 * Math.PI);
  if (Engine.gameState === "IN_PROGRESS" || Engine.gameState === "ENDED") {
    ctx.beginPath();
    ctx.arc(0, 0, 13, 0, 2 * Math.PI);
    ctx.fill();
  }

  ctx.restore();
};

Graph.prototype.drawAxes = function () {
  var ctx = this.ctx;
  Object.assign(ctx, this.style.axis);

  var payoutSeparation = tickSeparation(this.yMinTickSeparation / this.YScale);
  var timeSeparation = tickSeparation(this.xMinTickSeparation / this.XScale);

  var x, y, payout, time;
  ctx.beginPath();

  payout = this.YPayoutBeg + payoutSeparation;
  for (; payout < this.YPayoutEnd; payout += payoutSeparation) {
    y = this.trY(payout);
    ctx.moveTo(0, y);
    ctx.lineTo(XTICK_MARK_LENGTH, y);
  }

  time = timeSeparation;
  for (; time < this.YBEG; time += timeSeparation) {
    x = this.trX(time);
    ctx.moveTo(x, 0);
    ctx.lineTo(x, -YTICK_MARK_LENGTH);
  }

  ctx.stroke();

  payout = this.YPayoutBeg + payoutSeparation;
  for (; payout < this.YPayoutEnd; payout += payoutSeparation) {
    y = this.trY(payout);
    ctx.fillText(payout / 100 + "x", -XTICK_LABEL_OFFSET, y);
  }

  time = 0;
  for (; time < this.YBEG; time += timeSeparation) {
    x = this.trX(time);
    ctx.fillText(time / 1000 + "s", x, YTICK_LABEL_OFFSET);
  }
};

Graph.prototype.drawGameData = function () {
  var style = this.style.data;
  var ctx = this.ctx;

  if (Engine.gameState === "STARTING") {
    Object.assign(ctx, style.starting);
  } else if (Engine.gameState === "IN_PROGRESS") {
    Object.assign(ctx, style.progress);
  } else if (Engine.gameState === "ENDED") {
    Object.assign(ctx, style.ended);
  }
};

function calcGamePayout(m) {
  return Math.pow(Math.E, 0.00006 * m);
}

function calcGrowthFromMulti(multi) {
  return Math.log(multi) / Math.log(Math.E) / 0.00006;
}

module.exports = {
  Engine,
  Graph,
};
