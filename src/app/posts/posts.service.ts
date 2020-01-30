import { Post } from './post.model';
import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({providedIn: 'root'})
export class PostsService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<Post[]>();

  constructor(private http: HttpClient) {}

  getPostUpdateListener(){
    return this.postsUpdated.asObservable();
  }
  getPosts() {
    //return [...this.posts];
    this.http.get<{message:string, posts: any}>('http://localhost:3000/api/posts')
    .pipe(map(
      (postsData)=> {
        return postsData.posts.map( post => {
          return {
            title: post.title,
            content: post.content,
            id: post._id
          };
        })
      }))
    .subscribe((transPosts)=> {
      this.posts = transPosts;
      this.postsUpdated.next([...this.posts]);
    });


  }

  addPost(title: string, content: string){
    const post: Post = {id:null, title:title, content:content};
    this.http.post<{message: string}>('http://localhost:3000/api/posts',post).subscribe((responseData)=>{
      console.log(responseData.message);

      this.posts.push(post);
      this.postsUpdated.next([...this.posts]);
    });


  }

  deletePost(postId:string){
    this.http.delete("http://localhost:3000/api/posts/"+postId)
    .subscribe(()=>{
      console.log('Deleted!');
    })
  }
}
