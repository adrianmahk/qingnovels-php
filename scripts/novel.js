
function ready(fn) {
    if (document.readyState != 'loading') {
        fn();
    } else if (document.addEventListener) {
        document.addEventListener('DOMContentLoaded', fn);
    } else {
        document.attachEvent('onreadystatechange', function () {
            if (document.readyState != 'loading')
                fn();
        });
    }
}
ready(function () {
    init(); replaceTitle(); showPageLoading();
    // moveBlogPagerToTopBar(function () {
        // loadScrollPos();
    // });
});
var resizeTimer = 0;
function init() {
    window.addEventListener('load', function (e) {
        hidePageLoading();
        document.body.setAttribute("page-loaded", true);
    });
    window.addEventListener('click', eventCallback, false);
    window.addEventListener("scroll", function (e) {
        handleScrollEvent(e);
    });
    window.addEventListener("pageshow", loading);
    window.addEventListener("ajaxload", loading);
    window.addEventListener("popstate", function (e) {
        if (e.state) {
            if (!popstateReplacePage(e.state)) {
            ajaxLoadHTML(this.window.location, ajaxReplacePage, {push: false, state: e.state});
            }
        }
    });
    //window.addEventListener("beforeunload", unloading);
    window.addEventListener("pagehide", unloading);
    window.addEventListener('animationiteration', function (event) {
        if (event.target.classList.contains('loading-bar')) {
            if (document.body.classList.contains('page-loading-end')) {
                document.body.classList.remove('page-loading-end');
            }
        }
    });
    const resizeObserver = new ResizeObserver(entries => {
        // console.log('Body height changed:', entries[0].target.clientHeight);
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          if (document.body.getAttribute("page-loaded") == "true") {
            loadScrollPos(document.body.getAttribute("ajax-popstate") == "true");
            document.body.removeAttribute("page-loaded");
            document.body.removeAttribute("ajax-popstate");
          }
          handleScrollEvent(0);
        }, 100);
      });
      resizeObserver.observe(document.getElementById("page"));
}

function loading(event, isAjax = false, isPopstate = false) {
    document.body.removeAttribute("unloaded");
    if (event && event.detail) {
        isAjax = event.detail.isAjax;
        isPopstate = event.detail.isPopstate;
    }

    if (isAjax || event.persisted) {
        // console.log('persisted');
        darkModeInit();
        changeFontSizeInit();
        hidePageLoading();
    }
    if (isAjax) {
        document.body.setAttribute("page-loaded", true);
        nodeScriptReplace(document.getElementById("page"));
        // loadScrollPos();
    }
    loadReadingProgress();
    loadNowReading();
    saveNowReading();
}

function unloading(event) {
    if (!document.body.getAttribute("unloaded")) {
        hidePageLoading();
        if (document.body.classList.contains("feed-view")) {
            var button_list = document.getElementsByClassName('snippet-a');
            for (i = 0; i < button_list.length; i++) {
                button_list[i].setAttribute("triggered", "false");
            }
        }
        // saveScrollPos();

        document.body.setAttribute("unloaded", true);
    }
}

function eventCallback(e) {
    if (e.metaKey || e.ctrlKey) {
        return;
    }
    var anchorEl = findLink(e.target);
    if (anchorEl == null) {
        return;
    }
    else if (!handleLink(anchorEl)) {
        e.preventDefault();
        e.stopPropagation();
    }
}

function findLink(el) {
    if (el.tagName == 'A' && el.href) {
        return el;
    } else if (el.parentElement) {
        return findLink(el.parentElement);
    } else {
        return null;
    }
}

