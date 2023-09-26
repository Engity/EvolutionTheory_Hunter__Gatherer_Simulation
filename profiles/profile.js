const loadProfile = (profile) => {
    let oldParams = params;
    let oldHTML = document.getElementsByTagName('html')[0].innerHTML;

    document.getElementById("save_to_db").checked = true;
    params.SAVE_TO_DB = true;

    document.getElementById("auto_save_genome").checked = true;
    params.AUTO_SAVE_GENOME = true;

    let attributesLoaded = 0;
    let len = 0;
    for (let key in profile) {
        len++;
        let attr = profile[key];
        params[key] = attr.value;

        if (attr.additionalFunction) {
            attr.additionalFunction();
            attributesLoaded++;
            continue;
        }
        if (!attr.HTMLElementID) {
            console.log("Missing HTML Element in the field: " + key);
            continue;
        }
        let HTMLElement = document.getElementById(attr.HTMLElementID);
        if (HTMLElement.value != undefined) {
            if (attr.value != undefined) {
                HTMLElement.value = attr.value;
            }

            if (attr.checked != undefined) {
                HTMLElement.value = attr.checked;
            }
        }
        if (HTMLElement.checked != undefined) {
            if (attr.value != undefined) {
                HTMLElement.checked = attr.value;
            }

            if (attr.checked != undefined) {
                HTMLElement.checked = attr.checked;
            }

        }
        attributesLoaded++;
    }

    if (attributesLoaded === len) {
        console.log("All attributes loaded successfully");
        params.SIM_CURR_TRIAL = 1;
        gameEngine.population.resetSim();

    }
    else {
        console.log("Problem occurs during loading, reverting to the previous parameter specs");
        params = oldParams;
        document.getElementsByTagName('html')[0].innerHTML = oldHTML;
    }

};

//Example of profile
const simulationProfile_numberOfAgents_25 = {
    DB: {
        HTMLElementID: 'db',
        value: "NEATWi23"
    },

    DB_COLLECTION: {
        HTMLElementID: 'db_collection',
        value: "TotalNumberOfAgents_100"
    },

    GEN_TO_SAVE: {
        HTMLElementID: 'gen_to_save',
        value: 200,
    },

    SIM_TRIAL_NUM: {
        HTMLElementID: 'sim_trial_num',
        value: 5,
    },

    GENOME_DB: {
        HTMLElementID: 'genome_db',
        value: "NEATWi23"
    },

    GENOME_DB_COLLECTION: {
        HTMLElementID: 'genome_db_collection',
        value: "TotalNumberOfAgents_100_Genome"
    },

    GEN_TO_SAVE_GENOME: {
        HTMLElementID: 'gen_to_save_genome',
        value: 200,
    },

    NUM_AGENTS: {
        HTMLElementID: 'num_agents',
        value: 25,
    },

    //Has a custom additional function to run before adding to the profile
    AGENT_PER_WORLD: {
        HTMLElementID: 'agent_per_world',
        value: 1,
        additionalFunction:
            () => {
                document.getElementById("restart_sim").click();
            },

    }
};

