var fc = require('fc')
var vec2 = require('vec2')
var center = require('ctx-translate-center')
var circle = require('ctx-circle')

var bubbles = [] 
for (var i = 0; i < 100; i++) {
  bubbles.push( bubble(Math.random()*5000-2500,Math.random()*5000-2500) )
}
var secondaryBubbles = []

function lerp(a,b,f){
  return( (b*f)+(a-(a*f)) )
}
function degreeToRadian(x){
  return( x*(Math.PI/180) )
}
function bubble(x,y){
  return{
    x:x,
    y:y,
    created: Date.now()+ Math.random()*3000,
    expire: 2500+Math.random()*2500,
    render:function(ctx){
      if(Date.now()<this.created){return}//not created yet
      var fraction = (Date.now()-this.created) / this.expire
      if(fraction>=1){//if dead
          //add surface bubbles:
            for (var i = 0; i < 5; i++) {
              secondaryBubbles.push(surfaceBubble(this.x,this.y))
            };
          this.x=Math.random()*5000-2500
          this.y=Math.random()*5000-2500
          this.created= Date.now()+ Math.random()*3000
          this.expire= 2500+Math.random()*250
          return;
      }
      ctx.beginPath()
      circle(ctx, this.x, this.y,  lerp(2,5,fraction) );
      //ctx.arc(x,y,10,0,2*Math.PI);
      ctx.closePath()      
      ctx.fillStyle = "hsla(200,"+lerp(100,10+(Math.random()*70),fraction)+"%,"+lerp(10+(Math.random()*10),100,fraction)+"%,0.5)";
      ctx.strokeStyle = "hsla(200,"+lerp(100,80,fraction)+"%,"+lerp(10,100,fraction)+"%,0.8)";
      ctx.fill();
      ctx.stroke();
    }
  }
}
function surfaceBubble(x,y){
  return{
    x:x,
    y:y,
    v:Math.random(),
    r:Math.random()*360,
    created: Date.now()+ Math.random()*150,
    expire: 2500+Math.random()*150,
    render:function(ctx){
      if(Date.now()<this.created){return}//not created yet
      var fraction = (Date.now()-this.created) / this.expire
      if(fraction>=1){//if dead
          //TODO: remove from array
          var index = secondaryBubbles.indexOf(this)
          secondaryBubbles.splice(index, 1)
          return;
      }

      //update coordinates
      this.x = this.x+(Math.cos(degreeToRadian(this.r))*this.v)
      this.y = this.y+(Math.sin(degreeToRadian(this.r))*this.v)
      ctx.beginPath()
      circle(ctx, this.x, this.y,  lerp(2,1,fraction) );
      //ctx.arc(x,y,10,0,2*Math.PI);
      ctx.closePath()      
      ctx.fillStyle = "hsla(200,"+lerp(100,50,fraction)+"%,"+lerp(100,80,fraction)+"%,0.5)";
      ctx.strokeStyle = "hsla(200,"+lerp(100,80,fraction)+"%,"+lerp(100,70,fraction)+"%,0.8)";
      ctx.fill();
      ctx.stroke();
    }
  }
}
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
      ctx.fillStyle = "hsl(200,0%,0%)";
      ctx.arc(x, y, 50, 0, 2*Math.PI, false)
    //ctx.stroke()
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
  ctx.clear('hsl(216, 73%, 30%)')
  ctx.save()
    center(ctx)
    ctx.scale(.25, .25)
    //bubbles! (RH2 testing)
    for (var i = 0; i < bubbles.length; i++) {
      bubbles[i].render(ctx)
    };
    for (var i = 0; i < secondaryBubbles.length; i++) {
      secondaryBubbles[i].render(ctx)
    };

    drawVortex(vortex.x, vortex.y)
    drawBoat(ctx, boat)

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
