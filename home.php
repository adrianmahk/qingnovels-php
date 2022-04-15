<main class="centered-bottom" id="main" role="main" tabindex="0">
    <!-- <b:if cond='data:view.isMultipleItems'> <h2 class='main-heading'><data:messages.posts/></h2> </b:if> -->
    <div class="main section" id="page_body" name="頁面主體">
        <div class="widget HTML" data-version="2" id="HTML1">
            <h3 class="post-title main">作者的話</h3>
            <div class="post-outer">
                <div class="post-body entry-content intro">
                    <style>
                        p br {
                            content: none !important;
                            line-height: 1 !important;
                        }

                        ul {
                            margin-top: -1em;
                        }

                        li img {
                            max-height: 25px;
                        }
                    </style>
                    <script type="text/javascript">
                        function clearStorage() {
                            if (confirm("確定清除閱讀進度資料?")) {
                                localStorage.clear();
                                window.location.reload();
                            }
                        }
                    </script>
                    <p>歡迎來到青 · 小說<br>我是青鳥，一個夢想成為小說家的 90 後青年<br>想了解我，可以看我的 blog ──<a
                            href="https://www.qingsky.hk">青色的天空</a>，裡面會有我最新的文章<br>青 ‧
                        小說則是輯錄了我過去的作品，主要是小說，以及少量精選散文，期望用簡潔的介面，帶來清新的閱讀體驗～</p>

                    <p><br>注意事項</p>

                    <ul>
                        <li>按 <img
                                src="/icons/darkmode_novels.png">
                            進入黑夜模式，按多一下關閉</li>
                        <li>按 <img
                                src="/icons/fontsize_novels.png">
                            更改文字大小</li>
                        <li>電腦：移動鼠標預覽文章，點一下進入文章</li>
                        <li>移動裝置：點一下預覽文章，點兩下進入文章</li>
                        <li>會根據瀏覽紀錄顯示閱讀進度條；近期瀏覽的文章再次進入時亦會回到上次的進度（如要清除，請清理瀏覽器暫存及瀏覽紀錄）</li>
                        <!-- <li><strong>（已更新）</strong>歡迎使用「加入主畫面」功能，進一步精簡介面之餘，亦會於首頁顯示小說（或文集）整體閱讀進度，詳見<a
                                href="https://www.qingsky.hk/2022/02/progress-bar-update.html">主站文章</a></li> -->
                        <li><strong>（已更新）</strong>歡迎使用「加入主畫面」功能，進一步精簡介面之餘，亦會於首頁顯示小說（或文集）整體閱讀進度</li>
                    </ul>

                    <p><br><span id="last-read-msg" style="visibility: hidden;">上次閱讀：<a id="last-read-a"
                                href="/"></a></span><br>點擊下列文集，即可進入章節列表
                    </p>

                    <div style="text-align: right">
                        <p>最後更新：<?php echo date('Y-m-d', get_last_update(true));?></p>
                        <?php if (strpos($_SERVER['SERVER_NAME'], 'localhost') === 0):?><p><a onclick="createJsonFromFile('雲想曲 Ⅱ')">create</a></p><?php endif;?>
                    </div>
                </div>
            </div>
        </div>
    </div>
</main>
<!-- </div> -->
<!--start of moved labels-->
<div class="centered-bottom" style="position: relative;text-align: center;">
    <div class="section" id="page_list_top" name="網頁清單 (頂端)">
        <div class="widget Label" data-version="2" id="Label2">
            <h3 class="title">
                標籤
            </h3>
            <div class="widget-content list-label-widget-content" id="tags-container"
                style="position: relative;text-align: center;">
                <div>
                    <?php
                        $tags = getTags();
                        if (is_array($tags)) {
                            foreach ($tags as $tag) {
                                $echo = '<a class="label-cust-a" id="no-featured-image-demo" href="/tags/' . $tag->name. '" rel="tag">';
                                $echo .= '<button class="label-cust-button">';
                                $echo .= '<div class="label-cust" id="title">' . $tag->name .'</div>';
                                if ($tag->is_new) {
                                    $echo .= '<div class="label-cust new"></div>';
                                }
                                $echo .= '<div class="progress-bar"></div>';
                                $echo .= '</button></a>';
                                echo $echo;
                            }
                        }
                    ?>
                </div>
            </div>
        </div>
    </div>
</div>
<!--end of copied labels-->