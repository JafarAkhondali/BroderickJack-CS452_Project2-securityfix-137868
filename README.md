Jack Broderick, Alison Davis
May 2, 2019
CS452 Computer Graphics
Project #2

The goal of this project was to create a realistic scene using WebGL in which the user had the ability to manipulate at least one object in the scene. We accomplished this by using multiple types of light sources, multiple plolyhedra imported from .obj files, and user interaction through the keyboard.

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


