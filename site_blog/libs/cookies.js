var Cookies = {
	setCookie : function(c_name,value,exdays) {
		var exdate=new Date();
		exdate.setDate(exdate.getDate() + (exdays?exdays:365));
		var c_value=encodeURIComponent(value) + "; expires="+encodeURIComponent(exdate.toUTCString());
		document.cookie=encodeURIComponent(c_name) + "=" + c_value;
	},
	getCookie : function (c_name, defaultvalue){
		var i,x,y,ARRcookies=document.cookie.split(";");
		for (i=0;i<ARRcookies.length;i++) {
			x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
			y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
			x=decodeURIComponent(x.replace(/^\s+|\s+$/g,""));
			if (x==c_name) {
				return decodeURIComponent(y);
			}
		}
		return defaultvalue;
	}
}

var Request = {
	getParameter : function (parameter){
		var qs=Request.getParameters();
		return qs[parameter];
	},
	getParameters : function (){
		var qs=new Array();
		var loc=location.search;
		if (loc){
			loc=loc.substring(1);//take out '?'
			var parms=loc.split('&');
			for(var i=0;i<parms.length;i++){
				nameValue=parms[i].split('=');
				qs[nameValue[0]]=unescape(nameValue[1]);
			}
		}
		return qs;
	}
}