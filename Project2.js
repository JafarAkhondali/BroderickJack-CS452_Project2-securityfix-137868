/* Jack Broderick, Alison Davis */
/* April 10, 2019 */
/* CS468 Project 2 */

/* Resources

irex: https://www.turbosquid.com/3d-models/3d-indominus-rex-rig-irex-1182227
coke bottle: https://www.turbosquid.com/FullPreview/Index.cfm/ID/540827

*/

var gl;
var numVertices;
var numTriangles;
var myShaderProgram;
var vertexScaling; /* Used to scale the vertices to make sure the object fits */

/* Global Uniforms */
var MUniform;
var PUniform;
var MVitUniform; /* Uniform for modelviewInverseTranspose */
var PosUniform;  /* Uniform for position of the point light source */
var PosUniform2;  /* Uniform for position of the point light source */

/* Texture Uniform */
var TexFlagUniform;

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

/* Translation Variables */
var T; // Translation matrix
var Tuniform;
var tx, ty, tz; /* The translation in the x, y, and z directions */

/* 1: Orthographic 0: Perspective */
var projection_select; /* Selects Orthographic vs. Perspecvice Projection */
var source1;
var source2;
var toggleSpecular;

/* Create a global variable to pass the vertices between functions */
var vert = [];
var vertices = [];
var indices = [];
var vertexNormals = [];
var texCoordinates = [];
var use_texture;

//Creation transformation matrices
var Mx;
var My;
var Mxuniform;
var Myuniform;
var a = .0;
var beta = .0;

var alterAlpha = .0;
var alterBeta = .0;


function initGL() {
    var canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.enable(gl.DEPTH_TEST);
    gl.viewport( 0, 0, 512, 512 );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );

    myShaderProgram = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( myShaderProgram );

    /* Get all of the uniform locations */
    MUniform = gl.getUniformLocation(myShaderProgram, "modelview");
    PUniform = gl.getUniformLocation(myShaderProgram, "projection");
    MVitUniform = gl.getUniformLocation(myShaderProgram, "modelviewInverseTranspose");
    PosUniform = gl.getUniformLocation(myShaderProgram, "p0");
    PosUniform2 = gl.getUniformLocation(myShaderProgram, "p02");
    IaUniform = gl.getUniformLocation(myShaderProgram, "Ia");
    IdUniform = gl.getUniformLocation(myShaderProgram, "Id");
    IsUniform = gl.getUniformLocation(myShaderProgram, "Is");
    IaUniform2 = gl.getUniformLocation(myShaderProgram, "Ia2");
    IdUniform2 = gl.getUniformLocation(myShaderProgram, "Id2");
    IsUniform2 = gl.getUniformLocation(myShaderProgram, "Is2");
    KaUniform = gl.getUniformLocation(myShaderProgram, "ka");
    KdUniform = gl.getUniformLocation(myShaderProgram, "kd");
    KsUniform = gl.getUniformLocation(myShaderProgram, "ks");
    UUniform = gl.getUniformLocation(myShaderProgram, "u_spotlight");
    Source1Uniform = gl.getUniformLocation(myShaderProgram, "source1");
    Source2Uniform = gl.getUniformLocation(myShaderProgram, "source2");
    AlphaUniform = gl.getUniformLocation(myShaderProgram, "alpha");
    ToggleSpecularUniform = gl.getUniformLocation(myShaderProgram, "toggleSpecular");
    TexFlagUniform = gl.getUniformLocation(myShaderProgram, "use_texture");
    Mxuniform = gl.getUniformLocation( myShaderProgram, "Mx" );
    Myuniform = gl.getUniformLocation( myShaderProgram, "My" );
    Tuniform = gl.getUniformLocation( myShaderProgram, "T");

    /* Initial translation is 0 */
    tx = 0;
    ty = 0;
    tz = 0;

    /* Decide if a texture is being used or not */
    use_texture = -1.0;
    gl.uniform1f(TexFlagUniform, use_texture);

    // if(use_texture < 1) {
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

    Mx = [1.0,
          .0,
          .0,
          .0,
          .0,
          Math.cos(a),
          -Math.sin(a),
          .0,
          .0,
          Math.sin(a),
          Math.cos(a),
          .0,
          .0,
          .0,
          .0,
          1.0];

    My = [Math.cos(beta),
          .0,
          -Math.sin(beta),
          .0,
          .0,
          1.0,
          .0,
          .0,
          Math.sin(beta),
          .0,
          Math.cos(beta),
          .0,
          .0,
          .0,
          .0,
          1.0];

          T = [1.0,
                  0.0,
                  0.0,
                  0.0,
                  0.0,
                  1.0,
                  0.0,
                  0.0,
                  0.0,
                  0.0,
                  1.0,
                  0.0,
                  tx,
                  ty,
                  tz,
                  1.0];


        /* Send the model view matrix and the modelview inverse transpose matrix */
        gl.uniformMatrix4fv(MUniform, false, M);
        gl.uniformMatrix4fv(MVitUniform, false, modelviewInverseTranspose);
        gl.uniformMatrix4fv(Mxuniform, false, Mx );
        gl.uniformMatrix4fv(Myuniform, false, My );
        gl.uniformMatrix4fv(Tuniform, false, T);

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
        gl.uniform3f(IaUniform2, Ia2[0], Ia2[1], Ia2[2]);
        gl.uniform3f(IdUniform2, Id2[0], Id2[1], Id2[2]);
        gl.uniform3f(IsUniform2, Is2[0], Is2[1], Is2[2]);

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
        var left = -250.0;
        // Define right plane
        var right = 250.0;
        // Define top plane
        var top = 400.0;
        // Define bottom plane
        var bottom = -400.0;
        // Define near plane
        var near = 10.0;
        // Define far plane
        var far = 400.0;

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

    // } else {
    if(use_texture > 0.0) {
        /* Create a buffer for the texture */
        var texture1 = document.getElementById("texture1");
        textureImage = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, textureImage);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); /* Must flip because images assume the origin is in the top left */
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, texture1); /* Sends data to the GPU */
        /* We will use linear mipmapping to avoid undersampling and edges */
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
        gl.generateMipmap(gl.TEXTURE_2D);
    }

    /* We need to load the object */
    var vertex_scalings = [1.0, 1.0, 10.0, 1.0];
    var object_names = ['coke_bottle.OBJ', 'Irex_obj.obj', 'TV.obj', 'apple.obj'];
    // var object_names = ['Irex_obj.obj'];

    var i = 3;
    // for(i = 0; i < object_names.length; i++) {
    //     load_object(object_names[i]);
    // }
    vertexScaling = vertex_scalings[i];
    load_object(object_names[i]);
    // createOctahedron();



    // drawObject();
};


