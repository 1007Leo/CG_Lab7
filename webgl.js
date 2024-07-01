/*============= Canvas =================*/
const canvas = document.getElementById('gl1');
const gl = canvas.getContext('webgl2');

/*============= Importing objects =================*/
import { parseObj } from "./parcer/parseObj";
import { parseMtl } from "./parcer/parseMtl";

import planeTexturePaths from "./models/plane/textures/paths";
import planeObjtext from "bundle-text:./models/plane/Cirrus.obj";
import planeMtlText from "bundle-text:./models/plane/Cirrus.mtl";

import hangarTexturePaths from "./models/hangar/textures/paths";
import hangarObjtext from "bundle-text:./models/hangar/hangar.obj";
import hangarMtlText from "bundle-text:./models/hangar/hangar.mtl";

import buhankaTexturePaths from "./models/buhanka/textures/paths";
import buhankaObjtext from "bundle-text:./models/buhanka/uaz.obj";
import buhankaMtlText from "bundle-text:./models/buhanka/uaz.mtl";

import groundTexturePaths from "./models/ground/textures/paths";
import groundObjText from "bundle-text:./models/ground/ground.obj";
import groundMtlText from "bundle-text:./models/ground/ground.mtl";

import runwayTexturePaths from "./models/runway/textures/paths";
import runwayObjText from "bundle-text:./models/runway/runway.obj";
import runwayMtlText from "bundle-text:./models/runway/runway.mtl";

import towerTexturePaths from "./models/tower/textures/paths";
import towerObjText from "bundle-text:./models/tower/tower.obj";
import towerMtlText from "bundle-text:./models/tower/tower.mtl";

import old_workerTexturePaths from "./models/old_worker/textures/paths";
import old_workerObjText from "bundle-text:./models/old_worker/old_worker.obj";
import old_workerMtlText from "bundle-text:./models/old_worker/old_worker.mtl";

import fueltankTexturePaths from "./models/fueltank/textures/paths";
import fueltankObjText from "bundle-text:./models/fueltank/fueltank.obj";
import fueltankMtlText from "bundle-text:./models/fueltank/fueltank.mtl";

import fueltruckTexturePaths from "./models/fueltruck/textures/paths";
import fueltruckObjText from "bundle-text:./models/fueltruck/Gaz51_Benzin_01.obj";
import fueltruckMtlText from "bundle-text:./models/fueltruck/Gaz51_Benzin_01.mtl";

const planeObj = parseObj(planeObjtext);
const planeMtl = parseMtl(planeMtlText);

const hangarObj = parseObj(hangarObjtext);
const hangarMtl = parseMtl(hangarMtlText);

const buhankaObj = parseObj(buhankaObjtext);
const buhankaMtl = parseMtl(buhankaMtlText);

const groundObj = parseObj(groundObjText);
const groundMtl = parseMtl(groundMtlText);

const runwayObj = parseObj(runwayObjText);
const runwayMtl = parseMtl(runwayMtlText);

const towerObj = parseObj(towerObjText);
const towerMtl = parseMtl(towerMtlText);

const old_workerObj = parseObj(old_workerObjText);
const old_workerMtl = parseMtl(old_workerMtlText);

const fueltankObj = parseObj(fueltankObjText);
const fueltankMtl = parseMtl(fueltankMtlText);

const fueltruckObj = parseObj(fueltruckObjText);
const fueltruckMtl = parseMtl(fueltruckMtlText);

