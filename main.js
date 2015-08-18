var WaterfallDiagram = function(){
  // this.camera, scene, renderer;
  this.curves = [];
  this.startTimestamp = null;
  // this.audioContext;
  // this.analyserNode;
  // this.realAudioInput;
  // this.audioInput;
  // this.inputPoint;

  this.counter = 0;
};

WaterfallDiagram.prototype.newFrame = function() {
  var freqByteData = new Uint8Array(this.analyserNode.frequencyBinCount);

  this.analyserNode.getByteFrequencyData(freqByteData);

  return freqByteData.slice(0, 140)
}

WaterfallDiagram.prototype.makeShape = function(x, width, height, material) {
  var shape = new THREE.Shape()
  var step = width / (x.length + 1)

  shape.moveTo( 0, 0 );
  // shape.lineTo( 0, 0 );

  x.forEach(function(elm, index) {
    shape.lineTo( step * (index + 1), elm * height)
  })

  shape.lineTo( width, 0 );
  return shape
}

WaterfallDiagram.prototype.makeObjects = function( shape) {
  var group = new THREE.Group();
  group.rotation.x = Math.PI * 0.5
  //
  // // flat shape
  var geometry = new THREE.ShapeGeometry( shape );
  var mesh = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( { color: 0x000000, side: THREE.DoubleSide } ) );

  // solid line
  var points = shape.createPointsGeometry();
  var line = new THREE.Line( points, new THREE.LineBasicMaterial( { color: 0xffffff, linewidth: 1 } ) );

  group.add( line );
  group.add( mesh );
  return group;
}

WaterfallDiagram.prototype.init = function() {
  this.scene = new THREE.Scene();

  this.camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 1000);
  this.camera.rotation.x = Math.PI * 0.3
  this.camera.position.set( 100, -100, 130 );
  this.scene.add( this.camera );

  var light = new THREE.PointLight( 0xffffff, 0.8 );
  this.camera.add( light );

  this.scene.add(buildAxes(1000));

  this.renderer = new THREE.WebGLRenderer( { antialias: true } );
  this.renderer.setClearColor( 0x000000 );
  this.renderer.setPixelRatio( window.devicePixelRatio );
  this.renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( this.renderer.domElement );
}

WaterfallDiagram.prototype.insertNewFrame = function() {
  requestAnimationFrame( this.insertNewFrame );
  this.counter ++;
  if(this.counter % 2 != 0) {
    return
  } else {
    this.counter = 0
  }

  var maxCurves = 50
  var x = newFrame();
  var shape = makeShape(x, 200, 0.1)
  var curve = makeObjects(shape)
  this.curves.unshift(curve)
  this.scene.add(curve)

  var len = this.curves.length
  if(len > this.maxCurves) {
    this.scene.remove( this.curves.pop() )
  }
}

WaterfallDiagram.prototype.render = function(timestamp) {
  if (!this.startTimestamp) {
    this.startTimestamp = timestamp;
  }
  var progress = timestamp - startTimestamp;

  console.log(this)

  this.curves.forEach(function(curve) {
    curve.position.y += 2
  })

  this.renderer.render(this.scene, this.camera);
  requestAnimationFrame( this.render );
}

WaterfallDiagram.prototype.gotStream = function(stream) {
    this.inputPoint = this.audioContext.createGain();

    // Create an AudioNode from the stream.
    this.realAudioInput = this.audioContext.createMediaStreamSource(stream);
    this.audioInput = this.realAudioInput;
    this.audioInput.connect(this.inputPoint);

    this.analyserNode = this.audioContext.createAnalyser();
    this.analyserNode.fftSize = 2048;
    this.inputPoint.connect( this.analyserNode );

    // setInterval(insertNewFrame, 300)
    requestAnimationFrame( this.insertNewFrame );
}

WaterfallDiagram.prototype.initAudio = function() {
  window.AudioContext = window.AudioContext || window.webkitAudioContext;

  this.audioContext = new AudioContext();

  navigator.getUserMedia = navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia;

  navigator.requestAnimationFrame = navigator.requestAnimationFrame ||
  navigator.webkitRequestAnimationFrame ||
  navigator.mozRequestAnimationFrame;

  if (navigator.getUserMedia) {
    navigator.getUserMedia(
        {
            audio: true
        }, this.gotStream, function(e) {
            alert('Error getting audio');
            console.log(e);
        });
      } else {
        alert('Error getting audio');
      }
}

function main() {
  var waterfall = new WaterfallDiagram();
  waterfall.init()
  waterfall.initAudio()
  console.log(waterfall)
  requestAnimationFrame( waterfall.render );
}
