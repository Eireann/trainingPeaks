window.dataUtils = {
		convertFtToMiles: function (distInFt) {
			return distInFt * 0.00018939;
		},
		
		millisToTime: function (duration) {
	        var milliseconds = parseInt((duration%1000)/100)
	            , seconds = parseInt((duration/1000)%60)
	            , minutes = parseInt((duration/(1000*60))%60)
	            , hours = parseInt((duration/(1000*60*60))%24);

	        hours = (hours < 10) ? "0" + hours : hours;
	        minutes = (minutes < 10) ? "0" + minutes : minutes;
	        seconds = (seconds < 10) ? "0" + seconds : seconds;

	        return hours + ":" + minutes + ":" + seconds + "." + milliseconds;
	    },
	    
	    getDateFromMillis: function (dateInMillis) {
	    	var date = new Date(dateInMillis);
	    	
	    	return (date.getMonth() + 1) + "/" + (date.getDay() + 1) + "/" + date.getFullYear();
	    },
	    
	    getDateTimeFromMillis: function (dateInMillis) {
	    	var date = new Date(dateInMillis);
	    	
	    	return (date.getMonth() + 1) + "/" + (date.getDay() + 1) + "/" + date.getFullYear() + 
	    		" " + this.millisToTime(dateInMillis);
	    }
};