const models = {
    plane: {
        obj: planeObj,
        mtl: planeMtl,
        texturePaths: planeTexturePaths,
        moveMatrix: [mat4.create()]
    },
    buhanka: {
        obj: buhankaObj,
        mtl: buhankaMtl,
        texturePaths: buhankaTexturePaths,
        moveMatrix: [mat4.create()]
    },
    hangar: {
        obj: hangarObj,
        mtl: hangarMtl,
        texturePaths: hangarTexturePaths,
        moveMatrix: [mat4.create(), mat4.create(), mat4.create()]
    },
    ground: {
        obj: groundObj,
        mtl: groundMtl,
        texturePaths: groundTexturePaths,
        moveMatrix: [mat4.create()]
    },
    runway: {
        obj: runwayObj,
        mtl: runwayMtl,
        texturePaths: runwayTexturePaths,
        moveMatrix: [mat4.create()]
    },
    tower: {
        obj: towerObj,
        mtl: towerMtl,
        texturePaths: towerTexturePaths,
        moveMatrix: [mat4.create()]
    },
    old_worker: {
        obj: old_workerObj,
        mtl: old_workerMtl,
        texturePaths: old_workerTexturePaths,
        moveMatrix: [mat4.create()]
    },
    fueltank: {
        obj: fueltankObj,
        mtl: fueltankMtl,
        texturePaths: fueltankTexturePaths,
        moveMatrix: [mat4.create(), mat4.create(), mat4.create()]
    },
    fueltruck: {
        obj: fueltruckObj,
        mtl: fueltruckMtl,
        texturePaths: fueltruckTexturePaths,
        moveMatrix: [mat4.create()]
    },
    

};

/*============= Buffers ==================*/
for (const model of Object.values(models)) {
    model.obj.geometries.map(({material, data}) => {
        if (!data.texcoord) {
            data.texcoord = { value: [0, 0] };
        }

        if (!data.normal) {
            data.normal = { value: [0, 0, 1] };
        }

        const bufferData = {
            VertexPosition: data.position,
            VertexNormal: data.normal,
            TextureCoord: data.texcoord,
        };

        const bufferInfo = webglUtils.createBufferInfoFromArrays(gl, bufferData);
        data.bufferInfo = bufferInfo;
    });
};

/*============= Shaders ==================*/
// import { fsSource } from "./shader/pointPhong/fsSource";
// import { vsSource } from "./shader/pointPhong/vsSource";

import { fsSource } from "./shader/directionalPhong/fsSource"
import { vsSource } from "./shader/directionalPhong/vsSource"

const shaderProgram = webglUtils.createProgramInfo(gl, [vsSource, fsSource]);
gl.useProgram(shaderProgram.program);

/*==================== Matrices =====================*/
const FoV = (70 * Math.PI) / 180;
const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
const zNear = 0.1;
const zFar = 2000.0;
const pMatrix = mat4.create();

mat4.perspective(pMatrix, FoV, aspect, zNear, zFar);

const vMatrix = mat4.create();
const nMatrix = mat3.create();

/*==================== Camera =====================*/
let cameraOffset = [-10,4,0];
//let cameraOffset = [0,0,0];
let cameraPosition = vec3.clone(cameraOffset);

let cameraRotation = quat.create();
quat.fromEuler(cameraRotation, 0, -90, 0);

let initialCameraRotation = quat.create();
quat.copy(initialCameraRotation, cameraRotation);

const cameraSpeed = 0.5;
const cameraRotationSpeed = 0.05;

function extractRotationFromMatrix(matrix) {
    const rotationMatrix = mat3.create();
    mat3.fromMat4(rotationMatrix, matrix);
  
    mat3.transpose(rotationMatrix, rotationMatrix);
    mat3.invert(rotationMatrix, rotationMatrix);
  
    const rotationQuaternion = quat.create();
    quat.fromMat3(rotationQuaternion, rotationMatrix);
  
    return rotationQuaternion;
  }

function cameraRotateArounObj(moveMatrix) {
    const objPosition = vec3.create();
    vec3.set(objPosition, moveMatrix[12], moveMatrix[13], moveMatrix[14]);
    const objRotation = extractRotationFromMatrix(moveMatrix);

    let relativeCameraPosition = vec3.create();
    vec3.transformQuat(relativeCameraPosition, cameraOffset, objRotation);

    vec3.add(cameraPosition, objPosition, relativeCameraPosition);
    quat.multiply(cameraRotation, objRotation, initialCameraRotation);
}

