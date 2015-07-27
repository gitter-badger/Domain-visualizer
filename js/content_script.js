chrome.storage.sync.get({"option-root-disc": false}, function(result) {
		var discover = result["option-root-disc"];
		var baseUrl = stripUrl(document.URL);;
		if(discover) {
		    $.getJSON(baseUrl +'/chck-domain.json', function(d) {
		        insertHtmlInDom(d);
		    }).fail( function(d, textStatus, error) {
		        run();
		    });
		} else {
			run();
		}
	});

function run(){
	if ( $( "body" ).length <= 0 ) {
		(function() {
	      var observer = new MutationObserver(function() {
	        if (document.body) {
	          // It exists now
	          checkLocalStorage()
	          observer.disconnect();
	        }
	      });
	      observer.observe(document.documentElement, {childList: true});
	    })();
	}
	else {
		checkLocalStorage()
	}
}

function checkLocalStorage() {
	chrome.storage.sync.get({ sites: {} }, function(items) {
	 var url = document.URL;
	 $.each(items.sites, function(key, value) {
		 if(stripUrl(url) == stripUrl(key)) {
		     insertHtmlInDom(value);
		     return false;
		 }
	  });
	});	
}

function stripUrl(url) {
	var regexedUrl = url.replace(/(?:https?:\/\/)?(?:www\.)?(.*)\/?$/i, '$1');
	var regexedUrl = regexedUrl.replace(/:{1}\d{1,}/i, '');
	var splitedUrl = regexedUrl.split('/');
	return splitedUrl[0];
}

function insertHtmlInDom(param)
{
	if(param.hasOwnProperty('fade') && param.fade == true) {
		$(document).scroll(function() {
			if($(this).scrollTop() > 5){
			    $('.environmentblock').css("opacity", "0.6");
				$('.environmentblock').css("transition", "1s");
				$('.environmentblock').css("pointer-events", "none");
			} else {
			 	$('.environmentblock').css("opacity", "1");
			 	$('.environmentblock').css("pointer-events", "auto");
			}
		});
	}

	if(!param.hasOwnProperty('custom_html') || param.custom_html == false) {
    	$('body').prepend('<div class="environmentblock" style="position: '+param.position +'; z-index: 900000000; top: 0px; left: 0px; right: 0px; text-align: center; vertical-align: middle;color: '+param.textColor+'; background-color: '
		    +param.backgroundColor+'; width: '+param.width+ ';height: '+param.height+';"><div style="line-height: '+param.height+'; font-size: '+param.textSize+';">'+param.name+'</div></div>');
		$('body').prepend('<div style="height: ' + param.height + ';">&nbsp;</div>');
	} else {
		$('body').prepend(JSON.parse(param.custom_html));
	}
}
