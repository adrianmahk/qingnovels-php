<?php 
    require __DIR__ . '/include/functions.php';
    require __DIR__ . '/config.php';
    
    $path = $_SERVER['REQUEST_URI'];
    if (is_tags()) {
        preg_match('/(?<=tags\/)([^\/]*)$/i', urldecode($path), $matches);
        if ($matches) {
            $tag_name = $matches[0];

            $tag_posts = getPostsList($tag_name);
            if (!$tag_posts) {
              http_response_code(404);
            }
        }
    }

    if (is_post()) {
        preg_match('/(?<=\/)[^\/]*\.html$/i', urldecode($path), $matches);
        if ($matches) {
            $post_path = $matches[0];
            $post = getPostDataFromPath($post_path);
            $postNextPrev = getNextPrevPost();
            // echo json_encode($postNextPrev);
            $post_content = loadPost($post_path);
            if ($post_content === null) {
              http_response_code(404);
              $post_content = '找不到文章。';
            }
        }
    }

    if (isset($_GET['no-count']) && $_GET['no-count'] == '1') {
      $cookie_name = "no-count";
      $cookie_value = "1";
      setcookie($cookie_name, $cookie_value, time() + (86400 * 14), "/"); // 86400 = 1 day
    }
    update_view_count();
    
?>
<html dir="ltr" xmlns="http://www.w3.org/1999/xhtml" xmlns:b="http://www.google.com/2005/gml/b"
	xmlns:data="http://www.google.com/2005/gml/data" xmlns:expr="http://www.google.com/2005/gml/expr">

<head>
	<!-- <base href="http://localhost:84"> -->
	<meta content="width=device-width, initial-scale=1, viewport-fit=cover" name="viewport">
	<link href="/assests/manifest_qingnovels.json" rel="manifest">
	<link rel="stylesheet" href="/assests/novel.css?t=<?php echo filemtime($_SERVER['DOCUMENT_ROOT'] . '/assests/novel.css')?>">
	<meta content="yes" name="apple-mobile-web-app-capable">
	<meta content="black" name="apple-mobile-web-app-status-bar-style">
	<meta content="青. 小說" name="apple-mobile-web-app-title">
	<link href="/icons/qingsky-512.png" rel="apple-touch-icon" sizes="512x512">
	<title><?php echo get_title();?></title>
	<!-- <script src="https://js.qingsky.hk/fancy-compiled.js" type="text/javascript"> </script> -->
	<script src="/scripts/novel.js?t=<?php echo filemtime($_SERVER['DOCUMENT_ROOT'] . '/scripts/novel.js')?>" type="text/javascript"></script>
	<script src="/scripts/standalone.js" type="text/javascript"></script>
	<meta content="text/html; charset=UTF-8" http-equiv="Content-Type">
	<!-- Chrome, Firefox OS and Opera -->
	<meta content="" name="theme-color">
	<!-- Windows Phone -->
	<meta content="" name="msapplication-navbutton-color">
	<meta content="blogger" name="generator">
	<link href="/icons/qingsky13.png" rel="icon" type="image/x-icon">
	<meta content="青 . 小說" property="og:title">
	<script>
		function setupServiceWorker() {
			if (!document.body.classList.contains('error404')) {
				if ('serviceWorker' in navigator) {
					navigator.serviceWorker.register("<?php echo  '/sw.js?t='.get_last_update(true)?>", {scope: "<?php echo '/' ?>"}).then(function(registration) {
						console.log('Service worker registration succeeded:', registration);
					}, /*catch*/ function(error) {
						console.log('Service worker registration failed:', error);
					});
				}
				// navigator.serviceWorker.addEventListener('message', event => {
				// 	console.log(`The service worker sent me a message: ${event.data}`);
				// });
        
			}
		}
		ready(setupServiceWorker);
	</script>
</head>
<?php 
// echo 'php <br />';


