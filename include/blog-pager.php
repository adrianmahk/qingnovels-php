<?php
    global $post, $postNextPrev;
?>

<div class="blog-pager container" style="">

<div class="blog-pager-newer-link">
    <a class="blog-pager-newer-link <?php echo isset($postNextPrev->newer) ? 'visible' : '' ?>" href="<?php echo isset($postNextPrev->newer) ? '/posts/'.$postNextPrev->newer->path : '' ?>" title="<?php echo isset($postNextPrev->newer) ? $postNextPrev->newer->title : '' ?>"
    id="blog-pager-newer-link" title="">＜上一篇</a>
</div>
<div class="home-link">
    <?php if (is_post() && !is_404()):?>
    <a class="home-link" id="blog-pager-home-link"
    href="<?php echo '/tags/'.$post->tag ?>"
    rel="tag">回列表</a>
    <!-- <br/>
    <a class="home-link" href="/">首頁</a> -->
    <?php endif;?>
</div>
<div class="blog-pager-older-link">
    <!-- <a class="blog-pager-older-link" href="https://novel.qwinna.hk/2016/10/cloud2-afterword.html" id="blog-pager-older-link" title="">下一篇＞</a> -->
    <a class="blog-pager-older-link <?php echo isset($postNextPrev->older) ? 'visible' : '' ?>" href="<?php echo isset($postNextPrev->older) ? '/posts/'.$postNextPrev->older->path : '' ?>" title="<?php echo isset($postNextPrev->older) ? $postNextPrev->older->path : '' ?>"
    id="blog-pager-older-link" title="">下一篇＞</a>
</div>


</div>
