var shards = 0;
var conflict = 0;
var parahumans = 0;
var living_parahumans = [];
var classes = ["Mover","Shaker","Brute","Blaster","Breaker","Master","Tinker","Thinker","Striker","Changer","Trump","Stranger"];
var class_created = [0,0,0,0,0,0,0,0,0,0,0,0];
var cost = 0;
var warrior = 0;
var harvester = 0;
var gardener = 0;
var news = [];
var live = 0;
var stattracker = [];
var heroes = [];
var villains = [];
var isAutosaving = true;

$( document ).ready(function() {
	
	$(".fancybox").fancybox();
	
	$( ".shard_container" ).click(function() {
		update_shards(1)
	});

	$( "#warrior .levelUpSkill" ).click(function() {
		warrior_skill()
	});
	
	$( "#harvester .levelUpSkill" ).click(function() {
		harvester_skill()
	});
	
	$( "#gardener .levelUpSkill" ).click(function() {
		gardener_skill()
	});
	
	$( "#deleteSave").click(function(){
		deleteSave()
	});
	
	$( "#toggleAutosave").click(function(){
		toggleAutosave()
	});
	
	// Create Parahuman buttons, function to hold mouse down and add shards
	$( ".createParahuman" ).mouseup(function() {
    	var element = $(this).find(".cost");
    	$(element).text($(element).text());
    	if (shards >= cost) {
			update_shards(-cost);
			if ($(this).attr("id") == "createRandom"){
				var y = 'random';
			}else{
				var y = $(this).attr("id").replace("capeType", "");
			}

			create_parahuman(parahumans,y,cost);
		}
    })
  	.mousedown(function() {
    	
		cost = $(this).find(".cost").text();
    	var element = $(this).find(".cost");
		timeout = window.setTimeout(function () {
			timeout = setInterval(function(){
        		if (cost < shards){
        			cost++
        			$(element).text(cost)
        		}
    		}, 100);
		}, 400);
  	});

	//Clears the mousedown function (adding shards) regardless of if the mouse is still over the button
  	$(document).mouseup(function(){
    	if (typeof timeout != "undefined"){
    		clearInterval(timeout);
    		return false;
    	}
	});

	//Animation for sliding skill panel
	$(function(){
		$('.slider-arrow').click(function(){
        	if($(this).hasClass('show')){
	    		$( ".slider-arrow, .skillsPanel" ).animate({
          			left: "+=300"
		  		}, 700, function() {
				// Animation complete.
				 });
				$(this).html('Skills &laquo;').removeClass('show').addClass('hide');
			} else {   	
				$( ".slider-arrow, .skillsPanel" ).animate({
					left: "-=300"
				}, 700, function() {
				// Animation complete.
				});
				$(this).html('Skills &raquo;').removeClass('hide').addClass('show');    
        	}
   		 });
	});

	$( "#warrior" ).tooltip({
  		content: "The warrior trait unlocks after 100 conflict.",
  		track:true
	});
	
	$( "#harvester" ).tooltip({
  		content: "The harvester trait unlocks after 200 conflict.",
  		track:true
	});
	
	$( "#gardener" ).tooltip({
  		content: "The gardener trait unlocks after 300 conflict.",
  		track:true
	});

	$( "#harvester .levelUpSkill" ).tooltip({
  		content: "<p>The Harvester skill increases the shards returned when a prahuman dies</p><p>Next Level: </p><p>Cost: 200 shards<br>Effect: +2% shards on death</p>",
  		track:true
	});
	
	$( "#warrior .levelUpSkill" ).tooltip({
  		content: "<p>The Warrior skill increases conflict automatically</p><p>Next Level: </p><p>Cost: 100 shards<br>Effect: +5 conflict per second</p>",
  		track:true
	});
	
	$( "#gardener .levelUpSkill" ).tooltip({
  		content: "<p>The Gardener skill generates shards automatically and reduces the cost of new parahumans.</p><p>Next Level: </p><p>Cost: 300 shards<br>Effect: +10 shards per second, cost of new parahumans reduced by 1%</p>",
  		track:true
	});
	
	//These are the function checks, in the case of a save game, so all of the information from the loaded variables is displayed correctly
	importsave();
	update_shards();
	update_conflict();
	check_classes();
	check_skills();

	var global_clock = setInterval(time, 1000);
});

