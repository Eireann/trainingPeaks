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
            "1": { name: "startTime", prefix: "C", conversion: "getTime"},
            "2": { name: "startTimePlanned", prefix: "P", conversion: "getTime"},
            "3": { name: "distance", prefix: "C", conversion: "getDistance", unitHelper: "distance" },
            "4": { name: "distancePlanned", prefix: "P", conversion: "getDistance", unitHelper: "distance" },
            "5": { name: "calories", prefix: "C", conversion:"getNumber", unitHelper: "calories" },
            "6": { name: "energy", prefix: "C", conversion: "getNumber", unitHelper: "energy" },
            "7": { name: "totalTime", prefix: "C", conversion: "getTime", unitHelper: "time" },
            "8": { name: "totalTimePlanned", prefix: "P", conversion: "getTime", unitHelper: "time" },
            "13": { name: "tempAvg", prefix: "", conversion: "getTemperature", unitHelper: "temperature" },
            "23": { name: "title", prefix: "" },
            //TODO: add lookup to resolve valueId
            "24": { name: "workoutTypeValueId", prefix: "" } ,
            "25": { name: "code", prefix: "" } , 
            "26": { name: "description", prefix: "" } ,
            "30": { name: "coachComments", prefix: "P" } ,
            "31": { name: "workoutComments", prefix: "C" } ,
            "35": { name: "tssActual", prefix: "C", conversion: "getNumber", unitHelper: "tss" },
            "36": { name: "if", prefix: "C", conversion: "getNumber", unitHelper: "if" },
            "38": { name: "tssPlanned", prefix: "P", conversion: "getNumber", unitHelper: "tss" },
            "39": { name: "ifPlanned", prefix: "P", conversion: "getNumber", unitHelper: "if" },
            "40": { name: "caloriesPlanned", prefix: "P", conversion: "getNumber", unitHelper: "calories" },
            "41": { name: "energyPlanned", prefix: "P", conversion: "getNumber", unitHelper: "energy" }
        }
    };
});