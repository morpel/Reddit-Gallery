console.log("adf");
//this object manages all the fetched posts from reddit and their relevant methods
var myPosts = {
	data: [],//holds all data fetched from reddit
	dataAmount: "",
	
	getDataFromSearch: function (allData){
	//saves in database all the relevant data from reddit
		myPosts.dataAmount += allData.data.children.length;
		mySearches.lastFetchAmount = allData.data.children.length;
		for (let i=0;i<mySearches.lastFetchAmount;i++){
			var imgSrc = "";
			//check where the post's photo is saved, 
			//if it's not in the media section the function fetches the post's thumbnail,
			//if there is no thumbnail, sets "No Image" image
			if (allData.data.children[i].data.preview != undefined)
				imgSrc = allData.data.children[i].data.preview.images["0"].source.url;
			else if (allData.data.children[i].data.thumbnail != "self")
				imgSrc = allData.data.children[i].data.thumbnail;
			else 
				imgSrc = "./noImages.png";
			myPosts.data.push({
				title: allData.data.children[i].data.title,
				img: imgSrc,
				url: "https://www.reddit.com/" + allData.data.children[i].data.permalink
			});
		}		
	},
	
	showPictures: function (){
	//render the pictures to page
		mySearches.showPageNumber();
		if (mySearches.firstLoad){
		//if it's the first search
			document.getElementById("body").removeChild(document.getElementById("openningMessage"));
			mySearches.firstLoad = false;
			document.getElementById("photoExhibit").classList.remove("noSearchComitted");
			document.getElementById("photoExhibit").classList.add("searchComitted");
		}
		for (i=0;i<mySearches.lastFetchAmount;i++){
			document.getElementById("pic"+i).src = myPosts.data[(9*mySearches.currentPage+i)].img;
			document.getElementById("link"+i).href = myPosts.data[(9*mySearches.currentPage+i)].url;
			document.getElementById("pic"+i).title =myPosts.data[(9*mySearches.currentPage+i)].title;
		}
	},
	
	clearAllRecentPosts: function(){
	//in case of new search, deletes all recent posts
		this.data = [];
		this.dataAmount = 0;
	},
};


//this object manages all the searches data and processes
var mySearches = {
	firstLoad: true,//tells if it's the first search 
	errInSearch: false,	//tells if there is an error message in the window
	recentSearches: [],//savves all recent searches
	currentSearch :"",
	currentPage:"",
	lastPageFetched: "",//tells how many pages ive already fetched
	lastResult : null,//the last post fetched
	
	resetLastSearch: function(){
	//clears all recent search data
		this.lastResult = null;
		document.getElementById("searchBars").value = "";
	},
	
	showPageNumber: function(){
	//prints current page number
		var pageIndLine = document.getElementById("pageIndicator");
		var newTitle = "Page\\" + (mySearches.currentPage+1);
		console.log(newTitle);
		pageIndLine.innerHTML =newTitle;
	},
	
	findOnReddit: function(event){
	//in event of typing and pressing "Enter", makes the search and fetch from reddit
		if (event.key == "Enter"){
			mySearches.currentSearch = document.getElementById("searchBars").value;
			mySearches.resetLastSearch();						
			myPosts.clearAllRecentPosts();
			reddit.search(mySearches.currentSearch).limit(9).fetch(function(res){
					console.log(res);
					if (res.error == 503)
						displayErrMessage();
					else if(res.data.children.length == 0)
						alert("No Images To Show, Try Again");
					else{
						if (mySearches.errInSearch){
							removeErrMsg();
						}
						myPosts.getDataFromSearch(res);
						mySearches.lastResult = res.data.after;
						mySearches.currentPage=0;
						mySearches.lastPageFetched=0;
						mySearches.recentSearches.push(mySearches.currentSearch);
						myPosts.showPictures();
						mySearches.showLastSearches();
					}
			});
		}
	},
	
	showLastSearches: function(){
	//manages the last searches line
		var searchHistoryLine = document.getElementById("searchHistory");
	//	searchHistoryLine.style.visibility="visible";
		var searchTitleElement = document.createElement("span");
		var searchTitleName = document.createTextNode(mySearches.currentSearch.concat("\\"));
		searchTitleElement.appendChild(searchTitleName);
		searchHistoryLine.appendChild(searchTitleElement);
	},
};

function removeErrMsg(){
	mySearches.errInSearch=false;
	var body=document.getElementById("body");
	var errMsg=document.getElementById("errorAlert");
	body.removeChild(errMsg);
}


function displayErrMessage(){
	mySearches.errInSearch = true;
	var errorAlertElement = document.createElement("Label");
	var errorAlertText = document.createTextNode("There was a problem. Try again!");
	var beforeElemnt = document.getElementById("placeHolder");
	errorAlertElement.appendChild(errorAlertText);
	errorAlertElement.id ="errorAlert";
	var body=document.getElementById("body");
	body.insertBefore(errorAlertElement,beforeElemnt);
	console.log("err");
}
 
window.onload = function() {
//hendels clicking on the next or prev buttons
	var nextButton = document.getElementById("goRight");
	var prevButton = document.getElementById("goLeft");
	
	nextButton.onclick = function() {
	//click on next button
		if (mySearches.currentPage == mySearches.lastPageFetched){
		//havent fetched this page
			console.log("fetching the page");
			reddit.search(mySearches.currentSearch).limit(9).after(mySearches.lastResult).fetch(function(res){
				console.log(res);
				myPosts.getDataFromSearch(res);
				mySearches.currentPage++;
				mySearches.lastPageFetched = mySearches.currentPage;
				mySearches.lastResult = res.data.after;
				myPosts.showPictures();
			});
		}
		else{
		//allready fetched this page
			console.log("have the page");
			mySearches.currentPage++;
			myPosts.showPictures();
		}
		return false;
	}
	
	prevButton.onclick = function() {
		//click on previous button
		if (mySearches.currentPage > 0){//if it's the first page
			mySearches.currentPage--;
			myPosts.showPictures();
		}
		else
			alert("This is the first page");
		return false;
    }
}
