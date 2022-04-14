// var hostPath = "http://localhost:84";
var hostPath = "";
var postsPath = "/posts/";
var tagsPath = "/tags/";
ready(function (){
    // loadPost('posts/cloud-2-5-1.html');
    // if (document.body.classList.contains('homepage-view')) {
    //     if ('serviceWorker' in navigator) {
	// 		navigator.serviceWorker.register('/sw.js', {scope: '/'}).then(function(registration) {
	// 			console.log('Service worker registration succeeded:', registration);
	// 		}, /*catch*/ function(error) {
	// 			console.log('Service worker registration failed:', error);
	// 		});
	// 	}
	// 	navigator.serviceWorker.addEventListener('message', event => {
	// 		// event is a MessageEvent object
	// 		console.log(`The service worker sent me a message: ${event.data}`);
	// 	});
    //     // loadTagsList();
    // }

    if (document.body.classList.contains('item-view')) {
        if (getParam("path")) {
            // loadPost(path + '/posts/cloud-2-5-1.html');
            // loadPost(getParam("path"));
        }
        
    }
    if (document.body.classList.contains('feed-view')) {
        if (getParam('name')) {
            // loadPostsList(getParam('name'));
        }
    }
});

function getParam(name) {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    // console.log(urlParams);
    if (name) {
        return urlParams.get(name);
    }
    return urlParams;
}

function getPostData(fn = null) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            // var postData;
            //console.log(this.responseText);
             try {
                var postData = JSON.parse(this.responseText);
                // console.log(postData);
                if (fn) {
                    fn(postData);
                }
             }
             catch (e) {
                //  console.log('error');
                 console.log(e);
             }
             return JSON.parse(this.responseText);
        }
    };

    xhttp.open("GET", hostPath + "/posts/posts-data.json", true);
    xhttp.send();
}

function loadTagsList() {
    var noImageDemo = document.getElementById('no-featured-image-demo');
    var tagsContainer = document.getElementById('tags-container');
    getPostData(function(postData) {
        var tags = postData['tags'].sort(function (a, b) {
            return parseInt(a['ordering']) - parseInt(b['ordering']);
        });
        for (var i = 0; i < tags.length; i++) {
            var newTag = noImageDemo.cloneNode(true);
            noImageDemo.removeAttribute("id");
            newTag.href = '/tags?name=' + tags[i]['name'];
            newTag.querySelector('#title').innerHTML = "" + tags[i]['name'];
            
            tagsContainer.appendChild(newTag);
            
            if (tags[i]['posts'].find(post => post['new'] == true))
            //     tag => tag['posts'].some(function (post) {
            //     return post['new'] == true
            // })))
            {
                newTag.querySelector(".label-cust-button").insertAdjacentHTML("beforeend", '<div class="label-cust new"> </div>');
            }
        }
    });
    noImageDemo.parentNode.removeChild(noImageDemo);
}

function loadPostsList(tag_name = "散文") {
    // if (getParam('name')) {
    // console.log('loadPostList');
    var postsList = document.getElementById('posts-list');
    var hasImageDemo = document.getElementById('has-featured-image-demo');
    var noImageDemo = document.getElementById('no-featured-image-demo');
    var searchLabel = document.getElementById('search-label');
    var blogPager = document.getElementById('blog-pager');

    getPostData(function(postData, name = tag_name) {
        var posts = postData['tags'].find(el => el['name'] == tag_name);
        if (posts) {
            posts = posts['posts'];
            posts.sort(function (a,b) {
                return parseInt(a['ordering']) - parseInt(b['ordering']);
            });
        
            searchLabel.innerHTML = tag_name;
            for (var i = 0; i < posts.length; i++) {
                if (posts[i]['hidden'] == true) {
                    continue;
                }

                var newPost;
                if (posts[i]['image']) {
                    newPost = hasImageDemo.cloneNode(true);
                    newPost.querySelector("#post-image").setAttribute("src", posts[i]['image']);
                }
                else {
                    newPost = noImageDemo.cloneNode(true);
                }

                if (posts[i]['new'] == true) {
                    newPost.querySelector(".snippet-cust-button").insertAdjacentHTML("beforeend", '<div class="snippet-cust-new" style=""><div class="snippet-cust-button-new"></div></div>');
                }
                
                // console.log(newPost);
                newPost.removeAttribute("id");
                newPost.querySelector("#post-title").innerHTML = posts[i]['title'];
                newPost.querySelector("#post-body").innerHTML = posts[i]['snippet'];
                newPost.querySelector("#post-link").href = "/posts/?path=" + posts[i]['path'] + "";
                newPost.querySelector("#post-link").setAttribute("ontouchend", "handlePreviewLink(this, '/posts/?path=" + posts[i]['path'] + "', true)");
                // ontouchend="handlePreviewLink(this, 'https://novel.qwinna.hk/2020/09/dancing-blade.html', true);"
                postsList.insertBefore(newPost, blogPager);
            }

            hasImageDemo.parentNode.removeChild(hasImageDemo);
            noImageDemo.parentNode.removeChild(noImageDemo);

            loadReadingProgress();
        }
    });
    // }
}

