/** Global Parameters Object */
const params = {
    CANVAS_SIZE: 1000,
    DB: "testDB",
    DB_COLLECTION: "NEATtests",
    GEN_TO_SAVE: 40,
    GENOME_DB: "test",
    GENOME_DB_COLLECTION: "NEATGenomeTests1",
    AUTO_SAVE_GENOME: false,
    GEN_TO_SAVE_GENOME: 100,
    GEN_TICKS: 700,
    AGENT_NEIGHBORS: true,
    FOOD_AGENT_RATIO: 1,
    POISON_AGENT_RATIO: 0,
    COMPAT_THRESH: 0.07,
    ENFORCE_MIN_FOOD: true,
    ENFORCE_MIN_POISON: false,
    AGENT_VISION_RADIUS: 500,
    RAND_FOOD_PHASES: false,
    RAND_FOOD_LIFETIME: false,
    FREE_RANGE: false,
    SPLIT_SPECIES: true,
    RAND_DEFAULT_WEIGHTS: true,
    AGENT_NEIGHBOR_COUNT: 5,
    FITNESS_CALORIES: 10,
    FITNESS_BUMPING_INTO_WALL: 0,
    FITNESS_OUT_OF_BOUND: -2,
    FITNESS_POTENTIAL_CALORIES: 0,
    FITNESS_HUNTING_PREY: 50,
    FITNESS_PERCENT_DEAD: 0,
    FITNESS_ENERGY_EFFICIENCY: 0,
    FITNESS_WINNER_BONUS: 50,

    NO_DECAYING_FOOD: true,
    CALORIES_PER_FOOD: 50,
    INNER_WALL: false,
    NUM_AGENTS: 50,
    AGENT_PER_WORLD: 2,
    DYNAMIC_AGENT_SIZING: false,
    AGENT_VISION_RAYS: 13,
    AGENT_VISION_ANGLE: 180,
    AGENT_VISION_IS_CONE: true,
    AGENT_VISION_DRAW_CONE: false,
    MAX_TICKS_TO_CONSUME: 50,
    COOLDOWN_TO_REGEN: 100,
    EVOLVE_K_AND_M: true,
    TICK_TO_UPDATE_CURRENT_GEN_DATA: 0,
    AGENT_BITING: false,
    GENOME_DEFAULT_K_VAL: 0.75,
    NO_BORDER: false,
    DISPLAY_SAME_WORLD: false,
    DISPLAY_MINIMAP: true,
    LARGE_ENERGY_THRESHOLD: false,
    SIM_TRIAL_NUM: 3,
    SIM_CURR_TRIAL: 1,
    SAVE_TO_DB: false,
    MOVING_FOOD: false,
    MOVING_FOOD_PATTERN: "drunkenSailor",
    RANDOMIZE_FOOD_SPAWN_PATTERN: true,
    FOOD_VELOCITY_X: 1,
    FOOD_VELOCITY_Y: 1,
    SIM_PAUSE: false,
    PAUSE_DRAWING: false,
    HUNTING_MODE: "hierarchy",
    AGENT_MAX_SPEED: 5,
    PREY_MAX_SPEED: 5,
    PREDATOR_MAX_SPEED: 5,
    AGENT_DIAMETER: 15,
    FOOD_DIAMETER: 24,
    GRADUAL_CONSUMPTION: true,
    GRADUAL_CONSUMPTION_RESPAWN: true,
    MIRROR_ROLES: true,
    BUSH_SIGHT_MODE: "solid",
    INACTIVE_PREY_TARGETABLE: true,
    PUSH_FHI_TO_ANN: true,
    MODVISION: false,
    PREDGOOD: false,
};

const agentTrackerAttributesToCollect = [
    "avgFitness", "avgEnergySpent", "avgPercDead", "avgPredWinnerBonus",
    "totalPreyHuntedCount", "totalFoodConsumptionCount", "totalTicksOutOfBounds",
    "totalTicksOutOfBounds_Prey", "totalTicksOutOfBounds_Predator", "totalCaloriesConsumedAsPrey"
];

const getMedian = (arr) => {
    arr.sort((a, b) => a - b);
    if (arr.length % 2 !== 0) {
        return arr[Math.floor(arr.length / 2)];
    } else {
        return getMean(arr.slice(Math.floor(arr.length / 2), Math.floor(arr.length / 2) + 2));
    }
};

const getMean = (arr) => {
    if (arr.length === 0) return 0;
    const total = arr.reduce((curr, acc) => acc + curr, 0);
    return total / arr.length;
};

const eqThrsh = (a, b, threshold = 0.00001) => Math.abs(a - b) < threshold;

/**
 * @param {Number} n
 * @returns Random Integer Between 0 and n-1
 */
const randomInt = (n) => Math.floor(Math.random() * n);

/**
 * @param {Number} n
 * @returns Random Float Between 0 and n-1
 */
const randomFloat = (n) => Math.random() * n;

/**
 * Uses Box-Muller transform to generate random numbers that produce a normal distribution
 * @param {Number} min 
 * @param {Number} max 
 * @returns random float between min and max that follows a normal distribution
 */