function cameraMoveForward(speed=cameraSpeed) {
    const moveVector = vec3.fromValues(0, 0, -speed);
    vec3.add(lightPos, lightPos, vec3.negate(vec3.create(), moveVector));
    vec3.transformQuat(moveVector, moveVector, cameraRotation);
    vec3.add(cameraPosition, cameraPosition, moveVector);
}
function cameraMoveBackward(speed=cameraSpeed) {
    const moveVector = vec3.fromValues(0, 0, speed);
    vec3.add(lightPos, lightPos, vec3.negate(vec3.create(), moveVector));
    vec3.transformQuat(moveVector, moveVector, cameraRotation);
    vec3.add(cameraPosition, cameraPosition, moveVector);
}
function cameraMoveLeft(speed=cameraSpeed) {
    const moveVector = vec3.fromValues(-speed, 0, 0);
    vec3.add(lightPos, lightPos, vec3.negate(vec3.create(), moveVector));
    vec3.transformQuat(moveVector, moveVector, cameraRotation);
    vec3.add(cameraPosition, cameraPosition, moveVector);
}
function cameraMoveRight(speed=cameraSpeed) {
    const moveVector = vec3.fromValues(speed, 0, 0);
    vec3.add(lightPos, lightPos, vec3.negate(vec3.create(), moveVector));
    vec3.transformQuat(moveVector, moveVector, cameraRotation);
    vec3.add(cameraPosition, cameraPosition, moveVector);
}
function cameraMoveUp(speed=cameraSpeed) {
    const moveVector = vec3.fromValues(0, speed, 0);
    vec3.add(lightPos, lightPos, vec3.negate(vec3.create(), moveVector));
    vec3.transformQuat(moveVector, moveVector, cameraRotation);
    vec3.add(cameraPosition, cameraPosition, moveVector);
}
function cameraMoveDown(speed=cameraSpeed) {
    const moveVector = vec3.fromValues(0, -speed, 0);
    vec3.add(lightPos, lightPos, vec3.negate(vec3.create(), moveVector));
    vec3.transformQuat(moveVector, moveVector, cameraRotation);
    vec3.add(cameraPosition, cameraPosition, moveVector);
}
function cameraRotateUp(speed=cameraRotationSpeed) {
    quat.rotateX(cameraRotation, cameraRotation, speed);
}
function cameraRotateDown(speed=cameraRotationSpeed) {
    quat.rotateX(cameraRotation, cameraRotation, -speed);
}
function cameraRotateLeft(speed=cameraRotationSpeed) {
    quat.rotateY(cameraRotation, cameraRotation, speed);
}
function cameraRotateRight(speed=cameraRotationSpeed) {
    quat.rotateY(cameraRotation, cameraRotation, -speed);
}
function cameraRotateAroundLeft(speed=cameraRotationSpeed) {
    quat.rotateZ(cameraRotation, cameraRotation, speed);
}
function cameraRotateAroundRight(speed=cameraRotationSpeed) {
    quat.rotateZ(cameraRotation, cameraRotation, -speed);
}
/*==================== Event listener =====================*/
import { PlaneMovementController } from "./planeMovementController";

let freemode = false;
let cameraPosCopy = vec3.create();
let cameraRotCopy = quat.create();

let rotatePlaneLeft = false;
let rotatePlaneRight = false;
let rotatePlaneUp = false;
let rotatePlaneDown = false;
let seekPlaneLeft = false;
let seekPlaneRight = false;

const planeController = new PlaneMovementController(models.plane);

document.addEventListener('keyup', (e) => {
    if (e.key == "s" && !freemode) {
        rotatePlaneUp = false;
    }
    else if (e.key == "w" && !freemode) {
        rotatePlaneDown = false;
    }
    else if (e.key == "a" && !freemode) {
        rotatePlaneLeft = false;
    }
    else if (e.key == "d" && !freemode) {
        rotatePlaneRight = false;
    }
    else if (e.key == "q" && !freemode) {
        seekPlaneLeft = false;
    }
    else if (e.key == "e" && !freemode) {
        seekPlaneRight = false;
    }
})

