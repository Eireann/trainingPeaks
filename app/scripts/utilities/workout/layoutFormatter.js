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
            "1": { name: "startTime", prefix: "C", conversion: "formatTimeOfDay" },
            "2": { name: "startTimePlanned", prefix: "P", conversion: "formatTimeOfDay"},
            "3": { name: "distance", prefix: "C", conversion: "formatDistance", unitHelper: "distance" },
            "4": { name: "distancePlanned", prefix: "P", conversion: "formatDistance", unitHelper: "distance" },
            "5": { name: "calories", prefix: "C", conversion:"formatCalories", unitHelper: "calories" },
            "6": { name: "energy", prefix: "C", conversion: "formatEnergy", unitHelper: "energy" },
            "7": { name: "totalTime", prefix: "C", conversion: "formatDuration"},
            "8": { name: "totalTimePlanned", prefix: "P", conversion: "formatDuration"},
            "13": { name: "tempAvg", prefix: "", conversion: "formatTemperature", unitHelper: "temperature" },
            //"23": { name: "title", prefix: "" }, //commented out because it is hardwired
            "24": { name: "workoutTypeValueId", prefix: "", conversion: "formatWorkoutType" },
            "25": { name: "code", prefix: "" } , 
            "26": { name: "description", prefix: "" } ,
            "30": { name: "coachComments", prefix: "P" },
            "31": { name: "workoutComments", prefix: "Post", conversion: "formatWorkoutComments" },
            "35": { name: "tssActual", prefix: "C", conversion: "formatTSS", unitHelper: "tss" },
            "36": { name: "if", prefix: "C", conversion: "formatIF", unitHelper: "if" },
            "38": { name: "tssPlanned", prefix: "P", conversion: "formatTSS", unitHelper: "tss" },
            "39": { name: "ifPlanned", prefix: "P", conversion: "formatIF", unitHelper: "if" },
            "40": { name: "caloriesPlanned", prefix: "P", conversion: "formatCalories", unitHelper: "calories" },
            "41": { name: "energyPlanned", prefix: "P", conversion: "formatEnergy", unitHelper: "energy" }
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