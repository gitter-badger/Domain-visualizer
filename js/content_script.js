chrome.storage.sync.get({"option-root-disc": false}, function(result) {
	var discover = result["option-root-disc"];
	var baseUrl = stripUrl(document.URL);;
	if(discover) {
	    $.getJSON(baseUrl +'/chck-env.json', function(d) {
	        insertHtmlInDom(d);
	    }).fail( function(d, textStatus, error) {
	    	console.log('Debug: ', 'could not find json, moving on to local storage check');
	        checkLocalStorage();
	    });
	} else {
		checkLocalStorage();
	}
});

function checkLocalStorage() {
	chrome.storage.sync.get({ sites: {} }, function(items) {
	console.log(items);
	 var url = document.URL.split('/')[2].replace('www.', '');
	 $.each(items.sites, function(key, value) {
		 var storedEnvKey = key.split('/')[2].replace('www.','');
		 if(url == storedEnvKey) {
		     insertHtmlInDom(value);
		     return false;
		 }
	  });
	});	
}

function stripUrl(url) {
	var splitedUrl = url.split('/');
	return splitedUrl[0] + "//" + splitedUrl[2];
}

function insertHtmlInDom(param)
{
	console.log(param);
	if(!param.hasOwnProperty('custom_html') || param.custom_html == false) {
    	$('body').prepend('<div class="environmentblock" style="position: fixed; z-index: 900000000; top: 0px; left: 0px; right: 0px; text-align: center; vertical-align: middle;color: '+param.textColor+'; background-color: '
		    +param.backgroundColor+'; width: '+param.width+ ';height: '+param.height+';"><div style="line-height: '+param.height+'; font-size: '+param.textSize+';">'+param.name+'</div></div>');

    	var bodyPadding = parseInt($('body').css('padding-top').replace('px', ''));
    	console.log(bodyPadding);    	
    	bodyPadding = bodyPadding + parseInt(param.height.replace('px', ''));
    	console.log(bodyPadding);    	
    	$('body').css('padding-top', bodyPadding + 'px');
	} else {
		$('body').prepend(JSON.parse(param.custom_html));
	}
}