const ControlProfile_GradualConsumption_Off_FHI_Off = {
    DB: {
        HTMLElementID: 'db',
        value: "NEAT_Thesis_23_TN"
    },

    DB_COLLECTION: {
        HTMLElementID: 'db_collection',
        value: "Control_GradualConsumption_Off_FHI_Off"
    },

    GEN_TO_SAVE: {
        HTMLElementID: 'gen_to_save',
        value: 400,
    },

    GENOME_DB: {
        HTMLElementID: 'genome_db',
        value: "NEAT_Thesis_23_TN",
    },

    GENOME_DB_COLLECTION: {
        HTMLElementID: 'genome_db_collection',
        value: "Control_GradualConsumption_Off_FHI_Off_Genome"
    },

    GEN_TO_SAVE_GENOME: {
        HTMLElementID: 'gen_to_save_genome',
        value: 400,
    },

    SIM_TRIAL_NUM: {
        HTMLElementID: 'sim_trial_num',
        value: 5,
    },

    NUM_AGENTS: {
        HTMLElementID: 'num_agents',
        value: 50,
    },

    //Has a custom additional function to run before adding to the profile
    AGENT_PER_WORLD: {
        HTMLElementID: 'agent_per_world',
        value: 2,
        additionalFunction:
            () => {
                document.getElementById("restart_sim").click();
            },
    },

    FITNESS_HUNTING_PREY: {
        HTMLElementID: 'FITNESS_HUNTING_PREY',
        value: 50,
    },

    FITNESS_OUT_OF_BOUND: {
        HTMLElementID: 'FITNESS_OUT_OF_BOUND',
        value: -2,
    },

    FITNESS_CALORIES: {
        HTMLElementID: 'fitness_calories',
        value: 10,
    },

    SPLIT_SPECIES: {
        HTMLElementID: 'split_species',
        checked: false,
    },

    AGENT_NEIGHBORS: {
        HTMLElementID: 'agent_neighbors',
        checked: true,
    },

    FITNESS_ENERGY_EFFICIENCY: {
        HTMLElementID: 'FITNESS_ENERGY_EFFICIENCY',
        value: 0,
    },

    FITNESS_PERCENT_DEAD: {
        HTMLElementID: 'FITNESS_PERCENT_DEAD',
        value: 0,
    },

    FITNESS_WINNER_BONUS: {
        HTMLElementID: 'FITNESS_WINNER_BONUS',
        value: 50,
    },

    GRADUAL_CONSUMPTION: {
        HTMLElementID: 'GRADUAL_CONSUMPTION',
        checked: true,
    },

    MIRROR_ROLES: {
        HTMLElementID: 'mirror_roles',
        checked: true,
    },

    INACTIVE_PREY_TARGETABLE: {
        HTMLElementID: 'inactive_prey_targetable',
        checked: true,
    },

    COOLDOWN_TO_REGEN: {
        HTMLElementID: 'cooldown_to_regen',
        value: 1,
    },

    MAX_TICKS_TO_CONSUME: {
        HTMLElementID: 'max_ticks_to_consume',
        value: 1,
    },

    GRADUAL_CONSUMPTION: {
        HTMLElementID: 'GRADUAL_CONSUMPTION',
        checked: false,
    },

    PUSH_FHI_TO_ANN: {
        HTMLElementID: 'push_fhi_to_ann',
        checked: false,
    },
};

const RoleAwareness_GradualConsumption_Off_FHI_On = {
    ...ControlProfile_GradualConsumption_Off_FHI_Off,
    DB_COLLECTION: {
        HTMLElementID: 'db_collection',
        value: "RoleAwareness_GradualConsumption_Off_FHI_On"
    },

    GENOME_DB_COLLECTION: {
        HTMLElementID: 'genome_db_collection',
        value: "RoleAwareness_GradualConsumption_Off_FHI_On_Genome"
    },

    PUSH_FHI_TO_ANN: {
        HTMLElementID: 'push_fhi_to_ann',
        checked: false,
    },
};

const RoleAwareness_GradualConsumption_On_FHI_Off = {
    ...ControlProfile_GradualConsumption_Off_FHI_Off,
    DB_COLLECTION: {
        HTMLElementID: 'db_collection',
        value: "RoleAwareness_GradualConsumption_On_FHI_Off_4"
    },

    GENOME_DB_COLLECTION: {
        HTMLElementID: 'genome_db_collection',
        value: "RoleAwareness_GradualConsumption_On_FHI_Off_Genome_4"
    },

    GRADUAL_CONSUMPTION: {
        HTMLElementID: 'GRADUAL_CONSUMPTION',
        checked: true,
    },

    GRADUAL_CONSUMPTION_RESPAWN: {
        HTMLElementID: 'GRADUAL_CONSUMPTION_RESPAWN',
        checked: true,
    },

    COOLDOWN_TO_REGEN: {
        HTMLElementID: 'cooldown_to_regen',
        value: 100,
    },

    MAX_TICKS_TO_CONSUME: {
        HTMLElementID: 'max_ticks_to_consume',
        value: 50,
    },

    CALORIES_PER_FOOD: {
        HTMLElementID: 'caloriesPerFood',
        value: 250,
    },

    PUSH_FHI_TO_ANN: {
        HTMLElementID: 'push_fhi_to_ann',
        checked: false,
    },
};