document.addEventListener('keydown', (e) => {

    if (!freemode) {
        // plane controls
        if (e.key == "s") {
            planeController.rotateUp();
            cameraRotateArounObj(models.plane.moveMatrix[0]);
            rotatePlaneUp = true;
        }
        else if (e.key == "w") {
            planeController.rotateDown();
            cameraRotateArounObj(models.plane.moveMatrix[0]);
            rotatePlaneDown = true;
        }
        else if (e.key == "a") {
            planeController.rotateLeft();
            cameraRotateArounObj(models.plane.moveMatrix[0]);
            rotatePlaneLeft = true;
        }
        else if (e.key == "d") {
            planeController.rotateRight();
            cameraRotateArounObj(models.plane.moveMatrix[0]);
            rotatePlaneRight = true;
        }
        else if (e.key == "q") {
            planeController.seekLeft();
            cameraRotateArounObj(models.plane.moveMatrix[0]);
            seekPlaneLeft = true;
        }
        else if (e.key == "e") {
            planeController.seekRight();
            cameraRotateArounObj(models.plane.moveMatrix[0]);
            seekPlaneRight = true;
        }
        //throttle
        if (e.key == "=") {
            planeController.throttleUp();
        }
        else if (e.key == "-") {
            planeController.throttleDown();
        }
        // engine
        if (e.key == "i") {
            planeController.startStopEngine();
        }
    }

    //freemode controls
    if (e.key == "f") {
        if (!freemode) {
            vec3.copy(cameraPosCopy, cameraPosition);
            quat.copy(cameraRotCopy, cameraRotation);
            freemode = true;
        }
        else {
            vec3.copy(cameraPosition, cameraPosCopy);
            quat.copy(cameraRotation, cameraRotCopy);
            freemode = false;
            cameraRotateArounObj(models.plane.moveMatrix[0]);
        }
    }

    if (freemode) {
        if (e.ctrlKey && e.key == "ArrowRight") {
            cameraRotateRight();        
        }
        else if (e.ctrlKey && e.key == "ArrowLeft") {
            cameraRotateLeft()
        }
        else if (e.ctrlKey && e.key == "ArrowUp") {
            cameraRotateUp();
        }
        else if (e.ctrlKey && e.key == "ArrowDown") {
            cameraRotateDown();
        }
        else if (e.altKey && e.key == "ArrowRight") {
            cameraRotateAroundRight();        
        }
        else if (e.altKey && e.key == "ArrowLeft") {
            cameraRotateAroundLeft()
        }
    
        else if (e.altKey && e.key == "ArrowUp") {
            cameraMoveUp();
        }
        else if (e.altKey && e.key == "ArrowDown") {
            cameraMoveDown();
        }

        else if (e.key == "ArrowUp") {
            cameraMoveForward();
        }
        else if (e.key == "ArrowDown") {
            cameraMoveBackward();
        }
        else if (e.key == "ArrowRight") {
            cameraMoveRight();
        }
        else if (e.key == "ArrowLeft") {
            cameraMoveLeft();
        }
    }
});

/*==================== Light =====================*/
const lightPos = [-5.0, 9.0, 2.0];
// +x front
// +y up
// +z right
const lightDirection = [-0.3, 1.0, 0.3];

let shininess = 100.0;
let ambientStrength = 1;
let specularStrength = 1

let constAtt = 1.0;
let linAtt = 0.0;
let qAtt = 0.001;

const lightUniforms = {
    uLightPosition: lightPos,
    uLightDirection: lightDirection,

    uAmbientLightColor: [0.1, 0.1, 0.1],
    uDiffuseLightColor: [1.0, 1.0, 1.0],
    uSpecularLightColor: [1.0, 1.0, 1.0],
    uShininess: shininess,
    
    uConstAtt: constAtt,
    uLinAtt: linAtt,
    uQAtt: qAtt,

    uAmbinetStrength: ambientStrength,
    uSpecularStrength: specularStrength,
  };

/*==================== Textures =====================*/
function create1PixelTexture(gl, pixel) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(pixel));
    return texture;
}

function isPowerOf2(value) {
    return (value & (value - 1)) === 0;
}
  
function createTexture(gl, url) {
    const texture = create1PixelTexture(gl, [128, 192, 255, 255]);
    // Asynchronously load an image
    const image = new Image();
    image.src = url;
    image.addEventListener('load', function() {
        // Now that the image has loaded make copy it to the texture.
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,gl.UNSIGNED_BYTE, image);

        // Check if the image is a power of 2 in both dimensions.
        if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
            // Yes, it's a power of 2. Generate mips.
            gl.generateMipmap(gl.TEXTURE_2D);
        } 
        else {
            // No, it's not a power of 2. Turn of mips and set wrapping to clamp to edge
            // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        }
    });
    return texture;
}