function getCookie(cname) {
    var name = cname + '=';
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function writeCookie(key, value, days = 30) {
    var someDate = new Date();
    someDate.setDate(someDate.getDate() + days);
    someDate.setHours(0, 0, 0, 0);

    var cookie = key + "=" + value + "; expires=" + someDate.toUTCString() + "; path=/; samesite=lax";
    document.cookie = (cookie);
}

function clearCookie(cookie_key) {
    var someDate = new Date(0);
    var cookie = cookie_key + "=" + 0 + "; expires=" + someDate.toUTCString() + "; path=/; samesite=lax";
    document.cookie = (cookie);
}

function changeFontSizeInit() {
if (document.body.className.match("item-view")) {
    var font_size_cookie = getCookie("font-size");
    if (font_size_cookie == "") {
    font_size_cookie = getCookie("font_size");
    }
    if (font_size_cookie != "") {
    var body = document.body;
    body.classList.remove("f12px", "f13px", "f14px", "f15px", "f16px", "f17px", "f18px");
    //body.classList.remove("font-xs", "font-s", "font-m", "font-l", "font-xl");

    body.classList.add(font_size_cookie);
    writeCookie("font-size", font_size_cookie);
    }
}
}
function changeFontSize() {
var body = document.body;
var next_font_size = "f15px";

if (body.classList.contains("f12px") || body.classList.contains("f13px")) {
    next_font_size = "f14px";
}
else if (body.classList.contains("f14px")) {
    next_font_size = "f15px";
}
else if (body.classList.contains("f15px")) {
    next_font_size = "f16px";
}
else if (body.classList.contains("f16px")) {
    next_font_size = "f17px";
}
else if (body.classList.contains("f17px") || body.classList.contains("f18px")) {
    next_font_size = "f13px";
}
body.classList.remove("f12px", "f13px", "f14px", "f15px", "f16px", "f17px", "f18px");
body.classList.add(next_font_size);
writeCookie("font-size", next_font_size);
}

function darkMode() {
    var body = document.body;

    var someDate = new Date();
    var numberOfDaysToAdd = 30;
    someDate.setDate(someDate.getDate() + numberOfDaysToAdd);
    if (!body.classList.contains("dark-mode")) {
        // darkOverlay.style.visibility = "visible";
        body.classList.add("dark-mode");
        writeCookie("dark-mode", 1);
    }
    else {
        // darkOverlay.style.visibility = "hidden";
        body.classList.remove("dark-mode");
        clearCookie("dark-mode");
    }
}
function darkModeInit() {
    var body = document.body;
    var cookie_value = getCookie("dark-mode");
    if (cookie_value == "1") {
        body.classList.add("dark-mode");
        writeCookie("dark-mode", 1);
    }
    else {
        body.classList.remove("dark-mode");
        clearCookie("dark-mode");
    }
}

function showPageLoading() {
    document.body.classList.add("page-loading");
    var el = document.getElementById('loading-bar');
    el.style.animation = 'none';
    el.offsetHeight; /* trigger reflow */
    el.style.animation = null;
}

function hidePageLoading(delay = 1000) {
    if (delay > 0) {
        document.body.classList.remove('page-loading', 'ajax-loading');
        document.body.classList.add('page-loading-end');
    }
    else {
        document.body.classList.remove('page-loading');
    }
}

function gotoUrlWithDelay(url, delay = 100, animated = true) {
    if (animated) {
        showPageLoading();
    }
    setTimeout(function () {
        window.location.href = url;
    }, delay);
    return false;
}
var triggerTimer = 0;
function handlePreviewLink(anchorEl, touch) {
    // console.log("handleLink" + (touch ? "" : " touch"));
    console.log(anchorEl);
    clearTimeout(triggerTimer);
    triggerTimer = setTimeout(function () {
        if (anchorEl.getAttribute('triggered') == 'true' && !touch) {
            // gotoUrlWithDelay(anchorEl.href);
            ajaxLoadHTML(anchorEl, ajaxReplacePage);
        }
        else {
            toggleTriggered(anchorEl, true);
        }
    }, 100);

    return false;
}

function handleLink(anchorEl) {
    var website = window.location.hostname;
    website = website.replace("www.", "");

    var internalLinkRegex = new RegExp(
        '^('
          +'(((http:\\/\\/|https:\\/\\/)(www\\.)?)?(' + website + '|(localhost.*)))' //starts with host
          +'|'  // or
          +'(localhost.*)' //starts with localhost
          +'|' // or
          +'((\\/|#|\\?|javascript:).*))'  //starts with / # ? javascript:
          +'((\\/|\\?|\#).*'  //ends with / # $
        +')?$'
        , '');
    var jsCheck = new RegExp('^(javascript:|\#).*?$', '');
    const imgCheck = new RegExp('(\.jpg|\.gif|\.png|\.jpeg|\.mov|\.mp4|\.woff)$', 'i');
    var href = anchorEl.getAttribute('href');
    if (href) {
        if (anchorEl.classList.contains("snippet-a")) {
            return handlePreviewLink(anchorEl);
        }
        else if (!jsCheck.test(href)) {
            if (!internalLinkRegex.test(href) || imgCheck.test(href)) {
                anchorEl.setAttribute('target', '_blank');
            }
            else if (new URL(window.location.href, "http://example.com").pathname === new URL(href, "http://example.com").pathname) {
                return true; // same url, just a #
            }
            else if (!anchorEl.getAttribute('onclick') && !anchorEl.getAttribute('target') && !jsCheck.test(href)) {
                // return gotoUrlWithDelay(href); // which is always false
                return ajaxLoadHTML(anchorEl, ajaxReplacePage);
            }
        }
    }
    return true;
}
function replaceTitle() {
    if (document.body.className.match("feed-view")) {
        var titles = document.getElementsByClassName("post-title entry-title");
        for (i = 0; i < titles.length; i++) {
            var newt = titles[i].innerHTML.replace("\uff1e ", "\uff1e<br />");
            titles[i].innerHTML = newt;
            //console.log(titles[i].innerHTML, newt);
        }
        //alert(titles.length);
    }
}
function detectAndroid() {
    //if (/(android)/i.test(navigator.userAgent))
    if (navigator.userAgent.match(/Android/i)
        || navigator.userAgent.match(/iPhone/i)
        || navigator.userAgent.match(/iPad/i)
        || navigator.userAgent.match(/iPod/i)
    )
        return true;
    else
        return false;
}
var mobileDevice = detectAndroid();

function toggleTriggered(button = null, onOff = false) {
    clearTimeout(triggerTimer);
    triggerTimer = setTimeout(function () {
        var button_list = document.getElementsByClassName('snippet-a');
        for (i = 0; i < button_list.length; i++) {
            button_list[i].setAttribute("triggered", (onOff && button_list[i] == button) ? "true" : "false");
        }
    }, 100);
}
function moveBlogPagerToTopBar(fn = null) {
    if (document.body.classList.contains("item-view")) {
        var blogPagerContainer = document.getElementsByClassName("blog-pager container");
        var topBar = document.getElementById("top-bar");
        var topBarShadow = document.getElementById("top-bar-shadow");
        if (blogPagerContainer.length > 0) {
            topBar.insertBefore(blogPagerContainer[0], topBarShadow);
        }
    }
    if (fn) {
        fn();
    }
}
function saveNowReading() {
    if (typeof (Storage) !== "undefined" && document.body.classList.contains("item-view")) {
        console.log("item-view: " + document.body.classList.contains("item-view"));
        localStorage.setItem("last-read-title", document.title);
        localStorage.setItem("last-read-url", window.location.href);
        //localStorage.setItem("last-read-scroll-pos", document.body.scrollTop || document.scrollingElement.scrollTop);
    }
}
function loadNowReading() {
    if (typeof (Storage) !== "undefined" && document.body.classList.contains("homepage-view")) {
        var lastReadTitle = localStorage.getItem("last-read-title");
        var lastReadUrl = localStorage.getItem("last-read-url");
        //var lastReadScrollPos = localStorage.getItem("last-read-scroll-pos");
        if (lastReadTitle) {
            var lastReadMsg = document.getElementById("last-read-msg");
            var lastReadA = document.getElementById("last-read-a");
            if (lastReadMsg) {
                lastReadMsg.style.visibility = "visible";
                lastReadA.innerHTML = lastReadTitle;
                lastReadA.setAttribute("href", lastReadUrl);
            }
        }
    }
}

function getScrollPercent(bottomPadding = 580) {
    const post = document.querySelector(document.body.classList.contains("item-view") ? "#post-body" : "#page");
    const header = document.querySelector('header');
    const top = post.getBoundingClientRect().top - (header ? header.getBoundingClientRect().height : 0);
    const height = post.getBoundingClientRect().height - window.innerHeight;
    var percent = 100.0 * (top < 0 ? -top : 0) / height;
    return Math.min(100, (Math.round(percent * 100) / 100));
  }

function getLocalStorageScrollPos(key = "scrollPosJsonURIDecode") {
if (typeof (Storage) !== "undefined") {
// var scrollPosJson = localStorage.getItem("scrollPosJson");
var scrollPosJson = localStorage.getItem(key);
var scrollPosObj = scrollPosJson ? JSON.parse(scrollPosJson) : {};

return scrollPosObj;
}
}
 
function getLocalStorageJson(key = "scrollPosJson") {
    if (typeof (Storage) !== "undefined") {
        var json = localStorage.getItem(key);
        var obj = json ? JSON.parse(json) : {};
        return obj;
    }
}

function saveScrollPos(path = undefined, scrollPercent = undefined) {
    if (!document.body.classList.contains("error404")) {
        if (typeof (Storage) !== "undefined") {
        var scrollPosObj = getLocalStorageScrollPos();
        if (!path) {
            path = decodeURI(window.location.pathname);
        }
        else {
            path = decodeURI(path);
        }
        if (scrollPercent === undefined) {
            // scrollPercent = (document.body.getAttribute("scrollPos") != undefined) ? document.body.getAttribute("scrollPos") : 0;
            scrollPercent = getScrollPercent();
        }
        
        console.log(path + ": " + scrollPercent);
        scrollPosObj[path] =  scrollPercent;
        // localStorage.setItem("scrollPosJson", JSON.stringify(scrollPosObj));
        localStorage.setItem("scrollPosJsonURIDecode", JSON.stringify(scrollPosObj));
        }
    }
}

function loadScrollPos(popstate = false, bottomPadding = 580) {
// get scrollPos
    if (window.location.hash) {
    const anchor = document.querySelector("[id='" + window.location.hash.replace("#", "") + "'], [name='" + window.location.hash.replace("#", "") + "']");
    if (anchor) {
        window.scrollTo({
        top: anchor.getBoundingClientRect().top + window.pageYOffset, // scroll so that the element is at the top of the view
        behavior: 'smooth' // smooth scroll
        })
    }
    }

    if (popstate || document.body.classList.contains("is-post")) {
    if (typeof (Storage) == "undefined") {
        return;
    }

    var scrollPosObj = getLocalStorageScrollPos();
    var scrollPos = scrollPosObj ? scrollPosObj[decodeURI(window.location.pathname)] : 0;
    updateItemViewProgressBar(scrollPos);
    if (scrollPos === undefined) {
        saveScrollPos();
    }
    else {
        scrollPos = scrollPos / 100;
        if (document.body.classList.contains("is-post")) {
        if (scrollPos < 0.05 || scrollPos > 0.99 || (window.innerHeight > ((document.documentElement.scrollHeight || document.body.scrollHeight) - bottomPadding))) {
            return;
        }
        }
        setTimeout(function (){
        const post = document.querySelector(document.body.classList.contains("item-view") ? "#post-body" : "#page");
        const header = document.querySelector('header');
        // console.log(header.getBoundingClientRect().height);
        var scrollPosFromPercent = post.getBoundingClientRect().top + window.pageYOffset + (header ? header.getBoundingClientRect().height : 0)  + scrollPos * (post.getBoundingClientRect().height  - window.innerHeight);
        // var scrollPosFromPercent = post.getBoundingClientRect().top + window.pageYOffset  + scrollPos * (post.getBoundingClientRect().height  - window.innerHeight);
        window.scrollTo({
            top: scrollPosFromPercent,
            behavior: popstate ? "auto" : "smooth"
        });
        }, popstate ? 0 : 0);
    }
    
    }
}

function loadReadingProgress() {
    if (document.body.classList.contains("feed-view")) {
        // Chapter progress
        var scrollPosObj = getLocalStorageScrollPos();
        var snippetA = document.getElementsByClassName("snippet-a");
        var sum = 0;
        for (var i = 0; i < snippetA.length; i++) {
            var url = new URL(snippetA[i].href);
            if (scrollPosObj[url.pathname + url.search] != undefined) {
                var percent = scrollPosObj[url.pathname + url.search];
                sum += percent / 100;
                var progressBars = snippetA[i].getElementsByClassName("progress-bar");
                if (progressBars.length > 0) {
                    progressBars[0].classList.add("visited");
                    progressBars[0].setAttribute("style", "width: " + percent + "%");
                }
            }
        }

        //Section progress
        if (window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches) {
        // if (true) {
            // console.log('standalone');
            var sectionPercent = Math.ceil((sum / snippetA.length) * 100);
            //console.log(sectionPercent);
            var progressBarTopBar = document.getElementById("progress-bar-top-bar");
            if (progressBarTopBar) {
                progressBarTopBar.classList.add("visited");
                progressBarTopBar.setAttribute("style", "width: " + sectionPercent + "%");
            }
            var jsonObj = getLocalStorageScrollPos("sectionProgressJson");
            jsonObj[decodeURI(window.location.pathname + window.location.search)] = sectionPercent;
            localStorage.setItem("sectionProgressJson", JSON.stringify(jsonObj));
        }
    }
    else if (document.body.classList.contains("homepage-view") && (window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches)) {
    // else if (document.body.classList.contains("homepage-view")) {
        var sectionProgressObj = getLocalStorageScrollPos("sectionProgressJson");
        var labelCustA = document.getElementsByClassName("label-cust-a");

        for (var i = 0; i < labelCustA.length; i++) {
            var url = new URL(labelCustA[i].href);
            if (sectionProgressObj[decodeURI(url.pathname + url.search)] != undefined) {
                var percent = sectionProgressObj[decodeURI(url.pathname + url.search)];
                sum += percent / 100;
                var progressBars = labelCustA[i].getElementsByClassName("progress-bar");
                if (progressBars.length > 0) {
                    progressBars[0].classList.add("visited");
                    progressBars[0].setAttribute("style", "width: " + percent + "%");
                }
            }
        }

    }
}
var scrollTimer = 0;
function handleScrollEvent(e, delay = 500) {
  clearTimeout(scrollTimer);
  var handleScrollPercent = function (){
      if (!document.body.classList.contains("page-loading")) {
          var scrollPercent = getScrollPercent();
          if (document.body.classList.contains("blog")  || (document.body.classList.contains("is-post") && document.body.classList.contains("collapsed-header") && (scrollPercent > 1)) ) {
        document.body.setAttribute("scrollPos", scrollPercent);
        saveScrollPos();
        updateItemViewProgressBar();
      }
    }
  };
  if (delay > 0) {
    scrollTimer = setTimeout(handleScrollPercent, delay);
  }
  else {
    handleScrollPercent();
  }
  
  var article = document.querySelector("header");
  if (article) {
    if(article.getBoundingClientRect().bottom < 0 && !document.body.classList.contains("collapsed-header")){
      document.body.classList.add("collapsed-header");
    }
    else if (article.getBoundingClientRect().bottom > 0 && document.body.classList.contains("collapsed-header")) {
      document.body.classList.remove("collapsed-header");
    }
  }

}
function updateItemViewProgressBar(progress = false) {
    if (document.body.classList.contains("item-view")) {
        // if (document.body.classList.contains("item-view" && document.body.getAttribute("js-loaded") == "true")) {
        var progressBarTopBar = document.getElementById("progress-bar-top-bar");
        if (progressBarTopBar) {
            progressBarTopBar.setAttribute("style", "width: " + (progress ? progress : getScrollPercent()) + "%");
            progressBarTopBar.classList.add("visited");

        }
        if (progress) {
            document.body.setAttribute("scrollPos", progress);
        }
    }
}


function ajaxLoadHTML(link, ajaxCallback = null, ajaxCallBackArgs = null, appendMode = false) {
    var anchorEl = null;
    if (link.nodeType) {
      anchorEl = link;
      link = link.href;
    }
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
      if (this.readyState == 4 && (this.status == 200 || this.status == 404)) {
        console.log("ajaxLoadHTML: " + link + " success.");
        if (anchorEl) {
          anchorEl.classList.remove("disabled");
        }
        clearTimeout(timer); 
        if (ajaxCallback) {
          var args = {
            responseText: this.responseText,
            link: link,
            push: ajaxCallBackArgs ? (ajaxCallBackArgs.push ? ajaxCallBackArgs.push : false) : true,
            state: ajaxCallBackArgs ? (ajaxCallBackArgs.state ? ajaxCallBackArgs.state : null) : null
          };
          ajaxCallback(args);
        }
      }
      else if (this.readyState == 4) {
        hidePageLoading();
        // showPopupMessage(this.responseText);
      }
    };
    if (link) {
      if (anchorEl) {
        anchorEl.classList.add("disabled");
      }
      xhttp.open("GET", link, true);
      xhttp.send();
      showPageLoading(!appendMode);
      timer = setTimeout(function () {
        hidePageLoading(0);
        xhttp.abort();
        if (anchorEl) {
          anchorEl.classList.remove("disabled");
        }
      }, 5000);
  
    }
  
    return false;
  }
  
  function ajaxReplacePage(args = null) {
    const responseText = args.responseText;
    const link = args.link;
    const push = args.push;
    const state = args.state;
    
    var ajax_doc = new DOMParser().parseFromString(responseText, "text/html");
    // document.body.classList.add("page-loading", "ajax-loading");
    ajax_doc.body.classList.add("page-loading", "ajax-loading");
    var ajax_page = ajax_doc.getElementById("page");
    var body_page = document.getElementById("page");
    
    unloading();
    if (push) {
      history.replaceState({page: body_page.innerHTML, title: document.title, classList: document.body.classList.value}, document.title, window.location);
      history.pushState({page: ajax_page.innerHTML, title: ajax_doc.title, classList: ajax_doc.body.classList.value}, ajax_doc.title, link);
    }
    else {
      document.body.setAttribute("ajax-popstate", true);
    }
    window.scrollTo(0, 0);
    document.body.classList = ajax_doc.body.classList;
    body_page.innerHTML = ajax_page.innerHTML;
    document.title = ajax_doc.title;
    hidePageLoading();
  
    // pageShowCallBack(null, true);
    const customEvent = new CustomEvent("ajaxload", {detail: {isAjax: true}, bubbles: true, cancelable: true, composed: false});
    body_page.dispatchEvent(customEvent);
  }

