Jack Broderick, Alison Davis
May 2, 2019
CS452 Computer Graphics
Project #2

Creation of a Realistic Scene:
The goal of this project was to create a realistic scene using WebGL in which the user had the ability to manipulate at least one object in the scene. We accomplished this by using multiple types of light sources, multiple plolyhedra imported from some .obj files, and some .js files, and accept user interaction through the keyboard.

Three of the objects in the scene are imported from .obj files, a wine glass, an apple, and a plate. In order to display these objects, the following information must be extracted from the file.
- vertices
- indices
- vertexNormals

This information is extracted using a ThreeJS OBJLoader object. The .obj file is then loaded using the loader.load() method. Once the object is loaded, the process_object() function is called to actually extract the information that we need. In order to make our project as generic as possible, a new JavaScript object is created that stores the name of the object, the information for how to draw it (vertices, indices, vertexNormals) as well as the transformation variables (rotation, translation, scaling). Once all of this information is put into the JavaScript object, it is added to the 'all_objects' array. 

A function that performs a similar looping to load each object was created for the simple .js files. This function is called after all of the .obj files are done loading. The .js files contained self-made lists of vertices, indices, and corresponding texture coordinates. The load function for these objects is called load_js_obj( ) and calls on each of the .js files whose names were provided and gets their lists of vertices, indices, and texture coordinates and assigns them to a new object. The .js objects require the use of the getFaceNormals( ) function and the getVertexNormals( ) function. Loading these .js objects also assigns the transofrmation variables. The new objects are pushed into the 'all_objects' array.  There are two .js objects in the scene: the table and the carpet.

This 'all_objects' array now contains all of the created .obj and .js objects. Since each of the objects has all of the data it needs to be drawn, drawing all of the objects is simply a matter of looping through all of the objects in the all_objects array using the draw_Objects( ) function.


User Interaction:
Our project has a specific object hardcoded to be the one manipulated by the user. The apple is able to be moved/scaled in our scene, however by going into the code and changing the MOVE_INDEX, different objects from the 'all_objects' array will be referenced. On different key presses, the object will be transformed accordingly. The key press mapping is as follows:

'x'         : Rotation about the x-axis
'y'         : Rotation about the y-axis
Arrow Left  : Translation in the (+) x-direction
Arrow Right : Translation in the (-) x-direction
Arrow Up    : Translation in the (+) y-direction
Arrow Down  : Translation in the (-) y-direction
'j'         : Scale in (+) x-direction
'k'         : Scale in (-) x-direction
'i'         : Scale in (+) y-direction
'o'         : Scale in (-) y-direction

On the button down for each, a flag is set, once the button is released, the flag is set back to 0. As the 'drawObjects()' functions is continually called, if the flag is set, the corresponding variable for the selected object is updated. This data is all stored in the JavaScript object that is created for each object in the scene. Since only one object is moved at a time, the 'MOVE_INDEX' is the index for the all_objects array that will have it's transformation variables updated during each call to 'drawObjects()'. Our functionality could be increased by giving the user the ability to select which object is being moved by providing buttons or a drop down menu where user input would change the value of MOVE_INDEX. 


Light Sources:
The two light sources implemented here are a point light source and a spotlight source. These lights as well as the specular component of the reflectance may be toggled using the buttons shown on the screen. All of the objects have some component of specular reflectance. 


Colors and Textures:
The coloration of the .obj objects is done by assigning values for their reflectance coefficients (ka, kd, and ks). However, the two .js objects are also assigned texture coordinates. The texture coordinates are sent over to the vertex shader as an attribute and then sent to the fragment shader as a varying variable. Both the fragment and vertex shaders also take a boolean from the javascript that inform it whether or not there is a texture for the current object. In the fragment shader, new variables are created for ka, kd, and ks called ka_tex, kd_tex, and ks_tex which are all 3-component vectors. These new versions of the reflectance coefficients are assigned the values of the texture color for the given fragment if the texture boolean is marked as true. This allows the colors that are seen on the screen for the textured objects to account for both the texture color as well as the light color that is hitting it. These new k_tex values are used only if a texture is being used. Otherwise, the original ka, kd, and ks brought over as unifrom variables are used. The textures come from two different texture images: one of a wooden texture and the other of a persian rug. Different parts of the wood texture are assigned to each of the sides of the table and the persian rug texture is assigned to each side of the box that is used as a carpet. The edges all use a red section of the rug and the top and bottom use the same full image.

Perspective View: 
The perspective view can be seen by selecting the button at the bottom of the screen. The orthographic view shows up by default, and may be returned to by selecting the orthographic button again. These are implemented by using the different projection matrixes (either orthographic or perspective).
