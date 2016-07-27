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

$( document ).ready(function() {
	$( ".createParahuman" ).mouseup(function() {
    	var element = $(this).find(".cost");
    	$(element).text("100")
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

  	$(document).mouseup(function(){
    	if (typeof timeout != "undefined"){
    		clearInterval(timeout);
    		return false;
    	}
	});

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
  		content: "<p>The Gardener skill generates shards automatically</p><p>Next Level: </p><p>Cost: 300 shards<br>Effect: +10 shards per second</p>",
  		track:true
	});
	
	importcookie();
	update_shards();
	update_conflict();
	check_classes();

	var global_clock = setInterval(time, 1000);
});


function update_shards(change){
	change = change || 0;
	shards += change;
	$('.num_shards').text(shards);
	update_spawn();	
	makecookie();
}

function update_conflict(){
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
	makecookie();
	
}

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

function create_parahuman(id,class_check,power,_name,initial_hp,current_hp){
	parahumans++;
	living_parahumans.push(id);
	if (class_check == "random"){
		var thisclass = Math.floor((Math.random() * classes.length));
	}else{
		var thisclass = class_check;
	}
	class_created[thisclass] = 1;
	thisclass = classes[thisclass];
	check_classes();
	if(initial_hp){
		initial_timer = initial_hp;
	}else{
		var initial_timer = 100;
	}
	if(current_hp){
		var timer = current_hp;
	}else{
		var timer = 100;	
	}
	var cd = 0;
	if (_name){
		var name = _name;
	}else{
		var name = name_generate();
		news_message("cape",name);
	}
	//var minutes = Math.floor(timer / 60);
	//var seconds = timer-(minutes * 60);
	$( "#parahuman_container" ).append( '<div id="parahuman" class="parahuman'+id+'"><div id="protrait"><img class="pimage'+id+'" src="images/face1.png" /></div><div id="stats"><p>Name: '+name+'<br>Power level: '+power+'<br>Type: '+thisclass+'<br>Conflict per second: 2<br>Shards upon death: <span id="sharddeath'+id+'"></span></p></p></div><div id="life"><p>HP: <span id="timer'+id+'">'+timer+'</span><div id="progressbar'+id+'""></div></p></div></div>' );
	var countdown = setInterval(frame, 1000);
	function frame() {
		//console.log("tick "+events+" "+id+" "+targets+" "+cd+" "+living_parahumans);
		if(events == 1 && id == targets && cd == 0){
			//do something eventful
			
			var figure = event_trigger();
			//console.log("figure "+figure);
			if (figure + timer < 0){
				timer = 0;	
			}else if (figure+timer > initial_timer) {
					timer = initial_timer;
					
			}else{
				timer = figure + timer;	
				//console.log("timer "+timer);
				
			}
			if (figure < 0){
				$(".parahuman"+id).animate({backgroundColor: '#ff0000'}, '1000');
				$(".parahuman"+id).animate({backgroundColor: '#ffffff'}, '1000');
			}else if (figure > 0 && figure+timer < initial_timer){
				$(".parahuman"+id).animate({backgroundColor: '#00ff0c'}, '1000');
				$(".parahuman"+id).animate({backgroundColor: '#ffffff'}, '1000');
			}
			
			//minutes = minutes + 5;
			//console.log("event");
			cd = 1;
		}
		if(cd==1 && events==0){
			cd = 0;
		}
		lifesigns(id,name,classes.indexOf(thisclass),initial_timer,timer,power);
		makecookie();

		if (timer == 0){
		
			clearInterval(countdown);
			kill_parahuman(id,Number(power)+(Number(power)*(harvester*.02)));
			news_message("death",name);
		}
		if (timer == 0){}else{
		conflict = conflict + 2;
		update_conflict();
		}
		//timer--
		$( function() {
    		$( "#progressbar"+id ).progressbar({
      			value: (timer/initial_timer)*100
    		});
  		} );
		
		$( "#timer"+id ).text(timer);
		$( "#sharddeath"+id ).text(Number(power)+(Number(power)*(harvester*.02)));
		
	}
	
}

function kill_parahuman(id,gainshards){
	delete stattracker['id'+id];
	$(".pimage"+id).attr("src","images/dead.jpg");
	$(".parahuman"+id).animate({backgroundColor: '#000000'}, 5000);
	timeout = window.setTimeout(function () {
		$( ".parahuman"+id ).remove();
	}, 5000);
	//$( ".parahuman"+id ).remove();
	update_shards(Number(gainshards));
	living_parahumans.splice( $.inArray(id, living_parahumans), 1 );
	makecookie();
	
}