//Function to update the shards display
function update_shards(change){
	shards += (change || 0);
	$('.num_shards').text(dp(shards));
	update_spawn();	
	makesave();
}

//Function to update conflict display, also checks if skills are available
function update_conflict(change){
	change = change || 0;
	conflict += change;
	
	$('.num_conflict').text(conflict);

	if (conflict >= 100) {
		$("#warrior").removeClass('unavailable').addClass('available');
		if ($('#warrior').tooltip()){
			$('#warrior').tooltip("destroy");
		}
		
	}
	if (conflict >= 200) {
		$("#harvester").removeClass('unavailable').addClass('available');
		if ($('#harvester').tooltip()){
			$('#harvester').tooltip("destroy");
		}
		
	}
	
	if (conflict >= 300) {
		$("#gardener").removeClass('unavailable').addClass('available');
		if ($('#gardener').tooltip()){
			$('#gardener').tooltip("destroy");
		}
		
	}
	makesave();
	
}

//Checks to see if you have enough shards to spawn a new parahuman
function update_spawn(){
	if (shards >= 100) {
		$( ".createParahuman" ).each(function( i ) {
			$(this).removeClass('unableToBuy');
		});
	}
	if (shards < 100 ){
			$('.createParahuman').addClass('unableToBuy');
	}	
}

//Sets the display level of your skills, used when loading a save 
function check_skills(){
	$("#gardener_lvl").text(gardener);
	$( ".createParahuman .cost" ).each(function( index ) {
		var new_value = Number($(this).text())-(Number($(this).text())*(gardener*.01));
		$(this).text(dp(new_value));
	});
	$("#harvester_lvl").text(harvester);
	$("#warrior_lvl").text(warrior);
		
}