function popstateReplacePage(state) {
if (state && state.page && state.classList) {
    showPageLoading(true);
    const body_page = document.getElementById("page");
    body_page.innerHTML = state.page;
    document.body.classList = state.classList;//.replace("page-loading", "").replace("ajax-loading","");
    document.title = state.title ? state.title : "";
    
    // pageShowCallBack(null, true, true);
    const customEvent = new CustomEvent("ajaxload", {detail: {isAjax: true, isPopstate: true}, bubbles: true, cancelable: true, composed: false});
    body_page.dispatchEvent(customEvent);
    hidePageLoading();
    return true;
}
return false;
}

function nodeScriptReplace(node) {
    if ( nodeScriptIs(node) === true ) {
            node.parentNode.replaceChild( nodeScriptClone(node) , node );
    }
    else {
            var i = -1, children = node.childNodes;
            while ( ++i < children.length ) {
                  nodeScriptReplace( children[i] );
            }
    }
  
    return node;
  }
  function nodeScriptClone(node){
    var script  = document.createElement("script");
    script.text = node.innerHTML;
  
    var i = -1, attrs = node.attributes, attr;
    while ( ++i < attrs.length ) {                                    
          script.setAttribute( (attr = attrs[i]).name, attr.value );
    }
    return script;
  }
  
  function nodeScriptIs(node) {
    return node.tagName === 'SCRIPT';
  }