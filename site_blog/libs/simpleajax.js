var MonAjax = {
		_createXHR : function () {
		    var request = false;
		        try {
		            request = new ActiveXObject('Msxml2.XMLHTTP');
		        }
		        catch (err2) {
		            try {
		                request = new ActiveXObject('Microsoft.XMLHTTP');
		            }
		            catch (err3) {
						try {
							request = new XMLHttpRequest();
						}
						catch (err1) 
						{
							throw("Votre client n'autorise pas les connexions Ajax.");
							request = false;
						}
		            }
		        }
		    return request;
		},
		

		//fonction de communication avec le serveur
		communiqueGET : function (url,tableauArgs,callback,callbackerreur){
			var xhr = MonAjax._createXHR();var serveur = url;
			var chaineDAppel = url;
			if (typeof(tableauArgs)=='string'){
				chaineDAppel += tableauArgs+(url.indexOf("?")>=0?"&":"?")+"nocache=" + Math.random();
			} else if (typeof tableauArgs == "object") {//tableau associatif
				chaineDAppel+=url+(tableauArgs.indexOf("?")>=0?"&":"?");
				for(var clef in tableauArgs)
					chaineDAppel+=clef+"="+tableauArgs[clef]+"&";
				chaineDAppel += "nocache=" + Math.random();
			}
			xhr.onreadystatechange  = function(){ 
				if(xhr.readyState  == 4){
					if(xhr.status  == 200) {
						if (callback) {
							callback(xhr.responseXML,xhr.responseText);
						}
					} else {
						if (callbackerreur){
							callbackerreur(xhr.status,xhr.responseText);
						}
					}
		         }
		    }; 
			xhr.open("GET", chaineDAppel, true); 
			xhr.send(null);
		},

		communiquePOST : function (url,tableauArgsGET,tableauArgsPOST,callback,callbackerreur){
			var xhr = MonAjax._createXHR();var serveur = url;
			var chaineDAppel = serveur;//+"?";
			if (typeof(tableauArgsGET)=='string'){
				chaineDAppel += (serveur.indexOf("?")>0 ? "":"?")+tableauArgsGET;
				//+(tableauArgsGET.indexOf("?")>=0?"&":"?")+"nocache=" + Math.random();
			} else if (tableauArgsGET) {//tableau associatif
				for(var clef in tableauArgsGET){
					chaineDAppel+=(chaineDAppel.indexOf("?")>0 ? "&":"?");
					chaineDAppel+=encodeURIComponent(clef)+"="+encodeURIComponent(tableauArgsGET[clef]);
				}
				//chaineDAppel += "nocache=" + Math.random();
			}
			chaineEnvoyee = "";
			for(var clef in tableauArgsPOST)
				chaineEnvoyee+=encodeURIComponent(clef)+"="+encodeURIComponent(tableauArgsPOST[clef])+"&";
			chaineEnvoyee = chaineEnvoyee.substr(0,chaineEnvoyee.length-1);
			xhr.onreadystatechange  = function(){ 
				if(xhr.readyState  == 4){
					if(xhr.status  == 200) {
						leXML = xhr.responseXML;
						yaErreur = leXML.getElementsByTagName("erreur").length;
						if (yaErreur){
							//TODO
						} else {
							if (callback)
								callback(xhr.responseXML,xhr.responseText);
						}
					} else {
						if (callbackerreur){
							callbackerreur(xhr.status,xhr.responseText);
						}
					}
		         }
		    }; 
		    console.log(chaineEnvoyee);
		    xhr.open("POST", chaineDAppel, true); 
			xhr.send(chaineEnvoyee);
			
		},
		envoieFormulaire : function (formulaire, callback, callbackerreur){
			var inputs = formulaire.getElementsByTagName("input");
			var tabArgs = new Object();
			for (var i = 0;i < inputs.length; i++){
				if (inputs[i].getAttribute("name"))
					tabArgs[inputs[i].getAttribute("name")] = inputs[i].value;
			}
			
			var methode = formulaire.getAttribute("method") || "GET";
			if (methode.toLowerCase() == "get"){
				MonAjax.communiqueGET(
						formulaire.getAttribute("target"),
						tabArgs, callback, callbackerreur);
			} else {
				MonAjax.communiquePOST(formulaire.getAttribute("target"),
						null, tabArgs, callback, callbackerreur);
			}
			
		}
}