const Post = require('../models/post');


exports.createPost = (req, res, next) => {
    const url = req.protocol + "://" + req.get("host");
    const post = new Post({
      title: req.body.title,
      content: req.body.content,
      imagePath: url + "/images/" + req.file.filename,
      creator: req.userData.userId
    });
    
    post.save().then(createdPost => {
      console.log(createdPost);
      res.status(201).json({
        message: "Post added successfully",
        post: {
          ...createdPost,
          id: createdPost._id
        }
      });
    })
    .catch(err => {
      res.status(500).json({message: "Creating a post failed."});
    });
};

exports.updatePost = (req,res,next)=>{
    let imagePath = req.body.imagePath;
    if(req.file){
      const url = req.protocol + "://" + req.get("host");
      imagePath = url + "/images/" + req.file.filename;
    }

    const post = new Post({
      _id: req.params.id,
      title:    req.body.title,
      content:  req.body.content,
      imagePath: imagePath,
      creator: req.userData.userId
    });
    
    Post.findOneAndUpdate({_id: req.params.id, creator: req.userData.userId}, post).then(result => {
      console.log("Look Here : "+result);
      if(result) {
        res.status(200).json({message: 'Udate successfull.'});
      }else{
        res.status(401).json({message: 'Not authorised.'});      
      }
      
    })
    .catch(err => {
      res.status(401).json({message: "Could not update post."});      
    });
};

exports.getPost = (req,res,next)=>{
    Post.findById(req.params.id).then(post => {
      if(post){
        res.status(200).json(post);
      }else{
        res.status(404).json({message: 'Post not foud'});
      }
    }).catch((err)=>{
      res.status(500).json({message: "Fetching post failed."});
   });
};

exports.getPosts = (req, res, next)=>{

    const pageSize = +req.query.pageSize;
    const currentPage = +req.query.page;
    const postQuery = Post.find();
    let fetchedPosts;
    //Create query.
    if(pageSize && currentPage ){
      // console.log("!!!!" + pageSize + " !! ++ !! " + currentPage);
      postQuery
        .skip(pageSize * (currentPage - 1))
        .limit(pageSize);
    }
    postQuery.then((documents) => {
        fetchedPosts = documents;
        return Post.count();
      }).
      then(count => {
        res.status(200).json({
          message: 'Posts fetched successfully',
          posts: fetchedPosts,
          maxPosts: count
        });
      })
      .catch((err)=>{
         res.status(500).json({message: "Fetching posts failed."});
      });
};

exports.deletePost = (req, res, next)=>{
    Post.deleteOne({_id: req.params.id, creator: req.userData.userId}).then(result => {  
      if(result.deletedCount > 0) {
        console.log(result);
        res.status(200).json({message: 'Deleted '+ req.params.id + ' successfully, well done!'});
      }else {
        res.status(401).json({message: 'Not authorised.'});
      }
      
    }).catch((err)=>{
      res.status(500).json({message: "Delete post failed."});
   });

};