const textures = {
    defaultWhite: create1PixelTexture(gl, [255, 255, 255, 0]),
    defaultNormal: create1PixelTexture(gl, [127, 127, 255, 0]),
};

for (const model of Object.values(models)) {
    if (model.mtl != null)
    for (const material of Object.values(model.mtl)) {
        Object.entries(material)
            .filter(([key]) => key.endsWith('Map'))
            .forEach(([key, filename]) => {
                let texture = textures[filename];
                if (!texture) {
                texture = createTexture(gl, model.texturePaths[filename]);
                textures[filename] = texture;
                }
                material[key] = texture;
            });
    }
}

/*==================== Settings =====================*/
// webglLessonsUI.setupSlider("#AmbientStrength", {value: ambientStrength, slide: updateAmbientStrength, min: -30, max: 30, precision: 2, step: 0.01});

// function updateAmbientStrength(event, ui) {
//     lightUniforms.uAmbinetStrength = ui.value;
// }

// webglLessonsUI.setupSlider("#SpecularStrength", {value: specularStrength, slide: updateSpecularStrength, min: 0, max: 30, precision: 2, step: 0.01});

// function updateSpecularStrength(event, ui) {
//     lightUniforms.uSpecularStrength = ui.value;
// }

// webglLessonsUI.setupSlider("#LightX", {value: lightPos[0], slide: updateLightX, min: -20, max: 20, precision: 2, step: 0.1});
// webglLessonsUI.setupSlider("#LightY", {value: lightPos[1], slide: updateLightY, min: -20, max: 20, precision: 2, step: 0.1});
// webglLessonsUI.setupSlider("#LightZ", {value: lightPos[2], slide: updateLightZ, min: -20, max: 20, precision: 2, step: 0.1});

// function updateLightX(event, ui) {
//     lightPos[0] = ui.value;
// }
// function updateLightY(event, ui) {
//     lightPos[1] = ui.value
// }
// function updateLightZ(event, ui) {
//     lightPos[2] = ui.value
// }

// webglLessonsUI.setupSlider("#Shininess", {value: shininess, slide: updateShininess, min: 0.5, max: 400, precision: 2, step: 0.5});

// function updateShininess(event, ui) {
//     lightUniforms.uShininess = ui.value
// }

// // Attenuation
// webglLessonsUI.setupSlider("#Constant", {value: constAtt, slide: updateConstAtt, min: 0, max: 5, precision: 2, step: 0.01});
// webglLessonsUI.setupSlider("#Linear", {value: linAtt, slide: updateLinAtt, min: 0, max: 2, precision: 3, step: 0.001});
// webglLessonsUI.setupSlider("#Quadratic", {value: qAtt, slide: updateQAtt, min: 0, max: 1, precision: 3, step: 0.001});

// function updateConstAtt(event, ui) {
//     lightUniforms.uConstAtt = ui.value
// }
// function updateLinAtt(event, ui) {
//     lightUniforms.uLinAtt = ui.value
// }
// function updateQAtt(event, ui) {
//     lightUniforms.uQAtt = ui.value
// }

// var continiousRotation = false;
// function updateRotationCheckbox() {
//     continiousRotation = document.getElementById("rotation").checked;
// }

// document.getElementById("rotation").addEventListener("change", updateRotationCheckbox);

/*==================== Drawing =====================*/
function initialSetup(moveMatrix, translation=[0,0,0], rotation=[0,0,0], scale=[1,1,1]) {
    if (moveMatrix == null) return;
    mat4.translate(moveMatrix, moveMatrix, translation);
    mat4.rotateY(moveMatrix, moveMatrix, rotation[1]);
    mat4.rotateX(moveMatrix, moveMatrix, rotation[0]);
    mat4.rotateZ(moveMatrix, moveMatrix, rotation[2]);
    mat4.scale(moveMatrix, moveMatrix, scale);
}

