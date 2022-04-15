<main class="centered-bottom" id="main" role="main" tabindex="0">
<!-- <b:if cond='data:view.isMultipleItems'> <h2 class='main-heading'><data:messages.posts/></h2> </b:if> -->
<div class="main section" id="page_body" name="頁面主體">
    <div class="widget Blog" data-version="2" id="Blog1">
    <div class="blog-posts hfeed container" id="posts-list">
        <?php
            $posts = getPostsList($tag_name);
            if (!$posts) {
                echo '沒有文章。';die();
            }
            foreach ($posts as $post):
            if ($post->is_hidden) {
                continue;
            }
        ?>
        <div class="post-outer-container">
        <div class="post-outer">
            <div class="post <?php echo $post->image ? 'has-featured-image' : 'no-featured-image' ?>">
                <?php if ($post->image):?>
                <div class="snippet-thumbnail">
                    <img alt="圖片" sizes="(max-width: 576px) 100vw, (max-width: 1024px) 576px, 490px" id="post-image" src="<?php echo  $post->image ?>"/>
                </div>
                <?php endif;?>
                <h3 class="post-title entry-title" id="post-title"><?php echo $post->title;?></h3>
            </div>
            <a class="snippet-a <?php echo ($post->image ? 'has-featured-image' : 'no-featured-image');?>" href="<?php echo '/posts/' . $post->path ?>" id="post-link"
            onfocusout="toggleTriggered(this, false);" onmouseout="toggleTriggered(this, false)"
            onmouseover="toggleTriggered(this, true)"
            ontouchend="handlePreviewLink(this, '/', true);"
            triggered="false">
            <button class="snippet-cust-button">
                <div class="snippet-cust" id="snippet-cust">
                <div class="post-body entry-content float-container" id="post-body">
                    <?php echo preg_replace('/(<(a )[^>]*>|<\/a>)/i', '',  $post->snippet)?>
                </div>
                </div>
                <?php if ($post->is_new):?>
                <div class="snippet-cust-new"></div>
                <?php endif?>
                <div class="progress-bar-container">
                <div class="progress-bar" style=""></div>
                </div>
            </button>
            </a>
        </div>
        </div>
        <?php endforeach;?>
    <div class="blog-pager container" id="blog-pager">
        <br><a class="home-link" href="/">
        首頁
        </a>
    </div>
    </div>
</div>
</main>