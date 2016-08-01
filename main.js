var shards = 100000;
var conflict = 0;
var classes = ["Mover","Shaker","Brute","Blaster","Breaker","Master","Tinker","Thinker","Striker","Changer","Trump","Stranger"];
var affiliations = {"true": "Hero", "false":"Villain"}
var is_class_created = [false,false,false,false,false,false,false,false,false,false,false,false];
var cost = 0;
var warrior = 0;
var harvester = 0;
var gardener = 0;
var news = [];
var live = 0;
var parahumanList = [];
var stattracker = [];
var heroes = [];
var villains = [];
var isAutosaving = true;
var eventTickTock = false;

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
				var y = null;
			}else{
				var y = $(this).attr("id").replace("capeType", "");
			}

			createParahuman(parahumanList.length,y,cost);
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

	setInterval(time, 1000);
});


//Function to update the shards display
function update_shards(change){
	shards += (change || 0);
	$('.num_shards').text(dp(shards));
	update_spawn();
}

//Function to update conflict display, also checks if skills are available
function update_conflict(change){
	conflict += (change || 0);
	
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



function createParahuman(index, _class, _power, _name, _startHp, _currentHp, _affiliation, isFromSave){
	
	if (!isFromSave) {
		/* This is a new parahuman so calculate all the elements */
		_affiliation = Math.chooseRandom([false,false,false,true]); // 1/4 chance of being good & 3/4 change of being bad
		_class = _class || Math.randomRange(0,11);
		_startHp = 100;
		_currentHp = 100;
		_name = name_generate();
		_power = _power || 100;
		
		news_message("cape", _name);
		is_class_created[_class] = true;
		check_classes();
	}
	
	/* Add the parahuman to the list */
	parahumanList[index] = {
		"id":index,
		"name": _name,
		"class": _class,
		"initalHp": _startHp,
		"currentHp": _currentHp,
		"power": dp(_power),
		"affiliation": _affiliation,
		"totalConflict": 0,
		"canBud":true
	}
	
	/* Display the parahuman */
	$( "#parahuman_container" ).append( '<div id="parahuman" class="parahuman'+index+'"><div id="protrait"><img class="pimage'+index+'" src="images/face1.png" /></div><div id="stats"><p>Name: '+_name+'<br>Power level: '+dp(_power)+'<br>Type: '+classes[_class]+'<br>Conflict per second: 2<br>Shards upon death: <span id="sharddeath'+index+'"></span><br>Affiliation: '+affiliations[_affiliation]+'</p></div><div id="life"><p>HP: <span id="timer'+index+'">'+_currentHp+'</span><div id="progressbar'+index+'""></div></p></div></div>' );
}

function alterParahumanHealth(id,amount){
	parahumanList[id].currentHp += amount;
	$("#timer" + parahumanList[id].id).text(parahumanList[id].currentHp);
	if (amount < 0){
		/* Flash red */
		$(".parahuman"+parahumanList[id].id).animate({backgroundColor: '#ff0000'}, '1000');
		$(".parahuman"+parahumanList[id].id).animate({backgroundColor: '#ffffff'}, '1000');
	} else if (amount > 0){
		/* Flash green */
		$(".parahuman"+parahumanList[id].id).animate({backgroundColor: '#00ff0c'}, '1000');
		$(".parahuman"+parahumanList[id].id).animate({backgroundColor: '#ffffff'}, '1000');
	}
}

/* Updates all the parahumans */
function updateParahumans(){
	/* loop over each parahuman
	 * We must loop backwards as elements are being removed */
	for (q = parahumanList.length-1; q > -1; q--){
		/* Ensure HP never gets too high */
		parahumanList[q].currentHp = Math.min(parahumanList[q].currentHp,parahumanList[q].initalHp);
		
		/* Check if the cape is dead */
		if (parahumanList[q].currentHp <= 0){
			killParahuman(q);
		} else {
			/* Cape is still alive */
			update_conflict(2);
			parahumanList[q].totalConflict += 2;
			
			/* Check if we can bud, and if so have a chance to do so */
			if (parahumanList[q].totalConflict >= 100 && parahumanList[q].canBud){
				var chance = (100/parahumanList[q].totalConflict)*0.05; // 5% chance to bud, increases with conflict made over 100
				if (Math.random() <= chance){
					createParahuman(parahumanList.length);
					parahumanList[q].canBud = false;
				}
			}
			$("#sharddeath" + parahumanList[q].id).text(dp(parahumanList[q].power+parahumanList[q].power*(harvester*.02)));
			
			//update the visual hp display
			$( function() {
				$( "#progressbar"+parahumanList[q].id ).progressbar({
					value: (parahumanList[q].currentHp/parahumanList[q].initalHp)*100
				});
			} );
		}
	}
}

function killParahuman(index){
	var id = parahumanList[index].id;
	$(".pimage"+parahumanList[index].id).attr("src","images/dead.jpg");
	$(".parahuman"+parahumanList[index].id).animate({backgroundColor: '#000000'}, 5000);
	update_shards(parahumanList[index].power + parahumanList[index].power * harvester*0.02);
	timeout = window.setTimeout(function () {
		$( ".parahuman"+id ).remove();
	}, 5000);
	parahumanList.splice(index,1);
}

//constantly ticking time function, checks for news scrolls, events, and updates shards and conflict depending on skills & updates parahumans
function time(){
	scroller();
	if (eventTickTock){
		event_system();
	}
	eventTickTock = !eventTickTock;

	if (warrior > 0){
		update_conflict(5*warrior);
	}
	
	if (gardener > 0){
		update_shards(10*gardener);	
	}
	
	updateParahumans();
	
	makesave();
}

//event system, currently set to trigger every 2 seconds
function event_system(){
	/* If we actually have parahumans */
	if(parahumanList.length > 0){
		/* Pick a random bunch and create events */
		var numTargets = Math.randomRange(1,parahumanList.length);
		for (q = 0; q < numTargets;q++){
			var target = Math.randomRange(0,parahumanList.length-1);
			event_trigger(target);
		}
	}
}

//decides what type of event you're going to have
function event_trigger(id){
	
	//if there is at least one hero and one villain alive, 1 in 5 chance to battle
	if(heroes.length > 0 && villains.length > 0 && Math.randomRange(1,5) == 5){
		battle_event(id);
	}else{
		var pick = Math.randomSign();
		if (pick < 0){
			good_event(id);
		}
		if (pick > 0){
			bad_event(id);
		}
	}
}

//good event, with a modifier so values are not always static
function good_event(id){
	var heal = 5 + Math.floor((Math.random() * 10) + 1)*Math.randomSign();
	alterParahumanHealth(id,heal)
	
}

//bad event, with a modifier so values are not always static
function bad_event(id){
	var damage = -20 + Math.randomSign()*Math.floor((Math.random() * 5) + 1);
	alterParahumanHealth(id, damage);
}


function battle_event(id){
		//check if the id that triggered the event is a hero or villain, then find a random of the opposite faction to battle
		if (parahumanList[id].affiliation){
			var hero = id;
			var villain = villains[Math.floor(Math.random() * villains.length)];
		}else{
			var villain = id;	
			var hero = heroes[Math.floor(Math.random() * heroes.length)];
		}
		//update health of the parahumans involeved
		alterParahumanHealth(hero,-20);
		alterParahumanHealth(villain,-20);
		
		//send fighting message
		var message = parahumanList[hero].name+" and "+ parahumanList[villain].name+" were seen fighting in the streets.";
		news_message("fight",null,message);

}

//This function is used the first time a parahuman of one type is born, revealing the button to create more of that type. Also used when loading a save
function check_classes(){
	for (var i = 0; i < is_class_created.length; i++) {
    	if (is_class_created[i]){
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

//name generator, based on Shemetz Java code.
function name_generate() {
	var namechance = [4, 4, 4, 4, 3, 4, 4, 2, 2, 2, 4, 4, 5, 10, 6, 9, 5, 9, 4, 5, 4, 6, 5, 3, 3, 3, 5, 5, 4, 4, 5, 11]; 
	var name;
	switch(Math.chooseRandom(namechance)) {
   		case 6:
       		name = nouns[Math.floor(Math.random() * nouns.length)].capitalize() + " " + nouns[Math.floor(Math.random() * nouns.length)].capitalize();
			return name;
    	case 5:
       		name = nouns[Math.floor(Math.random() * nouns.length)].capitalize() + nouns[Math.floor(Math.random() * nouns.length)];
			return name;
		case 2:
       		name = "The "+nouns[Math.floor(Math.random() * nouns.length)].capitalize();
			return name;
		case 3:
       		name = pretitles[Math.floor(Math.random() * pretitles.length)] + " " + nouns[Math.floor(Math.random() * nouns.length)].capitalize();
			return name;
		case 4:
       		name = "The "+nouns[Math.floor(Math.random() * nouns.length)].capitalize() + " " + posttitles[Math.floor(Math.random() * posttitles.length)].capitalize();
			return name;
		case 8:
       		name = verbs[Math.floor(Math.random() * verbs.length)].capitalize() + nouns[Math.floor(Math.random() * nouns.length)];
			return name;
		case 9:
       		name = adjectives[Math.floor(Math.random() * adjectives.length)].capitalize() + nouns[Math.floor(Math.random() * nouns.length)];
			return name;
		case 10:
       		name = adjectives[Math.floor(Math.random() * adjectives.length)].capitalize() + " " + posttitles[Math.floor(Math.random() * posttitles.length)];
			return name;
		case 11:
       		name = nouns[Math.floor(Math.random() * nouns.length)].capitalize() + " the " + adjectives[Math.floor(Math.random() * adjectives.length)].capitalize();
			return name;
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
	if(news.length > 0 && !live){
		live = true;
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
			live = false;
  		});
	}
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

function makesave(){
	/* Early exit if we have autosave turned off */
	if (!isAutosaving){
		return null;
	}
	var saveObject = {
		"shards":shards,
		"conflict":conflict,
		"warrior":warrior,
		"harvester":harvester,
		"gardener":gardener,
		"createdClasses":is_class_created,
		"parahumans": parahumanList
	}
	localStorage.setItem("save", JSON.stringify(saveObject));
}


function importsave(){
	
	if (localStorage.getItem("save") !== null) {
		
		/* Retrieve the saved object from localStorage */
		var saveObject = $.parseJSON(localStorage.getItem("save"));
		/* Retrive all the values from the object, with defaults incase something is changed/added in a future version */
		shards = saveObject.shards || 0;
		conflict = saveObject.conflict || 0;
		warrior = saveObject.warrior || 0;
		harvester = saveObject.harvester || 0;
		gardener = saveObject.gardener || 0;
		is_class_created = saveObject.createdClasses || [];
		var tempParahumans = saveObject.parahumans || [];
		for (q = 0; q < tempParahumans.length; q++)
		{
			createParahuman(q,tempParahumans[q].class, tempParahumans[q].power, tempParahumans[q].name, tempParahumans[q].initalHp, tempParahumans[q].currentHp, tempParahumans[q].affiliation, true)
		}
	}
}