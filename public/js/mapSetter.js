
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
{"major":"cs", "num":241}
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
	console.log("classOptions:")
	console.log(classOptions);
	initialize();
}

function initialize() {

	console.log("in initialize")

	var myLatlng = new google.maps.LatLng(40.1097,-88.2210);

	var mapOptions = {
		zoom: 16,
		center: myLatlng
	}
	var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
	
	var markerBounds = new google.maps.LatLngBounds();


	for(var i = 0; i<classOptions.length; i++){
		classLat = buildingGeocoding[classOptions[i]["options"][0]["building"]]["lat"]
		classLong = buildingGeocoding[classOptions[i]["options"][0]["building"]]["long"]
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



