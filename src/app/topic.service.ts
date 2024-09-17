import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TopicService {
  private apiUrl = 'http://127.0.0.1:5000';

  constructor(private http: HttpClient) { }

  // Fetch a list of topics from the backend
  getWordToDocIds(): Observable<{ [key: string]: string[] }> {
    return this.http.get<{ [key: string]: string[] }>(`${this.apiUrl}/word_to_doc_ids`);
  }

  // Fetch genres (assuming this endpoint exists)
  getGenres(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/genres`);
  }

  // Fetch songs by a list of genres
  getSongsByGenre(genres: string[]): Observable<any[]> {
    return this.http.post<any[]>(`${this.apiUrl}/songs_by_genre`, { genres });
  }

  // Fetch songs by a specific topic
  getSongsByTopic(topic: string): Observable<any[]> {
    return this.http.post<any[]>(`${this.apiUrl}/songs_by_topic`, { topic });
  }

  // Fetch songs by both genre and topic
  getSongsByGenreAndTopic(genre: string, topic: string): Observable<any[]> {
    return this.http.post<any[]>(`${this.apiUrl}/songs_by_genre_and_topic`, { genre, topic });
  }

  getTopicBySongIds(songIds: string[]): Observable<{ [key: string]: string }> {
    return this.http.post<{ [key: string]: string }>(`${this.apiUrl}/topic_by_song_ids`, { song_ids: songIds });
  }
}
