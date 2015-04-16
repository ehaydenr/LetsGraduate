//google maps shit

//get the classes

var classes = [{"major":"cs", "num":210}, {"major":"cs", "num":225}, {"major":"cs", "num":241}];
// window.document.domain = "http://courses.illinois.edu/";

function dynamicLoad()
{
    var script= document.createElement('script');
    script.type= 'text/javascript';
    //
    script.src= "http://courses.illinois.edu/cisapp/explorer/schedule/2015/fall/"+classes[0].major.toUpperCase() +"/"+classes[0].num + ".xml";
    console.log(script);
    document.getElementById("myBody").appendChild(script);
}

function parseJSON(JSONdata)
{
   alert(JSONdata.name);
}
dynamicLoad();


// $(function() {
// 	for(var i = 0; i<classes.length; i++){
// 		$.ajax({
// 			type: "get",
// 			headers: {
// 				"Origin":"http://courses.illinois.edu/",
// 			},
// 			"Origin": "http://courses.illinois.edu/",
// 			url: "http://courses.illinois.edu/cisapp/explorer/schedule/2015/fall/"+classes[i].major.toUpperCase() +"/"+classes[i].num + ".xml",
// 			dataType: "xml",
// 			success: function(data) {
// 				/* handle data here */
// 				xmlDoc = $.parseXML(data);
// 				$xml = $(xmlDoc);
// 				$title = $xml.find("creditHours");
// 				console.log($title.text());
// 			},
// 			error: function(xhr, status) {
// 				/* handle error here */
// 				$("#show_table").html(status);
// 			}
// 		});
// 	}
// });