//This function creates a new parahuman and continues until it dies
function create_parahuman(id,class_check,power,_name,initial_hp,current_hp,_affiliation){
	parahumans++;
	living_parahumans.push(id);
	
	//start checks for saved parahuman
	if (_affiliation){
		var affiliation = _affiliation;
	}else{
		var affiliation = Math.floor((Math.random() * 4) + 1);
		if (affiliation <= 3){
			affiliation = "Villain";	
			heroes.push(id);
		}else{
			affiliation = "Hero"	;
			villains.push(id);
		}	
	}
	if (class_check == "random"){
		var thisclass = Math.floor((Math.random() * classes.length));
	}else{
		var thisclass = class_check;
	}
	
	var hp_start = initial_hp || 100;
	var hp_current = current_hp || 100;
	
	if (_name){
		var name = _name;
		//specifically here, if parahuman is not from a save, announce it's birth
	}else{
		var name = name_generate();
		news_message("cape",name);
	}
	
	//end checks for saved parahuman
	
	//variables relating to the bud system
	var collected_conflict = 0;
	var bud = 0;
	
	//when you create a random parahuman, if this is the first time that class is born, show a button to let yourself create more of that class
	class_created[thisclass] = 1;
	thisclass = classes[thisclass];
	check_classes();
	
	//this is the "pulse" of the parahuman, these variables are used in the save and this system also lets you "hook" into it using the event system, to modify hp or other stats via events
	lifesigns(id,name,classes.indexOf(thisclass),hp_start,hp_current,power,affiliation);
	makesave();
	
	//visual display of the parahuman
	$( "#parahuman_container" ).append( '<div id="parahuman" class="parahuman'+id+'"><div id="protrait"><img class="pimage'+id+'" src="images/face1.png" /></div><div id="stats"><p>Name: '+name+'<br>Power level: '+dp(power)+'<br>Type: '+thisclass+'<br>Conflict per second: 2<br>Shards upon death: <span id="sharddeath'+id+'"></span><br>Affiliation: '+affiliation+'</p></div><div id="life"><p>HP: <span id="timer'+id+'">'+hp_current+'</span><div id="progressbar'+id+'""></div></p></div></div>' );
	//check the parahuman each second, to adjust hp or other stats visually
	var countdown = setInterval(frame, 1000);
	function frame() {
		//if hp has gone down since last second, flash red
		if (stattracker["id"+id].split(',')[3] < hp_current){	
			$(".parahuman"+id).animate({backgroundColor: '#ff0000'}, '1000');
			$(".parahuman"+id).animate({backgroundColor: '#ffffff'}, '1000');
		
		//if hp has gone up since last second, flash green		
		}else if (stattracker["id"+id].split(',')[3] > hp_current){	
			$(".parahuman"+id).animate({backgroundColor: '#00ff0c'}, '1000');
			$(".parahuman"+id).animate({backgroundColor: '#ffffff'}, '1000');
		}
		//make sure hp never goes below 0, and never goes above the initial hp value
		hp_current = stattracker["id"+id].split(',')[3];
		if (hp_current < 0){
			hp_current = 0;
		}
		if(hp_current > hp_start){
			hp_current = hp_start;	
		}
		
		//update the "pulse" again
		lifesigns(id,name,classes.indexOf(thisclass),hp_start,hp_current,power,affiliation);
		makesave();

		//if hp is 0, kill the parahuman and send a death message. If not, add conflict.
		if (hp_current == 0){
		
			clearInterval(countdown);
			kill_parahuman(id,Number(power)+(Number(power)*(harvester*.02)),affiliation);
			news_message("death",name);
		}else{
			update_conflict(2);
			collected_conflict += 2;
		}
		
		//bud system, after generating 100 conflict, 5% chance to bud, increasing as conflict rises
		if (collected_conflict >= 100 && bud == 0){
			var chance = (100 / collected_conflict)*.05;
			var d = Math.random();
			if (d <= chance){
				create_parahuman(parahumans,"random",100)
				bud = 1;
			}
			
		}
		
		//update the visual hp display
		$( function() {
    		$( "#progressbar"+id ).progressbar({
      			value: (hp_current/hp_start)*100
    		});
  		} );
		
		//update the hp text
		$( "#timer"+id ).text(hp_current);
		
		//shards dropped on death can change depending on the harvester skill, this updates the number visually
		$( "#sharddeath"+id ).text(dp(Number(power)+(Number(power)*(harvester*.02))));
		
	}
	
}

//parahuman death function, remove the id from the save, show death image and fade out, add shards from death
function kill_parahuman(id,gainshards,affiliation){
	delete stattracker['id'+id];
	$(".pimage"+id).attr("src","images/dead.jpg");
	$(".parahuman"+id).animate({backgroundColor: '#000000'}, 5000);
	update_shards(Number(gainshards));
	
	//remove the parahumans id from living parahumans, and the heroes and villains arrays (used in events)
	living_parahumans.splice( $.inArray(id, living_parahumans), 1 );
	if (affiliation == "Hero"){
		heroes.splice( $.inArray(id, heroes), 1 );	
	}else if (affiliation == "Villain"){
		villains.splice( $.inArray(id, villains), 1 );		
	}
	makesave();
	timeout = window.setTimeout(function () {
		$( ".parahuman"+id ).remove();
	}, 5000);
}

//constantly ticking time function, checks for news scrolls, events, and updates shards and conflict depending on skills
function time(){
	scroller();
	event_system();

	if (warrior > 0){
		update_conflict(5*warrior);
	}
	
	if (gardener > 0){
		update_shards(10*gardener);	
	}
	
}

//randomizes array order, used in events
function shuffle(a) {
    var j, x, i;
    for (i = a.length; i; i--) {
        j = Math.floor(Math.random() * i);
        x = a[i - 1];
        a[i - 1] = a[j];
        a[j] = x;
    }
}

