/**
 * The class for displaying minimap
 * 
 * @author Toan Nguyen 
 */
class Minimap {
    constructor(game, ctx = null, totalWidth = 900, totalHeight = 900) {
        Object.assign(this, { game, ctx, totalWidth, totalHeight });
        this.resize(totalWidth, totalHeight);
        if (ctx != null) {
            this.startInput();
        }
        this.selectedWorld = -1;
        this.hoveringWorld = -1;
    }

    //Resize the minimap
    resize(width, height) {
        this.totalWidth = width;
        this.totalHeight = height;

        this.updateSpec(params.NUM_AGENTS);

    }

    //Update the draw spec with the number of world
    updateSpec(numberOfWorld = params.NUM_AGENTS) {
        if (!numberOfWorld) {
            numberOfWorld = params.NUM_AGENTS;
        }
        //Adjust the number of world to be drawn because a world is square
        if (Math.round(Math.sqrt(numberOfWorld)) ** 2 < numberOfWorld) {
            numberOfWorld = Math.round(Math.sqrt(numberOfWorld) + 1) ** 2
        }

        this.sizeOfAWorld = Math.round(Math.sqrt(this.totalWidth * this.totalHeight / numberOfWorld));
        this.scale = this.sizeOfAWorld / params.CANVAS_SIZE;
        this.worldPerRow = Math.round(this.totalHeight / this.sizeOfAWorld);
        this.worldPerCol = Math.round(this.totalWidth / this.sizeOfAWorld);
        this.numberOfWorld = numberOfWorld;

        this.bufferRow = Math.max(1, this.totalHeight - this.sizeOfAWorld * this.worldPerRow);
        this.bufferCol = Math.max(1, this.totalWidth - this.sizeOfAWorld * this.worldPerCol);

    }

    startInput(ctx = null) {
        if (!ctx) {
            //Won't start input if ctx is null or undefined
            return;
        }
        this.ctx = ctx;

        const getXandY = e => ({
            x: e.clientX - this.ctx.canvas.getBoundingClientRect().left,
            y: e.clientY - this.ctx.canvas.getBoundingClientRect().top
        });

        this.ctx.canvas.addEventListener("mousemove", e => {
            this.mouse = getXandY(e);
        });

        this.ctx.canvas.addEventListener("click", e => {
            //console.log("CLICK", getXandY(e));
            this.click = getXandY(e);
        });


    };

    updateMousePos(mouse) {
        if (mouse) {
            let i = Math.floor(mouse.y / this.sizeOfAWorld) * this.worldPerCol;
            let j = Math.floor(mouse.x / this.sizeOfAWorld);
            return Math.round(i) + Math.round(j);

        }

        return 0;


    }

    updateMainDisplay(worldDisplay) {
        document.getElementById(`carousel-button-slide-${worldDisplay}`).click();
        PopulationManager.CURRENT_WORLD_DISPLAY = worldDisplay;
    }

    update() {
        if (this.mouse) {
            this.hoveringWorld = this.updateMousePos(this.mouse);

        }
        if (this.click) {
            this.selectedWorld = this.updateMousePos(this.click);
            this.updateMainDisplay(this.selectedWorld);
            //Resetting the click
            this.click = null;
        }
        //console.log("Current hovering world ", this.hoveringWorld, this.selectedWorld);
    }

    /**
     *
     * @param {number} x x coordinate of we want to convert
     * @param {number} y y coordinate of we want to convert
     * @param {number} startX origin's x coordinate of the world
     * @param {number} startY origin's y coordinate of the world
     */
    convertCoordinate(x, y, startX, startY) {
        let res = [
            x * this.scale + startX,
            y * this.scale + startY,
        ]
        return res;
    }

