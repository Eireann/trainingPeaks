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
            "1": { name: "startTime", prefix: "C", conversion: "" },
            "2": { name: "plannedStartTime", prefix: "P" },
            "3": { name: "distance", prefix: "C" },
            "4": { name: "distancePlanned", prefix: "P" },
            "5": { name: "calories", prefix: "C" },
            "6": { name: "energy", prefix: "C" } ,
            "7": { name: "totalTime", prefix: "C" } ,
            "8": { name: "totalTimePlanned", prefix: "P" } ,
            "13": { name: "tempAvg", prefix: "" } ,
            "23": { name: "title", prefix: "" } ,
            "24": { name: "workoutTypeValueId", prefix: "" } ,
            "25": { name: "code", prefix: "" } , 
            "26": { name: "description", prefix: "" } ,
            "30": { name: "coachComments", prefix: "P" } ,
            "31": { name: "workoutComments", prefix: "C" } ,
            "35": { name: "tssActual", prefix: "C" } ,
            "36": { name: "if", prefix: "C" } ,
            "38": { name: "tssPlanned", prefix: "P" } ,
            "39": { name: "ifPlanned", prefix: "P" } ,
            "40": { name: "caloriesPlanned", prefix: "P" } ,
            "41": { name: "energyPlanned", prefix: "P" }
        }
    };
});