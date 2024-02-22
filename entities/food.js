/**
 * The main class for Food and Food behaviors/lifecycles
 * 
 * @author Parker Rosengreen and Artem Potafiy
 */
class Food {
    static MOVING_DESTINATION = [
        { x: params.CANVAS_SIZE / 2, y: params.CANVAS_SIZE / 25 }, //North
        { x: params.CANVAS_SIZE - params.CANVAS_SIZE / 25, y: params.CANVAS_SIZE / 2 }, //East
        { x: params.CANVAS_SIZE / 2, y: params.CANVAS_SIZE - params.CANVAS_SIZE / 25 }, //South
        { x: params.CANVAS_SIZE / 25, y: params.CANVAS_SIZE / 2 }, //West
    ];

    /**
     * Creates a new Food
     * 
     * @param {*} x the center x position 
     * @param {*} y the center y position
     * @param {*} isPoison indicates whether this food is poisonous or not
     * @param {*} foodTracker the food tracker to monitor this food
     */
    constructor(game, x, y, isPoison, foodTracker, worldId = 0) {
        Object.assign(this, { x, y, isPoison, game, foodTracker, worldId });
        if (!this.isPoison) this.foodTracker.addFood(); // counts how many foods per generation
        this.tickCounter = 0; // a simple tick counter to manage lifecycle phases for this food

        /**
         * the number of ticks in this food's entire lifetime
         * if RAND_FOOD_LIFETIME is enabled, this value is random and at least half of a generation
         * otherwise, this value is a full generation (GEN_TICKS)
         */
        this.lifecycleTicks = params.RAND_FOOD_LIFETIME ? randomInt(params.GEN_TICKS / 2 + 1) + params.GEN_TICKS / 2 : params.GEN_TICKS;

        /** An enumeration object for this food's lifecycle stages 
         * NOTE: other code such as the fitness function for the agent assumes dead is the final stage
        */
        this.lifecycle_phases = {
            seed: 0,
            adolescent: 1,
            adult: 2,
            decaying: 3,
            dead: 4,
        };

        this.phase = this.lifecycle_phases.seed; // start out as a seed
        let phase_ticks = this.createLifecyclePhaseTicks(); // an array of tick counts to determine how long this food lasts during each lifecycle phase

        //Original properties
        this.phase_properties = [ // configures the ticks, visual properties, calories, and set state for this food's individual lifecycle phases
            {
                ticks: phase_ticks[0],
                radius: 7,
                color: this.isPoison ? 120 : 270,
                calories: 50,
                isSet: false,
            },
            {
                ticks: phase_ticks[1],
                radius: 9,
                color: this.isPoison ? 90 : 300,
                calories: 100,
                isSet: false,
            },
            {
                ticks: phase_ticks[2],
                radius: 12,
                color: this.isPoison ? 60 : 330,
                calories: 150,
                isSet: false,
            },
            {
                ticks: phase_ticks[3],
                radius: 12,
                color: 30,
                calories: -200,
                isSet: false,
            },
        ];

        //Equalized all the phase, no decaying food
        if (params.NO_DECAYING_FOOD) {
            this.phase_properties = [ // configures the ticks, visual properties, calories, and set state for this food's individual lifecycle phases
                {
                    ticks: phase_ticks[0],
                    radius: params.FOOD_DIAMETER / 2,
                    color: this.isPoison ? 60 : 330,
                    calories: params.CALORIES_PER_FOOD,
                    isSet: false,
                },
                {
                    ticks: phase_ticks[1],
                    radius: params.FOOD_DIAMETER / 2,
                    color: this.isPoison ? 60 : 330,
                    calories: params.CALORIES_PER_FOOD,
                    isSet: false,
                },
                {
                    ticks: phase_ticks[2],
                    radius: params.FOOD_DIAMETER / 2,
                    color: this.isPoison ? 60 : 330,
                    calories: params.CALORIES_PER_FOOD,
                    isSet: false,
                },
                {
                    ticks: phase_ticks[3],
                    radius: params.FOOD_DIAMETER / 2,
                    color: 330,
                    calories: params.CALORIES_PER_FOOD,
                    isSet: false,
                },
            ];
        }

        /** Sets the number of ticks left until this food transitions to its next lifecycle phase */
        this.ticksToNext = this.phase_properties[this.lifecycle_phases.seed].ticks;
        this.ticksToConsume = params.MAX_TICKS_TO_CONSUME;
        this.lastTickBeingEaten = -1;
        this.updateBoundingCircle(); // update our BC to reflect our position
        this.isActive = true;
        this.updateMovingDestination();
    };