var tick = 0;

//event system, currently set to trigger every 2 seconds
function event_system(){
	
	if (tick == 0){
		tick = 2;
		//check if there are any living parahumans, if there are, pick one or more of them randomly and make an event happen
		if(living_parahumans.length > 0){
			var targets = Math.floor((Math.random() * living_parahumans.length));
			shuffle(living_parahumans);
			while (targets >= 0){
				event_trigger(living_parahumans[targets]);
				targets--;	
			}
		}
	}
	tick--;
}

//decides what type of event you're going to have
function event_trigger(ids){
	
	//if there is at least one hero and one villain alive, 1 in 5 chance to battle
	if(heroes.length > 0 && villains.length > 0 && Math.floor((Math.random() * 5) + 1) == 5){
		battle_event(ids);
		 		
	}else{
		var pick = Math.floor((Math.random() * 2) + 1);
		if (pick == 1){
			good_event(ids);
		}
		if (pick == 2){
			bad_event(ids);
		}
	}
}

//good event, with a modifier so values are not always static
function good_event(ids){
	var base = 5;
	var plus = Math.floor((Math.random() * 2) + 1);
	var modifier = Math.floor((Math.random() * 10) + 1);
	if (plus == 1){
		base = base + modifier;	
	}else{
		base = base - modifier;
	}
	//update health of the parahumans "pulse", this is where the event system hooks in
	var new_health = stattracker["id"+ids].split(',')
	new_health[3] = Number(new_health[3]) + base;
	stattracker["id"+ids] = new_health.toString();
	
}

//bad event, with a modifier so values are not always static
function bad_event(ids){
	var base = -20;
	var plus = Math.floor((Math.random() * 2) + 1);
	var modifier = Math.floor((Math.random() * 5) + 1);
	if (plus == 1){
		base = base + modifier;	
	}else{
		base = base - modifier;
	}
	//update health of the parahumans "pulse", this is where the event system hooks in
	var new_health = stattracker["id"+ids].split(',')
	new_health[3] = Number(new_health[3]) + base;
	stattracker["id"+ids] = new_health.toString();
}


function battle_event(ids){
		var base = -20;
		//check if the id that triggered the event is a hero or villain, then find a random of the opposite faction to battle
		if (jQuery.inArray( ids, heroes ) != -1){
			var hero = ids;
			var villain = villains[Math.floor(Math.random() * villains.length)];
		}else{
			var villain = ids;	
			var hero = heroes[Math.floor(Math.random() * heroes.length)];
		}
		//update health of the parahumans "pulse", this is where the event system hooks in
		var id = "id"+hero;
		hero = stattracker[id].split(',');
		hero[3] = Number(hero[3]) + base;
		stattracker[id] = hero.toString();
		id = "id"+villain;
		villain = stattracker["id"+villain].split(',');
		villain[3] = Number(villain[3]) + base;
		stattracker[id] = villain.toString();
		
		//send fighting message
		var message = hero[0]+" and "+villain[0]+" were seen fighting in the streets.";
		news_message("fight",null,message);

}

//This function is used the first time a parahuman of one type is born, revealing the button to create more of that type. Also used when loading a save
function check_classes(){
	for (var i = 0; i < class_created.length; i++) {
    	if (class_created[i] == 1){
    		$("#capeType"+i).show(2000);
    	}
	}	
}

function warrior_skill(){
	if (shards >= (warrior+1)*100){
		update_shards(-(warrior+1)*100);
		warrior++;
		$( "#warrior_lvl" ).text( warrior );
		$('#warrior .levelUpSkill').tooltip("destroy");
		$( "#warrior .levelUpSkill" ).tooltip({
  		content: "<p>The Warrior skill increases conflict automatically</p><p>Current level: "+warrior*5+" conflict per second</p><p>Next Level: </p><p>Cost: "+(warrior+1)*100+" shards<br>Effect: +"+(warrior+1)*5+" conflict per second</p>",
  		track:true
	});
	}
}