function load_object(object_name) {
    // instantiate a loader
    var children;
    var loader = new THREE.OBJLoader();

    // load a resource
    loader.load(
    	// resource URL
    	object_name,

    	// called when resource is loaded
    	function ( object ) {
            /* Need to call draw all of the children
            /* We get the vertices of all of the points */
            console.log(object);
            /* Create a geometry object from a buffer geometry */
            // geometry = new THREE.Geometry().fromBufferGeometry( object.children[0].geometry );

            children = object.children;

            var i =0;
            for(i = 0; i < children.length; i++) {
                    geometry = new THREE.Geometry().fromBufferGeometry(children[i].geometry);

                    console.log(geometry);
                    /* Get the vertices from the geometry object */
                    vert = geometry.vertices;

                    /* Next, call a function to process the loaded geometry object */
                    process_object();
            }
    	},
    	// called when loading is in progresses
    	function ( xhr ) {
    		// console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

    	},
    	// called when loading has errors
    	function ( error ) {

    		console.log( 'An error happened' );

    	}
    );

}

function process_object() {
    /* We need to add 1.0 to all of the vertices because it is going to be looking for a vec4 in the vertex shader for position */
    var i = 0;
    var j = 0;

    var faces = geometry.faces;

    if(use_texture < 0) {
        for(i = 0; i < vert.length; i++) {
            vertices.push(vert[i].x * vertexScaling);
            vertices.push(vert[i].y * vertexScaling);
            vertices.push(vert[i].z * vertexScaling);
            vertices.push(1.0);
        }

        /* Now we need to create a vector for the indices */
        var faces = geometry.faces;
        // console.log(faces);
        // console.log(faces[1].a);
        var v_n = [];
        for(i = 0; i < faces.length; i++) {
            indices.push(faces[i].a);
            indices.push(faces[i].b);
            indices.push(faces[i].c);

            /* We need to get the vertex normal for each of the vertices in the face */
            v_n[faces[i].a] = faces[i].vertexNormals[0];
            v_n[faces[i].b] = faces[i].vertexNormals[1];
            v_n[faces[i].c] = faces[i].vertexNormals[2];
        }

        numTriangles = faces.length;

        /* We need to get the values from the vertexNormals */
        for(i = 0; i < v_n.length; i++) {
            vertexNormals.push(v_n[i].x);
            vertexNormals.push(v_n[i].y);
            vertexNormals.push(v_n[i].z);
        }

        /* We now need to send the values via buffers */
        var indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

        /* Create a buffer for the vertex normals */
        var vertexNormal = gl.getAttribLocation(myShaderProgram, "vertexNormal");
        var normalsBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(vertexNormals), gl.STATIC_DRAW);
        gl.vertexAttribPointer(vertexNormal, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vertexNormal);

        /* Create, bind, and send data to the buffer for the vertices */
        var vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

        var vertexPosition = gl.getAttribLocation(myShaderProgram, "vertexPosition");
        gl.vertexAttribPointer(vertexPosition, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vertexPosition);
    } else {
        /* We are going to use the texture */
        var indexCounter = 0;
        var v1, v2, v3;
        var face;
        var all_tex = geometry.faceVertexUvs[0];
        console.log("all_tex: ", all_tex);
        var face_tex;
        for(i = 0; i < faces.length; i++) {
            face = faces[i];
            /* We must get the three vertices for each face */
            v1 = vert[face.a];
            v2 = vert[face.b];
            v3 = vert[face.c];
            vertices.push(v1.x);
            vertices.push(v1.y);
            vertices.push(v1.z);
            vertices.push(1.0);
            vertices.push(v2.x);
            vertices.push(v2.y);
            vertices.push(v2.z);
            vertices.push(1.0);
            vertices.push(v3.x);
            vertices.push(v3.y);
            vertices.push(v3.z);
            vertices.push(1.0);

            /* Now we need to add the texture coordinates for each vertex */
            /* We have an array of texture coordianates for each face that we need to index */
            face_tex = all_tex[i];
            texCoordinates.push(face_tex[0].x);
            texCoordinates.push(face_tex[0].y);
            texCoordinates.push(face_tex[1].x);
            texCoordinates.push(face_tex[1].y);
            texCoordinates.push(face_tex[2].x);
            texCoordinates.push(face_tex[2].y);

            /* Now we need to add the index of the vertex (this will just increment) */
            indices.push(indexCounter++);
            indices.push(indexCounter++);
            indices.push(indexCounter++);
        }

        /* We need to send the texture */
        /* Create a buffer for the texture */
        var texture1 = document.getElementById("texture1");
        textureImage = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, textureImage);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); /* Must flip because images assume the origin is in the top left */
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, texture1); /* Sends data to the GPU */
        /* We will use linear mipmapping to avoid undersampling and edges */
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
        gl.generateMipmap(gl.TEXTURE_2D);

        /* Now we need to send all of the data */
        var vertexBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, vertexBuffer );
        gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
        console.log(vertices);

        var myPosition = gl.getAttribLocation( myShaderProgram, "vertexPosition" );
        gl.vertexAttribPointer(myPosition, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(myPosition);

        var iBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
        gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(indices), gl.STATIC_DRAW);
        console.log(indices);
        /* Create attribute for texture coordinates */
        var textureCoordinateBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordinateBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoordinates), gl.STATIC_DRAW);
        console.log("texCoordinates: ", texCoordinates);

        var texCoordinate = gl.getAttribLocation(myShaderProgram, "textureCoordinate");
        gl.vertexAttribPointer(texCoordinate, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(texCoordinate);
    }
    /* Try rendering the object with the texture coordinate if the flag is set */

    // render the object
    drawObject();

}

