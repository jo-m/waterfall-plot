// http://webaudiodemos.appspot.com/AudioRecorder/index.html

var camera, scene, renderer;
var curves = [];
var startTimestamp = null;
var audioContext;
var analyserNode;
var realAudioInput;
var audioInput;
var inputPoint;
var counter = 0;

function newFrame() {
  var freqByteData = new Uint8Array(analyserNode.frequencyBinCount);

  analyserNode.getByteFrequencyData(freqByteData);

  return freqByteData.slice(0, 140)
}

function makeShape(x, width, height, material) {
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

function makeObjects( shape) {
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

function init() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 1000);
  camera.rotation.x = Math.PI * 0.3
  camera.position.set( 100, -100, 130 );
  scene.add( camera );

  var light = new THREE.PointLight( 0xffffff, 0.8 );
  camera.add( light );

  scene.add(buildAxes(1000));

  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setClearColor( 0x000000 );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );
}

function insertNewFrame() {
  requestAnimationFrame( insertNewFrame );
  counter ++;
  if(counter % 2 != 0) {
    return
  } else {
    counter = 0
  }

  var maxCurves = 50
  var x = newFrame();
  shape = makeShape(x, 200, 0.1)
  curve = makeObjects(shape)
  curves.unshift(curve)
  scene.add(curve)

  var len = curves.length
  if(len > maxCurves) {
    scene.remove( curves.pop() )
  }
}

function render(timestamp) {
  if (!startTimestamp) startTimestamp = timestamp;
  var progress = timestamp - startTimestamp;

  curves.forEach(function(curve) {
    curve.position.y += 2
  })

  renderer.render(scene, camera);
  requestAnimationFrame( render );
}

function gotStream(stream) {
    inputPoint = audioContext.createGain();

    // Create an AudioNode from the stream.
    realAudioInput = audioContext.createMediaStreamSource(stream);
    audioInput = realAudioInput;
    audioInput.connect(inputPoint);

    analyserNode = audioContext.createAnalyser();
    analyserNode.fftSize = 2048;
    inputPoint.connect( analyserNode );

    // setInterval(insertNewFrame, 300)
    requestAnimationFrame( insertNewFrame );
}

function initAudio() {
  window.AudioContext = window.AudioContext || window.webkitAudioContext;

  audioContext = new AudioContext();

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
        }, gotStream, function(e) {
            alert('Error getting audio');
            console.log(e);
        });
      } else {
        alert('Error getting audio');
      }
}

function main() {
  init()
  initAudio()
  requestAnimationFrame( render );
}
