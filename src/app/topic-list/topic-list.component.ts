import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { TopicService } from '../topic.service';

@Component({
  selector: 'app-topic-list',
  templateUrl: './topic-list.component.html',
  styleUrls: ['./topic-list.component.css']
})
export class TopicListComponent implements OnInit {
  wordToDocIds: { [key: string]: string[] } = {};
  genres: string[] = [];
  showGenres = true;
  showTopics = true;
  genresPage = 1;
  topicsPage = 1;
  genreSearch = '';
  topicSearch = '';
  chart?: Chart;
  itemsPerPage = 10; // Number of items per page for pagination

  selectedGenres: string[] = [];
  selectedTopic: string | null = null;

  filteredGenres: string[] = [];
  filteredTopics: string[] = [];

  songs: any[] = [];  // Array to store song details
  likedSongs: any[] = [];  // Array to store liked songs

  totalGenresPages = 1; // Total number of pages for genres
  totalTopicsPages = 1; // Total number of pages for topics

  constructor(
    private topicService: TopicService,
    @Inject(PLATFORM_ID) private platformId: any
  ) {}

  ngOnInit(): void {
    // Register Chart.js components
    Chart.register(...registerables);

    this.topicService.getGenres().subscribe({
      next: (data: string[]) => {
        this.genres = data;
        this.filteredGenres = this.genres;
        this.updateTotalGenresPages();
      },
      error: (error) => {
        console.error('Failed to fetch genres:', error);
      }
    });

    this.topicService.getWordToDocIds().subscribe({
      next: (data: { [key: string]: string[] }) => {
        this.wordToDocIds = data;
        this.filteredTopics = Object.keys(data);
        this.updateTotalTopicsPages();
      },
      error: (error) => {
        console.error('Failed to fetch topics:', error);
      }
    });

    // Load liked songs from local storage if running in the browser
    if (isPlatformBrowser(this.platformId)) {
      this.loadLikedSongsFromLocalStorage();
    }
  }

  updateTotalGenresPages() {
    this.totalGenresPages = Math.ceil(this.filteredGenres.length / this.itemsPerPage);
  }

  updateTotalTopicsPages() {
    this.totalTopicsPages = Math.ceil(this.filteredTopics.length / this.itemsPerPage);
  }

  filterGenres() {
    this.filteredGenres = this.genres.filter(genre =>
      genre.toLowerCase().includes(this.genreSearch.toLowerCase())
    );
    this.updateTotalGenresPages();
  }

  filterTopics() {
    this.filteredTopics = Object.keys(this.wordToDocIds).filter(topic =>
      topic.toLowerCase().includes(this.topicSearch.toLowerCase())
    );
    this.updateTotalTopicsPages();
  }

  // Custom pagination logic
  paginate(array: any[], pageNumber: number, itemsPerPage: number) {
    return array.slice((pageNumber - 1) * itemsPerPage, pageNumber * itemsPerPage);
  }

  getPaginatedGenres() {
    return this.paginate(this.filteredGenres, this.genresPage, this.itemsPerPage);
  }

  getPaginatedTopics() {
    return this.paginate(this.filteredTopics, this.topicsPage, this.itemsPerPage);
  }

  onGenreClick(genre: string) {
    const index = this.selectedGenres.indexOf(genre);
    if (index > -1) {
      this.selectedGenres.splice(index, 1);
    } else {
      this.selectedGenres.push(genre);
    }
    this.updateTotalGenresPages();
  }

  onTopicClick(topic: string) {
    this.selectedTopic = this.selectedTopic === topic ? null : topic;
  }

  updateSongs() {
    if (this.selectedTopic && this.selectedGenres.length > 0) {
      this.topicService.getSongsByGenreAndTopic(this.selectedGenres.join(','), this.selectedTopic).subscribe({
        next: (songs: any[]) => {
          this.songs = songs;
        },
        error: (error) => {
          console.error('Failed to fetch songs:', error);
        }
      });
    } else if (this.selectedTopic) {
      this.topicService.getSongsByTopic(this.selectedTopic).subscribe({
        next: (songs: any[]) => {
          this.songs = songs;
        },
        error: (error) => {
          console.error('Failed to fetch songs:', error);
        }
      });
    } else if (this.selectedGenres.length > 0) {
      this.topicService.getSongsByGenre(this.selectedGenres).subscribe({
        next: (songs: any[]) => {
          this.songs = songs;
        },
        error: (error) => {
          console.error('Failed to fetch songs:', error);
        }
      });
    } else {
      this.songs = [];
    }
  }

