/**
 * Debounce / throttle all AJAX requests Duplicate request can't be made twice
 * within our throttle limit This stops duplicate entries and multiple server
 * requests
 * 
 */

// throttle time in ms
$.ajaxThrottle = 1000;
// our AJAX requests
$.ajaxRequests = {};
// list of urls allowed to call faster than our debounce throttle
$.allowedUrls = [];

// Override the send to store our ajax request time and abort ones that are
// within our throttle time
jQuery(document).ajaxSend(function(event, xhr, settings) {
  // check if this is an allowed url
  for (let i = 0; i < $.allowedUrls.length; i++) {
    if (settings.url.indexOf($.allowedUrls[i]) !== -1) {
      return;
    }
  }
  // we have made this request before and we are posting
  if ($.ajaxRequests[settings.url] != undefined) {
    // if our request is still pending or the throttle time has not passed
    // then stop the request
    if (($.ajaxRequests[settings.url].responseTime + $.ajaxThrottle) > Date.now() || $.ajaxRequests[settings.url].responseTime == 0) {
      xhr.abort();
      return false;
    }
  }
  $.ajaxRequests[settings.url] = {
    requestTime : Date.now(),
    responseTime : 0
  };
});

// Override the complete to store our ajax request completed time
jQuery(document).ajaxComplete(function(event, xhr, settings) {
  // we get a status code from the server and not aborted from debounce
  if (xhr.status != 0 && $.ajaxRequests[settings.url] != undefined) {
    $.ajaxRequests[settings.url].responseTime = Date.now();
  }
});

// Override default errors so we don't show them on abort
// Save reference to actual jQuery ajax function
var $_ajax = $.ajax;
$.ajax = function(options) {
  if (options.error) {
    // save reference to original error callback
    let originalErrorHandler = options.error;
    let errorHandlerContext = options.context ? options.context : $;
    // define a custom error callback
    let customErrorHandler = function(xhr, status, error) {
      // call original error callback
      if (xhr.status != 0) {
        originalErrorHandler.apply(errorHandlerContext, arguments);
      }
      // our abort, do nothing
      else {
        return;
      }
    };
    // override error callback with custom implementation
    options.error = customErrorHandler;
  };
  // call original ajax function with modified arguments
  $_ajax.apply($, arguments);
};
