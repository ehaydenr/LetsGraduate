
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
	}
}

//google maps shit

//get the classes

var classes = [
{"major":"cs", "num":210}, 
{"major":"cs", "num":225}, 
{"major":"cs", "num":411},
{"major":"math", "num":241},
{"major":"phys", "num":211},
];

var classOptions = [];

$(function() {
	for(var i = 0; i<classes.length; i++){
		$.ajax({
			type: "get",
			url: "/class/"+classes[i].major.toUpperCase() +"/"+classes[i].num + "",
			dataType: "JSON",
			success: function(data) {
				/* handle data here */
				var aClass = {}
				aClass["dept"] = data[0].dept;
				aClass["num"] = data[0].num;
				aClass["options"] = data;
				classOptions.push(aClass);

				if(classOptions.length == classes.length){
					classesCollected();
				}
			},
			error: function(status) {
			}
		});
	}
});

function classesCollected(){
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
	var currentClasses = [];
	while(true){
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