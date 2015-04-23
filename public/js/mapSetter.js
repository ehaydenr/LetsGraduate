
var buildingGeocoding = {
	"Noyes Laboratory": {
		"lat":40.108497,
		"long":-88.226040
	},
	"Siebel Center for Comp Sci": {
		"lat":40.114029, 
		"long":-88.224926
	},
	"Digital Computer Laboratory": {
		"lat":40.113413, 
		"long":-88.226650
	},
	"Electrical & Computer Eng Bldg": {
		"lat":40.115032, 
		"long":-88.228070
	},
	"Loomis Laboratory": {
		"lat":40.111032, 
		"long":-88.223199
	},
	"Altgeld Hall": {
		"lat":40.109568, 
		"long":-88.228410
	},
	"Wohlers Hall": {
		"lat":40.103851, 
		"long":-88.229739
	},
	"Mumford Hall": {
		"lat":40.103827, 
		"long":-88.225951
	},
	"Everitt Elec & Comp Engr Lab": {
		"lat":40.110888, 
		"long":-88.228344
	},
	"Temple Hoyne Buell Hall": {
		"lat":40.102331,
		"long":-88.228119
	}, 
	"Henry Administration Bldg": {
		"lat":40.108568,
		"long":-88.228248
	}
}

//google maps shit

//get the classes

var classes = [];
var noClass = [];

var classOptions = [];

$(function() {
	$.get( "/councillorStuff", function(data){
		chooseClassesToSchedule(data);
	});
});

function takenRecs(dept, num, classRecs, takenClasses){
	for(var i =0; i<classRecs.length; i++){
		if (classRecs[i].dep === dept && classRecs[i].num === num){
			if(dept === "CS" && num==125){
				console.log(classRecs[i]);
			}
			if(typeof classRecs[i].req === 'String'){
				console.log("here");
				if(classRecs[i].req === ""){
					console.log("here");
					return true;
				}
				return takenClass(classRecs[i].rec, takenClasses);
			} else {
				if(classRecs[i].req === ""){
					console.log("here");
					return true;
				}
				return recurseTakenRecs()
			}
		}
	}
	return true;
}

function recurseTakenRecs(classReq, classes){
	return true;
}

function takenClass(className, takenClasses){
	for(var i =0; i<takenClasses.length; i++){
		if (takenClasses[i] == className){
			return true;
		}
	}
	return false;
}

function chooseClassesToSchedule(data){
	var classRecs = data["classRecs"];
	var gradRecs = data["gradRecs"]["grad_reqs"];
	var takenClasses = data["classes"];
	var myClasses = []
	for(var i = 0; i<gradRecs.length; i++){
		if(gradRecs[i]["type"] === "C"){
			if(!takenClass(gradRecs[i]["department"]+gradRecs[i]["number"], takenClasses)) {
				if(takenRecs(gradRecs[i]["department"], gradRecs[i]["number"], classRecs, takenClasses)){
					myClasses.push({"major":gradRecs[i]["department"], "num":gradRecs[i]["number"]});
				}
			}
		}else if(gradRecs[i]["type"] == "OR" || gradRecs[i]["type"] == "AND"){
			recursiveCheckGrad(gradRecs[i], myClasses, takenClasses, classRecs);
		}
	}

	classes = myClasses;
	// [
	// 	{"major":"cs", "num":210}, 
	// 	{"major":"cs", "num":225}, 
	// 	{"major":"cs", "num":411},
	// 	{"major":"math", "num":241},
	// 	{"major":"phys", "num":211},
	// ];
	scheduleClasses();
}

function recursiveCheckGrad(gradRec, myClasses, takenClasses, classRecs){
	if(gradRec["type"] == "OR"){
		for(var i = 0; i<gradRec["reqs"].length; i++){
			if(recursiveCheckGrad(gradRec["reqs"][i], myClasses, takenClasses, classRecs)){
				break;
			}	
		}
	} else if(gradRec["type"] == "AND"){
		for(var i = 0; i<gradRec["reqs"].length; i++){
			recursiveCheckGrad(gradRec["reqs"][i], myClasses, takenClasses, classRecs);
		}
	} else if(gradRec["type"] == "C"){
		return addGradReqIfPossible(gradRec, myClasses, takenClasses, classRecs);
	}
}
function addGradReqIfPossible(gradRec, myClasses, takenClasses, classRecs){
	if(!takenClass(gradRec["department"]+gradRec["number"], takenClasses)) {
		if(takenRecs(gradRec["department"], gradRec["number"], classRecs)){
			myClasses.push({"major":gradRec["department"], "num":gradRec["number"]});
			return true;
		}
	}
	return false
}