function drawObj(model) {
    if (model == null) return;

    model.obj.geometries.forEach(object => {
        let texture = textures.defaultWhite;
        if (model.mtl != null) {
            texture = model.mtl[object.material].diffuseMap;
        }
        gl.activeTexture(gl[`TEXTURE${0}`]);
        gl.bindTexture(gl.TEXTURE_2D, texture);

        webglUtils.setBuffersAndAttributes(gl, shaderProgram, object.data.bufferInfo);

        model.moveMatrix.forEach (modelMoveMatrix => {
            const vMatrixCopy = mat4.create();
            mat4.copy(vMatrixCopy, vMatrix);
            mat4.multiply(vMatrix, vMatrix, mat4.multiply(mat4.create, modelMoveMatrix, object.moveMatrix));
            mat3.normalFromMat4(nMatrix, vMatrix);

            const matricesUniforms = {
                uProjectionMatrix: pMatrix,
                uModelViewMatrix: vMatrix,
                uNormalMatrix: nMatrix,
            };
            webglUtils.setUniforms(shaderProgram, matricesUniforms);

            webglUtils.drawBufferInfo(gl, object.data.bufferInfo);

            mat4.copy(vMatrix, vMatrixCopy);
            mat3.normalFromMat4(nMatrix, vMatrix);
        });
    });
}

function getRotationFromMatrix(moveMatrix) {
    var sy = Math.sqrt(moveMatrix[0] * moveMatrix[0] + moveMatrix[1] * moveMatrix[1]);
    
    var x = Math.atan2(moveMatrix[6], moveMatrix[10]);
    var y = Math.atan2(-moveMatrix[2], sy);
    var z = Math.atan2(moveMatrix[1], moveMatrix[0]);
    
    return [x, y, z];
}

// translation to center - x, z, y
function animateObject(model, objName, translationToCenter, axis, rotationSpeed, maxRotation) {
    const object = model.obj.geometries.find(item => item.object == objName);
    
    if (maxRotation != null) {
        let rotation = getRotationFromMatrix(object.moveMatrix);
        let i = 0
        rotation.forEach(angle => {
            if (maxRotation[i] != 0 && Math.abs(angle + rotationSpeed) > Math.abs(maxRotation[i])) {
                axis[i] = 0;
                angle = maxRotation[i]-0.1;
            }
            i++;
        });
    }

    mat4.translate(object.moveMatrix, object.moveMatrix, vec3.negate(vec3.create(), translationToCenter));
    mat4.rotate(object.moveMatrix, object.moveMatrix, rotationSpeed, axis);
    mat4.translate(object.moveMatrix, object.moveMatrix, translationToCenter);
}

function revertAnimation(model, objName, translationToCenter, axis, rotationSpeed) {
    const object = model.obj.geometries.find(item => item.object == objName);
    let rotation = getRotationFromMatrix(object.moveMatrix);

    let i = 0
    rotation.forEach(angle => {
        if (axis[i] != 0)
            rotationSpeed *= -Math.sign(angle);
        if (Math.sign(angle) != Math.sign(angle + rotationSpeed)) {
            angle = 0;
            axis[i] = 0;
        }
        i++;
    });

    mat4.translate(object.moveMatrix, object.moveMatrix, vec3.negate(vec3.create(), translationToCenter));
    mat4.rotate(object.moveMatrix, object.moveMatrix, rotationSpeed, axis);
    mat4.translate(object.moveMatrix, object.moveMatrix, translationToCenter);
}

const buhankaStates = {
    moveFowrard: "moveForward",
    return: "return",
    rotateLeft1: "rotateLeft1",
    rotateRight1: "rotateRight1",
    rotateLeft2: "rotateLeft2",
    rotateRight2: "rotateRight2",
};

let currentState = buhankaStates.moveFowrard;
let cumulativeRotated = 0;
let cumulativeMoved = 0;

