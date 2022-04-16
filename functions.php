<?php
function is_home() {
    $path = $_SERVER['REQUEST_URI'];
    return $path == '/';
}
function is_post() {
    $path = $_SERVER['REQUEST_URI'];
    return strpos($path, '/posts') === 0;
}
function is_tags() {
    $path = $_SERVER['REQUEST_URI'];
    return strpos($path, '/tags') === 0;
}

function get_title() {
    if (is_home()) {
        return '青 . 小說';
    }
    else if (is_tags()){
        global $tag_name;
        if ($tag_name){
            return $tag_name;
        }
    }
    else {
        global $post;
        if ($post && !is_array($post)) {
            return $post->title;
        }
    }
}

function body_class() {
    if (is_home()) {
        return 'homepage-view';
    }
    else if (is_tags()) {
        return 'label-view blog feed-view';
    }
    else if (is_post()) {
        return 'item-view is-post';
    }
}

function getPostData($fn = null) {
    $string = file_get_contents(__DIR__ . "/posts/posts-data.json");
    $json = json_decode(html_entity_decode($string));
    // print_r($json->tags[1]->posts);die();
    return $json;
}

function get_last_update($return = false) {
    $sql = "SELECT MAX(GREATEST(`create_date`,`update_date`)) as `last_update` FROM `posts`";
    $result = sql($sql);
    // echo json_encode($result);
    if ($result && $return) {
        return strtotime($result->last_update);
    }
    else {
        echo $result->last_update;
    }
}

function sql($sql, $rollback = false) {
    global $servername, $username, $password, $dbname;

	// Create connection
	$conn = new mysqli($servername, $username, $password, $dbname);
	// Check connection
	if ($conn->connect_error) {
		die("Connection failed: " . $conn->connect_error);
	}
    $conn->query("START TRANSACTION");
	$output = $conn->query($sql);
    $conn->query($rollback ? "ROLLBACK" : "COMMIT");
    // echo $rollback ? "ROLLBACK" : "COMMIT";
    
    $array = [];
    if ($output === true) {
        return true;
    }
    if ($output && $output->num_rows > 0) {
        while($row = $output->fetch_assoc()) {
            $array []= (object) $row;
        }
    }
    
	$conn->close();

    if (sizeof($array) == 1) {
        $array = $array[0];
    }
    else if (sizeof($array) == 0) {
        $array = null;
    }

    return $array;
}

function getPostDataFromPath($path) {
    $sql = "SELECT * FROM `posts_sorted` WHERE `path` = '". $path ."' LIMIT 1"; 
    // echo $sql;
    return sql($sql);
}

function getTags() {
    $sql = "SELECT DISTINCT `tags`.*, `is_new` FROM `tags` LEFT JOIN (SELECT `is_new`, `tag` FROM `posts` WHERE `is_new` = 1) `new` ON `tags`.`name` = `new`.`tag` ORDER BY `ordering` asc"; 
    return sql($sql);
}

function getPostsList($tag_name) {
    // $sql = "SELECT * FROM `posts` WHERE `tag` = '" . $tag_name . "' ORDER BY `ordering` asc, `create_date` desc, `update_date` desc"; 
    $sql = "SELECT * FROM `posts_sorted` WHERE `tag` = '" . $tag_name . "' ORDER BY `display_order` asc"; 
    // echo $sql;
    return sql($sql);
}

function getNextPrevPost() {
    global $post;
    if ($post) {
        $sql = "SELECT `display_order`, `title`, `path` FROM  `posts_sorted` WHERE `tag` = '". $post->tag ."' AND (`display_order` = " . ($post->display_order + 1).  " OR `display_order` = " . ($post->display_order - 1).  ") ORDER BY `display_order`";
        $results = sql($sql);
        $return = [];
        if (!is_array($results)) {
            $results = [$results];
        }
        foreach ($results as $result) {
            if ($result->display_order > $post->display_order) {
                $return['older'] = $result;
            }
            else if ($result->display_order < $post->display_order) {
                $return['newer'] = $result;
            }
        }
        return (object) $return;
    }
}

