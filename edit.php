
<?php 
    require __DIR__ . '/functions.php';
    require __DIR__ . '/config.php';
    $path = isset($_GET['path']) ? $_GET['path'] : null;
    $post = null;
    if ($path) {
        $post = getPostDataFromPath($path);
    }
    if (!$post) {
        $post = (object) [
            'path' => '',
            'title' => '',
            'tag' => '',
            'image' => '',
            'ordering' => '',
            'is_new' => 1,
            'is_hidden' => 0,
            'snippet' => ''
        ];
    }
    if (isset ($_GET['msg'])) {
        echo $_GET['msg'];
    }
    // echo json_encode($post);
?>
<?php 
// backupPost();
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    global $editPostPassword;
    if (!isset($_POST['password']) || hash('sha512', $_POST['password']) != $editPostPassword) {
        echo 'password error';
    }
    else {
        if (isset($_POST['backup'])) {
            backupPost();
        }
        $post = (object)[
            'path' => $_POST['path'],
            'title' => $_POST['title'],
            'tag' => $_POST['tag'],
            'ordering' => $_POST['ordering'],
            'is_new' => isset($_POST['is_new']) ? $_POST['is_new'] : 0,
            'is_hidden' => isset($_POST['is_hidden']) ? $_POST['is_hidden'] : 0,
            'image' => $_POST['image'],
            // 'image_file' => $_POST["image_file"],
            'snippet' => $_POST['snippet'],
            'content' => $_POST['content'],
            'delete' => isset($_POST['delete']) ? $_POST['delete'] : 0
            // 'path' => $_POST['path'],
        ];
        $success = updatePost($post, $_POST['password']);
        if ($success === true){
            echo 'Add/Edit post successful.';
            // header('Location: ?path=' . $post->path . '&msg=' . $success);
            header('Location: ?path=' . $post->path);
        }
        else {
            echo $success;
        }
    }
}
?>
<head>
</head>
<body style="text-align: left; width: 100vw; max-width: 500px; margin: auto">
<script type='text/javascript'>
    function submitOnEnter(event){
        if(event.which === 13 && (event.shiftKey || event.controlKey || event.metaKey) ) {
            console.log("enter");
            event.target.form.submit();
            // event.target.form.dispatchEvent(new Event("submit", {cancelable: true}));
            event.preventDefault(); // Prevents the addition of a new line in the text field (not needed in a lot of cases)
        }
    }
    function confirmDelete(ele) {
        if (ele.checked && confirm('Really Delete?')){
            ele.checked = true;
        }
        else {
            ele.checked = false;
        }
        return false;
    }
</script>
<form action="" method="POST" enctype="multipart/form-data">
    Password: <input type="password"style="min-width: 500px; " name="password" value=""/><br />
    Path: <input type="text"style="min-width: 500px; " name="path" value="<?php echo $path; ?>"/><br />
    Title: <input type="text"style="min-width: 500px;" name="title" value="<?php echo $post->title; ?>"/><br />
    Tag: <input type="text" name="tag" value="<?php echo $post->tag; ?>"><br />
    Ordering (Leave blank for latest): <input type="text" name="ordering" value="<?php echo $post->ordering; ?>"><br />
    New: <input type="checkbox" name="is_new" value="1" <?php echo $post->is_new ? 'checked' : ''?> /> Hidden: <input type="checkbox" name="is_hidden" value="1" <?php echo $post->is_hidden ? 'checked' : ''?>/> <br />
    Image: <input type="text" name="image" value="<?php echo $post->image; ?>"><input type="file" name="image_file" accept="image/jpeg, image/png"/><br />
    (Dont upload to keep current image; clear image path to delete, image file is retained in server)<br/>
    <br />
    <span style="color: red">
        Dangerous Zone<br />
        Backup: <input type="checkbox" name="backup" onchange=""/>  Delete: <input type="checkbox" name="delete" onchange="confirmDelete(this)"/><br />
    </span>
    <br />
    <div>
        Snippet: <br />
        <textarea name="snippet"  style="min-width: 500px; height: 7em;" onkeypress="submitOnEnter(event)"><?php echo $post->snippet; ?></textarea><br />
        Content: <br />
        <textarea name="content" style="min-width: 500px; min-height: 300px; height: 20em" onkeypress="submitOnEnter(event)"><?php echo loadPost($path) ?></textarea><br />
    </div>
    <br />
    <input type="submit" style="width: 100%"/>
</form>
</body>