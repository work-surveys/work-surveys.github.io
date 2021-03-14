(function () {
	var cookieName = '__enalyzer_es';

	function callAjax(baseUrl, getAttributeEmbedId, callback) {
		var xmlhttp;
		var ajaxUrl = baseUrl + getAttributeEmbedId;
		if (window.XMLHttpRequest) {
			xmlhttp = new XMLHttpRequest();
		} else {
			xmlhttp = new ActiveXObject('Microsoft.XMLHTTP');
		}
		xmlhttp.onload = function () {
			if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
				embed(xmlhttp.responseText, getAttributeEmbedId);
			}
		}
		xmlhttp.open("GET", ajaxUrl, true);
		xmlhttp.send(xmlhttp.responseText);
	}

	function setUpDelay(json, getAttributeEmbedId) {
		var timeDelay = json.TimeDelay * 1000;
		setTimeout(function () {
			var iframe = document.createElement('iframe');
			iframe.id = '__enalyzer_survey';
			iframe.frameBorder = '0';
			iframe.width = '100%';
			iframe.height = '100%';
			iframe.style.border = 'none';
			iframe.style.overflow = 'hidden';
			iframe.style.backgroundColor = 'rgba(0,0,0,0.4)';
			iframe.style.position = 'fixed';
			iframe.style.bottom = '0px';
			iframe.style.left = '0px';
			iframe.style.zIndex = '2147483647';
			iframe.src = json.HostName + '/embedmarkup/' + getAttributeEmbedId;
			document.body.appendChild(iframe);
			window.addEventListener('message', adjustPopupProperties, false);
		}, timeDelay);
	}

	function embed(json, getAttributeEmbedId) {
		var json = JSON.parse(json);
		switch (json.WebsiteCollectorType) {
			case 'Embed':
				var iframe = document.createElement('iframe');
				iframe.id = 'survey-frame';
				iframe.width = json.Width;
				iframe.height = json.Height;
				iframe.style.border = 'none';
				var loc = window.location.toString();
				if (loc.includes('?')){
				  var params = loc.split('?')[1];
				  //if survey id is passed in, remove the default one
				  if (params.includes('pid=')){
				    const baseUrl = json.Url.split('pid=')[0]
				    //copy all passed in parameters
				    iframe.src = baseUrl + params
				  }else {
			            //preserve passed in paramaters
				    iframe.src = json.Url + '&' + params;
				  }
				}else {
				    iframe.src = json.Url
				}
				document.getElementById('embed-enalyzer').appendChild(iframe);
				break;
			case 'Button':
				var iframe = document.createElement('iframe');
				iframe.id = '__enalyzer_survey';
				iframe.frameBorder = '0';
				iframe.height = '40px';
				iframe.style.border = 'none';
				iframe.style.overflow = 'hidden';
				iframe.style.backgroundColor = 'transparent';
				iframe.style.position = 'fixed';
				iframe.style.bottom = '20px';
				iframe.style.right = '20px';
				iframe.src = json.HostName + '/embedmarkup/' + getAttributeEmbedId;
				document.body.appendChild(iframe);
				window.addEventListener('message', adjustButtonProperties, false);
				break;
			case 'Popup':
				var cookie = getCookie(cookieName);
				if (!Array.isArray(cookie) || cookie.indexOf(getAttributeEmbedId) < 0) {
					setUpDelay(json, getAttributeEmbedId);
					if (!Array.isArray(cookie)) {
						cookie = [];
					}
					if (cookie.indexOf(getAttributeEmbedId) < 0) {
						cookie.push(getAttributeEmbedId);
					}
					setCookie(cookieName, cookie);
				}
				break;
			default:
				console.log('no type found for enalyzer data collection channel: ' + json.type);
		}
	}

	function adjustButtonProperties(message) {
		var widthString = message.data + 'px';
		document.getElementById('__enalyzer_survey').style.width = widthString;
	}

	function adjustPopupProperties(message) {
		var __enalyzer_survey = document.getElementById('__enalyzer_survey');
		__enalyzer_survey.parentNode.removeChild(__enalyzer_survey);
	}

	function setCookie(name, value) {
		document.cookie = name + "=" + encodeURIComponent(JSON.stringify(value)) + "; path=/";
	}

	function getCookie(name) {
		var allCookies = document.cookie.split(';');

		for (var i = 0; i < allCookies.length; i++) {
			var re = new RegExp("^\\s*" + name + "\\s*=");
			var c = allCookies[i];
			if (re.test(c)) {
				var result = decodeURIComponent(c.replace(re, ""));
				try {
					result = JSON.parse(result);
				} catch (e) {}
				return result;
			}
		}

		return null;
	}

	//Ajax call called onload:
	window.onload = function () {
		// check that postMessage is available before making call
		if (typeof window.postMessage !== 'undefined') {
			var getScript = document.getElementById('enalyzer-embed');
			var getAttributeEmbedId = getScript.getAttribute('data-embedid');
			var getAttributeEnv = getScript.getAttribute('data-env');
			var getAttributeEnv = (getAttributeEnv) ? getAttributeEnv : "https://surveys.enalyzer.com";
			
			callAjax(getAttributeEnv + '/embed/', getAttributeEmbedId);
		}
	}
})();
