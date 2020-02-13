import { Post } from './post.model';
import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({providedIn: 'root'})
export class PostsService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<Post[]>();

  constructor(private http: HttpClient, private router: Router) {}

  getPostUpdateListener(){
    return this.postsUpdated.asObservable();
  }

  getPost(id: string){
    // return {...this.posts.find(p=> p.id === id)};
    return this.http.get<{_id:string,title:string,content:string}>("http://localhost:3000/api/posts/" + id);
  }

  getPosts() {  
    this.http.get<{message: string; posts: any}>('http://localhost:3000/api/posts')
    .pipe(map(
      (postsData)=> {
        return postsData.posts.map( post => {
          return {
            title: post.title,
            content: post.content,
            id: post._id
          };
        });
      }))
    .subscribe((transPosts)=> {
      this.posts = transPosts;
      this.postsUpdated.next([...this.posts]);
    });
  }

  addPost(title: string, content: string, image: File){
    const postData = new FormData();
    postData.append("title",title);
    postData.append("content",content);
    postData.append("image", image, title);

    this.http.post<{message: string, postId: string}>('http://localhost:3000/api/posts',postData)
     .subscribe( responseData => {
      const post: Post = {id: responseData.postId, title:title, content: content};
      
      this.posts.push(post);
      this.postsUpdated.next([...this.posts]);
      this.router.navigate(["/"]);
    });


  }

  deletePost(postId: string){
    console.log('Deleting id : ' + postId);
    this.http.delete('http://localhost:3000/api/posts/' + postId)
    .subscribe(()=> {
      const updatedPosts = this.posts.filter(post => post.id !== postId);
      this.posts = updatedPosts;
      this.postsUpdated.next([...this.posts]);
    });
  }

  updatePost(postId:string, title: string, content: string){
    const post: Post = {id: postId, title: title, content:content};

    this.http.put('http://localhost:3000/api/posts/' + postId,post)
      .subscribe(response => {
        console.log(response);
        const updatedPosts = [...this.posts]; 
        const oldPostIndex = updatedPosts.findIndex(p => p.id === post.id);
        
        updatedPosts[oldPostIndex] = post;
        this.posts = updatedPosts;
        this.postsUpdated.next([...this.posts]);
        this.router.navigate(["/"]);
      });
  }
}