function harvester_skill(){
	if (shards >= (harvester+1)*200){
		update_shards(-(harvester+1)*200);
		harvester++;
		$( "#harvester_lvl" ).text( harvester );
		$('#harvester .levelUpSkill').tooltip("destroy");
		$( "#harvester .levelUpSkill" ).tooltip({
  		content: "<p>The Harvester skill increases the shards returned when a prahuman dies</p><p>Current level: +"+harvester*2+"% shards returned on parahuman death</p><p>Next Level: </p><p>Cost: "+(harvester+1)*200+" shards<br>Effect: +"+(harvester+1)*2+"% shards returned on parahuman death</p>",
  		track:true
	});
	}
}

function gardener_skill(){
	if (shards >= (gardener+1)*300){
		update_shards(-(gardener+1)*300);
		gardener++;
		$( ".createParahuman .cost" ).each(function( index ) {
			var new_value = Number($(this).text())-(Number($(this).text())*(gardener*.01));
			$(this).text(dp(new_value));
		});
		$( "#gardener_lvl" ).text( gardener );
		$('#gardener .levelUpSkill').tooltip("destroy");
		$( "#gardener .levelUpSkill" ).tooltip({
  		content: "<p>The Gardener skill generates shards automatically, and reduces the cost of new parahumans.</p><p>Current level: +"+gardener*10+"% shards per second, "+gardener+"% new parahuman cost reduction</p><p>Next Level: </p><p>Cost: "+(gardener+1)*300+" shards<br>Effect: +"+(gardener+1)*10+"% shards per second, "+gardener+1+"% new parahuman cost reduction</p>",
  		track:true
	});
	}
}

//function to capitalize, used for the random names in certain cases
String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

//rounding function
function dp(number, places){
	places = places || 0;
	return Math.floor(number*Math.pow(10,places))/Math.pow(10,places);
}

//name generator, based on Shemetz Java code.
function name_generate() {
	var namechance = [4, 4, 4, 4, 3, 4, 4, 2, 2, 2, 4, 4, 5, 10, 6, 9, 5, 9, 4, 5, 4, 6, 5, 3, 3, 3, 5, 5, 4, 4, 5, 11]; 
	var name;
	
	switch(namechance[Math.floor(Math.random() * namechance.length)]) {
   		case 6:
       		name = nouns[Math.floor(Math.random() * nouns.length)].capitalize() + " " + nouns[Math.floor(Math.random() * nouns.length)].capitalize();
			return name;
       		break;
    	case 5:
       		name = nouns[Math.floor(Math.random() * nouns.length)].capitalize() + nouns[Math.floor(Math.random() * nouns.length)];
			return name;
        	break;
		case 2:
       		name = "The "+nouns[Math.floor(Math.random() * nouns.length)].capitalize();
			return name;
       		break;
		case 3:
       		name = pretitles[Math.floor(Math.random() * pretitles.length)] + " " + nouns[Math.floor(Math.random() * nouns.length)].capitalize();
			return name;
       		break;
		case 4:
       		name = "The "+nouns[Math.floor(Math.random() * nouns.length)].capitalize() + " " + posttitles[Math.floor(Math.random() * posttitles.length)].capitalize();
			return name;
       		break;
		case 8:
       		name = verbs[Math.floor(Math.random() * verbs.length)].capitalize() + nouns[Math.floor(Math.random() * nouns.length)];
			return name;
       		break;
		case 9:
       		name = adjectives[Math.floor(Math.random() * adjectives.length)].capitalize() + nouns[Math.floor(Math.random() * nouns.length)];
			return name;
       		break;
		case 10:
       		name = adjectives[Math.floor(Math.random() * adjectives.length)].capitalize() + " " + posttitles[Math.floor(Math.random() * posttitles.length)];
			return name;
       		break;
		case 11:
       		name = nouns[Math.floor(Math.random() * nouns.length)].capitalize() + " the " + adjectives[Math.floor(Math.random() * adjectives.length)].capitalize();
			return name;
       		break;		
	}
}


