// http://webaudiodemos.appspot.com/AudioRecorder/index.html

var camera, scene, renderer;
var curves = [];

function newFrame() {
  var x = [0]
  for(var i = 0; i < 100; i++) {
    x.push(Math.random())
  }
  return x
}

function makeShape(x, width, height, material) {
  var shape = new THREE.Shape()
  var step = width / x.length

  shape.moveTo( width, 0 );
  shape.lineTo( 0, 0 );

  x.forEach(function(elm, index) {
    shape.lineTo( step * index, elm * height)
  })

  shape.lineTo( width, 0 );
  return shape
}

function makeObjects( shape) {
  var group = new THREE.Group();

  var points = shape.createPointsGeometry();

  // flat shape
  var geometry = new THREE.ShapeGeometry( shape );
  var mesh = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial( { color: 0x000000, side: THREE.DoubleSide } ) );
  group.add( mesh );

  // solid line
  var line = new THREE.Line( points, new THREE.LineBasicMaterial( { color: 0xffffff, linewidth: 1 } ) );
  group.add( line );
  group.rotation.x = Math.PI * 0.5

  return group;
}

function init() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 1000);
  camera.rotation.x = Math.PI * 0.5
  camera.position.set( 60, -150, 50 );
  scene.add( camera );

  var light = new THREE.PointLight( 0xffffff, 0.8 );
  camera.add( light );

  setInterval(insertNewFrame, 500)

  scene.add(buildAxes(1000));

  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setClearColor( 0x000000 );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );
}

function insertNewFrame() {
  var maxCurves = 5
  var x = newFrame();
  shape = makeShape(x, 150, 10)
  curve = makeObjects(shape)
  curves.unshift(curve)
  scene.add(curve)

  var len = curves.length
  if(len > maxCurves) {
    scene.remove( curves.pop() )
  }
}

function render() {
  requestAnimationFrame( render );

  curves.forEach(function(curve) {
    curve.position.y += 1
  })

  renderer.render(scene, camera);
}

function main() {
  init()
  render();
}
