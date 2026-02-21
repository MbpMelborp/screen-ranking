/**
 * Fondo de dots subiendo (gente entrando) — p5.js instance mode
 * Requiere: p5.js cargado y elemento #attendees-dots-bg en el DOM
 */
(function () {
  function initAttendeesDots() {
    var el = document.getElementById("attendees-dots-bg");
    if (!el || typeof p5 === "undefined") return;
    var w = el.offsetWidth;
    var h = el.offsetHeight;
    if (w < 10 || h < 10) {
      setTimeout(initAttendeesDots, 200);
      return;
    }
    new p5(function (p) {
      var dots = [];
      var maxDots = 100;
      var spawnY = 0;
      var speed = 1.2;
      var spreadOut = 1.4;
      var dotSize = 9.5;
      var doorWidth = 0.08;

      p.setup = function () {
        var cw = el.offsetWidth || w;
        var ch = el.offsetHeight || h;
        var cnv = p.createCanvas(cw, ch);
        cnv.position(0, 0);
        cnv.style("position", "absolute");
        cnv.style("left", "0");
        cnv.style("top", "0");
        cnv.style("z-index", "0");
        spawnY = ch + 10;
        var centerX = cw * 0.5;
        var door = cw * doorWidth;
        for (var i = 0; i < maxDots * 0.5; i++) {
          dots.push({
            x: centerX + p.random(-door, door),
            y: ch - p.random(0, ch * 0.6),
            vx: p.random(-0.2, 0.2),
            vy: -speed - p.random(0.5),
          });
        }
      };

      p.draw = function () {
        p.clear();
        var cw = p.width;
        var ch = p.height;
        var centerX = cw * 0.5;
        var door = cw * doorWidth;
        if (dots.length < maxDots && p.frameCount % 3 === 0) {
          dots.push({
            x: centerX + p.random(-door, door),
            y: spawnY,
            vx: p.random(-0.2, 0.2),
            vy: -speed - p.random(0.5),
          });
        }
        p.noStroke();
        p.fill(255, 255, 255, 140);
        for (var i = dots.length - 1; i >= 0; i--) {
          var d = dots[i];
          d.x += d.vx;
          d.y += d.vy;
          var distFromCenter = (d.x - centerX) / cw;
          d.vx += distFromCenter * 0.04 + p.random(-0.035, 0.035);
          d.vx = p.constrain(d.vx, -spreadOut, spreadOut);
          if (d.y < -10) dots.splice(i, 1);
          else p.circle(d.x, d.y, dotSize);
        }
      };

      p.windowResized = function () {
        var nw = el.offsetWidth;
        var nh = el.offsetHeight;
        if (nw && nh) {
          p.resizeCanvas(nw, nh);
          spawnY = nh + 10;
        }
      };
    }, "attendees-dots-bg");
  }

  function runWhenReady() {
    if (document.readyState !== "complete") {
      window.addEventListener("load", function () {
        setTimeout(initAttendeesDots, 500);
      });
      return;
    }
    setTimeout(initAttendeesDots, 600);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", runWhenReady);
  } else {
    runWhenReady();
  }
})();