    drawAgent(ctx, agent, startX, startY, world) {
        let tmpStrokeStyle = ctx.strokeStyle;
        let tmpFillStyle = ctx.fillStyle;
        ctx.strokeStyle = "red";

        ctx.beginPath();
        let [cx, cy] = this.convertCoordinate(agent.x, agent.y, startX, startY);
        ctx.arc(cx, cy, agent.diameter / 2 * this.scale, 0, 2 * Math.PI);

        let color = agent.getDisplayHue();
        if (params.SPLIT_SPECIES && params.DISPLAY_SAME_WORLD) {
            color = world.worldColor;
        }

        ctx.strokeStyle = `hsl(${color}, 100%, ${(!params.DISPLAY_SAME_WORLD) ? 0 : 50}%)`;
        ctx.fillStyle = `hsl(${agent.getDisplayHue()}, 100%, 50%)`;

        //Agent got deactivated
        if (!this.isActive) {
            ctx.strokeStyle = `hsl(${color}, 0%, ${(!params.DISPLAY_SAME_WORLD) ? 0 : 50}%)`;
            ctx.setLineDash([1]);
        }

        if (!params.DISPLAY_SAME_WORLD) {
            ctx.lineWidth = 2;
        }
        else {
            ctx.lineWidth = 4;
            [ctx.fillStyle, ctx.strokeStyle] = [ctx.strokeStyle, ctx.fillStyle];
        }
        ctx.fill();
        ctx.stroke();
        ctx.closePath();

        ctx.beginPath();
        ctx.lineWidth = (agent.biting ? 10 : 2) * this.scale;//width for pointer line is thicker if biting

        let [bx, by] = this.convertCoordinate(
            agent.BC.center.x + agent.diameter / 2 * Math.cos(agent.heading),
            agent.BC.center.y + agent.diameter / 2 * Math.sin(agent.heading)
            , startX, startY
        );
        ctx.moveTo(bx, by);

        [bx, by] = this.convertCoordinate(
            agent.BC.center.x + agent.diameter * Math.cos(agent.heading),
            agent.BC.center.y + agent.diameter * Math.sin(agent.heading),
            startX, startY
        );

        ctx.lineTo(bx, by);
        ctx.stroke();


        ctx.setLineDash([]);

        //Display hierarchy index
        if (params.HUNTING_MODE === "hierarchy" || params.HUNTING_MODE === "hierarchy_spectrum") {
            agent.drawTextAgent(ctx, agent.foodHierarchyIndex, cx, cy - (agent.diameter + 2) * this.scale, "red");
        }

        //Display species id
        if (params.SPLIT_SPECIES === false) {
            agent.drawTextAgent(ctx, agent.speciesId, cx, cy + (agent.diameter + 2) * this.scale);
        }

        agent.drawTextAgent(ctx, agent.worldId, cx, cy + (agent.diameter * 3) * this.scale);

        ctx.strokeStyle = tmpStrokeStyle;
        ctx.fillStyle = tmpFillStyle;
        ctx.closePath();
    }

    drawFood(ctx, food, startX, startY, world = null) {
        let tmpStrokeStyle = ctx.strokeStyle;
        let tmpFillStyle = ctx.fillStyle;
        ctx.strokeStyle = "black";

        //Convert the coordinate and spec
        let [cx, cy] = this.convertCoordinate(food.x, food.y, startX, startY);
        let cr = food.phase_properties[food.phase].radius * this.scale;

        ctx.beginPath();
        ctx.arc(
            cx,
            cy,
            cr,
            0,
            2 * Math.PI,
            false
        );

        ctx.fillStyle = `hsl(${food.getDisplayHue()}, 100%, 50%)`;
        ctx.fill();
        ctx.stroke();
        ctx.closePath();

        ctx.strokeStyle = tmpStrokeStyle;
        ctx.fillStyle = tmpFillStyle;
    }

    drawWall(ctx, wall, startX, startY, color = "black") {
        let tmpStrokeStyle = ctx.strokeStyle;
        ctx.strokeStyle = color;
        let tmpLineWidth = ctx.lineWidth;
        if (color != "black") {
            ctx.lineWidth = 3;
        }

        ctx.beginPath();
        let [cx, cy] = this.convertCoordinate(wall.xStart, wall.yStart, startX, startY);
        ctx.moveTo(cx, cy);
        [cx, cy] = this.convertCoordinate(wall.xEnd, wall.yEnd, startX, startY);
        ctx.lineTo(cx, cy);

        ctx.fill();
        ctx.stroke();
        ctx.closePath();

        ctx.strokeStyle = tmpStrokeStyle;

        ctx.lineWidth = tmpLineWidth;
    }

