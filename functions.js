//function to capitalize, used for the random names in certain cases
String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}


//rounding function
function dp(number, places){
	places = places || 0;
	return Math.floor(number*Math.pow(10,places))/Math.pow(10,places);
}

/* Returns a random element from the array */
Math.chooseRandom = function(items)
{
	return items[Math.floor(Math.random()*items.length)]
}

/* Returns random value between range, (Inclusive of both) */
Math.randomRange = function(min,max){
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

Math.randomSign = function(){
	return Math.random() < 0.5 ? -1 : 1;
}