//  die();
// print_r(json_encode(getPostData()));die();
// echo get_last_update(true);
// $post_data = getPostData();
// echo json_encode($post_data->tags[0]->posts);
// $table_name = backupPost();
// foreach ($post_data->tags[0]->posts as $post) {
    // importPost('雲想曲 Ⅱ', $post);
    // importPost('雲想曲 Ⅰ', $post);
    // importPost('散文', $post);
    // importPost('雲想曲．短篇', $post);
    // importPost('MH．短篇', $post);
    // importPost('獵傳．櫻花篇', $post);
    // importPost('滅絕', $post);
// }

// exit;
// echo 'a';
// importPost('雲想曲 Ⅱ', $post_data->tags[0]->posts[0]);
// echo loadPost('passages-dancing-blade.html');
// echo time();
?>

<body class="<?php echo body_class() ?>" onload="" data-js-state="loaded">
	<script type="text/javascript">
		changeFontSizeInit(); darkModeInit();
	</script>
	<a class="skip-navigation" href="#main" tabindex="0">
		跳到主要內容
	</a>
	<div class="loading-bar" id="loading-bar" style=""></div>
	<!-- <div class='bg-mask'/> -->
	<div class="page" id="page">
		<!-- <div class='main-page-body-content'> -->
		<div class="centered-top-placeholder"></div>
		<header class="centered-top-container" role="banner">
			<div class="centered-top">
				<div class="blog-name">
					<div class="section" id="header" name="標頭">
						<div class="widget Header" data-version="2" id="Header1">
							<div class="header-widget">
								<div>
									<h1>
										<a href="/">青 . 小說</a>
									</h1>
								</div>
								<?php if (is_home()):?>
                                <p>我的小說、散文作品集</p>
                                <?php else: ?>
                                <div class="blog-pager container" style="text-align: left   "><a class="home-link" href="/">回到首頁</a></div>
                                <?php endif;?>
							</div>
						</div>
					</div>
					<!--<nav role='navigation'> </nav>-->
				</div>
			</div>
		</header>
		<div class="hero-image">
		</div>

    <?php if (is_post() || is_tags()):?>
      <div class="top-sticky-title" style="">

    <div class="post-filter-message">
    <div class="message-container">
        <?php if (is_tags()):?>
          <div><span class="search-label" id="search-label"><?php echo $tag_name?></span></div>
          <?php else:?>
          <div style="display: inline-block">
          <span class="post-title entry-title" id="post-title"><?php echo get_title(); ?></span>
        </div>
          <?php endif;?>
    </div>
    </div>

          </div>
    <?php endif;?>
		<div class="top-bar-container">
      <div class="centered-top top-bar" id="top-bar">
        <div class="return_link back-button-container">
          <a class="back-button" href="/" onclick="history.back(); return false;">
            <svg class="svg-icon-24 rtl-reversible-icon flat-icon-button" width="100px" height="100px" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1">
              <path id="Path" fill="#30a080" d="M53.2 11.24 L49.96 11.24 10 49.04 10 51.2 C10 51.2 49.96 89 49.96 89 49.96 89 53.2 89 53.2 89 L59.68 83.6 59.68 79.28 33.76 56.6 33.76 55.52 87.92 56.6 89 55.52 89 44.72 87.92 43.64 33.76 44.72 33.76 43.64 59.68 20.96 59.68 16.64 53.2 11.24 Z" stroke="none" stroke-width="1" stroke-opacity="1" stroke-linejoin="round"/>
             </svg>
          </a>
          <a class="back-button-to_top" href="javascript:void(0)" onclick="window.scrollTo({top: 0, behavior: 'smooth'}); return false;">
            <svg class="svg-icon-24 rtl-reversible-icon flat-icon-button" width="100px" height="100px" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1">
              <path id="Path" fill="#30a080" d="M53.2 11.24 L49.96 11.24 10 49.04 10 51.2 C10 51.2 49.96 89 49.96 89 49.96 89 53.2 89 53.2 89 L59.68 83.6 59.68 79.28 33.76 56.6 33.76 55.52 87.92 56.6 89 55.52 89 44.72 87.92 43.64 33.76 44.72 33.76 43.64 59.68 20.96 59.68 16.64 53.2 11.24 Z" stroke="none" stroke-width="1" stroke-opacity="1" stroke-linejoin="round"/>
             </svg>
          </a>
        </div>
        
        <?php if (is_tags() || is_post()):?>
        <?php if (is_post())include(__DIR__ . "/include/blog-pager.php");?>
        <?php if (is_tags()):?>
        <div class="hover-hint-message">移動裝置：點一下預覽文章，點兩下進入文章</div>
        <?php endif;?>
        <div class="progress-bar" id="progress-bar-top-bar" style="width: 0%"></div>
        <hr class="top-bar-shadow" id="top-bar-shadow">
        <?php endif;?>
        <div class="right-button-container dark-mode flat-icon-button ripple">
          <a class="changeFontSizeButton" href="javascript:void(0)" onclick="changeFontSize();">
            <svg class="svg-icon-24" height="100px" version="1.1" viewBox="0 0 100 100" width="100px"
              xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
              <path class="svg-icon-24"
                d="M26 12 L70 12 C70 12 70 22 70 22 70 22 63.013 20.025 58 20 55.04 19.985 55 24 55 24 L55 80 C55 80 55.981 84.009 58 84 63.033 83.978 70 82 70 82 L70 92 26 92 26 82 C26 82 33.034 83.991 38 84 39.976 84.003 41 80 41 80 L41 24 C41 24 40.864 19.985 38 20 33.008 20.026 26 22 26 22 26 22 26 12 26 12 Z"
                fill="none" id="Path" stroke="#929292" stroke-linejoin="round" stroke-opacity="1" stroke-width="1">
              </path>
              <path class="svg-icon-24" d="M86 12 L86 92 80 92 80 12 Z" fill="none" id="Path-1" stroke="none"
                stroke-linejoin="round" stroke-opacity="1" stroke-width="1"></path>
            </svg>
          </a>
          <a class="return_link dark_mode_button" href="javascript:void(0)" onclick="darkMode();">
            <svg class="svg-icon-24" height="100px" version="1.1" viewBox="0 0 100 100" width="100px"
              xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
              <path class=""
                d="M86.333 52.167 C86.333 33.297 71.036 18 52.167 18 33.297 18 18 33.297 18 52.167 18 71.036 33.297 86.333 52.167 86.333 71.036 86.333 86.333 71.036 86.333 52.167 Z"
                fill="none" id="Ellipse-copy-3" stroke="none" stroke-linejoin="round" stroke-opacity="1"
                stroke-width="12"></path>
              <path class=""
                d="M25 52.947 C25 38.326 37.516 25.173 51.9 25.747 52.18 25.758 51.776 25.7 51.847 53.625 51.91 78.818 51.994 78.69 51.9 78.691 37.201 78.809 25 67.567 25 52.947 Z"
                fill="none" id="Ellipse-copy-2" stroke="#929292" stroke-linejoin="round" stroke-opacity="1"
                stroke-width="4"></path>
              <path class="dark-mode-fill"
                d="M86 53 C86 34.591 70.241 18.029 52.129 18.752 51.776 18.766 52.285 18.693 52.196 53.854 52.116 85.576 52.011 85.415 52.129 85.416 70.637 85.565 86 71.409 86 53 Z"
                fill="#929292" fill-opacity="1" id="Ellipse-copy-4" stroke="#929292"></path>
              <path class="dark-mode-stroke"
                d="M84 52 C84 34.327 69.673 20 52 20 34.327 20 20 34.327 20 52 20 69.673 34.327 84 52 84 69.673 84 84 69.673 84 52 Z"
                fill="none" id="Ellipse-copy-1" stroke="#929292" stroke-linejoin="round" stroke-opacity="1"
                stroke-width="8"></path>
            </svg>
          </a>
        </div>
      </div>
    </div>
   
		<div class="page_body">
			<?php
            if (is_home()){
                include(__DIR__ . "/include/home.php");
            }
            else if (is_tags()){
                include(__DIR__ . "/include/tags.php");
            }
            else {
                include(__DIR__ . "/include/post.php");
            }
      ?>
			<footer class="footer section" id="footer" name="頁尾">
				<div class="widget Attribution" data-version="2" id="Attribution1">
					<div class="widget-content">
						<div class="copyright">Adrian Ma（青鳥）2017年8月起 | All rights reserved</div>
					</div>
				</div>
			</footer>
		</div>
	</div>
</html>