var timer = 0;
function loadPost(path = null) {
    if (path) {
        var title = '';
        getPostData(function (postData, post_path = path) {
            var tags = postData['tags'];
            var posts = [];
            var tag_name = '';
            var ordering = 0;

            var i = 0;
            var tagsIndex = 0;
            tags.forEach(function(tag) {
                posts = posts.concat(tag['posts'].filter(function(post) {
                    if (post['path'] === post_path) {
                        tag_name = tag['name'];
                        ordering = parseInt(post['ordering']);
                        tagsIndex = i;
                        return true;
                    }
                }));
                i++;
            });

            // Title
            if (posts.length > 0) {
                document.title = posts[0]['title'];
                var postTitles = document.querySelectorAll('#post-title');
                for (var i = 0; i< postTitles.length; i++) {
                    postTitles[i].innerHTML = posts[0]['title'];
                }

                // Pagination
                var nextPrevPosts = tags[tagsIndex]['posts'].filter(function (post) {
                    // console.log(post['ordering'], ' ', ordering);
                    return (post['ordering'] == (ordering + 1) || post['ordering'] == (ordering - 1)) ;
                });
                console.log(nextPrevPosts);
                // Older = newer lol becoz of blogger sorting logic
                nextPrevPosts.forEach(function (post) {
                    if (post['ordering'] == (ordering - 1) ) {
                        document.querySelectorAll('#blog-pager-newer-link').forEach(function (link) {
                            link.href = hostPath + postsPath + '?path=' + post['path'];
                            link.classList.add('visible');
                        });
                    }
                    else {
                        document.querySelectorAll('#blog-pager-older-link').forEach(function (link) {
                            link.href = hostPath + postsPath + '?path=' + post['path'];
                            link.classList.add('visible');
                        });
                    }
                });
                
                // Back to list
                document.querySelectorAll('#blog-pager-home-link').forEach(function (link) {
                    link.href = hostPath + tagsPath + "?name=" + tag_name;
                });
            }
            
        });

        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
          if (this.readyState == 4 && this.status == 200) {
            console.log("200");
            var ajax_html = this.responseText;
            var postBody = document.getElementById('post-body');
            postBody.innerHTML = ajax_html;
            clearTimeout(timer);
            document.body.setAttribute("js-loaded", true);
            hidePageLoading();
            loadScrollPos();
          }
        };
        // if (link) {
          showPageLoading();
          
          xhttp.open("GET", hostPath + postsPath + path, true);
          xhttp.send();
      
          setTimeout(function () {
            timer = setTimeout(function () {
              hidePageLoading(0);
              xhttp.abort();
            }, 5000);
          }, 1000);
        // }

        // var postTitles = document.querySelectorAll('#post-title');
        // var postBody = document.getElementById('post-body');
        
        // for (var i = 0; i< postTitles.length; i++) {
        //     postTitles[i].innerHTML = 'testing title';
        // }
        // postBody.innerHTML = 'testing content';
    }
}

function createJsonFromFile (tag_name = "散文", ordering = 1) {
    const reader = new FileReader();

    reader.addEventListener("load", function (e) {
        // let text = escapeHTML(this.result);
        var ordering = prompt("ordering?");
        var fileName = prompt("filename?");
        if (!fileName.match(".html")) {
            fileName = fileName + ".html";
        }
        let text = this.result;
        const lines = text.split(/\r?\n/);
        var post = {
            "title": "",
            "path": fileName,
            "snippet": "",
            "ordering": ordering
        };
        var outputLines = '';
        var snippetOutput = true;
        for(let line of lines){
            
            if (post['title'] == '' && line.match("<h1>")) {
                post['title'] = line.replace('<h1>', '').replace('</h1>', '');
            }
            else
            if (post['title'] == '' && line.match("<h2>")) {
                post['title'] = line.replace('<h2>', '').replace('</h2>', '');
            }
        
            else {
                outputLines += line + '\n';
                if (snippetOutput) {
                    post['snippet'] += line;
                }
            }
            if (line.match("<!--more-->") || post['snippet'].length > 200) {
                snippetOutput = false;
            }
        }
        if (post['title'] == '') {
            post['title'] = prompt("title?", this.fileNameOriginal.replace(/^(.*】)/i, "").replace(".html", ""));
            
        }
        console.log(JSON.stringify(post));
        saveToFile(outputLines, fileName);

    }, false);


    var input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "text/plain, text/markdown, text/html");
    input.addEventListener('click', function () {
        setTimeout(() => {
            input.parentNode.removeChild(input);
        }, 500);
        
    });
    input.addEventListener('change', function () {
        const file = this.files[0];
        console.log("fileSize: " + file.size);
        if (file) {
            // document.body.setAttribute('filename', file.name);
            if (true) {
            // if (file.type.match('text/plain') || file.type.match('text/markdown' || file.type.match('html'))) {
                reader.fileNameOriginal = file.name;
                reader.readAsText(file);
            }
            else {
                alert('檔案格式不支援 (只接受 .txt 純文字文件)');
                console.log(file.type);
            }
        }
    }, false);

    document.body.appendChild(input);
    input.click();
}

function saveToFile(text = '', fileName = '') {
    // let content = document.getElementById("editor-body").innerText;

    let textFile = null,
        makeTextFile = function (text) {
            var data = new Blob([text], { encoding: "UTF-8", type: "text/html;charset=UTF-8" });
            if (textFile !== null) {
                window.URL.revokeObjectURL(textFile);
            }
            textFile = window.URL.createObjectURL(data);
            return textFile;
        };

    let link = document.createElement('a');
    if (!fileName.match(".html")) {
        fileName = fileName + ".html";
    }
    
    link.setAttribute('download', fileName);
    link.href = makeTextFile(text);
    document.body.appendChild(link);

    // wait for the link to be added to the document
    window.requestAnimationFrame(function () {
        var event = new MouseEvent('click');
        link.dispatchEvent(event);
        document.body.removeChild(link);
    });
}