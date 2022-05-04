<main class="centered-bottom" id="main" role="main" tabindex="0">
<div class="main section" id="page_body" name="頁面主體">
    <div class="widget Blog" data-version="2" id="Blog1">
    <div class="blog-posts hfeed container">
        <div class="post-outer-container">
        <div class="post-outer">
            <div class="post-sidebar">
            </div>
            <div class="post">
            <div style="display: none">
            </div>
            <a name="743862057301849569"></a>
            <h3 class="post-title entry-title" id="post-title">
            </h3>
            <div class="post-body-container">
                <div class="post-body entry-content float-container" id="post-body">
                    <?php
                        global $post_path;
                        // $path = $_SERVER['REQUEST_URI'];
                        // preg_match('/(?<=\/)[^\/]*\.html$/i', $path, $matches);
                        if ($post_path) {
                            // echo json_encode($matches);
                            // echo json_encode(getNextPrevPost($post_path));
                            echo loadPost($post_path);
                        }
                        else {
                            echo '找不到文章。';
                        }
                        // $path = $matches[0];
                    ?>
                </div>
            </div>
            <div class="post-footer">
                <?php include($_SERVER['DOCUMENT_ROOT'] . "/include/blog-pager.php");?>
                <div class="blog-pager container"><a class="home-link" href="/">首頁</a></div>
            </div>
            </div>
        </div>
        <section class="comments" data-num-comments="0" id="comments">
            <a name="comments"></a>
        </section>
        </div>
    </div>
    </div>
</div>
<?php include($_SERVER['DOCUMENT_ROOT'] . "/include/adsense.php"); ?>
</main>