function createOctahedron() {
    // This function creates the coordinates for a regular octahedron
    h = 1;
    var vertices = [vec4(0.2, 0.0, 0.0, 1.0),
                vec4(-0.2, 0.0, 0.0, 1.0),
                vec4(0.0, 0.2, 0.0, 1.0),
                vec4(0.0, -0.2, 0.0, 1.0),
                vec4(0.0, 0.0, 0.2, 1.0),
                vec4(0.0, 0.0, -0.2, 1.0)];
    var vertices2 = [
                        // Face 1
                        vertices[0],
                        vertices[3],
                        vertices[4],
                        // Face 2
                        vertices[0],
                        vertices[2],
                        vertices[4],
                        // Face 3
                        vertices[1],
                        vertices[2],
                        vertices[4],
                        // Face 4
                        vertices[1],
                        vertices[3],
                        vertices[4],
                        // Face 5
                        vertices[0],
                        vertices[3],
                        vertices[5],
                        // Face 6
                        vertices[0],
                        vertices[2],
                        vertices[5],
                        // Face 7
                        vertices[1],
                        vertices[2],
                        vertices[5],
                        // Face 8
                        vertices[1],
                        vertices[3],
                        vertices[5]
                 ];

    /* Create an array for the coordinates in the texture image corresponding to each of the vertices */
    var textureCoordinates = [  // Face 1
                                1.0, 0.0,
                                0.0, 0.0,
                                0.5, 1.0,
                                // Face 2
                                0.0, 0.0,
                                1.0, 0.0,
                                0.5, 1.0,
                                // Face 3
                                1.0, 0.0,
                                0.0, 0.0,
                                0.5, 1.0,
                                // Face 4
                                0.0, 0.0,
                                1.0, 0.0,
                                0.5, 1.0,
                                // Face 5
                                0.0, 0.0,
                                1.0, 0.0,
                                0.5, 1.0,
                                // Face 6
                                1.0, 0.0,
                                0.0, 0.0,
                                0.5, 1.0,
                                // Face 7
                                0.0, 0.0,
                                1.0, 0.0,
                                0.5, 1.0,
                                // Face 8
                                1.0, 0.0,
                                0.0, 0.0,
                                0.5, 1.0
    ]

    console.log(vertices2);
    console.log(vertices);

    // Setup the colors of the vertices
    var vertexColors = [vec4( 0.0, 0.0, 1.0, 1.0), // p0
                        vec4( 0.0, 1.0, 0.0, 1.0), // p1
                        vec4( 1.0, 0.0, 0.0, 1.0), // p2
                        vec4( 1.0, 1.0, 0.0, 1.0), // p3
                        vec4( 1.0, 0.0, 1.0, 1.0), // p4
                        vec4( 0.0, 1.0, 1.0, 1.0)]; // p6

    var indexList =    [0, 3, 4,
                        0, 2, 4,
                        1, 2, 4,
                        1, 3, 4,
                        0, 3, 5,
                        0, 2, 5,
                        1, 2, 5,
                        1, 3, 5];

    /* We need a new index list for the texture coordinates */
    var indexList2 =    [ // Face 1
                            0, 1, 2,
                            // Face 2
                            3, 4, 5,
                            // Face 3
                            6, 7, 8,
                            // Face 4
                            9, 10, 11,
                            // Face 5
                            12, 13, 14,
                            // Face 6
                            15, 16, 17,
                            // Face 7
                            18, 19, 20,
                            // Face 8
                            21, 22, 23];


    /* I want to scale all of the vertices to try to make it visible */
    vertices2 = flatten(vertices2);
    console.log("scaling");
    for(i = 0; i < vertices2.length; i++) {
        if((i+1)%4)
        vertices2[i] = vertices2[i] * 1;
    }
    console.log(vertices2);

    var vertexBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vertexBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices2), gl.STATIC_DRAW);

    var myPosition = gl.getAttribLocation( myShaderProgram, "vertexPosition" );
    gl.vertexAttribPointer(myPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(myPosition);

    var iBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
    gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(indexList2), gl.STATIC_DRAW);

    /* Create attribute for texture coordinates */
    var textureCoordinateBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordinateBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(textureCoordinates), gl.STATIC_DRAW);

    var texCoordinate = gl.getAttribLocation(myShaderProgram, "textureCoordinate");
    gl.vertexAttribPointer(texCoordinate, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(texCoordinate);
}