function backupPost() {
    global $servername, $username, $password, $dbname;
    $conn = new mysqli($servername, $username, $password, $dbname);
	if ($conn->connect_error) {
		die("Connection failed: " . $conn->connect_error);
	}
    $table_name = "posts_" . date('Y-m-d_H:i:s');
    $conn->query( "START TRANSACTION" );
    $conn->query("CREATE TABLE `". $table_name ."` LIKE `posts`;");
    $conn->query("INSERT INTO  `". $table_name ."` SELECT * FROM `posts`;");
    $conn->query( "COMMIT" );
    $conn->close();

    return $table_name;
}

function importPost($tag = '散文', $post) {
    global $servername, $username, $password, $dbname;

	// Create connection
	$conn = new mysqli($servername, $username, $password, $dbname);
	// Check connection
	if ($conn->connect_error) {
		die("Connection failed: " . $conn->connect_error);
	}
    $conn->query( "START TRANSACTION" );
    // echo "CREATE TABLE `posts_bak_" . date('Y-m-d_H:i:s') . "` LIKE `posts`;";
    // echo "INSERT INTO  `posts_bak_" . date('Y-m-d_H:i:s') . "` SELECT * FROM `posts`;";

	$sql = "INSERT INTO `posts` (`id`, `title`, `path`, `snippet`, `image`, `ordering`, `tag`, `is_hidden`, `is_new`) VALUES (NULL, '" . $post->title . "', '". $post->path . "', '" . $post->snippet. "', '" . (isset($post->image) ? $post->image : "") . "', " . $post->ordering . ", '" . $tag . "', " . (isset($post->hidden) ? 1 : 0) . ", '0');";
    // echo $sql . '<br />';
	$output = $conn->query($sql);
    $conn->query( "COMMIT" );
	$conn->close();
    
}


function updatePost($post, $password = null) {
    global $editPostPassword;
    if (!isset($password) || hash('sha512', $password) != $editPostPassword) {
        return 'password error';
    }

    $msg = '';
    if ($post->delete) {
        $sql = "DELETE FROM `posts` WHERE `path` = '" . $post->path . "'";
        unlink(__DIR__ . '/posts/'. $post->path);
    }
    else {
        if (!preg_match('/\.html$/',$post->path)) {
            $post->path = $post->path . '.html';
        }

        if ($_FILES["image_file"] && $_FILES["image_file"]['name']) {
            // echo $_FILES["image_file"]["name"];
            $dir_path =  __DIR__ . '/uploads/';
            if (is_link($dir_path)){
                $dir_path = readlink($dir_path);
            }

            $img_path = $dir_path . $_FILES["image_file"]["name"];
            if (file_exists($img_path)){
                return 'Image already exists';
            }
            if ($_FILES["image_file"]["size"] > 5000000) {
                return "Sorry, your file is too large.";
            }
            else {
                move_uploaded_file($_FILES["image_file"]["tmp_name"], $img_path);
                $post->image = '/uploads/' . $_FILES["image_file"]['name'];
                $msg .= $img_path . ' added. ';
            }
        }
        if (!$post->ordering || $post->ordering == ''){
            $post->ordering = sql("SELECT MAX(`ordering`) + 1 as `next` FROM `posts` WHERE tag = '". $post->tag ."'")->next;
        }
        
        $sql = "INSERT INTO `posts` (`id`, `title`, `path`, `snippet`, `image`, `ordering`, `tag`, `is_hidden`, `is_new`) VALUES (NULL, '" . $post->title . "', '". $post->path . "', '" . $post->snippet. "', '" . (isset($post->image) ? $post->image : "") . "', " . $post->ordering . ", '" . $post->tag . "', " . (isset($post->is_hidden) ? $post->is_hidden : 0) . ", ". (isset($post->is_hidden) ? $post->is_new : 0) .")";
        $sql .= "ON DUPLICATE KEY UPDATE `ordering` = " . $post->ordering . ", `title` = '". $post->title . "', `path` = '". $post->path . "', `snippet` = '". $post->snippet . "', `image` = '". $post->image . "', `tag` = '". $post->tag . "', `is_new` = " . $post->is_new. ", `is_hidden` = " . $post->is_hidden . ", `update_date` = NOW()";
        // echo $sql . "<br />";
        
        $dir_path =  __DIR__ . '/posts/';
        if (is_link($dir_path)){
            $dir_path = readlink($dir_path);
        }

        $file_path = __DIR__ . '/posts/'. $post->path;
        $new_file = !file_exists($file_path);
        if ($file = fopen($file_path, 'w')){
            fwrite($file, $post->content);
            if ($new_file) {
                $msg .= '/posts/' . $post->path . ' added. ';
            }
        }
    }

    if (sql($sql)) {
        return true;
    }
    else {
        return false;
    }
}

