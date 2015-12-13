var fc = require('fc')
var vec2 = require('vec2')
var center = require('ctx-translate-center')



function drawBoat(ctx, boat) {
  ctx.save()
    ctx.translate(boat.center.x, boat.center.y)
    ctx.rotate(boat.rotation)

    ctx.save()
      ctx.scale(.25, .25)
      ctx.drawImage(boat.img, -(boat.img.width/2)|0, -(boat.img.height/2)|0)
    ctx.restore()

    ctx.save()
      if (boat.paddles[0]) {
        ctx.rotate(.5)
      }
      ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.lineTo(0, 50)
        ctx.lineTo(10, 100)
        ctx.arcTo(10, 150, -20, 100, 10)
        ctx.lineTo(-10, 100)
        ctx.lineTo(0, 50)
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
      ctx.stroke()
      ctx.fill()
    ctx.restore()

    // ctx.fillStyle = "brown"
    // ctx.fillRect(-25, -10, 50, 20)
  ctx.restore();
}


var waterDrag = .899;
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

var ctx = fc(function tick() {
  ctx.clear('hsl(216, 73%, 65%)')
  ctx.save()
    center(ctx)
    ctx.scale(.5, .5)
    drawBoat(ctx, boat)

    boat.center.add(boat.velocity)
    boat.velocity.multiply(waterDrag)

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
      boat.rotation -= impulseRotation;
      boat.velocity.rotate(-impulseRotation).add(impulse.rotate(impulseRotation, true))

    // right shift
    } else if (ev.location === 2) {
      boat.paddles[1] = 0
      boat.rotation += impulseRotation;
      boat.velocity.rotate(impulseRotation).add(impulse.rotate(-impulseRotation, true))
    }
    ctx.dirty()
  }
})
