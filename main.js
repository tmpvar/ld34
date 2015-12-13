var fc = require('fc')
var vec2 = require('vec2')
var center = require('ctx-translate-center')
var createFishSchool = require('./fish.js')
function drawBoat(ctx, boat) {
  ctx.save()
    ctx.translate(boat.center.x, boat.center.y)
    ctx.rotate(boat.rotation)

    ctx.save()
      ctx.scale(.65, .65)
      ctx.drawImage(boat.img, -(boat.img.width/2)|0, -(boat.img.height/2)|0)
    ctx.restore()

    ctx.save()
      if (boat.paddles[0]) {
        ctx.rotate(-Math.PI/4)
      }
      ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.lineTo(0, 50)
        ctx.lineTo(10, 100)
        ctx.arcTo(10, 150, -20, 100, 10)
        ctx.lineTo(-10, 100)
        ctx.lineTo(0, 50)
      ctx.fillStyle = boat.paddles[0] ? 'hsl(216, 73%, 40%)' : 'hsl(24, 60%, 41%)'
      ctx.strokeStyle = boat.paddles[0] ? 'hsl(216, 73%, 40%)' : 'hsl(24, 60%, 41%)'
      ctx.fill()
      ctx.stroke()
    ctx.restore()

    ctx.save()
      if (boat.paddles[1]) {
        ctx.rotate(.5)
      }
      ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.lineTo(0, -50)
        ctx.lineTo(10, -100)
        ctx.arcTo(10, -150, -20, -100, 10)
        ctx.lineTo(-10, -100)
        ctx.lineTo(0, -50)
      ctx.fillStyle = boat.paddles[1] ? 'hsl(216, 73%, 40%)' : 'hsl(24, 60%, 41%)'
      ctx.strokeStyle = boat.paddles[1] ? 'hsl(216, 73%, 40%)' : 'hsl(24, 60%, 41%)'
      ctx.stroke()
      ctx.fill()
    ctx.restore()

  ctx.restore();
}

function drawVortex (x, y) {
  ctx.save()
    ctx.beginPath()
      ctx.arc(x, y, 50, 0, 2*Math.PI, false)
    ctx.stroke()
    ctx.fill()
  ctx.restore()
}

var waterDrag = .98;
var boat = {
  center: vec2(0, 0),
  rotation: 0,
  velocity: vec2(0, 0),
  paddles: [0, 0],
  img: (function() {
    var img = new Image()
    img.src = '/img/canoe.png'
    return img
  })()
}
var impulse = vec2(5.0, 0.0)
var impulseRotation = Math.PI/10
var vortex = vec2(-500, 500)

var fish = createFishSchool(1000)

var ctx = fc(function tick() {
  ctx.clear('hsl(216, 73%, 65%)')
  ctx.save()
    center(ctx)
    ctx.scale(.25, .25)
    drawBoat(ctx, boat)
    drawVortex(vortex.x, vortex.y)

    boat.center.add(boat.velocity)

    var drag = waterDrag
    if (boat.paddles[0] && boat.paddles[1]) {
      drag -= .05
    }
    boat.velocity.multiply(drag)

    // calculate vortex force on boat
    var suck = boat.center.subtract(vortex, true)
    suck.normalize(false)
    suck.multiply(0.1)
    boat.velocity.subtract(suck)

    fish.tick()
    fish.attractors[0] = [boat.center.x, boat.center.y, 1000, -1]
    ctx.fillStyle = "hsl(224, 23%, 35%)"
    fish.boids.forEach(function(boid) {
      ctx.fillRect(boid[0], boid[1], 10, 10)
    })

  ctx.restore()
}, true)

window.addEventListener('keydown', function(ev) {
  if (ev.which === 16) {
    // left shift
    if (ev.location === 1) {
      boat.paddles[0] = 1

    // right shift
    } else if (ev.location === 2) {
      boat.paddles[1] = 1
    }
    ctx.dirty()
  }
})

window.addEventListener('keyup', function(ev) {
  if (ev.which === 16) {
    // left shift
    if (ev.location === 1) {
      boat.paddles[0] = 0
      var rimp = !boat.paddles[1] ? impulseRotation/2 : impulseRotation * 2;
      boat.rotation -= rimp
      boat.velocity.rotate(-rimp).add(impulse.rotate(rimp, true))

    // right shift
    } else if (ev.location === 2) {
      boat.paddles[1] = 0
      var rimp = !boat.paddles[0] ? impulseRotation/2 : impulseRotation * 2
      boat.rotation += rimp;
      boat.velocity.rotate(rimp).add(impulse.rotate(-rimp, true))
    }
    ctx.dirty()
  }
})
