import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import {Post} from '../post.model'
import { PostsService } from '../posts.service';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit, OnDestroy{

  // posts = [
  //   // {title: 'First Post ', content: ' Some content for 1st component, '},
  //   // {title: 'Second Post ', content: ' Some content for 2nd component, '},
  //   // {title: 'Third Post ', content: ' Some content for 3d component, '},
  //   // {title: 'Forth Post ', content: ' Some content for 4rth component, '}
  // ];

  posts: Post[] = [];
  private postsSub: Subscription;


  constructor(public  postsService: PostsService) {}

  ngOnInit(){
    this.postsService.getPosts();
    this.postsSub = this.postsService.getPostUpdateListener().subscribe((posts: Post[])=>{
      this.posts = posts;
    });
  }

  onDelete(postId:string){
    this.postsService.deletePost(postId);
  }

  ngOnDestroy(){
    this.postsSub.unsubscribe();
  }
}