const RoleAwareness_GradualConsumption_On_FHI_On = {
    ...ControlProfile_GradualConsumption_Off_FHI_Off,
    DB_COLLECTION: {
        HTMLElementID: 'db_collection',
        value: "RoleAwareness_GradualConsumption_On_FHI_On_4"
    },

    GENOME_DB_COLLECTION: {
        HTMLElementID: 'genome_db_collection',
        value: "RoleAwareness_GradualConsumption_On_FHI_On_Genome_4"
    },

    GRADUAL_CONSUMPTION: {
        HTMLElementID: 'GRADUAL_CONSUMPTION',
        checked: true,
    },

    GRADUAL_CONSUMPTION_RESPAWN: {
        HTMLElementID: 'GRADUAL_CONSUMPTION_RESPAWN',
        checked: true,
    },

    COOLDOWN_TO_REGEN: {
        HTMLElementID: 'cooldown_to_regen',
        value: 100,
    },

    MAX_TICKS_TO_CONSUME: {
        HTMLElementID: 'max_ticks_to_consume',
        value: 50,
    },

    CALORIES_PER_FOOD: {
        HTMLElementID: 'caloriesPerFood',
        value: 250,
    },

    PUSH_FHI_TO_ANN: {
        HTMLElementID: 'push_fhi_to_ann',
        checked: true,
    },
};

const GradualConsumption_TicksConsume1 = {
    ...ControlProfile_GradualConsumption_Off_FHI_Off,
    DB_COLLECTION: {
        HTMLElementID: 'db_collection',
        value: "GradualConsumption_Ticks_Consume_1_1"
    },

    GENOME_DB_COLLECTION: {
        HTMLElementID: 'genome_db_collection',
        value: "GradualConsumption_Ticks_Consume_1_1_Genome"
    },

    GRADUAL_CONSUMPTION: {
        HTMLElementID: 'GRADUAL_CONSUMPTION',
        checked: false,
    },

    GRADUAL_CONSUMPTION_RESPAWN: {
        HTMLElementID: 'GRADUAL_CONSUMPTION_RESPAWN',
        checked: false,
    },

    COOLDOWN_TO_REGEN: {
        HTMLElementID: 'cooldown_to_regen',
        value: 1,
    },

    MAX_TICKS_TO_CONSUME: {
        HTMLElementID: 'max_ticks_to_consume',
        value: 1,
    },

    

    CALORIES_PER_FOOD: {
        HTMLElementID: 'caloriesPerFood',
        value: 10,
    },

    PUSH_FHI_TO_ANN: {
        HTMLElementID: 'push_fhi_to_ann',
        checked: false,
    },
};

const GradualConsumption_TicksConsume25 = {
    ...ControlProfile_GradualConsumption_Off_FHI_Off,
    DB_COLLECTION: {
        HTMLElementID: 'db_collection',
        value: "GradualConsumption_Ticks_Consume_25_2"
    },

    GENOME_DB_COLLECTION: {
        HTMLElementID: 'genome_db_collection',
        value: "GradualConsumption_TicksConsume_25_Genome_2"
    },

    GRADUAL_CONSUMPTION: {
        HTMLElementID: 'GRADUAL_CONSUMPTION',
        checked: true,
    },

    GRADUAL_CONSUMPTION_RESPAWN: {
        HTMLElementID: 'GRADUAL_CONSUMPTION_RESPAWN',
        checked: true,
    },

    COOLDOWN_TO_REGEN: {
        HTMLElementID: 'cooldown_to_regen',
        value: 100,
    },

    MAX_TICKS_TO_CONSUME: {
        HTMLElementID: 'max_ticks_to_consume',
        value: 25,
    },

    CALORIES_PER_FOOD: {
        HTMLElementID: 'caloriesPerFood',
        value: 250,
    },

    PUSH_FHI_TO_ANN: {
        HTMLElementID: 'push_fhi_to_ann',
        checked: false,
    },
};