    drawBorder(ctx, startX, startY, color = "black") {
        let tmpStrokeStyle = ctx.strokeStyle;
        ctx.strokeStyle = color;
        let tmpLineWidth = ctx.lineWidth;
        if (color != "black") {
            ctx.lineWidth = 3;
        }

        let xStart = [0, 0, params.CANVAS_SIZE, 0];
        let yStart = [0, params.CANVAS_SIZE, 0, 0];
        let xEnd = [0, params.CANVAS_SIZE, params.CANVAS_SIZE, params.CANVAS_SIZE];
        let yEnd = [params.CANVAS_SIZE, params.CANVAS_SIZE, params.CANVAS_SIZE, 0];

        for (let i = 0; i < 4; i++) {
            ctx.beginPath();
            let [cx, cy] = this.convertCoordinate(xStart[i], yStart[i], startX, startY);
            ctx.moveTo(cx, cy);
            [cx, cy] = this.convertCoordinate(xEnd[i], yEnd[i], startX, startY);
            ctx.lineTo(cx, cy);

            ctx.fill();
            ctx.stroke();
            ctx.closePath();
        }

        ctx.strokeStyle = tmpStrokeStyle;

        ctx.lineWidth = tmpLineWidth;
    }

    draw(ctx = null) {
        if (!ctx) {
            ctx = this.ctx;

            //Don't draw if there is no contex
            if (!this.ctx) {
                return;
            }
        }

        ctx.clearRect(0, 0, this.totalWidth, this.totalHeight);

        ctx.strokeStyle = "black";
        //Draw the border
        ctx.rect(0, 0, this.totalWidth, this.totalHeight);
        ctx.stroke();
        let startX = 0;
        let startY = 0;
        let worldDrew = 0;
        let worlds = this.game.population.worlds;
        //this.updateSpec(worlds.size);

        let i = 0;
        let j = 0;
        worlds.forEach((world) => {
            //console.log(startX, startY);

            //Draw world Id in the corner
            ctx.fillStyle = "blue";
            ctx.font = Math.round(this.sizeOfAWorld / 10) + "px sans-serif";

            ctx.fillText(world.worldId, startX + 2, startY + this.sizeOfAWorld + this.bufferRow - 8);

            if (!world.isActive) {
                ctx.font = Math.round(this.sizeOfAWorld / 25) + "px sans-serif";
                ctx.textAlign = "center";
                ctx.fillText("World is not active", startX + (this.sizeOfAWorld + this.bufferRow) / 2, startY + (this.sizeOfAWorld + this.bufferRow) / 2);
            }
            ctx.textAlign = "left";

            world.walls.forEach((wall) => {
                this.drawWall(ctx, wall, startX, startY, "black");

            });

            let wallColor = "black";
            if (worldDrew == this.hoveringWorld) {
                wallColor = "red";
            }

            if (worldDrew == this.selectedWorld) {
                wallColor = "green";
            }
            this.drawBorder(ctx, startX, startY, wallColor);
         

            world.poison.forEach((poison) => {
                this.drawFood(ctx, poison, startX, startY, world);

            });

            world.food.forEach((food) => {
                this.drawFood(ctx, food, startX, startY, world);

            });

            world.agents.forEach((agent) => {
                this.drawAgent(ctx, agent, startX, startY, world);

            });




            ++j;
            if (j >= this.worldPerCol) {
                startX = 0;
                j = 0;
                ++i;
                startY += this.sizeOfAWorld + this.bufferRow;
            }
            else {
                startX += this.sizeOfAWorld + this.bufferCol;
            }
            worldDrew++;
        });


    }
}

/**
 * A helper method to draw minimap in population
 * @param {*} minimap The minimap we wants to display
 * @param {*} minimapElementID The HTML Element ID
 * @param {*} container The HTML Element container the histogram
 * @param {*} style The style the Element would have
 * @param {*} width The width of the element
 * @param {*} height The height of the element
 */
const drawMinimap = (minimap = PopulationManager.MINIMAP, minimapElementID = 'minimap', container = 'minimapContainters', 
        style = 'border: 1px solid black;',
        width = 900, height = 900,
    ) => {
    let canvas = document.createElement('canvas');

    if (!document.getElementById(minimapElementID)) {
        document.getElementById(container).appendChild(canvas);
        minimap.startInput(canvas.getContext("2d"));
    } else {
        canvas = document.getElementById(minimapElementID);
        if (!minimap.ctx) {
            minimap.startInput(canvas.getContext("2d"));
        }
    }

    canvas.setAttribute('id', minimapElementID);
    canvas.setAttribute('style', style);
    canvas.setAttribute('width', width);
    canvas.setAttribute('height', height);

    let ctx = canvas.getContext("2d");


    minimap.draw(ctx);



};