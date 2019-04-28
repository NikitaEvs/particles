/* Canvas settings */
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let width = window.innerWidth;
let height = window.innerHeight;
canvas.width = width;
canvas.height = height;

/* World settings */
var particles = [];
var spawners = [];
var fields = [];
const MAX_PARTICLES = 20000;
const PARTICLES_PER_FRAME = 30;

/* Util class for speed, acceleration etc */
function Vector(x, y) {
    this.x = x || 0;
    this.y = y || 0;

    this.plus = function (newVec) {
        this.x += newVec.x;
        this.y += newVec.y;
    };

    this.minus = function (newVec) {
        this.x -= newVec.x;
        this.y -= newVec.y;
    };

    this.returnPlus = function (newVec) {
        return new Vector(this.x + newVec.x, this.y + newVec.y);
    };

    this.returnMinus = function (newVec) {
        return new Vector(this.x - newVec.x, this.y - newVec.y)
    };

    this.getLength = function () {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
    };

    this.getAngle = function () {
        return Math.atan(this.y/this.x);
    };

    this.init = function (x, y) {
        this.x = x;
        this.y = y;
    };

    this.initWithAngle = function (angle, length) {
        this.x = length*Math.cos(angle);
        this.y = length*Math.sin(angle);
    };

    this.initNewWithAngle = function (angle, lenght) {
        return new Vector(length*Math.cos(angle), length*Math.sin(angle));
    }
}

function Particle(pos, vel, acel, color) {
    this.pos = pos || new Vector();
    this.vel = vel || new Vector();
    this.acel = acel || new Vector();
    this.color = color || "rgb(0,0,255)";

    this.init = function (pos, vel, acel, color) {
        this.pos = pos;
        this.vel = vel;
        this.acel = acel;
        this.color = color || "rgb(0,0,255)";
    };

    this.move = function () {
        this.vel.plus(this.acel);
        this.pos.plus(this.vel);
    };

    this.acceleration = function () {
        let acelX = 0;
        let acelY = 0;

        for (let i = 0; i < fields.length; i++) {
            let distance = fields[i].pos.returnMinus(this.pos);
            acelX += distance.x * fields[i].mass / Math.pow(distance.getLength(), 2);
            acelY += distance.y * fields[i].mass / Math.pow(distance.getLength(), 2);
        }

        this.acel = new Vector(acelX, acelY);
    };
}

function Spawner(pos, vel, threshold, color) {
    this.pos = pos || new Vector();
    this.vel = vel || new Vector();
    this.threshold = threshold || 0;
    this.color = color || "#999";

    this.init = function (pos, vel, threshold) {
        this.pos = pos;
        this.vel = vel;
        this.threshold = threshold;
    };

    this.spawn = function () {
        let newVel = new Vector();
        let angle = this.vel.getAngle() + this.threshold - (this.threshold * 2 * Math.random());
        newVel.initWithAngle(angle, this.vel.getLength());
        return new Particle(new Vector(this.pos.x, this.pos.y), newVel, new Vector(), this.color);
    }
}

function Field(pos, mass) {
    this.pos = pos || new Vector();

    this.setMass = function (mass) {
        if(mass < 0) {
            this.color = "#f00";
        } else {
            this.color = "#0f0";
        }
        this.mass = mass;
    }

    this.setMass(mass);
}

/* Generate world */
function init() {
    let vel = new Vector(), vel2 = new Vector();
    vel.initWithAngle(0, 2);
    vel2.initWithAngle(14.3, 2);
    spawners.push(new Spawner(new Vector(width/2, height/2), vel, Math.PI/4, "#0ff"));
    //spawners.push(new Spawner(new Vector(700, 500), vel2, Math.PI/4, "#00f"));
}

function spawnNewParticles() {
    if (particles.length < MAX_PARTICLES) {
        for (let i = 0; i < spawners.length; i++) {
            for (let j = 0; j < PARTICLES_PER_FRAME; j++) {
                particles.push(spawners[i].spawn());
            }
        }
    }
}

function moveParticles(maxX, maxY) {
    let currentParticles = [];
    for (let i = 0; i < particles.length; i++) {
        if (particles[i].pos.x > 0 && particles[i].pos.y > 0 && particles[i].pos.x < maxX && particles[i].pos.y < maxY) {
            particles[i].acceleration();
            particles[i].move();
            currentParticles.push(particles[i]);
        }
    }
    particles = currentParticles;
}

function drawParticles() {
    let particleSize = 1;

    for(let i = 0; i < particles.length; i++) {
        ctx.fillStyle = particles[i].color;
        ctx.fillRect(particles[i].pos.x, particles[i].pos.y, particleSize, particleSize);
    }
}

/* Animation */
function render() {
    clear();
    update();
    draw();
    queue();
}

/* Clear canvas */
function clear() {
    ctx.clearRect(0,0, width, height);
}

/* Update canvas */
function update() {
    spawnNewParticles();
    moveParticles(width, height);
}

/* Draw elements */
function draw() {
    drawParticles();
    spawners.forEach(drawCircle);
    fields.forEach(drawCircle);
}

function drawCircle(element) {
    ctx.fillStyle = element.color;
    ctx.beginPath();
    ctx.arc(element.pos.x, element.pos.y, 5, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
}

function queue() {
    window.requestAnimationFrame(render);
}

function handler(e) {
    console.log(e.screenX);
    console.log(e.screenY);
    let field = new Field(new Vector(e.screenX - 69, e.screenY - 99), -5);
    fields = [field];
}

canvas.addEventListener("mousemove", handler);

init();
render();