/* Jack Broderick, Alison Davis */
/* April 10, 2019 */
/* CS468 Project 2 */
var vertices;
var vertices4 = [];
var indices = [];
var vertexNormals = [];
var gl;
var myShaderProgram;
var geometry;

/* Global Uniforms */
var MUniform;
var PUniform;
var MVitUniform; /* Uniform for modelviewInverseTranspose */
var PosUniform;  /* Uniform for position of the point light source */
var PosUniform2;  /* Uniform for position of the point light source */

/* Incident Intensity Uniforms: Point Light Source */
var IaUniform;
var IdUniform;
var IsUniform;

/* Incident Intensity Uniforms: Spot Light Source */
var Ia2Uniform;
var Id2Uniform;
var Is2Uniform;

/* Spot light source vector of maximum intensity */
var UUniform; /* For unit vector u of the direction of maximum intensity of the spotlight */

/* Coefficients for the objectst themselves */
var KaUniform;
var KdUniform;
var KsUniform;

/* Uniforms for selecting the light source */
var Source1Uniform; /* Uniform for selecting the first light source */
var Source2Uniform; /* Uniform for selecting the second light source */
var AlphaUniform; /* Uniform for sending the alpha value for shine */

/* Variable used to store the matrix for the different persepctives */
var P_ortho;
var P_persp;

var ToggleSpecularUniform;

/* 1: Orthographic 0: Perspective */
var projection_select; /* Selects Orthographic vs. Perspecvice Projection */
var source1;
var source2;
var toggleSpecular;
var numTriangles;

function initGL() {
    /* This function is called when the webpage is loaded */
    var canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.enable(gl.DEPTH_TEST);
    gl.viewport( 0, 0, 512, 512 );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );

    myShaderProgram = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( myShaderProgram );

    // Step 1: Position the camera using the look at method

    // Define eye (use vec3 in MV.js)
    var eye = vec3(100.0, 50.0, 50.0);

    // Define at point (use vec3 in MV.js)
    var at_point = vec3(0.0, 0.0, 0.0); /* Use the look at point at the origin */

    // Define vup vector (use vec3 in MV.js)
    var vup = vec3(0.0, 1.0, 0.0); /* Camera is vertical - May need to change to point at the object better */

    // Obtain n (use subtract and normalize in MV.js)
    var n = normalize(subtract(eye, at_point));

    // Obtain u (use cross and normalize in MV.js)
    var u = normalize(cross(vup, n));

    // Obtain v (use cross and normalize in MV.js)
    var v = normalize(cross(n, u));

    // Set up Model-View matrix M and send M as uniform to shader
    var M = [u[0],
             v[0],
             n[0],
             0,
                u[1],
                v[1],
                n[1],
                0,
                        u[2],
                        v[2],
                        n[2],
                        0,
                            -1*eye[0]*u[0] - eye[1]*u[1] - eye[2]*u[2],
                            -1*eye[0]*v[0] - eye[1]*v[1] - eye[2]*v[2],
                            -1*eye[0]*n[0] - eye[1]*n[1] - eye[2]*n[2],
                            1.0];

    var modelviewInverseTranspose =     [u[0],
                                         v[0],
                                         n[0],
                                         eye[0],
                                            u[1],
                                            v[1],
                                            n[1],
                                            eye[1],
                                                    u[2],
                                                    v[2],
                                                    n[2],
                                                    eye[2],
                                                        0.0,
                                                        0.0,
                                                        0.0,
                                                        1.0];


    /* Send the model view matrix and the modelview inverse transpose matrix */
    gl.uniformMatrix4fv(MUniform, false, M);
    gl.uniformMatrix4fv(MVitUniform, false, modelviewInverseTranspose);

    /* Call the function to load the object */
    load_object();
}

