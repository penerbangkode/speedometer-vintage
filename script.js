let elements = {};
let speedMode = 1;
let indicators = 0;
let leftBlinkingInterval = null;
let leftBlinkActive = false;
let rightBlinkingInterval = null;
let rightBlinkActive = false;
let hazardBlinkingInterval = null;
let blinkState = false;

const onOrOff = state => state ? 'On' : 'Off';

/**
 * Updates the display of the engine state.
 *
 * @param {boolean} state If true, the engine is on; otherwise, it is off.
 * @description Sets the engine state display based on the provided boolean state.
 */
function setEngine(state) {
    elements.engine.innerText = onOrOff(state);
}

/**
 * Updates the speed display based on the current speed mode.
 * @param {number} speed - The speed value in meters per second (m/s).
 * @description Converts the speed value to the current speed mode and updates the display.
 */
function setSpeed(speed) {
    speedFinal = speed * 2.236936;
    setPointer(speedFinal); // Convert m/s to MPH for pointer
    switch(speedMode)
    {
        case 1: speed = elements.speed.innerText = `${Math.round(speed * 2.236936)}`; break; // MPH
        case 2: speed = elements.speed.innerText = `${Math.round(speed * 1.943844)}`; break; // Knots
        default: speed = elements.speed.innerText = `${Math.round(speed * 3.6)}`; // KMH
    }

    if (speedFinal < 10) {
        document.querySelector('.speed__wheel__inner').style.left = '160px';
    } else if (speedFinal > 10 && speedFinal < 100) {
        document.querySelector('.speed__wheel__inner').style.left = '155px';
    } else {
        document.querySelector('.speed__wheel__inner').style.left = '142px';
    }
}

/**
 * Updates the RPM (Revolutions Per Minute) display.
 * @param {number} rpm - The RPM value to display. (0 to 1).
 */
function setRPM(rpm) {
    // setPointer(rpm * 100);
}

/**
 * Updates the fuel level display as a percentage.
 * @param {number} fuel - The fuel level (0 to 1).
 */
function setFuel(fuel) {
    const fuelPercentage = (fuel * 100).toFixed(1);
    document.querySelector('.fuel-level').style.height = fuelPercentage + '%';
    
}

/**
 * Updates the vehicle health display as a percentage.
 * @param {number} health - The vehicle health level (0 to 1).
 */
function setHealth(health) {
    const healthPercentage = (health * 100).toFixed(1);
    document.querySelector('.engine-level').style.height = healthPercentage + '%';
}

/**
 * Updates the current gear display.
 * @param {number} gear - The current gear to display. 0 represents neutral/reverse.
 */
function setGear(gear) {
    elements.gear.innerText = String(gear);
}

/**
 * Updates the headlights status display.
 * @param {number} state - The headlight state (0: Off, 1: On, 2: High Beam).
 */
function setHeadlights(state) {
    if (state === 1 ){
        document.querySelector('.headlight-one').style.display  = 'block';
        document.querySelector('.headlight').style.display = 'none';
        document.querySelector('.headlight-second').style.display = 'none';
    } else if (state === 2) {
        document.querySelector('.headlight-one').style.display  = 'none';
        document.querySelector('.headlight').style.display = 'none';
        document.querySelector('.headlight-second').style.display = 'block';
    } else {
        document.querySelector('.headlight-one').style.display  = 'none';
        document.querySelector('.headlight').style.display = 'block';
        document.querySelector('.headlight-second').style.display = 'none';
    }
}

/**
 * Sets the state of the left turn indicator and updates the display.
 * @param {boolean} state - If true, turns the left indicator on; otherwise, turns it off.
 */
function setLeftIndicator(state) {
    indicators = (indicators & 0b10) | (state ? 0b01 : 0b00);

    if ((indicators & 0b01) && (indicators & 0b10)) {
        startHazardBlinking();
    } else if (state) {
        stopHazardBlinking();
        startLeftBlinking();
    } else {
        if (hazardBlinkingInterval && (indicators & 0b10)) {
            // Hazard was running but now only right remains
            stopHazardBlinking();
            startRightBlinking();
        } else {
            stopLeftBlinking();
        }
    }
}

/**
 * Sets the state of the right turn indicator and updates the display.
 * @param {boolean} state - If true, turns the right indicator on; otherwise, turns it off.
 */
function setRightIndicator(state) {
    indicators = (indicators & 0b01) | (state ? 0b10 : 0b00);

    if ((indicators & 0b01) && (indicators & 0b10)) {
        startHazardBlinking();
    } else if (state) {
        stopHazardBlinking();
        startRightBlinking();
    } else {
        if (hazardBlinkingInterval && (indicators & 0b01)) {
            // Hazard was running but now only left remains
            stopHazardBlinking();
            startLeftBlinking();
        } else {
            stopRightBlinking();
        }
    }
}