    getDisplayHue() {
        return this.ticksToConsume / params.MAX_TICKS_TO_CONSUME * 110;
    };

    /** Indicates whether this food is currently decaying */
    isDecaying() {
        return this.phase === this.lifecycle_phases.decaying;
    };

    /** Creates the ticks for each lifecycle phase of this food */
    createLifecyclePhaseTicks() {
        const minDistribution = 0.2; // the minimum fraction of an entire generation that each lifecycle phase must occupy (prevents phases with little to no ticks)
        let total = 0; // the number of ticks we have used up in creating our random phase times (an accumulator)
        let lifetimes = [];
        const num_phases = Object.keys(this.lifecycle_phases).length;

        if (!params.RAND_FOOD_PHASES) { // food phase ticks are NOT randomized
            for (let i = 0; i < num_phases - 2; i++) {
                let evenFractionToUse = Math.floor(this.lifecycleTicks / (num_phases - 1));
                lifetimes.push(evenFractionToUse);
                total += evenFractionToUse;
            }
        } else { // randomized phase ticks
            for (let i = 0; i < num_phases - 2; i++) {
                let minimumFractionToUse = Math.floor(minDistribution * this.lifecycleTicks); // our minimum distrubution requires us to use this many ticks
                let fractionLeftToUse = (this.lifecycleTicks - total) / this.lifecycleTicks; // we have this many ticks left to use in our lifetime
                let minDistributionConstraint = minDistribution * ((num_phases - 2) - i); // but we have to take into account the minimum distrubution of phases after us
                let randomFractionToUse = Math.random() * (fractionLeftToUse - minDistributionConstraint) * this.lifecycleTicks; // pick a random tick count under these constraints
                let next = Math.floor(Math.max(minimumFractionToUse, randomFractionToUse)); // assign the maximum of our minimum tick requirement and the randomly picked tick count

                lifetimes.push(next);
                total += next;
            }
        }

        lifetimes.push(this.lifecycleTicks - total); // we add the last phase outside of the loop to ensure exactly the right number of ticks are used to fill the lifetime
        return lifetimes;
    };

    /**
     * Supplies this Food's data hue that is used by other entities in the sim (Agents)
     * 
     * @returns this Food's data hue
     */
    getDataHue(entity = null) {

        if (this.phase_properties[this.phase] == undefined) console.error("Undefined phase properties. Phase is: " + this.phase);
        if (entity === null) return this.phase_properties[this.phase].color;
        let baseColor = entity.foodHierarchyIndex > 0 ? 180 : this.phase_properties[this.phase].color;//Predator sees food differently than prey
        let res = baseColor * (1 - 0.2 * this.getConsumptionCompletion());
        return res;
    };

    updateMovingDestination() {
        let currentPos = 0;
        let minDis = params.CANVAS_SIZE;
        //See which starting position the food is closer to
        for (let i = 0; i < Food.MOVING_DESTINATION.length; i++) {
            let dis = distance(Food.MOVING_DESTINATION[i], { x: this.x, y: this.y });
            if (dis < minDis) {
                currentPos = i;
                minDis = dis;
            }
        }
        //Choosing the next destination 
        this.movingFood = {
            goal: (currentPos + 1) % Food.MOVING_DESTINATION.length,

            random_movement_activation: 40,
            random_cooldown: randomInt(40),

            correct_movement_activation: 50,
            correcting_cooldown: randomInt(50),

        }

        this.dx = 0;
        this.dy = 0;
        //console.log("From ", currentPos, "To ", this.currentMovingGoal, "Gen ", PopulationManager.GEN_NUM);
    }

    /** Updates this Food's bounding circle to reflect its current physical properties */
    updateBoundingCircle() {
        this.BC = new BoundingCircle(
            this.x,
            this.y,
            this.phase_properties[this.phase].radius
        );
    };