function updateBuhanka() {
    let speed = 0.05;
    let rotationSpeed = 0.01;
    let moveMatrix = models.buhanka.moveMatrix[0];
    // let position = vec3.fromValues(moveMatrix[12], moveMatrix[13], moveMatrix[14]);
    // let rotation = getRotationFromMatrix(moveMatrix);
    
    if (currentState == buhankaStates.moveFowrard) {
        if (cumulativeMoved < 31) {
            mat4.translate(moveMatrix, moveMatrix, [0, 0, speed]);
            cumulativeMoved += speed;
        }
        else {
            cumulativeMoved = 0;
            currentState = buhankaStates.rotateRight1;
        }
    }
    if (currentState == buhankaStates.rotateRight1) {
        if (cumulativeRotated < Math.PI/2) {
            mat4.rotateY(moveMatrix, moveMatrix, -rotationSpeed);
            mat4.translate(moveMatrix, moveMatrix, [0,0,speed]);
            cumulativeRotated += rotationSpeed;
        }
        else {
            cumulativeRotated = 0;
            cumulativeMoved = -10;
            currentState = buhankaStates.rotateLeft1;
        }
    }
    if (currentState == buhankaStates.rotateLeft1) {
        if (cumulativeRotated < 3 * (Math.PI/2)) {
            mat4.rotateY(moveMatrix, moveMatrix, rotationSpeed);
            mat4.translate(moveMatrix, moveMatrix, [0,0,speed]);
            cumulativeRotated += rotationSpeed;
        }
        else {
            cumulativeRotated = 0;
            currentState = buhankaStates.return;
        }
    }
    if (currentState == buhankaStates.return) {
        if (cumulativeMoved < 31) {
            mat4.translate(moveMatrix, moveMatrix, [0, 0, speed]);
            cumulativeMoved += speed;
        }
        else {
            cumulativeMoved = 0;
            currentState = buhankaStates.rotateLeft2;
        }
    }
    if (currentState == buhankaStates.rotateLeft2) {
        if (cumulativeRotated < Math.PI/2) {
            mat4.rotateY(moveMatrix, moveMatrix, rotationSpeed);
            mat4.translate(moveMatrix, moveMatrix, [0,0,speed]);
            cumulativeRotated += rotationSpeed;
        }
        else {
            cumulativeRotated = 0;
            cumulativeMoved  = -10;
            currentState = buhankaStates.rotateRight2;
        }
    }
    if (currentState == buhankaStates.rotateRight2) {
        if (cumulativeRotated < 3 * (Math.PI/2)) {
            mat4.rotateY(moveMatrix, moveMatrix, -rotationSpeed);
            mat4.translate(moveMatrix, moveMatrix, [0,0,speed]);
            cumulativeRotated += rotationSpeed;
        }
        else {
            cumulativeRotated = 0;
            currentState = buhankaStates.moveFowrard;
        }
    }
}

// >x further
// >y higher
// >z more to the right
initialSetup(models.plane.moveMatrix[0], [0,0,0], [0,0,0])
initialSetup(models.buhanka.moveMatrix[0], [20,1.5,20], [0,Math.PI/2,0], [3,3,3]);

initialSetup(models.hangar.moveMatrix[0], [40,0,40], [0,0,0], [1.5,1.5,1.5]);
initialSetup(models.hangar.moveMatrix[1], [70,0,40], [0,0,0], [1.5,1.5,1.5]);
initialSetup(models.hangar.moveMatrix[2], [100,0,40], [0,0,0], [1.5,1.5,1.5]);

initialSetup(models.runway.moveMatrix[0], [90,0.05,0], [0,Math.PI/2,0], [1,1,1]);
initialSetup(models.ground.moveMatrix[0], [0,0,0], [0,0,0], [2000,2000,2000]);

initialSetup(models.tower.moveMatrix[0], [130, 0, -30], [0,0,0], [0.5,0.5,0.5]);


initialSetup(models.fueltank.moveMatrix[0], [10, 0, -30], [0,0,0],[2,2,2]);
initialSetup(models.fueltank.moveMatrix[1], [15, 0, -30], [0,0,0],[2,2,2]);
initialSetup(models.fueltank.moveMatrix[2], [20, 0, -30], [0,0,0],[2,2,2]);

