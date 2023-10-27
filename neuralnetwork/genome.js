class Genome {

    static DEFAULT_INPUTS = 2 * params.AGENT_VISION_RAYS + 2;//+2 is for bias and hunger

    static DEFAULT_HIDDENS = 0;

    static DEFAULT_OUTPUTS = params.AGENT_BITING ? 3 : 2;

    static INNOV_NUM = 0;

    static NODE_ID = Genome.DEFAULT_INPUTS + Genome.DEFAULT_HIDDENS + Genome.DEFAULT_OUTPUTS;

    static NODE_TYPES = {
        input: 0,
        hidden: 1,
        output: 2,
    };

    static INNOV_MAP = new ConnectionMap();

    static NODE_ID_MAP = new Map();

    static resetInnovations = () => { // this function must be called whenever a new set of agents is created
        Genome.INNOV_MAP = new ConnectionMap();
    };

    static resetAll = () => {
        Genome.INNOV_MAP = new ConnectionMap();
        Genome.NODE_ID_MAP = new Map();
        Genome.INNOV_NUM = 0;
        Genome.DEFAULT_OUTPUTS = params.AGENT_BITING ? 3 : 2;
        Genome.DEFAULT_INPUTS = params.AGENT_VISION_IS_CONE ? 2 * params.AGENT_VISION_RAYS + 2 : 3 * params.AGENT_NEIGHBOR_COUNT + 2;
        
        if ((params.HUNTING_MODE === "hierarchy" || params.HUNTING_MODE === "hierarchy_spectrum") && params.PUSH_FHI_TO_ANN) {
            Genome.DEFAULT_INPUTS++; //Increase 1 more in neural inputs for food hierarchy index
        }

        Genome.NODE_ID = Genome.DEFAULT_INPUTS + Genome.DEFAULT_HIDDENS + Genome.DEFAULT_OUTPUTS;
    };

    static assignInnovNum = (inId, outId) => {
        let innovNumber;
        if (Genome.INNOV_MAP.get([inId, outId]) !== undefined) { // check if we have already created a number for this connection
            innovNumber = Genome.INNOV_MAP.get([inId, outId]);
        } else {
            innovNumber = Genome.INNOV_NUM++;
            Genome.INNOV_MAP.set([inId, outId], innovNumber);
        }
        return innovNumber;
    };

    static assignNodeId = (innovNum) => {
        let id;
        if (Genome.NODE_ID_MAP.get(innovNum) !== undefined) {
            id = Genome.NODE_ID_MAP.get(innovNum);
        } else {
            id = Genome.NODE_ID++;
            Genome.NODE_ID_MAP.set(innovNum, id);
        }
        return id;
    };

    static getDefault = (randomWeights = params.RAND_DEFAULT_WEIGHTS) => {

        let numInputs = Genome.DEFAULT_INPUTS;
        let numHiddens = Genome.DEFAULT_HIDDENS;
        let numOutputs = Genome.DEFAULT_OUTPUTS;
        let numNeurons = numInputs + numHiddens + numOutputs;
        let nodeGenes = new Map();
        let connectionGenes = new ConnectionMap();

        //Default values for k and m
        let defaultKValue = params.GENOME_DEFAULT_K_VAL;
        let defaultMValue = 0;

        for (let i = 0; i < numNeurons; i++) {
            //Randomize the starting point for k and M value
            // if (randomWeights){
            //     defaultKValue = Math.random() * 4 - 2;//Random between -2 to 2
            //     defaultMValue = Math.random() * 2 - 1; //Random between -1 to 1
            // }

            if (i < numInputs) {
                nodeGenes.set(i, { id: i, type: Genome.NODE_TYPES.input, inIds: new Set(), outIds: new Set(), kValue: defaultKValue, mValue: defaultMValue });
            } else if (i < numInputs + numHiddens) {
                nodeGenes.set(i, { id: i, type: Genome.NODE_TYPES.hidden, inIds: new Set(), outIds: new Set(), kValue: defaultKValue, mValue: defaultMValue });
            } else {
                nodeGenes.set(i, { id: i, type: Genome.NODE_TYPES.output, inIds: new Set(), outIds: new Set(), kValue: defaultKValue, mValue: defaultMValue });
            }
        }

        for (let inputNeuron = 0; inputNeuron < numInputs; inputNeuron++) {
            if (numHiddens > 0) {
                for (let hiddenNeuron = numInputs; hiddenNeuron < numInputs + numHiddens; hiddenNeuron++) {
                    let connection = {
                        in: inputNeuron,
                        out: hiddenNeuron,
                        weight: randomWeights ? Math.random() * 2 - 1 : 0.1,
                        isEnabled: true,
                        innovation: Genome.assignInnovNum(inputNeuron, hiddenNeuron),
                    };
                    Genome.addParentConnection(connectionGenes, nodeGenes, connection);
                }
            } else { // no hidden neurons, connect straight to output neurons
                for (let outputNeuron = numInputs + numHiddens; outputNeuron < numNeurons; outputNeuron++) {
                    let connection = {
                        in: inputNeuron,
                        out: outputNeuron,
                        weight: randomWeights ? Math.random() * 2 - 1 : 0.1,
                        isEnabled: true,
                        innovation: Genome.assignInnovNum(inputNeuron, outputNeuron),
                    };
                    Genome.addParentConnection(connectionGenes, nodeGenes, connection);
                }
            }
        }

        for (let hiddenNeuron = numInputs; hiddenNeuron < numInputs + numHiddens; hiddenNeuron++) {
            for (let outputNeuron = numInputs + numHiddens; outputNeuron < numNeurons; outputNeuron++) {
                let connection = {
                    in: hiddenNeuron,
                    out: outputNeuron,
                    weight: randomWeights ? Math.random() * 3 - 1.5 : 0.5,
                    isEnabled: true,
                    innovation: Genome.assignInnovNum(hiddenNeuron, outputNeuron),
                };
                Genome.addParentConnection(connectionGenes, nodeGenes, connection);
            }
        }

        return {
            nodeGenes: nodeGenes,
            connectionGenes: connectionGenes,
        };
    };

    static addParentConnection = (connectionGenes, nodeGenes, newConnection) => { // NOTE: this function assumes a parent genome (nodes are set up appropriately).
        if (connectionGenes.get([newConnection.in, newConnection.out]) === undefined) {
            connectionGenes.set([newConnection.in, newConnection.out], []);
        }

        connectionGenes.get([newConnection.in, newConnection.out]).push(newConnection);
        nodeGenes.get(newConnection.in).outIds.add(newConnection.out);
        nodeGenes.get(newConnection.out).inIds.add(newConnection.in);
    };

    static crossover = (genomeA, genomeB) => {
        let innovationMap = new Map();

        genomeA.connectionGenes.forEach(connections => {
            connections.forEach(connection => {
                if (innovationMap.get(connection.innovation) === undefined) {
                    innovationMap.set(connection.innovation, new Map());
                }
                innovationMap.get(connection.innovation).set(0, { ...connection }); // genome A connections stored at index 0
            });
        });

        genomeB.connectionGenes.forEach(connections => {
            connections.forEach(connection => {
                if (innovationMap.get(connection.innovation) === undefined) {
                    innovationMap.set(connection.innovation, new Map());
                }
                innovationMap.get(connection.innovation).set(1, { ...connection }); // genome B connections stored at index 1
            });
        });

        let copiedNodes = new Map();
        let copiedConnections = new ConnectionMap();

        innovationMap.forEach(connectionMap => {
            let newConnection = undefined;
            let selectedGenome = undefined;
            if (connectionMap.get(0) !== undefined && connectionMap.get(1) !== undefined) { // randomly choose between matching connection genes
                let randChoice = randomInt(2);
                selectedGenome = randChoice === 0 ? genomeA : genomeB;
                newConnection = connectionMap.get(randChoice);
                newConnection.isEnabled = connectionMap.get(0).isEnabled && connectionMap.get(1).isEnabled;
            } else { // disjoint/excess gene case -> result depends of fitness of genomeA and genomeB (select more fit parent)
                if (connectionMap.get(0) !== undefined && genomeA.rawFitness >= genomeB.rawFitness) {
                    selectedGenome = genomeA;
                    newConnection = connectionMap.get(0);
                }
                if (connectionMap.get(1) !== undefined && genomeB.rawFitness >= genomeA.rawFitness) {
                    selectedGenome = genomeB;
                    newConnection = connectionMap.get(1);
                }
            }
            if (newConnection !== undefined) {
                if (copiedNodes.get(newConnection.in) === undefined) {
                    copiedNodes.set(newConnection.in, { ...selectedGenome.nodeGenes.get(newConnection.in) });
                    copiedNodes.get(newConnection.in).inIds = new Set();
                    copiedNodes.get(newConnection.in).outIds = new Set();
                }
                if (copiedNodes.get(newConnection.out) === undefined) {
                    copiedNodes.set(newConnection.out, { ...selectedGenome.nodeGenes.get(newConnection.out) });
                    copiedNodes.get(newConnection.out).inIds = new Set();
                    copiedNodes.get(newConnection.out).outIds = new Set();
                }
                Genome.addParentConnection(copiedConnections, copiedNodes, newConnection);

                // detect if this newly added edge creates a cycle in existing child genome
                newConnection.isCyclic = false;
                newConnection.isCyclic = NeuralNetUtil.detectCycle(copiedNodes, copiedConnections, newConnection);
            }
        });

        return new Genome({ nodeGenes: copiedNodes, connectionGenes: copiedConnections });
    };

    static numExcess = (genomeA, genomeB) => {
        let innovSetA = genomeA.innovationSet();
        let innovSetB = genomeB.innovationSet();
        let innovCutoff = Math.min(innovSetA.maxInnovation, innovSetB.maxInnovation);
        let count = 0;
        count += [...innovSetA.innovations].filter(x => x > innovCutoff).length;
        count += [...innovSetB.innovations].filter(x => x > innovCutoff).length;
        return count;
    };

    static numDisjoint = (genomeA, genomeB) => {
        let innovSetA = genomeA.innovationSet();
        let innovSetB = genomeB.innovationSet();
        let innovCutoff = Math.min(innovSetA.maxInnovation, innovSetB.maxInnovation);
        let count = 0;
        count += [...innovSetA.innovations].filter(x => x <= innovCutoff && !(innovSetB.innovations.has(x))).length;
        count += [...innovSetB.innovations].filter(x => x <= innovCutoff && !(innovSetA.innovations.has(x))).length;
        return count;
    };

    static avgWeightDiff = (genomeA, genomeB) => {
        let innovationMap = new Map();
        let connectionListA = genomeA.connectionsAsList();
        let connectionlistB = genomeB.connectionsAsList();

        connectionListA.forEach(connection => {
            if (innovationMap.get(connection.innovation) === undefined) {
                innovationMap.set(connection.innovation, new Map());
            }
            innovationMap.get(connection.innovation).set(0, connection.weight);
        });

        connectionlistB.forEach(connection => {
            if (innovationMap.get(connection.innovation) !== undefined) {
                innovationMap.get(connection.innovation).set(1, connection.weight);
            }
        });

        let average = 0;
        let matchCount = 0;
        innovationMap.forEach(weightPair => {
            if (weightPair.size === 2) {
                average += Math.abs(weightPair.get(0) - weightPair.get(1));
                matchCount++;
            }
        });
        return average / matchCount;
    };

    //Use for speciation. Determine the difference of k and M value in a and b
    // Return {avg diff for k, avg diff for m}
    static avgKAndMValueDiff = (genomeA, genomeB) => {
        if (!params.EVOLVE_K_AND_M)
            return { averageK: 0, averageM: 0 };

        let nodeMap = new Map();
        let nodeListA = genomeA.nodesAsList();
        let nodeListB = genomeB.nodesAsList();

        nodeListA.forEach(node => {
            if (nodeMap.get(node.nodeId) === undefined) {
                nodeMap.set(node.nodeId, new Map());
            }
            nodeMap.get(node.nodeId).set(0, {k: node.kValue, m: node.mValue});
        });

        nodeListB.forEach(node => {
            if (nodeMap.get(node.nodeId) !== undefined) {
                nodeMap.get(node.nodeId).set(1, {k: node.kValue, m: node.mValue});
            }
            
        });

        let avgDiff_k = 0;
        let avgDiff_m = 0;
        let matchCount = 0;
        nodeMap.forEach(valuePair => {
            if (valuePair.size === 2) {
                avgDiff_k += Math.abs(valuePair.get(0).k - valuePair.get(1).k);
                avgDiff_m += Math.abs(valuePair.get(0).m - valuePair.get(1).m);
                matchCount++;
            }
        });
        avgDiff_k /= matchCount;
        avgDiff_m /= matchCount;

        return { averageK: avgDiff_k, averageM: avgDiff_m };
    };

    static similarity = (genomeA, genomeB) => {
        let N = Math.max(genomeA.numConnections(), genomeB.numConnections());
        let res = 1 * (Genome.numExcess(genomeA, genomeB) / N) + 1 * (Genome.numDisjoint(genomeA, genomeB) / N) + 0.2 * Genome.avgWeightDiff(genomeA, genomeB);
        
        //Adding the difference of k and m to the similarity when speciation
        if (params.EVOLVE_K_AND_M){
            let tmp = Genome.avgKAndMValueDiff(genomeA, genomeB);
            res += 0.4 * tmp.averageK;
            res += 0.4 * tmp.averageM;
        }
        
        return res;
    };

    constructor(genome = undefined) {
        if (genome === undefined) {
            let defaultGenome = Genome.getDefault();
            this.nodeGenes = defaultGenome.nodeGenes;
            this.connectionGenes = defaultGenome.connectionGenes;
        } else {
            this.nodeGenes = genome.nodeGenes;
            this.connectionGenes = genome.connectionGenes;
        }
    };

    mutate() {
        this.connectionGenes.forEach(connections => { // weight mutations
            connections.forEach(connection => {
                if (randomInt(100) < 80) { // 80% chance of a weight mutation for every connection
                    let randNum = randomInt(1000);
                    if (randNum < 1) {//re-rolls the weight
                        let sign = randomInt(2) == 1 ? -1 : 1;
                        connection.weight = sign * (randomFloatUniform(0, 2)) * connection.weight;
                    } else if (randNum < 500) {//shifts the weight
                        connection.weight += (randomFloatUniform(-0.5, 0.5));
                    }
                    else {//scales the weight
                        let s_up = 0.5;
                        let s_down = 1 - 1/(1+s_up);
                        connection.weight += (randomInt(2) === 1) ? 
                                                (s_up * connection.weight * Math.abs(randomFloatUniform(-1, 1))) : 
                                                (-s_down * connection.weight * Math.abs(randomFloatUniform(-1, 1)));
                    }
                    //console.log("New Weight: " + connection.weight);
                }
            });
        });

        if (params.EVOLVE_K_AND_M) {// Sigmoid k and m mutations
            this.nodeGenes.forEach(node => {
                //K mutation
                if (randomInt(100) < 80) { // 80% chance of a weight mutation for every connection
                    let randNum = randomInt(1000);
                    if (randNum < 1) {//re-rolls the weight
                        let sign = randomInt(2) == 1 ? -1 : 1;
                        node.kValue = sign * (randomFloatUniform(0, 2)) * node.kValue;
                    } else if (randNum < 500) {//shifts the weight
                        node.kValue += (randomFloatUniform(-0.05, 0.05));
                    }
                    else {//scales the weight
                        let s_up = 0.25;
                        let s_down = 1 - 1/(1+s_up);
                        node.kValue += (randomInt(2) === 1) ? 
                                                (s_up * node.kValue * Math.abs(randomFloatUniform(-1, 1))) : 
                                                (-s_down * node.kValue * Math.abs(randomFloatUniform(-1, 1)));
                    }
                    //console.log("Mutated k ", node.kValue);
                }

                //M mutation
                if (randomInt(100) < 80) { // 80% chance of a weight mutation for every connection
                    let randNum = randomInt(1000);
                    if (randNum < 1) {//re-rolls the weight
                        let sign = randomInt(2) == 1 ? -1 : 1;
                        node.mValue = sign * (randomFloatUniform(0, 2)) * node.mValue;
                    } else if (randNum < 500) {//shifts the weight
                        node.mValue += (randomFloatUniform(-0.3, 0.3));
                    }
                    else {//scales the weight
                        let s_up = 0.25;
                        let s_down = 0.2;
                        node.mValue += (randomInt(2) === 1) ? 
                                                (s_up * node.mValue * Math.abs(randomFloatUniform(-1, 1))) : 
                                                (-s_down * node.mValue * Math.abs(randomFloatUniform(-1, 1)));
                    }
                    //console.log("Mutated m ", node.mValue);
                }
            });
        }

        if (randomInt(100) < 5) { // new node mutation (5% chance)
            let enabledConnections = this.connectionsAsList(false);
            let connection = undefined;
            if (enabledConnections.length > 0) {
                connection = enabledConnections[randomInt(enabledConnections.length)];
            }
            if (connection !== undefined) {
                let nodeId = Genome.assignNodeId(connection.innovation);
                if (this.nodeGenes.get(nodeId) === undefined) { // check if we already have this node in our genome
                    connection.isEnabled = false; // disable the old connection
                    this.nodeGenes.set(nodeId, { // add the new node, then split the connection
                        id: nodeId,
                        type: Genome.NODE_TYPES.hidden,
                        value: 0,
                        inIds: new Set(),
                        outIds: new Set(),
                        //Having the same k and m as the out node
                        kValue: this.nodeGenes.get(connection.out).kValue,
                        mValue: this.nodeGenes.get(connection.out).mValue,
                    });

                    let inConnection = {
                        in: connection.in,
                        out: nodeId,
                        weight: 1,
                        isEnabled: true,
                        isCyclic: connection.isCyclic,
                        innovation: Genome.assignInnovNum(connection.in, nodeId)
                    };
                    Genome.addParentConnection(this.connectionGenes, this.nodeGenes, inConnection);

                    let outConnection = {
                        in: nodeId,
                        out: connection.out,
                        weight: connection.weight,
                        isEnabled: true,
                        isCyclic: false,
                        innovation: Genome.assignInnovNum(nodeId, connection.out)
                    };
                    Genome.addParentConnection(this.connectionGenes, this.nodeGenes, outConnection);
                }
            }
        }

        if (randomInt(100) < 5) { // new connection mutation (5% chance)
            let possibleConnections = this.getUnusedConnections();

            if (possibleConnections.length > 0) {
                let randCon = possibleConnections[randomInt(possibleConnections.length)];
                let inNode = this.nodeGenes.get(randCon[0]);
                let outNode = this.nodeGenes.get(randCon[1]);
                let newConnection = {
                    in: inNode.id,
                    out: outNode.id,
                    weight: Math.random() * 2 - 1,
                    isEnabled: true,
                    innovation: Genome.assignInnovNum(inNode.id, outNode.id)
                };
                Genome.addParentConnection(this.connectionGenes, this.nodeGenes, newConnection);

                newConnection.isCyclic = NeuralNetUtil.detectCycle(this.nodeGenes, this.connectionGenes, newConnection);
            }
        }
    };

    getUnusedConnections() {
        let unused = [];
        this.nodeGenes.forEach(inNode => {
            this.nodeGenes.forEach(outNode => {
                if (!inNode.outIds.has(outNode.id) && outNode.type !== Genome.NODE_TYPES.input) {
                    unused.push([inNode.id, outNode.id]);
                }
            });
        });
        return unused;
    };

    innovationSet() {
        let innovations = new Set();
        let maxInnovation = 0;
        this.connectionGenes.forEach(connections => {
            connections.forEach(connection => {
                innovations.add(connection.innovation);
                maxInnovation = Math.max(maxInnovation, connection.innovation);
            });
        });
        return { innovations: innovations, maxInnovation: maxInnovation };
    };

    connectionsAsList(includeDisabled = true) {
        let connectionList = [];
        this.connectionGenes.forEach(connections => {
            connections.forEach(connection => {
                if (connection.isEnabled || includeDisabled) {
                    connectionList.push(connection);
                }
            });
        });
        return connectionList;
    };

    nodesAsList() {
        let nodeList = [];
        this.nodeGenes.forEach(node => {
            nodeList.push(node);
        });
        return nodeList;
    };

    numNodes() {
        return this.nodeGenes.size;
    };

    numConnections() {
        let count = 0;
        this.connectionGenes.forEach(connections => {
            count += connections.length;
        });
        return count;
    };
};