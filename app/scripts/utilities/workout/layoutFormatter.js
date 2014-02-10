define(
[],
function ()
{
    return {
        quickViewLayout:
        {
            "0": "",
            "1": "duration",
            "2": "distance",
            "3": "averageSpeed",
            "4": "averagePace",
            "5": "calories",
            "6": "elevationGain",
            "7": "elevationLoss",
            "8": "energy",
            "9": "TSS",
            "10": "IF",
            "11": "normalizedPower",
            "12": "normalizedPace",
            "13": "heartRate",
            "14": "power",
            "15": "torque",
            "16": "elevation",
            "17": "cadence",
            "18": "speed",
            "19": "pace",
            "20": "temperature"
        },
        calendarWorkoutLayout:
        {
            "1": { name: "startTime", prefix: "C", units: "timeofday" },
            "2": { name: "startTimePlanned", prefix: "P", units: "timeofday", },
            "3": { name: "distance", prefix: "C", units: "distance" },
            "4": { name: "distancePlanned", prefix: "P", units: "distance" },
            "5": { name: "calories", prefix: "C", units: "calories" },
            "6": { name: "energy", prefix: "C", units: "energy" },
            "7": { name: "totalTime", prefix: "C", units: "duration"},
            "8": { name: "totalTimePlanned", prefix: "P", units: "duration"},
            "13": { name: "tempAvg", prefix: "",  units: "temperature" },
            //"23": { name: "title", prefix: "" }, //commented out because it is hardwired
            "24": { name: "workoutTypeValueId", prefix: "", conversion: "formatWorkoutType" },
            "25": { name: "code", prefix: "" } , 
            "26": { name: "description", prefix: "", conversion: "formatDescription" } ,
            "30": { name: "coachComments", prefix: "P" },
            "31": { name: "workoutComments", prefix: "Post", conversion: "formatWorkoutComments" },
            "35": { name: "tssActual", prefix: "C", units: "tss" },
            "36": { name: "if", prefix: "C", units: "if" },
            "38": { name: "tssPlanned", prefix: "P", units: "tss" },
            "39": { name: "ifPlanned", prefix: "P", units: "if" },
            "40": { name: "caloriesPlanned", prefix: "P", units: "calories" },
            "41": { name: "energyPlanned", prefix: "P", units: "energy" }
        },
        trainingStressScoreSource:
        {
            "0": { name: "Undefined", abbreviation: "TSS*" },
            "1": { name: "PowerTss", abbreviation: "TSS" },
            "2": { name: "RunningTss", abbreviation: "rTSS" },
            "3": { name: "SwimmingTss", abbreviation: "sTSS" },
            "4": { name: "HeartRateTss", abbreviation: "hrTSS" },
            "5": { name: "TrimpsTss", abbreviation: "tTSS" }
        }
    };
});