function scheduleClasses(){

	if(classes.length > 7){
		classes.splice(7, classes.length);
	}


	for(var i = 0; i<classes.length; i++){
		for(var j = i+1; j<classes.length; j++){
			if(classes[i].num == classes[j].num && classes[j].major == classes[i].major){
				classes.splice(j, 1);
				j--;
			}
		}
	}

	for(var i = 0; i<classes.length; i++){
		$.ajax({
			type: "get",
			url: "/dave/"+classes[i].major.toUpperCase() +"/"+classes[i].num + "",
			dataType: "JSON",
			success: function(data) {
				/* handle data here */
				var aClass = {}
				var shouldGo = true;
				if(data["found"] == "no"){
					for(var j = 0; j<classes.length; j++){
						if(classes[j].major == data["dept"] && classes[j].num == data["num"]){
							classes.splice(j, 1);
							if(classOptions.length == classes.length){
								classesCollected();
							}
							shouldGo = false;
							return;
						}
					}
				}
				if(data["start"] == null){
					for(var j = 0; j<classes.length; j++){
						if(classes[j].major == data["dept"] && classes[j].num == data["num"]){
							console.log("here");
							shouldGo = false;
							noClass.push(classes[j]);
							classes.splice(j, 1);
							if(classOptions.length == classes.length){
								classesCollected();
							}
							return;
						}
					}
				}
				for(var k = 0; k<data.length; k++){
					if(typeof data[k]["end"] === 'undefined' || typeof data[k]["start"] == 'undefined'){
						for(var j = 0; j<classes.length; j++){
							if(classes[j].major == data[k]["dept"] && classes[j].num == data[k]["num"]){
								console.log("here");
								shouldGo = false;
								noClass.push(classes[j]);
								classes.splice(j, 1);
								if(classOptions.length == classes.length){
									classesCollected();
								}
								return;
							}
						}
					}
				}

				console.log(data);
				if(shouldGo && typeof data[0] !== 'undefined'){
					aClass["dept"] = data[0].dept;
					aClass["num"] = data[0].num;
					aClass["options"] = data;

					classOptions.push(aClass);
				// console.log(data);
				console.log("classOptionsLength: " + classOptions.length);
				console.log("classesLength: " + classes.length);

				if(classOptions.length == classes.length){
					classesCollected();
				}
			}

		},
		error: function(status) {
		}
	});
}
}


function classesCollected(){
	console.log(noClass);
	console.log(classes);
	initialize(findScheduleFromClassOptions());
}

function convertTimetoNum(time){
	var noHalf = time.substring(0, time.indexOf(" "));

	var isPM = time.indexOf("P") != -1;
	var hours = parseInt(noHalf.substring(0, noHalf.indexOf(":")));
	var minutes = parseInt(noHalf.substring(noHalf.indexOf(":")+1, noHalf.length));

	var total = isPM*60*12 + hours*60 + minutes;
	return total;
}

//returns true if times overlap (for a pair)
function Overlap(first, second){
	return ((first[0] <= second[0] && first[1] >= second[0]) || (second[0] <= first[0] && second[1] >= first[0]));
}



//returns true if they contain one similar day (first and second are the arrays in anOption)
function containsSameDay(first, second){
	for(var i = 0; i<first[2].length; i++){
		if(second[2].indexOf(first[2].substring(i,i+1)) != -1){
			return true;
		}
	}
	return false;
}

//checks if any classes overlap (day and time)
function noClassesOverlap(classes){
	for(var i = 0; i<classes.length; i++){
		for(var j = i+1; j<classes.length; j++){
			if(containsSameDay(classes[i], classes[j]) && Overlap(classes[i], classes[j])){
				return false;
			}
		}
	}
	return true;
}

function incrementOptionChoices(myArray, optionChoices){
	for(var i = optionChoices.length-1; i>-1; i--){
		optionChoices[i]++;
		if(optionChoices[i] >= myArray[i].length){
			optionChoices[i] = 0;
		} else {
			return false;
		}
		console.log("in optionChoices");
	}
	return true;
}


function findScheduleFromClassOptions(){
	//same order as classOptions for class name
	var myArray = []

	//for recursive method
	var optionChoices = [];


	for(var i = 0; i<classOptions.length; i++){
		var anOption = [];
		for(var j = 0; j< classOptions[i]["options"].length; j++){
			anOption.push([]);
			anOption[anOption.length-1].push(convertTimetoNum(classOptions[i]["options"][j].start))
			anOption[anOption.length-1].push(convertTimetoNum(classOptions[i]["options"][j].end))
			anOption[anOption.length-1].push(classOptions[i]["options"][j].days)
		}
		myArray.push(anOption);
		optionChoices.push(0);
	}
	
	while(true){
		var currentClasses = [];
		for(var i = 0; i<myArray.length; i++){
			currentClasses.push(myArray[i][optionChoices[i]]);
		}
		if(noClassesOverlap(currentClasses)){
			return optionChoices;
		}
		if(incrementOptionChoices(myArray, optionChoices)){
			return null;
		}
	}
}


function initialize(optionChoices) {

	if(optionChoices == null){
		console.log("no options")
		return;
	}
	var myLatlng = new google.maps.LatLng(40.1097,-88.2210);

	var mapOptions = {
		zoom: 16,
		center: myLatlng
	}
	var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
	
	var markerBounds = new google.maps.LatLngBounds();


	for(var i = 0; i<classOptions.length; i++){
		console.log(classOptions[i]["options"][optionChoices[i]]["building"]);
		classLat = buildingGeocoding[classOptions[i]["options"][optionChoices[i]]["building"]]["lat"]
		classLong = buildingGeocoding[classOptions[i]["options"][optionChoices[i]]["building"]]["long"]
		var bs = new google.maps.LatLng(classLat, classLong);
		markerBounds.extend(bs);
		var marker = new google.maps.Marker({
			position: bs,
			map: map,
			title: 'Hello World!'
		});
	}
	map.fitBounds(markerBounds);
}