    /** Processes a consumption operation on this food and returns the number of calories provided by the consumption 
     * @returns "{calories, consumption completion fraction}"
    */
    consume() {
        if (this.ticksToConsume > 0) this.ticksToConsume--;
        this.lastTickBeingEaten = this.game.population.tickCounter;
        if (params.GRADUAL_CONSUMPTION) return this.gradualConsume();
        else return this.singleConsume();
    };

    singleConsume() {
        // if this food is poisonous, then our calories are NEGATED
        if (this.ticksToConsume <= 0) {
            let cals = this.getCalories();
            this.foodTracker.addCalories(cals);
            if (!this.isPoison) {
                this.foodTracker.addTick();
                this.foodTracker.addLifeStage(this.phase);
            }
            this.phase = this.lifecycle_phases.dead;
            this.removeFromWorld = true; // if we are consumed then we are now dead and get wiped from the sim
            return { calories: cals, completion: 1 };
        }
        return { calories: 0, completion: (params.MAX_TICKS_TO_CONSUME - this.ticksToConsume) / params.MAX_TICKS_TO_CONSUME };

    }

    gradualConsume() {
        if (this.ticksToConsume > 0) {
            let cals = (this.getCalories() * 1.0) / params.MAX_TICKS_TO_CONSUME;
            this.foodTracker.addCalories(cals);
            return { calories: cals, completion: this.getConsumptionCompletion() };
        } else if (params.GRADUAL_CONSUMPTION_RESPAWN){
            this.removeFromWorld = true;
        }
        return { calories: 0, completion: this.getConsumptionCompletion() };
    }

    getCalories() {
        if (this.phase >= this.lifecycle_phases.dead) return 0;
        return this.isPoison ?
            Math.abs(this.phase_properties[this.phase].calories) * -1.0
            : this.phase_properties[this.phase].calories * 1.0;
    }

    getConsumptionCompletion() {
        return (params.MAX_TICKS_TO_CONSUME - this.ticksToConsume * 1.0) / params.MAX_TICKS_TO_CONSUME;
    }

    /** Processes a reproduction operation on this food */
    reproduce() {
        let numAgents = this.game.population.worlds.get(this.worldId).agents.length; // the number of agents in the world

        let numFood = this.isPoison ? // we need the number of food pellets in our world that match our poisonous state
            this.game.population.worlds.get(this.worldId).poison.length :
            this.game.population.worlds.get(this.worldId).food.length;

        //Do not reproduce if too much food is left
        if (params.ENFORCE_MIN_FOOD && (numAgents * params.FOOD_AGENT_RATIO < this.game.population.worlds.get(this.worldId).food.length)) {
            return;
        }

        //Do not reproduce if too much poison is left
        if (params.ENFORCE_MIN_POISON && (numAgents * params.POISON_AGENT_RATIO < this.game.population.worlds.get(this.worldId).poison.length)) {
            return;
        }


        const maxAdditionalChildren = 3; // the maximum number of additional seedlings this food can produce
        let numChildren = numFood > numAgents * (this.isPoison ? params.POISON_AGENT_RATIO : params.FOOD_AGENT_RATIO) ?
            randomInt(2) : // produce either 0 or 1 children if we are already at our food cap in this food's world
            randomInt(maxAdditionalChildren) + 2; // produce between 2 and 4 children inclusive otherwise

        if (numChildren > 0) {
            // determine a circle around food where it reproduce
            // use the number of children to determine the angle to place the children
            // if number of children is 2 then the angle increments should be 180deg
            // if its 4 then it should be 90deg incrememnts
            // once we know the angle we can choose a random distance from center to place the food
            const increment = 2 * Math.PI / numChildren;
            let angle = Math.random() * Math.PI; // choose random starting angle to provide some variation in placements
            const maxDist = 50; // the maximum distance from the parent food in pixels that children can be spawned
            let children = [];
            for (let i = 0; i < numChildren; i++) {
                // if i know angle and distance then i know coordinates
                const distance = Math.random() * maxDist;
                const x = Math.cos(angle) * distance;
                const y = Math.sin(angle) * distance;
                let seedling = new Food(this.game, this.x + x, this.y + y, this.isPoison, this.foodTracker, this.worldId);
                children.push(seedling);
                angle += increment;
            }
            this.game.population.registerSeedlings(this.worldId, children); // register new children with the population manager
        }
    };

