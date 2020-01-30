const express = new require("express");
const bodyParser = new require("body-parser");
const Post =  new require('./models/post');
const mongoose = new require('mongoose');

const app = express();

mongoose.connect('mongodb://localhost:27017/node-angular?retryWrites=true',{useNewUrlParser: true}).then(()=>{
  console.log("Connected to database.");
}).catch(()=>{
  console.log("Connection failed.");
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

app.use((req, res, next)=>{
  res.setHeader("Access-Control-Allow-Origin","*");
  res.setHeader("Access-Control-Allow-Headers","Origin, X-Requested-With, Content-Type, Accept");
  res.setHeader("Access-Control-Allow-Methods","GET, POST, PATCH, DELETE, OPTIONS");
  next();
});

app.post("/api/posts", (req,res,next)=>{

  const post = new Post({
    title: req.body.title,
    content: req.body.content
  });

  post.save();

  res.status(201).json({
    message: 'Post added successfully.'
  });

});

app.use('/api/posts' ,(req, res, next)=>{

  Post.find()
    .then((documents) => {
      res.status(200).json({
        message: 'Posts fetched successfully',
        posts: documents
      });
    })
    .catch((err)=>{
       console.log("Error catch line:backend/app.js 64: "+err);
    });


});

app.delete("/api/posts/:id",(req, res, next)=>{
  console.log(req.params.id);

  Post.deleteOne({_id: req.params.id}).then(result => {
    console.log(result);
    res.status(200).json({
      message: 'Deleted '+ req.params.id + ' successfully, well done!',
    });
  });


});


module.exports = app;