const GradualConsumption_TicksConsume50 = {
    ...ControlProfile_GradualConsumption_Off_FHI_Off,
    DB_COLLECTION: {
        HTMLElementID: 'db_collection',
        value: "GradualConsumption_Ticks_Consume_50_2"
    },

    GENOME_DB_COLLECTION: {
        HTMLElementID: 'genome_db_collection',
        value: "GradualConsumption_TicksConsume_50_Genome_2"
    },

    GRADUAL_CONSUMPTION: {
        HTMLElementID: 'GRADUAL_CONSUMPTION',
        checked: true,
    },

    GRADUAL_CONSUMPTION_RESPAWN: {
        HTMLElementID: 'GRADUAL_CONSUMPTION_RESPAWN',
        checked: true,
    },

    COOLDOWN_TO_REGEN: {
        HTMLElementID: 'cooldown_to_regen',
        value: 100,
    },

    MAX_TICKS_TO_CONSUME: {
        HTMLElementID: 'max_ticks_to_consume',
        value: 50,
    },

    CALORIES_PER_FOOD: {
        HTMLElementID: 'caloriesPerFood',
        value: 500,
    },

    PUSH_FHI_TO_ANN: {
        HTMLElementID: 'push_fhi_to_ann',
        checked: false,
    },
};

const GradualConsumption_TicksConsume100 = {
    ...ControlProfile_GradualConsumption_Off_FHI_Off,
    DB_COLLECTION: {
        HTMLElementID: 'db_collection',
        value: "GradualConsumption_TicksConsume_100"
    },

    GENOME_DB_COLLECTION: {
        HTMLElementID: 'genome_db_collection',
        value: "GradualConsumption_TicksConsume_100_Genome"
    },

    GRADUAL_CONSUMPTION: {
        HTMLElementID: 'GRADUAL_CONSUMPTION',
        checked: true,
    },

    GRADUAL_CONSUMPTION_RESPAWN: {
        HTMLElementID: 'GRADUAL_CONSUMPTION_RESPAWN',
        checked: true,
    },

    COOLDOWN_TO_REGEN: {
        HTMLElementID: 'cooldown_to_regen',
        value: 100,
    },

    MAX_TICKS_TO_CONSUME: {
        HTMLElementID: 'max_ticks_to_consume',
        value: 100,
    },

    CALORIES_PER_FOOD: {
        HTMLElementID: 'caloriesPerFood',
        value: 1000,
    },

    PUSH_FHI_TO_ANN: {
        HTMLElementID: 'push_fhi_to_ann',
        checked: false,
    },
};

const GradualConsumption_TicksConsume150 = {
    ...ControlProfile_GradualConsumption_Off_FHI_Off,
    DB_COLLECTION: {
        HTMLElementID: 'db_collection',
        value: "GradualConsumption_TicksConsume_150"
    },

    GENOME_DB_COLLECTION: {
        HTMLElementID: 'genome_db_collection',
        value: "GradualConsumption_TicksConsume_150_Genome"
    },

    GRADUAL_CONSUMPTION: {
        HTMLElementID: 'GRADUAL_CONSUMPTION',
        checked: true,
    },

    GRADUAL_CONSUMPTION_RESPAWN: {
        HTMLElementID: 'GRADUAL_CONSUMPTION_RESPAWN',
        checked: true,
    },

    COOLDOWN_TO_REGEN: {
        HTMLElementID: 'cooldown_to_regen',
        value: 100,
    },

    MAX_TICKS_TO_CONSUME: {
        HTMLElementID: 'max_ticks_to_consume',
        value: 150,
    },

    CALORIES_PER_FOOD: {
        HTMLElementID: 'caloriesPerFood',
        value: 1500,
    },

    PUSH_FHI_TO_ANN: {
        HTMLElementID: 'push_fhi_to_ann',
        checked: false,
    },
};

const SpeedAdvantage_FasterPrey_125_Percent_Faster = {
    ...ControlProfile_GradualConsumption_Off_FHI_Off,
    DB_COLLECTION: {
        HTMLElementID: 'db_collection',
        value: "SpeedAdvantage_FasterPrey_125_Percent_Faster_2"
    },


    GENOME_DB_COLLECTION: {
        HTMLElementID: 'genome_db_collection',
        value: "SpeedAdvantage_FasterPrey_125_Percent_Faster_Genome_2"
    },

    PREY_SPEED: {
        HTMLElementID: 'prey_speed',
        value: 6.25,
    },

    PREDATOR_SPEED: {
        HTMLElementID: 'predator_speed',
        value: 5,
    },
};