    /** Indicates whether this food lies outside of the main food circle in the sim */
    isOutsideOuterCircle() {
        return distance(this.BC.center, { x: params.CANVAS_SIZE / 2, y: params.CANVAS_SIZE / 2 }) > params.CANVAS_SIZE / 2;
    };

    /** Indicates whether this food lies inside of the innermost center food circle in the sim */
    isInsideInnerCircle() {
        return distance(this.BC.center, this.game.population.worlds.get(this.worldId).home.BC.center) < params.CANVAS_SIZE / 5;
    };

    /** Updates this Food for the current tick */
    update() {
        //Moving the food
        if (params.MOVING_FOOD) {
            //Reallign the moving goal on the first tick of the generation
            if (this.game.population.tickCounter === 0) {
                this.updateMovingDestination();
            }
            let goal = Food.MOVING_DESTINATION[this.movingFood.goal];

            //Check whether it is about to be out of bound 
            let aboutToBeOutOfBound = isOutOfBound(this.x + this.dx * this.phase_properties[this.phase].radius,
                this.y + this.dy * this.phase_properties[this.phase].radius);

            //Check the cooldown when to correct movement
            if (this.movingFood.correcting_cooldown >= this.movingFood.correct_movement_activation
                || params.MOVING_FOOD_PATTERN === "direct" //Trigger when movement type is direct
                || aboutToBeOutOfBound //Trigger when about to be out of bound
            ) {
                //Update dx and dy according to the position
                this.dx = params.FOOD_VELOCITY_X;
                this.dy = params.FOOD_VELOCITY_Y;

                if (this.x > goal.x) {
                    this.dx *= -1;
                }
                if (this.y > goal.y) {
                    this.dy *= -1;
                }
                this.movingFood.correcting_cooldown = 0;
            }
            else {
                this.movingFood.correcting_cooldown++;
            }

            switch (params.MOVING_FOOD_PATTERN) {
                default:
                //Moving in drunken sailor style
                case "drunkenSailor":
                    //Check cooldown

                    if (this.movingFood.random_cooldown >= this.movingFood.random_movement_activation
                        && !aboutToBeOutOfBound //Don't randomize when soon to be out of bound
                    ) {
                        let swayDx = randomFloat(2 * params.FOOD_VELOCITY_X) - params.FOOD_VELOCITY_X;
                        let swayDy = randomFloat(2 * params.FOOD_VELOCITY_Y) - params.FOOD_VELOCITY_Y;

                        this.dx = swayDx;
                        this.dy = swayDy;
                        this.movingFood.random_cooldown = 0;
                    }
                    else {
                        this.movingFood.random_cooldown++;
                    }
                    break;
                case "direct":
                    if (Math.abs(this.x - goal.x) < 10) {
                        this.dx = goal.x - this.x;
                    }
                    if (Math.abs(this.y - goal.y) < 10) {
                        this.dy = goal.y - this.y;
                    }
                    break;
            }

            this.x += this.dx;
            this.y += this.dy;

            //Update destination
            //When agent getting to the vertical or horizontal of the destination
            //if (Math.abs(goal.x - this.x) <= 10 || Math.abs(goal.y - this.y) <= 10){

            //When the food is near the destination
            if (distance(goal, { x: this.x, y: this.y }) < 10) {
                this.movingFood.goal++;
                this.movingFood.goal %= Food.MOVING_DESTINATION.length;
            }
        }
        else {
            this.dx = 0;
            this.dy = 0;
        }

        if (!params.MOVING_FOOD) {
            /** If we are outside of the bounds established by the sim, remove this food and return early and food has to be stationary*/
            if (this.x < 0 || this.y < 0 || this.x > params.CANVAS_SIZE || this.y > params.CANVAS_SIZE) // outside the world?
            {
                this.removeFromWorld = true;
                return;
            }
        }
        else {
            //Food is moving
            if (this.x < 0 || this.y < 0 || this.x > params.CANVAS_SIZE || this.y > params.CANVAS_SIZE) {
                this.removeFromWorld = true;
                return;
            }
        }

        this.phase_properties[this.phase].isSet = true;

        this.tickCounter++;
        if (this.tickCounter === this.ticksToNext) { // if our lifecycle phase is up, set up the next phase and reset phase ticks
            this.tickCounter = 0;
            this.phase++;
            if (this.phase === this.lifecycle_phases.dead) {
                this.removeFromWorld = true;
                this.reproduce(); // IMPORTANT -> Food by convention reproduces upon death
            } else {
                this.ticksToNext = this.phase_properties[this.phase].ticks;
            }
        }

        if (this.game.population.tickCounter - this.lastTickBeingEaten >= params.COOLDOWN_TO_REGEN
            && this.ticksToConsume < params.MAX_TICKS_TO_CONSUME)
            this.ticksToConsume = params.MAX_TICKS_TO_CONSUME;

        if (!this.removeFromWorld) {
            this.updateBoundingCircle(); // update our bounding circle to reflect our state
        }
    };