initialSetup(models.fueltruck.moveMatrix[0], [25, 0, -20], [0,-0.5,0], [1.5, 1.5, 1.5]);
initialSetup(models.old_worker.moveMatrix[0], [22, 0, -20], [0, -Math.PI/4, 0], [1.2, 1.2, 1.2]);

console.log(models);

// let time_old = 0;
// let dt = 0
const animate = function(time) {
    // dt = time - time_old;
    // time_old = time;

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clearColor(135/255, 206/255, 235/255, 1.0);
    gl.clearDepth(1.0);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

// camera movement update
    mat4.fromRotationTranslation(vMatrix, cameraRotation, cameraPosition);
    mat4.invert(vMatrix, vMatrix);

// fix light rotation when moving camera
    let cameraRotationMatrix = mat4.create();
    mat4.fromQuat(cameraRotationMatrix, cameraRotation);
    let cameraWorldToLocal = mat4.create();
    mat4.invert(cameraWorldToLocal, cameraRotationMatrix);
    let lightDirectionInCameraSpace = vec3.create();
    vec3.transformMat4(lightDirectionInCameraSpace, lightDirection, cameraWorldToLocal);

    lightUniforms.uLightDirection = lightDirectionInCameraSpace;

// setting light uniforms
    webglUtils.setUniforms(shaderProgram, lightUniforms);

// update plane
    planeController.update();
    if (!freemode)
        cameraRotateArounObj(models.plane.moveMatrix[0]);
    //mat4.copy(models.plane.moveMatrix[0], planeController.update());

// plane animation
    if (planeController.engineStarted)
        animateObject(models.plane, "Prop1", [-3.65, -1.9, 0], [1,0,0], planeController.throttle + 0.2);
    
    if (rotatePlaneDown)
        animateObject(models.plane, "Elevator21", [6.1, -1.91, 0], [0,0,1], 0.02, [0, 0, 0.5]);
    else if (rotatePlaneUp)
        animateObject(models.plane, "Elevator21", [6.1, -1.91, 0], [0,0,1], -0.02, [0, 0, 0.5]);
    else if (!rotatePlaneDown && !rotatePlaneUp)
        revertAnimation(models.plane, "Elevator21", [6.1, -1.91, 0], [0,0,1], 0.02);

    if (rotatePlaneLeft) {
        animateObject(models.plane, "Aileron1.002", [0.5, -1.64, -5.28], [0,0,1], -0.03, [0, 0, 0.7]);
        animateObject(models.plane, "Aileron1.003", [0.5, -1.64, 5.28], [0,0,1], 0.03, [0, 0, 0.7]);
    }
    else if (rotatePlaneRight) {
        animateObject(models.plane, "Aileron1.002", [0.5, -1.64, -5.28], [0,0,1], 0.03, [0, 0, 0.7]);
        animateObject(models.plane, "Aileron1.003", [0.5, -1.64, 5.28], [0,0,1], -0.03, [0, 0, 0.7]);
    }
    else if (!rotatePlaneLeft && !rotatePlaneRight) {
        revertAnimation(models.plane, "Aileron1.002", [0.5, -1.64, -5.28], [0,0,1], 0.03);
        revertAnimation(models.plane, "Aileron1.003", [0.5, -1.64, 5.28], [0,0,1], 0.03);
    }

    if (seekPlaneLeft)
        animateObject(models.plane, "Rudder1", [7, -3.75, 0], [0, 1, 0], -0.007, [0, 0.2, 0]);
    else if (seekPlaneRight)
        animateObject(models.plane, "Rudder1", [7, -3.75, 0], [0, 1, 0], 0.007, [0, 0.2, 0]);
    else if (!seekPlaneLeft && ! seekPlaneRight)
        revertAnimation(models.plane, "Rudder1", [7, -3.75, 0], [0, 1, 0], 0.007);

// buhanka animation
    updateBuhanka();

// drawing
    drawObj(models.plane);
    drawObj(models.hangar);
    drawObj(models.buhanka);
    drawObj(models.ground);
    drawObj(models.runway);
    drawObj(models.tower);
    drawObj(models.old_worker);
    drawObj(models.fueltank);
    drawObj(models.fueltruck);

    window.requestAnimationFrame(animate);
}
animate(0);
