import { Post } from './post.model';
import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({providedIn: 'root'})
export class PostsService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<{posts: Post[], postCount: number}>();

  constructor(private http: HttpClient, private router: Router) {}

  getPostUpdateListener(){
    return this.postsUpdated.asObservable();
  }

  getPost(id: string){
    // return {...this.posts.find(p=> p.id === id)};
    return this.http.get<{_id:string,title:string,content:string, imagePath: string}>("http://localhost:3000/api/posts/" + id);
  }

  getPosts(postsPerPage:number, currentPage: number) {
    const queryParams = `?pageSize=${postsPerPage}&page=${currentPage}`;
    console.log("Get Posts : " + queryParams);
    this.http
    .get<{message: string; posts: any, maxPosts: number}>("http://localhost:3000/api/posts"+queryParams)
    .pipe(map(
      (postsData)=> {
        return {posts: postsData.posts.map( post => {
          return {
            title: post.title,
            content: post.content,
            id: post._id,
            imagePath: post.imagePath
          };
        }), maxPosts: postsData.maxPosts};
      }))
    .subscribe((transformedPostData)=> {
      this.posts = transformedPostData.posts;
      this.postsUpdated.next({posts: [...this.posts], postCount: transformedPostData.maxPosts});
    });
  }

  addPost(title: string, content: string, image: File){
    const postData = new FormData();
    postData.append("title",title);
    postData.append("content",content);
    postData.append("image", image, title);

    this.http.post<{message: string, post: Post}>('http://localhost:3000/api/posts',postData)
     .subscribe( responseData => {

      this.router.navigate(["/"]);
    });


  }

  deletePost(postId: string){
    console.log('Deleting id : ' + postId);
    return this.http.delete('http://localhost:3000/api/posts/' + postId);
  }

  updatePost(postId:string, title: string, content: string, image: File | string){
    // const post: Post = {id: postId, title: title, content:content, imagePath: null};
    let postData: Post | FormData ;
    if(typeof(image)==='object'){
      postData = new FormData();
      postData.append("id",postId);
      postData.append("title",title);
      postData.append("content", content);
      postData.append("image",image,title);
    }else{
      postData =
      {
        id: postId,
        title: title,
        content: content,
        imagePath: image
      };
    }
    this.http.put('http://localhost:3000/api/posts/' + postId,postData)
      .subscribe(response => {
        this.router.navigate(["/"]);
      });
  }
}
