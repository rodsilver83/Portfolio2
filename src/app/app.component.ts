import { Component, AfterViewInit } from '@angular/core';
import { compileNgModule } from '@angular/core/src/render3/jit/module';


const MAX_VEL = 0.5;
const MIN_VEL = 0.21;
const MAX_DISTANCE = 250;//px
const WINDOW_OFFSET = 50;//px
const CONST_VY = -0.4;
const MAX_CONST_VX = -0.0;
const DOT_COLOR = "#2A4F6E";
const START_GRADIENT = "#042037";
const END_GRADIENT = "#003A23";
const INIT_SIZE_DOT = 0;
const DOT_GROW_SIZE = 0;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements AfterViewInit {
  public canvas: any;
  public context: any;
  public particles = [];
  public dots: number;
  public CONST_VX = -0.0;
  public T = 0;

  ngAfterViewInit() {
    this.canvas = document.getElementById("canvas-element");
    this.resizeCanvas();
    this.context = this.canvas.getContext("2d");
    
    this.particles = [];
    this.dots = Math.floor(window.innerWidth/20);
        
    // if(window.innerWidth >= 992){
      this.initCanvas();
    // }
  }

  speedParticlesX() {
    this.T+=20;
    var ease = this.easeInOutQuad(this.T,0,1,2000);
    if(ease < 0) {
      // this.clearInterval(goAboutInterval);
      this.CONST_VX = 0;
    }else{
      this.CONST_VX = ease * MAX_CONST_VX;
    }
  }
  /**
   *
   * @param t current Time
   * @param b start Value
   * @param c change in value
   * @param d duration
   * @returns {*}
   */
  easeInOutQuad(t, b, c, d) {
    t /= d/2;
    if (t < 1) return c/2*t*t + b;
    t--;
    return -c/2 * (t*(t-2) - 1) + b;
  }

  easeInQuad(t, b, c, d) {
    t /= d;
    return c*t*t + b;
  }

  initCanvas() {
    for (var i = 0; i < this.dots; i++) {
      this.particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: this.randomVelX(i),
        vy: this.randomVelY(i),
        size: INIT_SIZE_DOT,
        color: DOT_COLOR,
        id: 0
      });
    }

    setInterval(() => {
      if(this.context) {
        this.context.clearRect(0, 0, window.innerWidth, window.innerHeight);
        this.fillCanvasGradient();
        for( let i = 0; i < this.particles.length; i++ ) {
          this.particles[i].size = INIT_SIZE_DOT;
          this.particles[i].id = i;
          this.moveParticles(i);
          this.calculateLines(i);
          this.drawDot(this.particles[i]);
        }
      }
    },20);
  }

  randomVelX(i){
    if( i % 4 == 0){
      return -Math.random()*MAX_VEL-MIN_VEL;
    }
    if( i % 4 == 1){
      return Math.random()*MAX_VEL+MIN_VEL;
    }
    return 0.0;
  }

  randomVelY(i){
    if( i % 4 == 2){
      return -Math.random()*MAX_VEL-MIN_VEL;
    }
    if( i % 4 == 3){
      return Math.random()*MAX_VEL+MIN_VEL;
    }
    return 0.0;
  }

  fillCanvasGradient(){
    // Create gradient
    let grd = this.context.createLinearGradient(0,0,0,window.innerHeight);
    grd.addColorStop(0,START_GRADIENT);
    grd.addColorStop(1,END_GRADIENT);

    // Fill with gradient
    this.context.fillStyle = grd;
    this.context.fillRect(0,0,window.innerWidth,window.innerHeight);
  }

  calculateLines(i){
    for(let j=i + 1; j < this.particles.length; j++){
      var distance = this.distanceBetweenDots(this.particles[i],this.particles[j]);
      if(distance < MAX_DISTANCE){
        this.particles[i].size += DOT_GROW_SIZE;
        this.particles[j].size += DOT_GROW_SIZE;
        this.drawLine(this.particles[i],this.particles[j], distance);
      }
    }
  }

  drawLine(p1,p2, distance) {
    //context.strokeStyle = DOT_COLOR;
    //0.164 0.309 0.431 1
    var alpha = 1 - ( distance / MAX_DISTANCE);
    if(alpha > 1) {
      alpha = 1;
    }
    if(alpha < 0) {
      alpha = 0;
    }

    this.context.moveTo(p1.x,p1.y);
    this.context.strokeStyle = "rgba(42, 79, 110, "+alpha+")";
    this.context.lineTo(p2.x,p2.y);
    this.context.stroke();

    //Test Alpha
    //testLineAlpha(p1,p2,alpha);
  }

  testLineAlpha(p1,p2,alpha){
    this.context.font = "15px Arial";
    this.context.fillStyle = "rgba(42, 79, 110, "+alpha+")";
    this.context.fillText(alpha,p1.x + ((p2.x-p1.x)/2),p1.y + ((p2.y-p1.y)/2));
  }

  distanceBetweenDots(p1,p2) {
    var dx = 0;
    if(p1.x > p2.x){
      dx = p1.x - p2.x;
    }else{
      dx = p2.x - p1.x;
    }
    var dy = 0;
    if(p1.y > p2.y){
      dy = p1.y - p2.y;
    }else{
      dy = p2.y - p1.y;
    }
    return Math.sqrt(dx*dx + dy*dy);
  }

  moveParticles(i){
    this.particles[i].y += this.particles[i].vy + CONST_VY;
    this.particles[i].x += this.particles[i].vx + this.CONST_VX;

    if(this.particles[i].x > window.innerWidth + WINDOW_OFFSET){
      this.particles[i].x = - WINDOW_OFFSET;
    }

    if(this.particles[i].x < -WINDOW_OFFSET){
      this.particles[i].x = window.innerWidth + WINDOW_OFFSET;
    }

    if(this.particles[i].y > window.innerHeight + WINDOW_OFFSET){
      this.particles[i].y = - WINDOW_OFFSET;
    }

    if(this.particles[i].y < - WINDOW_OFFSET){
      this.particles[i].y = window.innerHeight + WINDOW_OFFSET;
    }
  }

  drawDot(dot) {
    this.context.fillStyle = dot.color;
    this.context.beginPath();
    this.context.arc(dot.x, dot.y, dot.size, 0, 2 * Math.PI);
    this.context.closePath();
    this.context.fill();

    //Test Text
    //context.font = "15px Arial";
    //context.fillText(dot.id,dot.x+5,dot.y-5);
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

}