function startLeftBlinking() {
    stopHazardBlinking(); // Ensure hazard isn't running
    if (leftBlinkingInterval) return;
    leftBlinkingInterval = setInterval(() => {
        leftBlinkActive = !leftBlinkActive;
        document.querySelector('.left-light.on').style.display  = leftBlinkActive ? 'block' : 'none';
        document.querySelector('.left-light.off').style.display = leftBlinkActive ? 'none'  : 'block';
    }, 500);
}

function stopLeftBlinking() {
    if (!leftBlinkingInterval) return;
    clearInterval(leftBlinkingInterval);
    leftBlinkingInterval = null;
    leftBlinkActive = false;
    document.querySelector('.left-light.on').style.display  = 'none';
    document.querySelector('.left-light.off').style.display = 'block';
}

function startRightBlinking() {
    stopHazardBlinking(); // Ensure hazard isn't running
    if (rightBlinkingInterval) return;
    rightBlinkingInterval = setInterval(() => {
        rightBlinkActive = !rightBlinkActive;
        document.querySelector('.right-light.on').style.display  = rightBlinkActive ? 'block' : 'none';
        document.querySelector('.right-light.off').style.display = rightBlinkActive ? 'none'  : 'block';
    }, 500);
}

function stopRightBlinking() {
    if (!rightBlinkingInterval) return;
    clearInterval(rightBlinkingInterval);
    rightBlinkingInterval = null;
    rightBlinkActive = false;
    document.querySelector('.right-light.on').style.display  = 'none';
    document.querySelector('.right-light.off').style.display = 'block';
}

function startHazardBlinking() {
    stopLeftBlinking();
    stopRightBlinking();
    if (hazardBlinkingInterval) return;
    hazardBlinkingInterval = setInterval(() => {
        blinkState = !blinkState;
        document.querySelector('.left-light.on').style.display  = blinkState ? 'block' : 'none';
        document.querySelector('.left-light.off').style.display = blinkState ? 'none'  : 'block';
        document.querySelector('.right-light.on').style.display  = blinkState ? 'block' : 'none';
        document.querySelector('.right-light.off').style.display = blinkState ? 'none'  : 'block';
    }, 500);
}

function stopHazardBlinking() {
    if (!hazardBlinkingInterval) return;
    clearInterval(hazardBlinkingInterval);
    hazardBlinkingInterval = null;
    document.querySelector('.left-light.on').style.display  = 'none';
    document.querySelector('.left-light.off').style.display = 'block';
    document.querySelector('.right-light.on').style.display  = 'none';
    document.querySelector('.right-light.off').style.display = 'block';
}

/**
 * Updates the seatbelt status display.
 * @param {boolean} state - If true, indicates seatbelts are fastened; otherwise, indicates they are not.
 */
function setSeatbelts(state) {
    document.querySelector('.seatbelt.on').style.display  = state ? 'block' : 'none';
    document.querySelector('.seatbelt.off').style.display = state ? 'none'  : 'block';
}

/**
 * Sets the speed display mode and updates the speed unit display.
 * @param {number} mode - The speed mode to set (0: KMH, 1: MPH, 2: Knots).
 */
// function setSpeedMode(mode) {
//     speedMode = mode;
//     switch(mode)
//     {
//         case 1: elements.speedMode.innerText = 'M/PH'; break;
//         case 2: elements.speedMode.innerText = 'Knots'; break;
//         default: elements.speedMode.innerText = 'KMH';
//     }
// }

function mphToDeg(mph) {
    if (mph <= 140) {
        // First segment
        const minMph = 0;
        const minDeg = -138;
        const maxMph = 140;
        const maxDeg = 0;
        const slope = (maxDeg - minDeg) / (maxMph - minMph);
        return minDeg + (mph - minMph) * slope;
    } else {
        // Second segment
        const minMph = 140;
        const minDeg = 0;
        const maxMph = 265;
        const maxDeg = 135;
        const slope = (maxDeg - minDeg) / (maxMph - minMph);
        return minDeg + (mph - minMph) * slope;
    }
}

function setPointer(mph) {
    elements.pointer.style.transform = `rotate(${mphToDeg(mph)}deg)`;
}



// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    elements = {
        engine: document.getElementById('engine'),
        speed: document.querySelector('.speed__wheel__inner__center__text'),
        rpm: document.getElementById('rpm'),
        fuel: document.getElementById('fuel'),
        health: document.getElementById('health'),
        gear: document.getElementById('gear'),
        headlights: document.getElementById('headlights'),
        indicators: document.getElementById('indicators'),
        seatbelts: document.getElementById('seatbelts'),
        gear: document.querySelector('.speed__inner_speed_mode__text'),
        pointer: document.getElementById('pointer-img')
    };
});
