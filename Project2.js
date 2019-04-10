/* Jack Broderick, Alison Davis */
/* April 10, 2019 */
/* CS468 Project 2 */

function initGL() {
    /* This function is called when the webpage is loaded */
    console.log("Here\n");

    // instantiate a loader
    var loader = new THREE.OBJLoader();

    // load a resource
    loader.load(
    	// resource URL
    	'coke_bottle.OBJ',
    	// called when resource is loaded
    	function ( object ) {

    		// scene.add( object );
            console.log(object);
            console.log(object.faces);

    	},
    	// called when loading is in progresses
    	function ( xhr ) {

    		console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

    	},
    	// called when loading has errors
    	function ( error ) {

    		console.log( 'An error happened' );

    	}
    );

}