  likeSong(song: any) {
    if (!this.likedSongs.some(likedSong => likedSong.song === song.song)) {
      this.likedSongs.push(song);
      this.saveLikedSongsToLocalStorage(); // Save to local storage
    }
  }

  dislikeSong(song: any) {
    const index = this.likedSongs.findIndex(likedSong => likedSong.song === song.song);
    if (index > -1) {
      this.likedSongs.splice(index, 1);
      this.saveLikedSongsToLocalStorage(); // Save to local storage
    }
  }

  isSelectedGenre(genre: string): boolean {
    return this.selectedGenres.includes(genre);
  }

  isSelectedTopic(topic: string): boolean {
    return this.selectedTopic === topic;
  }

  onGenresPageChange(page: number) {
    if (page >= 1 && page <= this.totalGenresPages) {
      this.genresPage = page;
    }
  }

  onTopicsPageChange(page: number) {
    if (page >= 1 && page <= this.totalTopicsPages) {
      this.topicsPage = page;
    }
  }

  playSong(spotifyUrl: string) {
    if (isPlatformBrowser(this.platformId)) {
      window.open(spotifyUrl, '_blank');
    } else {
      console.warn('Cannot open Spotify URL outside of the browser environment.');
    }
  }

  saveLikedSongsToLocalStorage() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('likedSongs', JSON.stringify(this.likedSongs));
    }
  }

  loadLikedSongsFromLocalStorage() {
    if (isPlatformBrowser(this.platformId)) {
      const savedSongs = localStorage.getItem('likedSongs');
      if (savedSongs) {
        this.likedSongs = JSON.parse(savedSongs);
      }
    }
  }

  generateChart() {
    const songIds = this.likedSongs.map(song => song.id); // Extract song IDs from liked songs

    // Fetch topics for the liked song IDs
    this.topicService.getTopicBySongIds(songIds).subscribe(songToTopic => {
      // Create a map to count liked songs per topic
      const topicCounts: { [key: string]: number } = {};

      // Initialize counts for each topic
      this.filteredTopics.forEach((topic) => {
        topicCounts[topic] = 0;
      });

      // Count the number of liked songs for each topic
      this.likedSongs.forEach(song => {
        const topic = songToTopic[song.id] || 'Unknown';
        if (this.filteredTopics.includes(topic)) {
          topicCounts[topic] += 1; // Increment the count for the topic
        }
      });

      // Prepare data for the chart
      const labels = this.filteredTopics; // The x-axis labels (topics)
      const data = this.filteredTopics.map(topic => topicCounts[topic]); // The y-axis data (counts of liked songs)

      const chartElement = document.getElementById('likedSongsChart') as HTMLCanvasElement;

      // Destroy previous chart instance if it exists
      if (this.chart) {
        this.chart.destroy();
      }

      const ctx = chartElement.getContext('2d');
      if (ctx) {
        this.chart = new Chart(ctx, {
          type: 'bar', // Switch to a bar chart
          data: {
            labels: labels, // Use topics as labels
            datasets: [{
              label: 'Liked Songs by Topic',
              data: data, // Use the counts as the data
              backgroundColor: 'blue',
            }]
          },
          options: {
            responsive: true,
            plugins: {
              tooltip: {
                callbacks: {
                  label: function (context) {
                    const topic = context.label || 'Unknown Topic';
                    const count = context.raw || 0;
                    return `Topic: ${topic}, Liked Songs: ${count}`;
                  }
                }
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: 'Count of Liked Songs'
                },ticks:{
                  precision:0,
                }
              },
              x: {
                title: {
                  display: true,
                  text: 'Topics'
                }
              }
            }
          }
        });
      }
    });
  }
}