const SpeedAdvantage_FasterPrey_150_Percent_Faster = {
    ...ControlProfile_GradualConsumption_Off_FHI_Off,
    DB_COLLECTION: {
        HTMLElementID: 'db_collection',
        value: "SpeedAdvantage_FasterPrey_150_Percent_Faster"
    },


    GENOME_DB_COLLECTION: {
        HTMLElementID: 'genome_db_collection',
        value: "SpeedAdvantage_FasterPrey_150_Percent_Faster_Genome"
    },

    PREY_SPEED: {
        HTMLElementID: 'prey_speed',
        value: 7.5,
    },

    PREDATOR_SPEED: {
        HTMLElementID: 'predator_speed',
        value: 5,
    },
};

const SpeedAdvantage_FasterPredator_125_Percent_Faster = {
    ...ControlProfile_GradualConsumption_Off_FHI_Off,
    DB_COLLECTION: {
        HTMLElementID: 'db_collection',
        value: "SpeedAdvantage_FasterPredator_125_Percent_Faster"
    },


    GENOME_DB_COLLECTION: {
        HTMLElementID: 'genome_db_collection',
        value: "SpeedAdvantage_FasterPredator_125_Percent_Faster_Genome"
    },

    PREY_SPEED: {
        HTMLElementID: 'prey_speed',
        value: 5,
    },

    PREDATOR_SPEED: {
        HTMLElementID: 'predator_speed',
        value: 6.25,
    },
};

const SpeedAdvantage_FasterPredator_150_Percent_Faster = {
    ...ControlProfile_GradualConsumption_Off_FHI_Off,
    DB_COLLECTION: {
        HTMLElementID: 'db_collection',
        value: "SpeedAdvantage_FasterPredator_150_Percent_Faster"
    },


    GENOME_DB_COLLECTION: {
        HTMLElementID: 'genome_db_collection',
        value: "SpeedAdvantage_FasterPredator_150_Percent_Faster_Genome"
    },

    PREY_SPEED: {
        HTMLElementID: 'prey_speed',
        value: 5,
    },

    PREDATOR_SPEED: {
        HTMLElementID: 'predator_speed',
        value: 7.5,
    },
};
const OverallSpeed_25_Percent = {
    ...ControlProfile_GradualConsumption_Off_FHI_Off,
    DB_COLLECTION: {
        HTMLElementID: 'db_collection',
        value: "OverallSpeed_25_Percent_1"
    },


    GENOME_DB_COLLECTION: {
        HTMLElementID: 'genome_db_collection',
        value: "OverallSpeed_25_Percent_1_Genome"
    },

    PREY_SPEED: {
        HTMLElementID: 'prey_speed',
        value: 1,
    },

    PREDATOR_SPEED: {
        HTMLElementID: 'predator_speed',
        value: 1,
    },
};
const OverallSpeed_50_Percent = {
    ...ControlProfile_GradualConsumption_Off_FHI_Off,
    DB_COLLECTION: {
        HTMLElementID: 'db_collection',
        value: "OverallSpeed_50_Percent_1"
    },


    GENOME_DB_COLLECTION: {
        HTMLElementID: 'genome_db_collection',
        value: "OverallSpeed_50_Percent_2_Genome"
    },

    PREY_SPEED: {
        HTMLElementID: 'prey_speed',
        value: 2.5,
    },

    PREDATOR_SPEED: {
        HTMLElementID: 'predator_speed',
        value: 2.5,
    },
};

const OverallSpeed_75_Percent = {
    ...ControlProfile_GradualConsumption_Off_FHI_Off,
    DB_COLLECTION: {
        HTMLElementID: 'db_collection',
        value: "OverallSpeed_75_Percent"
    },


    GENOME_DB_COLLECTION: {
        HTMLElementID: 'genome_db_collection',
        value: "OverallSpeed_75_Percent_Genome"
    },

    PREY_SPEED: {
        HTMLElementID: 'prey_speed',
        value: 3.75,
    },

    PREDATOR_SPEED: {
        HTMLElementID: 'predator_speed',
        value: 3.75,
    },
};

const OverallSpeed_150_Percent = {
    ...ControlProfile_GradualConsumption_Off_FHI_Off,
    DB_COLLECTION: {
        HTMLElementID: 'db_collection',
        value: "OverallSpeed_150_Percent"
    },


    GENOME_DB_COLLECTION: {
        HTMLElementID: 'genome_db_collection',
        value: "OverallSpeed_150_Percent_Genome"
    },

    PREY_SPEED: {
        HTMLElementID: 'prey_speed',
        value: 7.5,
    },

    PREDATOR_SPEED: {
        HTMLElementID: 'predator_speed',
        value: 7.5,
    },
};

