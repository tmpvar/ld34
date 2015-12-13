var fc = require('fc')
var vec2 = require('vec2')
var center = require('ctx-translate-center')

function drawBoat(ctx, boat) {
  ctx.save()
    ctx.translate(boat.center.x, boat.center.y)
    ctx.rotate(boat.rotation)
    ctx.fillStyle = "brown"
    ctx.fillRect(-25, -10, 50, 20)
  ctx.restore();
}


var waterDrag = .988;
var boat = {
  center: vec2(0, 0),
  rotation: 0,
  velocity: vec2(0, 0)
}
var impulse = vec2(5.0, 0.0)
var impulseRotation = Math.PI/10

var ctx = fc(function tick() {
  console.log('render', boat.rotation)
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
      boat.rotation -= impulseRotation;
      boat.velocity.rotate(-impulseRotation).add(impulse.rotate(impulseRotation, true))
      // v.multiply(.5)
    // right shift
    } else if (ev.location === 2) {
      boat.rotation += impulseRotation;
      boat.velocity.rotate(impulseRotation).add(impulse.rotate(-impulseRotation, true))
    }
    ctx.dirty()
  }
  console.log(ev)
})