function time(){
	//console.log(warrior);
	scroller();
	event_system();

	if (warrior > 0){
		conflict = conflict + 5*warrior;
		update_conflict();
	}
	
	if (gardener > 0){
		update_shards(10*gardener);	
	}
	
}
var tick = 0;
var events = 0;
var targets = 0;
function event_system(){
	//var roll = Math.floor((Math.random() * 2) + 1);
	//if (roll == 1 && tick == 0){
		if (tick == 0){
		tick = 2;
		events = 1;
		targets = living_parahumans[Math.floor((Math.random() * living_parahumans.length))];

	}
	if (tick > 0){
		tick--;
	}
	if(tick == 0){
		events = 0;
	}

}

function check_classes(){
	for (var i = 0; i < class_created.length; i++) {
    	if (class_created[i] == 1){
    		$("#capeType"+i).show(2000);
    	}
	}	
}

function warrior_skill(){
	if (shards >= (warrior+1)*100){
		//console.log("fire");
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
		//console.log("fire");
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
		//console.log("fire");
		update_shards(-(gardener+1)*300);
		gardener++;
		$( "#gardener_lvl" ).text( gardener );
		$('#gardener .levelUpSkill').tooltip("destroy");
		$( "#gardener .levelUpSkill" ).tooltip({
  		content: "<p>The Gardener skill generates shards automatically</p><p>Current level: +"+gardener*10+"% shards per second</p><p>Next Level: </p><p>Cost: "+(gardener+1)*300+" shards<br>Effect: +"+(gardener+1)*10+"% shards per second</p>",
  		track:true
	});
	}
}




String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

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

function event_trigger(){
	var pick = Math.floor((Math.random() * 2) + 1);
	
	if (pick == 1){
		return good_event();
	}
	if (pick == 2){
		return bad_event();
	}
}

function good_event(){
	var base = 5;
	var plus = Math.floor((Math.random() * 2) + 1);
	var modifier = Math.floor((Math.random() * 10) + 1);
	if (plus == 1){
		base = base + modifier;	
	}else{
		base = base - modifier;
	}
	return base;
	
}

function bad_event(){
	var base = -20;
	var plus = Math.floor((Math.random() * 2) + 1);
	var modifier = Math.floor((Math.random() * 5) + 1);
	if (plus == 1){
		base = base + modifier;	
	}else{
		base = base - modifier;
	}
	return base;
	
}



	
function news_message(type,name){
	if (type == "cape"){
		var message = "A new cape was seen in Brockton Bay today, calling themselves " + name+".";	
	}
	
	if (type == "death"){
		var message = name+" has died.";	
	}
	
	news.push(message);
}

function scroller(){
	//console.log("tick "+news.length+" "+live);
	if(news.length > 0 && live == 0){
		live = 1;
		$( "#newsScroller" ).append("<li class='one' style='position: relative; list-style: none'>"+news[0]+"</li>");
	
		var width = $("#newsScroller .one").width();
		var total_width = width+$("#container").width();
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

function makecookie(){
	var savestring=[];
	//var stattracker_convert;
	//shards,conflict,class_created,warrior,harvester,gardener
	//console.log(stattracker);
	for (var key in stattracker) {
       var arr = stattracker[key];
	   if (stattracker_convert){
	   		var stattracker_convert = stattracker_convert+","+key+","+arr;
	   }else{
			var stattracker_convert  =key+","+arr;
	   }
    }
	
	//console.log(stattracker_convert);
	savestring.push(shards,conflict,class_created,warrior,harvester,gardener,living_parahumans.length,stattracker_convert);
	//console.log(savestring);
	document.cookie = "save="+savestring;
}

function getCookie(name){
    var re = new RegExp(name + "=([^;]+)");
    var value = re.exec(document.cookie);
    return (value != null) ? unescape(value[1]) : null;
}

function importcookie(){
	if(getCookie("save")){
		var stringval = getCookie("save");
		var stringval = stringval.split(',');
		//console.log (stringval);
		shards = Number(stringval[0]);
		conflict = Number(stringval[1]);
		class_created = [];
		class_created.push(Number(stringval[2]),Number(stringval[3]),Number(stringval[4]),Number(stringval[5]),Number(stringval[6]),Number(stringval[7]),Number(stringval[8]),Number(stringval[9]),Number(stringval[10]),Number(stringval[11]),Number(stringval[12]),Number(stringval[13]));
		warrior = Number(stringval[14]);
		harvester = Number(stringval[15]);
		gardener = Number(stringval[16]);
		num_people = Number(stringval[17]);
		//console.log(stringval[18]);
		while (num_people > 0) {
    		//var id = stringval[18].replace("id", "");
			var name = stringval[19];
			var hclass = Number(stringval[20]);
			var initial_hp = Number(stringval[21]);
			var current_hp = Number(stringval[22]);
			var power = Number(stringval[23]);
			
			create_parahuman(parahumans,hclass,power,name,initial_hp,current_hp);
			stringval.splice(19, 6);
			//console.log (stringval);
    		num_people--;
		}
	}
}

function lifesigns(id,name,hclass,initial_hp,current_hp,power){
	//stattracker
	
		stattracker["id"+id] = name+","+hclass+","+initial_hp+","+current_hp+","+power;
}