    /** Draws this food to its world canvas */
    draw(ctx) {
        if (this.phase == this.lifecycle_phases.dead) { // don't draw if we are dead
            return;
        }

        if (params.DISPLAY_SAME_WORLD) {
            ctx = this.game.population.worlds.entries().next().value[1].ctx;
            //ctx = this.game.population.worlds.get(0).ctx;
        }

        //Debugging starting position
        // if (params.MOVING_FOOD) {
        //     let col = ["grey", "blue", "yellow", "green"];
        //     for (let i = 0; i < Food.MOVING_DESTINATION.length; i++) {
        //         let x = Food.MOVING_DESTINATION[i].x;
        //         let y = Food.MOVING_DESTINATION[i].y;
        //         ctx.beginPath();
        //         ctx.arc(x, y, 10, 0, 2 * Math.PI, false);
        //         ctx.fillStyle = col[i];
        //         ctx.stroke();
        //         ctx.fill();
        //         ctx.closePath();
        //     }
        // }

        ctx.beginPath();
        ctx.arc(
            this.x,
            this.y,
            this.phase_properties[this.phase].radius,
            0,
            2 * Math.PI,
            false
        );
        let color = 100;
        if (params.DISPLAY_SAME_WORLD) {
            color = this.game.population.worlds.get(this.worldId).worldColor;
        }

        ctx.fillStyle = `hsl(${this.getDisplayHue()}, 100%, 50%)`;
        if (params.POISON_AGENT_RATIO === 0 && params.DISPLAY_SAME_WORLD) {
            ctx.fillStyle = `hsl(${color}, 100%, 50%)`;
        }

        ctx.fill();
        if (!params.DISPLAY_SAME_WORLD) {
            ctx.lineWidth = 2;
        }
        else {
            ctx.lineWidth = 4;
        }
        ctx.strokeStyle = "black";//`hsl(${color}, 100%, ${(!params.DISPLAY_SAME_WORLD)? 0: 50}%)`;
        ctx.stroke();
        ctx.closePath();
        if (params.DISPLAY_SAME_WORLD) {
            ctx.fillStyle = "orange";
            ctx.font = parseInt(2 * params.FOOD_DIAMETER / 3) + "px sans-serif";

            ctx.textAlign = "center";
            ctx.fillText(this.worldId, this.x, this.y + this.phase_properties[this.phase].radius / 2);
            ctx.textAlign = "left";
        }

    };
};

/** 
 * A class for defining the locational properties of food pods in the sim
 * 
 * @author Parker Rosengreen
 */
class FoodPod {

    /**
     * Creates a new FoodPod
     * 
     * @param {*} game the game engine
     * @param {*} centerX the center x coordinate of the pod
     * @param {*} centerY the center y coordinate of the pod
     * @param {*} radius the areal radius of the pod
     * @param {*} isPoison indicates whether this pod is designated for poisonous food
     */
    constructor(game, centerX, centerY, radius, isPoison) {
        Object.assign(this, { game, centerX, centerY, radius, isPoison });
    };

    /**
     * Creates a random position within the positional confines of this pod to place a food pellet
     * 
     * @returns the randomly generated position
     */
    genFoodPos() {
        let minDist = 300; // Set minimum distance from the center
        let randomDist = minDist + randomInt(this.radius - minDist);
        let randomAngle = randomInt(360) * Math.PI / 180;
        let x = this.centerX + randomDist * Math.cos(randomAngle);
        let y = this.centerY + randomDist * Math.sin(randomAngle);
        return { x, y };
    }
};