const randomFloatUniform = (min, max) => {
    let u1 = Math.random();
    if (u1 == 0) u1 = 0.000000001;
    let u2 = Math.random();
    let z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2) * 0.1 + 0.5;

    let res = z * (max - min) + min;
    if (res > max) res = max;
    if (res < min) res = min;
    return res;
}

/**
 * @param {Number} r Red Value
 * @param {Number} g Green Value
 * @param {Number} b Blue Value
 * @returns String that can be used as a rgb web color
 */
const rgb = (r, g, b) => `rgba(${r}, ${g}, ${b})`;

/**
 * @param {Number} r Red Value
 * @param {Number} g Green Value
 * @param {Number} b Blue Value
 * @param {Number} a Alpha Value
 * @returns String that can be used as a rgba web color
 */
const rgba = (r, g, b, a) => `rgba(${r}, ${g}, ${b}, ${a})`;

/**
 * @param {Number} h Hue
 * @param {Number} s Saturation
 * @param {Number} l Lightness
 * @returns String that can be used as a hsl web color
 */
const hsl = (h, s, l) => `hsl(${h}, ${s}%, ${l}%)`;

/** Creates an alias for requestAnimationFrame for backwards compatibility */
window.requestAnimFrame = (() => {
    return (
        window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        /**
         * Compatibility for requesting animation frames in older browsers
         * @param {Function} callback Function
         * @param {DOM} element DOM ELEMENT
         */
        ((callback, element) => {
            window.setTimeout(callback, 1000 / 60);
        })
    );
})();

/**
 * Returns distance from two points
 * @param {Number} p1, p2 Two objects with x and y coordinates
 * @returns Distance between the two points
 */
const distance = (p1, p2) => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
};

/**
 * Shuffles a provided array
 * @param {Array} a the array to be shuffled
 * @returns a shuffled copy of the array
 */
const shuffleArray = (a) => [...a].sort(() => Math.random() - 0.5);

/**
 *
 * @param {object} array array of html elements you want to put in slideshow
 * @param {String} id id of slideshow holder
 */
const createSlideShow = (array, id) => {
    const indicatorContainer = document.getElementById(`${id}-indicators`);
    const carouselContainer = document.getElementById(`${id}-carousel`);
    let activeSlide = 0;
    // check which slide was active before
    if (indicatorContainer.firstChild) {
        // first remove existing data
        while (indicatorContainer.firstChild) {
            indicatorContainer.removeChild(indicatorContainer.lastChild);
        }
        let count = 0;
        while (carouselContainer.firstChild) {
            if (
                carouselContainer.firstChild.classList &&
                carouselContainer.firstChild.classList.contains('active')
            ) {
                activeSlide = Math.min(count, array.length - 1);
            }
            carouselContainer.removeChild(carouselContainer.firstChild);
            count++;
        }
    }
    if (array.length < 1) {
        return;
    }

    array.forEach((elem, i) => {
        const indButton = document.createElement('button');

        indButton.setAttribute(
            'id',
            `carousel-button-slide-${i}`
        );
        indButton.setAttribute('type', 'button');
        indButton.setAttribute(
            'data-bs-target',
            `#carousel${id.charAt(0).toUpperCase() + id.slice(1)}Indicators`
        );
        indButton.setAttribute('data-bs-slide-to', `${i}`);
        if (i == activeSlide) {
            indButton.setAttribute('class', 'active');
            indButton.setAttribute('aria-current', 'true');
            PopulationManager.CURRENT_WORLD_DISPLAY = i;
        }
        indButton.setAttribute('style', 'background-color: black');
        indButton.setAttribute('aria-current', 'true');
        indButton.setAttribute('aria-label', `Slide ${i + 1}`);
        indicatorContainer.appendChild(indButton);
    });

    let count = 0;

    array.forEach((elem) => {
        const div = document.createElement('div');
        div.setAttribute(

            'class',
            `carousel-item${count == activeSlide ? ' active' : ''}`
        );

        div.setAttribute('data-bs-interval', '999999999');
        div.setAttribute('id', `worldCanvas${elem.id}`);
        elem.canvas.style = `
            display:flex; 
            margin: 0 auto;
            border: 1px solid black;
        `;
        div.appendChild(elem.canvas);
        carouselContainer.appendChild(div);
        count++;
    });
};



/**
 * Check whether a coordinate is out of bound of the map
 * Return true if out of bound
 * Return false if not
 */
const isOutOfBound = (x, y = params.CANVAS_SIZE / 2, buffer = 0) => {
    if (x - buffer < 0 || x > params.CANVAS_SIZE - buffer) {
        return true;
    }
    if (y - buffer < 0 || y > params.CANVAS_SIZE - buffer) {
        return true;
    }
    return false;
}

const execAsync = (fun) => {
    setTimeout(() => {
        fun;
    }, 0)
};

const logData = (data, dataBase, dbCollection, extraElements = false) => {
    if (extraElements) {
        data = {
            genomes: data,
            ...extraElements
        }
    }
    let payload = {
        db: dataBase,
        collection: dbCollection,
        data: data
    }

    console.log(payload);

    if (socket) {
        socket.emit("insert", payload);
        console.log("inserted data to db");
    } else {
        console.error("Insertion failed... no socket.io detected :'(");
    }
}

