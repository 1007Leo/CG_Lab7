class PlaneMovementController {
    constructor(planeModel) {
        this.moveMatrix = planeModel.moveMatrix[0];
        this.rotation = getRotationFromMatrix(this.moveMatrix);
        this.position = vec3.fromValues(this.moveMatrix[12], this.moveMatrix[13], this.moveMatrix[14]);

        this.previousHeight = 0.0;

        this.speed = 0.0;
        this.maxSpeed = 2;
        
        this.rotationSpeed = 0.0;

        // this.rollSpeed = 0.0;
        
        this.seekSpeed = 0.0
        this.maxSeekSpeed = 0.01;

        this.throttle = 0.0;
        this.throttleStep = 0.1;
        this.maxSpeedPerThrottle = 0.
        
        this.stallSpeed = 0.4;

        this.engineStarted = false;
    }

    update() {
        // make parameters non negative
        if (this.speed < 0)
            this.speed = 0;
        if (this.rotationSpeed < 0)
            this.rotationSpeed = 0;
        if (this.throttle < 0)
            this.throttle = 0;
        if (this.maxSpeedPerThrottle < 0)
            this.maxSpeedPerThrottle = 0;

        // check collision with ground
        if (this.position[1] < 0) {
            mat4.rotateZ(this.moveMatrix, this.moveMatrix, -this.rotation[2]);
            mat4.rotateX(this.moveMatrix, this.moveMatrix, -this.rotation[0]);
            this.moveMatrix[13] = 0;
        }

        // change speed in relation to orientation
        let deltaSpeed = (this.position[1] - this.previousHeight) * 0.01;
        this.speed -= deltaSpeed;
        // if (this.speed == 0 && this.position[1] > 0.01)
        //     this.speed += 0.0;


        // stall
        if (this.speed < this.stallSpeed && this.position[1] > 0.01) {
            mat4.rotateZ(this.moveMatrix, this.moveMatrix, -this.rotation[2]);
            mat4.rotateX(this.moveMatrix, this.moveMatrix, -this.rotation[0]);
            mat4.rotateY(this.moveMatrix, this.moveMatrix, -this.rotation[1]);

            if (this.rotation[2] > -Math.PI/2) {
                mat4.rotateZ(this.moveMatrix, this.moveMatrix, -0.005 / (this.speed + 1));
            }


            mat4.rotateY(this.moveMatrix, this.moveMatrix, this.rotation[1]);
            mat4.rotateX(this.moveMatrix, this.moveMatrix, this.rotation[0]);
            mat4.rotateZ(this.moveMatrix, this.moveMatrix, this.rotation[2]);
        }

        // activate rotation
        if (this.speed > this.stallSpeed)
            this.rotationSpeed = 0.02;
        // if (this.position[1] != 0)
        //     this.rollSpeed = 0.02;
        if (this.seekSpeed < this.maxSeekSpeed)
            this.seekSpeed = this.speed / 20;


        this.previousHeight = this.position[1];

        if (this.speed > this.maxSpeed)
            this.speed = this.maxSpeed;

        // move plane accordingly
        mat4.translate(this.moveMatrix, this.moveMatrix, [this.speed, 0, 0]);


        
        // slow down
        if (this.speed > this.maxSpeedPerThrottle && this.speed > 0)
            this.speed -= 0.0007;

        this.rotation = getRotationFromMatrix(this.moveMatrix);
        this.position = vec3.fromValues(this.moveMatrix[12], this.moveMatrix[13], this.moveMatrix[14]);

        // actions with active engine next
        if (!this.engineStarted)
            return;
        // speed up
        this.maxSpeedPerThrottle = this.throttle;
        if (this.speed < this.maxSpeedPerThrottle)
            this.speed += 0.001;

    }

    startStopEngine() {
        this.engineStarted = !this.engineStarted;
        if (!this.engineStarted)
            this.maxSpeedPerThrottle = 0;
    }

    throttleUp() {
        if (this.throttle < 1) {
            this.throttle += this.throttleStep;
            this.maxSpeedPerThrottle += this.throttle * 10;
        }
    }
    throttleDown() {
        if (this.throttle > 0) {
            this.throttle -= this.throttleStep;
            this.maxSpeedPerThrottle -= this.throttle * 10;
        }
    }

    rotateLeft() {
        mat4.rotateX(this.moveMatrix, this.moveMatrix, -this.rotationSpeed)
    }
    rotateRight() {
        mat4.rotateX(this.moveMatrix, this.moveMatrix, this.rotationSpeed)
    }
    rotateUp() {
        mat4.rotateZ(this.moveMatrix, this.moveMatrix, this.rotationSpeed)
    }
    rotateDown() {
        mat4.rotateZ(this.moveMatrix, this.moveMatrix, -this.rotationSpeed)
    }
    seekLeft() {
        mat4.rotateY(this.moveMatrix, this.moveMatrix, this.seekSpeed)
    }
    seekRight() {
        mat4.rotateY(this.moveMatrix, this.moveMatrix, -this.seekSpeed)
    }
}

function getRotationFromMatrix(moveMatrix) {
    var sy = Math.sqrt(moveMatrix[0] * moveMatrix[0] + moveMatrix[1] * moveMatrix[1]);
    
    var x = Math.atan2(moveMatrix[6], moveMatrix[10]);
    var y = Math.atan2(-moveMatrix[2], sy);
    var z = Math.atan2(moveMatrix[1], moveMatrix[0]);
    
    return [x, y, z];
}

export {PlaneMovementController};