const OverallSpeed_200_Percent = {
    ...ControlProfile_GradualConsumption_Off_FHI_Off,
    DB_COLLECTION: {
        HTMLElementID: 'db_collection',
        value: "OverallSpeed_200_Percent"
    },


    GENOME_DB_COLLECTION: {
        HTMLElementID: 'genome_db_collection',
        value: "OverallSpeed_200_Percent_Genome"
    },

    PREY_SPEED: {
        HTMLElementID: 'prey_speed',
        value: 10,
    },

    PREDATOR_SPEED: {
        HTMLElementID: 'predator_speed',
        value: 10,
    },
};

const OverallSpeed_250_Percent = {
    ...ControlProfile_GradualConsumption_Off_FHI_Off,
    DB_COLLECTION: {
        HTMLElementID: 'db_collection',
        value: "OverallSpeed_250_Percent"
    },


    GENOME_DB_COLLECTION: {
        HTMLElementID: 'genome_db_collection',
        value: "OverallSpeed_250_Percent_Genome"
    },

    PREY_SPEED: {
        HTMLElementID: 'prey_speed',
        value: 12.5,
    },

    PREDATOR_SPEED: {
        HTMLElementID: 'predator_speed',
        value: 12.5,
    },
};


const profileList = {
    "Control Profile: Default Same Speed, Gradual Consumption Off, Push FHI Off": ControlProfile_GradualConsumption_Off_FHI_Off,
    "Padding_1": "1", //For spacing display in the html element

    "Role Awareness: Gradual Consumption Off, Push FHI On": RoleAwareness_GradualConsumption_Off_FHI_On,
    "Role Awareness: Gradual Consumption On, Push FHI Off": RoleAwareness_GradualConsumption_On_FHI_Off,
    "Role Awareness: Gradual Consumption On, Push FHI On": RoleAwareness_GradualConsumption_On_FHI_On,
    "Padding_2": "2",

    "Speed Advantage: Prey Faster 125%": SpeedAdvantage_FasterPrey_125_Percent_Faster,
    "Speed Advantage: Prey Faster 150%": SpeedAdvantage_FasterPrey_150_Percent_Faster,
    "Speed Advantage: Predator Faster 125%": SpeedAdvantage_FasterPredator_125_Percent_Faster,
    "Speed Advantage: Predator Faster 150%": SpeedAdvantage_FasterPredator_150_Percent_Faster,
    "Padding_4": "4",

    "Overall Speed: 25% Original Speed": OverallSpeed_25_Percent,
    "Overall Speed: 50% Original Speed": OverallSpeed_50_Percent,
    "Overall Speed: 75% Original Speed": OverallSpeed_75_Percent,
    "Overall Speed: 200% Original Speed": OverallSpeed_200_Percent,
    "Overall Speed: 250% Original Speed": OverallSpeed_250_Percent,
    "Padding_5": "5",

    "Gradual Consumption, Proportional Reward Per Tick: Number of Ticks to fully consume 1 (Instant)": GradualConsumption_TicksConsume1,
    "Gradual Consumption, Proportional Reward Per Tick: Number of Ticks to fully consume 50%": GradualConsumption_TicksConsume25,
    "Gradual Consumption, Proportional Reward Per Tick: Number of Ticks to fully consume 100%": GradualConsumption_TicksConsume50,
    "Gradual Consumption, Proportional Reward Per Tick: Number of Ticks to fully consume 200%": GradualConsumption_TicksConsume100,
    "Gradual Consumption, Proportional Reward Per Tick: Number of Ticks to fully consume 300%": GradualConsumption_TicksConsume150,
    "Padding_3": "3",
};

const initProfiles = () => {
    select = document.getElementById('profileOption');

    for (let profileName in profileList) {
        let opt = document.createElement("option");
        if (profileName.match("^Padding")) {
            opt.value = "";
            opt.style = "font-size: 5pt;";
            opt.disabled = true;
            select.appendChild(opt);
        }
        else {
            opt.value = profileName;
            opt.innerHTML = profileName;
            select.appendChild(opt);
        }
    }
};