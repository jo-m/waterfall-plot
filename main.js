var camera, scene, renderer;

function makeShape(x, width, height, material) {
  var shape = new THREE.Shape()
  var step = width / x.length

  shape.moveTo( width, 0 );
  shape.lineTo( 0, 0 );

  x.forEach(function(elm, index) {
    shape.lineTo( step * index, elm)
  })

  shape.lineTo( width, 0 );

  return shape
}

function makeObjects( shape) {
  var group = new THREE.Group();

  var points = shape.createPointsGeometry();

  // flat shape
  var geometry = new THREE.ShapeGeometry( shape );
  var mesh = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial( { color: 0xff5555, side: THREE.DoubleSide } ) );
  group.add( mesh );

  // solid line
  var line = new THREE.Line( points, new THREE.LineBasicMaterial( { color: 0xffffff, linewidth: 1 } ) );
  group.add( line );

  return group;
}

function init() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 1000 );
  camera.position.set( 0, 150, 500 );
  scene.add( camera );

  var light = new THREE.PointLight( 0xffffff, 0.8 );
  camera.add( light );

  group = new THREE.Group();

  var x = [0, 3, 4, 5, 2, 3, 4, 12, 2, 3, 1, 1, 5, 4, 3, 3, 2, 4, 6, 5, 2, 23, 4, 1]
  shape = makeShape(x, 80, 50)
  object = makeObjects(shape)
  scene.add( object );

  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setClearColor( 0x000000 );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );

}

function render() {
  requestAnimationFrame( render );
  renderer.render(scene, camera);
}

function main() {
  init();
  render();
}