//news message parser	
function news_message(type,name,_message){
	if (type == "cape"){
		var message = "A new cape was seen in "+cities[Math.floor(Math.random() * cities.length)]+" today, calling themselves " + name+".";	
	}
	
	if (type == "death"){
		var message = name+" has died.";	
	}
	
	if (type == "fight" && jQuery.inArray( _message, news ) == -1){
		var message = _message;	
	}
	//add the message to the news array
	if(message){
		news.push(message);
	}
}

//constantly ticking, waiting for news entries
function scroller(){
	//live variable keeps multiple news stories from being generated on top of each other
	if(news.length > 0 && live == 0){
		live = 1;
		//add first news story in array to html
		$( "#newsScroller" ).append("<li class='one' style='position: relative; list-style: none'>"+news[0]+"</li>");
	
		//set width based on the content of the message
		var width = $("#newsScroller .one").width();
		var total_width = width+$("#mainGame").width();
		
		//scroll the message the width of the container
		$("#newsScroller .one").css("right", -Math.abs(width));
		$("#newsScroller .one").animate({ 
    		right: "+="+total_width,
  		}, total_width/.14, function() {
    		news.splice(0, 1);
			$( ".one" ).remove();
			live = 0;
  		});
	}
}

function makesave(){
	/* Early exit if we have autosave turned off */
	if (!isAutosaving){
		return null;
	}
	var savestring=[];

	// get each of the currently alive parahumans and add their saved variables
	for (var key in stattracker) {
       var arr = stattracker[key];
	   if (stattracker_convert){
	   		var stattracker_convert = stattracker_convert+","+key+","+arr;
	   }else{
			var stattracker_convert  =key+","+arr;
	   }
    }
	savestring.push(shards,conflict,class_created,warrior,harvester,gardener,living_parahumans.length,stattracker_convert);
	localStorage.setItem("save", savestring);
}

function deleteSave(){
	localStorage.removeItem("save");
}

function toggleAutosave(){
	if (isAutosaving){
		$("#toggleAutosave").text("Turn on autosave");
		isAutosaving = false;
	} else {
		$("#toggleAutosave").text("Turn off autosave");
		isAutosaving = true;
	}
}

function importsave(){
	
	if (localStorage.getItem("save") !== null) {
		//start retrieving all of the saved variables from the string
		var stringval = localStorage.getItem("save");
		var stringval = stringval.split(',');
		shards = Number(stringval[0]);
		conflict = Number(stringval[1]);
		class_created = [];
		class_created.push(Number(stringval[2]),Number(stringval[3]),Number(stringval[4]),Number(stringval[5]),Number(stringval[6]),Number(stringval[7]),Number(stringval[8]),Number(stringval[9]),Number(stringval[10]),Number(stringval[11]),Number(stringval[12]),Number(stringval[13]));
		warrior = Number(stringval[14]);
		harvester = Number(stringval[15]);
		gardener = Number(stringval[16]);
		num_people = Number(stringval[17]);
		
		//for each parahuman in the save, create a brand new parahuman with those stats (basically a clone)
		while (num_people > 0) {
    		//var id = stringval[18].replace("id", "");
			var name = stringval[19];
			var hclass = Number(stringval[20]);
			var initial_hp = Number(stringval[21]);
			var current_hp = Number(stringval[22]);
			var power = Number(stringval[23]);
			var affiliation = stringval[24];
			
			create_parahuman(parahumans,hclass,power,name,initial_hp,current_hp,affiliation);
			stringval.splice(19, 7);
    		num_people--;
		}
	
	}
}

//this function takes the lifesigns "pulse" and pushes it into an object for the save system
function lifesigns(id,name,hclass,initial_hp,current_hp,power,affiliation){
	stattracker["id"+id] = name+","+hclass+","+initial_hp+","+current_hp+","+power+","+affiliation;
}