// FOLLOWING CODE SKELETON FOR getFaceNormals() NEEDS TO BE COMPLETED
function getFaceNormals( vertices, indexList, numTriangles ) {
    // array of face normals
    var faceNormals = [];
    var faceNormal = [];

    // Following lines iterate over triangles
    for (var i = 0; i < numTriangles; i++) {
        // Following lines give you three vertices for each face of the triangle
        var p0 = vec3( vertices[indexList[3*i]][0],
                      vertices[indexList[3*i]][1],
                      vertices[indexList[3*i]][2]);

        var p1 = vec3( vertices[indexList[3*i+1]][0],
                      vertices[indexList[3*i+1]][1],
                      vertices[indexList[3*i+1]][2]);

        var p2 = vec3( vertices[indexList[3*i+2]][0],
                      vertices[indexList[3*i+2]][1],
                      vertices[indexList[3*i+2]][2]);

        // Calculate vector from p0 to p1 ( use subtract function in MV.js, NEEDS CODE )
        var v1 = subtract(p1, p0);
        // Calculate vector from p0 to p2 ( use subtract function, NEEDS CODE )
        var v2 = subtract(p2, p0);
        // Calculate face normal as the cross product of the above two vectors
        // (use cross function in MV.js, NEEDS CODE )
        var n = cross(v1, v2);
        // normalize face normal (use normalize function in MV.js, NEEDS CODE)
        faceNormal = normalize(n);
        // Following line pushes the face normal into the array of face normals
        faceNormals.push( faceNormal );
    }

    // Following line returns the array of face normals
    return faceNormals;
}

