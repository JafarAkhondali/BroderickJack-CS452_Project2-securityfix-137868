Jack Broderick, Alison Davis
May 2, 2019
CS452 Computer Graphics
Project #2

The goal of this project was to create a realistic scene using WebGL in which the user had the ability to manipulate at least one object in the scene. We accomplished this by using multiple types of light sources, multiple plolyhedra imported from .obj files, and user interaction through the keyboard.

Most of the objects in the scene are imported from .obj files. In order to display these objects, the following information must be extracted from the file.
    - vertices
    - indices
    - vertexNormals
    
This information is extracted using a ThreeJS OBJLoader object. The .obj file is then loaded using the loader.load() method. Once the object is loaded, the process_object() function is called to actually extract the information that we need. In order to make our project as generic as possible, a new JavaScript object is created that stores the name of the object, the information for how to draw it (vertices, indices, vertexNormals) as well as the transformation variables (rotation, translation, scaling). Once all of this information is put into the JavaScript object, it is added to the 'all_objects' array. This contains all of the created JavaScript objects, and since each of the objects has all of the data it needs to be drawn, drawing all of the objects is simply a matter of looping through all of the objects in the list. 

Our project has a specific object hardcoded to be the one manipulated by the user. On different key presses, the object will be transformed accordingly. The key press mapping is as follows:

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
    
On the button down for each, a flag is set, once the button is released, the flag is set back to 0. As the 'drawObjects()' functions is continually called, if the flag is set, the corresponding variable for the selected object is updated. This data is all stored in the JavaScript object that is created for each object in the scene. In order to make sure that only one object is moved at a time, there is a variable 'MOVE_INDEX', this is the index in the list of all JavaScript objects that will have it's transformation variables updated during each call to 'drawObjects()'. Our functionality could be increased by giving the user the ability to select which object is being moved by providing buttons or a drop down menu where user input would change the value of MOVE_INDEX. 