function load_object() {
    // instantiate a loader
    var loader = new THREE.OBJLoader();

    // load a resource
    loader.load(
    	// resource URL
    	'coke_bottle.OBJ',

    	// called when resource is loaded
    	function ( object ) {
            /* We get the vertices of all of the points */
            /* Each face is stored in order, so some points are repeated */
            // vertices = object.children[0].geometry.attributes.position.array;
            // vertexNormals = object.children[0].geometry.attributes.normal.array;
            // numTriangles = Math.floor(vertices/9.0);

            // console.log(vertices);
            // console.log(object.children[0].geometry);
            /* Create a geometry object from a buffer geometry */
            geometry = new THREE.Geometry().fromBufferGeometry( object.children[0].geometry );
            // console.log("Geometry: ", geometry);

            /* Get the vertices from the geometry object */
            // console.log(geometry.vertices);

            vertices = geometry.vertices;

            // console.log(Math.max.apply(null,vertices));
            // console.log(Math.min(vertices));

            // console.log(object.children[0].geometry);

            send_vertices();
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

function send_vertices() {
    /* We need to add 1.0 to all of the vertices because it is going to be looking for a vec4 in the vertex shader for position */
    var i = 0;
    var j = 0;

    var faces = geometry.faces;

    for(i = 0; i < vertices.length; i++) {
        vertices4.push(vertices[i].x);
        vertices4.push(vertices[i].y);
        vertices4.push(vertices[i].z);
        vertices4.push(1.0);
        indices.push(i); /* The vertices for each face are supposed to be repeated so they should all be in order */
    }

    // console.log("vertices4: ", vertices4);

    /* Now we need to create a vector for the indices */
    var faces = geometry.faces;
    // console.log(faces);
    // console.log(faces[1].a);
    var v_n = [];
    for(i = 0; i < faces.length; i++) {
        indices.push(faces[i].a);
        // console.log(indices);
        indices.push(faces[i].b);
        indices.push(faces[i].c);

        /* We need to get the vertex normal for each of the vertices in the face */
        v_n[faces[i].a] = faces[i].vertexNormals[0];
        v_n[faces[i].b] = faces[i].vertexNormals[1];
        v_n[faces[i].c] = faces[i].vertexNormals[2];
    }

    /* We need to get the values from the vertexNormals */
    for(i = 0; i < v_n.length; i++) {
        vertexNormals.push(v_n[i].x);
        vertexNormals.push(v_n[i].y);
        vertexNormals.push(v_n[i].z);
    }

    // console.log(vertexNormals);
    // console.log(flatten(vertexNormals));
    // console.log("indices: ", indices);

    // console.log(geometry);

    /* Get the vertex normals from the geometry */
    /* We need to loop through all of the vertex normals in the faces */


    /* Create the index buffer */
    var indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    /* Create, bind, and send data to the buffer for the vertices */
    var vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices4), gl.STATIC_DRAW);

    var vertexPosition = gl.getAttribLocation(myShaderProgram, "vertexPosition");
    gl.vertexAttribPointer(vertexPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vertexPosition);

    /* Create a buffer for the vertex normals */
    var vertexNormal = gl.getAttribLocation(myShaderProgram, "vertexNormal");
    var normalsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertexNormals), gl.STATIC_DRAW);
    gl.vertexAttribPointer(vertexNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vertexNormal);

    // Set up the first light source and send the variables
    // to the shader program (NEEDS CODE, VARIABLES DEPEND ON LIGHT TYPE)
    /* Point light source at point p */
    var p = vec3(100.0, 100.0, 0.0);
    /* Spot light source at point p0 */
    var p02 = vec3(-135.0, -135.0, 0.0);
    gl.uniform3f(PosUniform, p[0], p[1], p[2]);
    gl.uniform3f(PosUniform2, p02[0], p02[1], p02[2]);

    /* Incident Components for the first light source */
    var Ia = vec3(0.8, 0.3, 0.1);
    var Id = vec3(0.7, 0.3, 0.7);
    var Is = vec3(0.4, 0.4, 0.4);

    /* Incident components for the spotlight */
    var Ia2 = vec3(0.3, 0.8, 0.8);
    var Id2 = vec3(0.3, 0.7, 0.7);
    var Is2 = vec3(0.4, 0.4, 0.4);

    /* Spot light vector of maximum intensity */
    var u_spotlight = normalize(vec3(-0.7, -0.9, 0.0));
    gl.uniform3f(UUniform, u_spotlight[0], u_spotlight[1], u_spotlight[2]);

    /* Send the uniforms */
    gl.uniform3f(IaUniform, Ia[0], Ia[1], Ia[2]);
    gl.uniform3f(IdUniform, Id[0], Id[1], Id[2]);
    gl.uniform3f(IsUniform, Is[0], Is[1], Is[2]);
    gl.uniform3f(Ia2Uniform, Ia2[0], Ia2[1], Ia2[2]);
    gl.uniform3f(Id2Uniform, Id2[0], Id2[1], Id2[2]);
    gl.uniform3f(Is2Uniform, Is2[0], Is2[1], Is2[2]);

    /* Setup the object specific variables */
    var ka = vec3(0.6, 0.6, 0.1);
    var kd = vec3(0.8, 0.8, 0.8);
    var ks = vec3(0.8, 0.8, 0.8);

    /* Send the variables to the unifomrs */
    gl.uniform3f(KaUniform, ka[0], ka[1], ka[2]);
    gl.uniform3f(KdUniform, kd[0], kd[1], kd[2]);
    gl.uniform3f(KsUniform, ks[0], ks[1], ks[2]);

    /* Send alpha uniform */
    var alpha = 10.0;
    gl.uniform1f(AlphaUniform, alpha)

    /* Turn on both sources to start */
    source1 = 1;
    source2 = 1;
    toggleSpecular = 1;

    gl.uniform1f(Source1Uniform, source1);
    gl.uniform1f(Source2Uniform, source2);
    gl.uniform1f(ToggleSpecularUniform, toggleSpecular);
    // Step 2: Set up orthographic and perspective projections

    // Define left plane
    var left = -150.0;
    // Define right plane
    var right = 150.0;
    // Define top plane
    var top = 150.0;
    // Define bottom plane
    var bottom = -150.0;
    // Define near plane
    var near = 50.0;
    // Define far plane
    var far = 150.0;

    /* Set up orthographic projection matrix P_orth using above planes */
    P_ortho = [2.0/ (right-left),
                   0.0,
                   0.0,
                   0.0,
                    0.0,
                    2.0/(top-bottom),
                    0.0,
                    0.0,
                        0.0,
                        0.0,
                        -2.0/(far-near),
                        0.0,
                            -(right+left)/(right-left),
                            -(top+bottom)/(top-bottom),
                            -(far+near)/(far-near),
                            1];
    // Set up perspective projection matrix P_persp using above planes
    P_persp = [ (2.0 * near)/(right - left),
                0.0,
                0.0,
                0.0,
                    0.0,
                    (2*near)/ (top - bottom),
                    0.0,
                    0.0,
                        (right+left) / (right-left),
                        (top+bottom)/ (top - bottom),
                        -(far+near) / (far - near),
                        -1.0,
                            0.0,
                            0.0,
                            -(2.0*far * near) / (far-near),
                            0.0];

    // Use a flag to determine which matrix to send as uniform to shader
    // flag value should be changed by a button that switches between
    // orthographic and perspective projections
    projection_select = 1; /* 1: Orthographic 0: Perspective */

    // render the object
    drawObject();
}

function set_orthographic() {
    projection_select = 1;
    drawObject();
    // console.log("Orhtographic");
}

function set_perspective() {
    // console.log("perspective");
    projection_select = 0;
    drawObject();
}

function drawObject() {
    var P; /* Projection matrix */
    // console.log("projection_select: ", projection_select);
    if(projection_select) {
        P = P_ortho;
    } else {
        // console.log("Here");
        P = P_persp;
    }
    gl.uniformMatrix4fv(PUniform, false, P);

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
    gl.drawElements( gl.TRIANGLES, 3 * numTriangles, gl.UNSIGNED_SHORT, 0 )
}

function toggleSource1() {
    if(source1 == 1) {
        source1 = 0;
    } else {
        source1 = 1;
    }
    gl.uniform1f(Source1Uniform, source1);
    drawObject();
}

function toggleSource2() {
    if(source2 == 1) {
        source2 = 0;
    } else {
        source2 = 1;
    }
    gl.uniform1f(Source2Uniform, source2);
    drawObject();
}

function toggleSpec() {
    if(toggleSpecular == 1) {
        toggleSpecular = 0;
    } else {
        toggleSpecular = 1;
    }
    gl.uniform1f(ToggleSpecularUniform, toggleSpecular);
    drawObject();
}