function loadPost($path = null) {
    $file = __DIR__ . '/posts/'. $path;
    if (file_exists($file)) {
        $post = file_get_contents(__DIR__ . '/posts/'. $path);
        if ($post) {
            return $post;
        }
    }
    else {
        return '找不到文章。';
    }
}

function update_view_count() {	
	// if (is_home() || is_archive() || is_singular() || is_search() || is_404()) {
	if (is_home() || is_post()) {
        global $post, $servername, $username, $password, $dbname;

        // Create connection
        $conn = new mysqli($servername, $username, $password, $dbname);
        // Check connection
        if ($conn->connect_error) {
            die("Connection failed: " . $conn->connect_error);
        }
        $conn->query( "START TRANSACTION" );
		$view_count_table_sql = "CREATE TABLE IF NOT EXISTS `qingnovels`.`viewcounts` ( `title` TEXT NULL, `post_id` BIGINT(20) NULL, `view_count` INT(11) NOT NULL DEFAULT '0', `is_valid` BOOLEAN NOT NULL DEFAULT TRUE, `url` VARCHAR(255) NOT NULL , `date` DATE NOT NULL DEFAULT CURRENT_TIMESTAMP , `update_time` TIME NOT NULL DEFAULT CURRENT_TIMESTAMP  , PRIMARY KEY (`url`, `date`)) ENGINE = InnoDB";
		$view_count_sql = "INSERT INTO `viewcounts` (`url`, `date`, `update_time`, `view_count`, `is_valid`, `post_id`, `title`) VALUES('". urldecode($_SERVER['REQUEST_URI']) ."', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1, 1, " . ($post ?  $post->id : 0) . ", '" . get_title() . "') ON DUPLICATE KEY UPDATE `view_count` = `view_count` + 1, `update_time` = CURRENT_TIMESTAMP";

		$user_region = getIpData($_SERVER['REMOTE_ADDR']);
		$user_region_table_sql = "CREATE TABLE `qingnovels`.`viewcounts_region` ( `region` VARCHAR(255) NOT NULL , `date` DATE NOT NULL DEFAULT CURRENT_TIMESTAMP , `update_time` TIME NOT NULL DEFAULT CURRENT_TIMESTAMP , `view_count` INT(11) NOT NULL , PRIMARY KEY (`region`, `date`)) ENGINE = InnoDB;";
		$user_region_sql = "INSERT INTO `viewcounts_region` (`region`, `date`, `update_time`, `view_count`) VALUES('". $user_region . "', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1) ON DUPLICATE KEY UPDATE `view_count` = `view_count` + 1, `update_time` = CURRENT_TIMESTAMP";
		
		// echo $view_count_sql;exit();
		$conn->query( "START TRANSACTION" );
		$conn->query($view_count_table_sql);
		$conn->query($view_count_sql);
		$conn->query($user_region_table_sql);
		$conn->query($user_region_sql);
		
		$conn->query( "COMMIT" );
	}
}

function getIpData($userIP) {
	
	// API end URL 
	$apiURL = 'https://freegeoip.app/json/'.$userIP; 
	
	// Create a new cURL resource with URL 
	$ch = curl_init($apiURL); 
	
	// Return response instead of outputting 
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true); 
	
	// Execute API request 
	$apiResponse = curl_exec($ch); 
	// echo $apiResponse; exit;
	
	// Close cURL resource 
	curl_close($ch); 
	
	// Retrieve IP data from API response 
	$ipData = json_decode($apiResponse, true); 
	
	if(!empty($ipData)){ 
		return $ipData['country_name'];
	}else{ 
	} 
}
?>