// FOLLOWING CODE SKELETON FOR getVertexNormals() NEEDS TO BE COMPLETED
function getVertexNormals( vertices, indexList, faceNormals, numVertices, numTriangles ) {
    var vertexNormals = [];

    // Iterate over all vertices
    for ( var j = 0; j < numVertices; j++) {

        // Initialize the vertex normal for the j-th vertex
        var vertexNormal = vec3( 0.0, 0.0, 0.0 );

        // Iterate over all the faces to find if this vertex belongs to
        // a particular face

        for ( var i = 0; i < numTriangles; i++ ) {

            // The condition of the following if statement should check
            // if the j-th vertex belongs to the i-th face
                // console.log("i: ", i);
                // console.log("indexList[0-3]: ", indexList.slice(i,i+3));
                // console.log("IndexList: ", indexList);
            if ( indexList.slice(i*3, (i*3)+3).includes(j) ) { // NEEDS CODE IN PARENTHESES
                vertexNormal = add(vertexNormal, faceNormals[i]);
            }

        }

        /* Normalize the vertex normal */
        vertexNormal = normalize(vertexNormal);

        // Following line pushes the vertex normal into the vertexNormals array
        vertexNormals.push( vertexNormal );
    }

    return vertexNormals;
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
    if(use_texture > 0) {
        gl.uniform1i(gl.getUniformLocation(myShaderProgram, "texMap0"), 0);
        gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
        gl.drawElements( gl.TRIANGLES, 24, gl.UNSIGNED_BYTE, 0 );
        var P; /* Projection matrix */
        // console.log("projection_select: ", projection_select);
        if(projection_select) {
            P = P_ortho;
        } else {
            // console.log("Here");
            P = P_persp;
        }
        gl.uniformMatrix4fv(PUniform, false, P);

        a = a + .05 * alterAlpha;
        Mx = [1.0,
              .0,
              .0,
              .0,
              .0,
              Math.cos(a),
              -Math.sin(a),
              .0,
              .0,
              Math.sin(a),
              Math.cos(a),
              .0,
              .0,
              .0,
              .0,
              1.0];

        gl.uniformMatrix4fv( Mxuniform, false, Mx );

    } else {

        var P; /* Projection matrix */
        // console.log("projection_select: ", projection_select);
        if(projection_select) {
            P = P_ortho;
        } else {
            // console.log("Here");
            P = P_persp;
        }
        gl.uniformMatrix4fv(PUniform, false, P);

        a = a + .05 * alterAlpha;
        beta = beta + .05 * alterBeta;
        Mx = [1.0,
              .0,
              .0,
              .0,
              .0,
              Math.cos(a),
              -Math.sin(a),
              .0,
              .0,
              Math.sin(a),
              Math.cos(a),
              .0,
              .0,
              .0,
              .0,
              1.0];

        My = [Math.cos(beta),
              .0,
              -Math.sin(beta),
              .0,
              .0,
              1.0,
              .0,
              .0,
              Math.sin(beta),
              .0,
              Math.cos(beta),
              .0,
              .0,
              .0,
              .0,
              1.0];

        gl.uniformMatrix4fv( Mxuniform, false, Mx );
        gl.uniformMatrix4fv( Myuniform, false, My );

        gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
        gl.drawElements( gl.TRIANGLES, 3 * numTriangles, gl.UNSIGNED_SHORT, 0 )
    }
    requestAnimFrame( drawObject );
}

function toggleSource1() {
    if(source1 == 1) {
        source1 = 0;
    } else {
        source1 = 1;
    }
    gl.uniform1f(Source1Uniform, source1);
    //drawObject();
}

function toggleSource2() {
    if(source2 == 1) {
        source2 = 0;
    } else {
        source2 = 1;
    }
    gl.uniform1f(Source2Uniform, source2);
    //drawObject();
}

function toggleSpec() {
    if(toggleSpecular == 1) {
        toggleSpecular = 0;
    } else {
        toggleSpecular = 1;
    }
    gl.uniform1f(ToggleSpecularUniform, toggleSpecular);
    //drawObject();
}

function moveObjectKeys(event)
{
    var theKeyCode = event.keyCode;

    if (theKeyCode == 88)
    {
        alterAlpha = 1.0;
    }
    if (theKeyCode == 89)
    {
        alterBeta = 1.0;
    }

}


function stopObjectKeys(event)
{
    var theKeyCode = event.keyCode;


    if (theKeyCode == 88)
    {
        alterAlpha = .0;
    }

    if (theKeyCode == 89)
    {
        alterBeta = .0;
    }

}
