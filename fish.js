var boids = require('boids')

module.exports = createSchool

function createSchool(count) {

  var flock = boids({
    boids: count || 50,              // The amount of boids to use
    speedLimit: 2,          // Max steps to take per tick
    accelerationLimit: .5,   // Max acceleration per tick
    separationDistance: 10, // Radius at which boids avoid others
    alignmentDistance: 180, // Radius at which boids align with others
    choesionDistance: 10,  // Radius at which boids approach others
    separationForce: 0.50,  // Speed to avoid at
    alignmentForce: 0.25,   // Speed to align with other boids
    choesionForce: 0.1,     // Speed to move towards other boids
    attractors: []
  })

  return flock

}
