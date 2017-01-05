'use strict';
/* jshint eqnull:true */
/* globals Vue, YT */

var app = {
  config: {
    nsfwThumbnailUrl: 'https://cdn.gomix.com/630c7520-5581-4686-ba26-06f0aa5f7e5f%2Fnsfw-icon.png'
  },
  mediaStatus: {
    playing: 'playing',
    stopped: 'stopped',
    loading: 'loading',
    error: 'error'
  }
}

var isYoutubeApiReady = false;
function onYouTubeIframeAPIReady() {
  isYoutubeApiReady = true;
}

Vue.component('playlist', {
  template: '#playlist-template',
  
  props: {
    posts: Array,
  },
  
  computed: {
    // TODO: make smart
    loading: function() {
      return false;
    }
  },
  
  methods: {
    emitLoadPost: function(index) {
      this.$emit('load-post', this.posts[index]);
    }
  },
  
  components: {
    'upcoming-post': {
      template: '#upcoming-post-template',
      
      props: {
        active: Boolean,
        title: String,
        thumbnail: String
      },

      filters: {
        isThumbnail: function(url) {
          // Cheat by just checking common cases I guess?
          switch (url) {
            case 'nsfw':
              return app.config.nsfwThumbnailUrl;
            
            default:
              return url;
          }
        },
        // because the reddit api is derped
        makeSSL: function(url) {
          return url.replace('http://', 'https://');
        }
      },
      
      watch: {
        active: function(isActive) {
          if (isActive) {
            var upcomingPosts = document.querySelectorAll('.upcoming-posts')[0],
                buffer = 50;
                
            upcomingPosts.scrollTop = this.$el.offsetTop - buffer;
          }
        }
      }
    }
  }
});
Vue.component('player', {
  template: '#player-template',
  
  props: {
    post: Object
  },
  
  data: function() {
    return {
      currentView: 'no-media',
      height: null,
      width: null
    };
  },
  
  mounted: function() {
    this.height = this.$el.clientHeight;
    this.width = this.$el.clientWidth;
  },
  
  computed: {
    // TODO: make smart
    loading: function() {
      return false;
    },

    mediaType: function() {
      if (this.post.media == null ||
          this.post.media == null
      ) {
        return '';
      } else {
        return this.post.media.type
      }
    },
    
    embedCode: function() {
      if (this.post.media == null ||
          this.post.media == null
      ) {
        return '';
      } else {
        return this.post.secure_media_embed.content;
      }
    },
    
    currentView: function() {
      if (this.post.media == null ||
          this.post.media == null
      ) {
        return 'no-media';
      } else {
        switch (this.post.media.type) {
          case 'youtube.com':
          case 'youtube.com':
          // case 'vimeo.com':
            return 'api-embed';
          
          default:
            return 'generic-embed';
        }
      }
    },
  },
  
  methods: {
    playPrev: function() {
      this.$emit('play-prev');
    },
    togglePlay: function() {
      this.$emit('toggle-play');
    },
    playNext: function() {
      this.$emit('play-next');
    }
  },
  
  components: {
    // Youtube: {
      
    // },
    'api-embed': {
      template: '<div class="embed-wrapper"><div class="embed-placeholder" ref="embedPlaceholder"></div></div>',
      
      props: {
        domain: String,
        width: Number,
        height: Number,
        mediaUrl: String,
        playerStatus: String,
        backupEmbedHtml: String
      },
      
      data: function() {
        return {
          playerApi: null
        };
      },
      
      watch: {
        playerStatus: function(newValue) {
          console.log('player status change is now ' + newValue);
          if (this.playerApi == null) {
            return;
          }
          
          switch (newValue) {
            case app.mediaStatus.playing:
              this.startPlayer();
              break;
            case app.mediaStatus.stopped:
              this.pausePlayer();
              break;
          }
        }
      },
      
      mounted: function() {
        this.createPlayerApi();
      },
      
      beforeDestroy: function() {
        if (this.playerApi == null) {
          return;
        }
        
        // this is probably good enough???
        switch (this.domain) {
          case 'youtube.com':
            this.playerApi.destroy();
            break;
          // case 'vimeo.com':
            // do a vimeo thing
        }
        
        this.playerApi = null;        
      },
      
      methods: {
        createPlayerApi: function() {
          switch (this.domain) {
            case 'youtube.com':
              if (!window.isYoutubeApiReady) {
                console.log('Uh Oh');
                break;
              }
              this.youtubeInit();
              break;
            // case 'vimeo.com':
              // do a vimeo thing
              // break;
          }
        },
        pausePlayer: function() {
          switch (this.domain) {
            case 'youtube.com':
              this.playerApi.pauseVideo();
              break;
            // case 'vimeo.com':
              // do a vimeo thing
              // break;
          }
        },
        startPlayer: function() {
          switch (this.domain) {
            case 'youtube.com':
              this.playerApi.playVideo();
              break;
            // case 'vimeo.com':
              // do a vimeo thing
              // break;
          }
        },
        youtubeInit: function() {
          this.playerApi = new YT.Player(this.$refs.embedPlaceholder, {
            height: this.height,
            width: this.width,
            videoId: this.getYoutubeId(this.mediaUrl),
            playerVars: {
              autoplay: (this.playerStatus === 'playing') ? 1 : 0
              // controls: 0,
            },
            events: {
              'onReady': this.onYoutubeReady,
              'onStateChange': this.onYoutubeStateChange
            }
          });
        },
        getYoutubeId: function(url) {
          // this is a black box don't touch it plz
          var regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
          var match = url.match(regExp);
          if (match && match[2].length == 11) {
            return match[2];
          }
          console.log('Uh oh');
        },
        onYoutubeReady: function(event) {
          // event.target.playVideo();
        },
        onYoutubeStateChange: function(event) {
          switch (event.data) {
            case YT.PlayerState.ENDED:
              console.log('done I guess?');
              this.$emit('media-finished');
              break;
            case YT.PlayerState.PLAYING:
              this.$emit('media-started');
              break;
            case YT.PlayerState.PAUSED:
              this.$emit('media-stopped');
              break;
          }
        }
      }
    },
    'generic-embed': {
      template: '<div class="embed-wrapper" v-html="backupEmbedHtml"></div>',
      
      props: {
        backupEmbedHtml: String
      }
    },
    'no-media': {
      template: '<span class="no-media">No Media Found</span>',
    }
  }
});
Vue.component('meta-bar', {
  template: '#meta-bar-template',
  
  props: {
    title: String,
    threadPermalink: String,
    mediaStatus: String,
  },
  
  computed: {
    loading: function() {
      return false;
    },
    toggleLabel: function() {
      switch (this.mediaStatus) {
        case app.mediaStatus.playing:
          return 'Pause';
        case app.mediaStatus.stopped:
          return 'Play';
        default:
          return 'Play/Pause';
      }
    }
  },
  
  methods: {
    playPrev: function() {
      this.$emit('play-prev');
    },
    togglePlay: function() {
      this.$emit('toggle-play');
    },
    playNext: function() {
      this.$emit('play-next');
    }
  }
});
Vue.component('comments', {
  template: '#comments-template',
  
  props: {
    threadPermalink: String,
    comments: Array
  },
});
Vue.component('comment', {
  template: '#comment-template',
  
  props: {
    comment: Object,
  },
  
  computed: {
    author: function() {
      return this.comment.author;
    },
    body: function() {
      return this.comment.body_html;
    },
    children: function() {
      if (this.comment.replies === '' ||
          this.comment.replies == null
      ) {
        return false;
      }
      return this.comment.replies.data.children
    },
  }
});

var vh = new Vue({
  el: 'header',
  
  data: {
    show: false
  }
});

var vm = new Vue({
  el: 'main',
  
  data: {
    endpointBase: 'https://www.reddit.com/r/{subreddit}/hot.json?raw_json=1{params}',
    commentsEndpointBase: 'https://www.reddit.com/comments/{article}.json?raw_json=1',
    redditUrlBase: 'https://www.reddit.com',
    posts: [],
    comments: null,
    linkPostType: 't3',
    commentPostType: 't1',
    postMeta: {
      after: null,
      count: 0,
      currentPost: {
        name: null,
        title: 'No Post Loaded',
        mediaStatus: app.mediaStatus.loading,
        permalink: '/#'
      }
    },
    defaultPostData: {
      mediaStatus: app.mediaStatus.playing
    }
  },
  
  computed: {
    subreddit: function() {
      var subredditString = /r\/([\w\d]+)/g;
      var searchResult = subredditString.exec(window.location.pathname);
      return searchResult[1];
    },
    endpoint: function() {
      var params = '';
      if (this.postMeta.count) {
        params += '&count=' + this.postMeta.count;
      }
      if (this.postMeta.after != null) {
        params += '&after=' + this.postMeta.after;
      }
      return this.endpointBase
        .replace('{subreddit}', this.subreddit)
        .replace('{params}', params);
    },
    commentsEndpoint: function() {
      return this.commentsEndpointBase.replace('{article}', this.postMeta.currentPost.id);
    }
  },
  
  created: function () {
    this.fetchData();
  },
  
  mounted: function() {
    var self = this;
    
    window.addEventListener('keydown', function(event) {
      var key = event.which || event.keyCode;
      
      switch (key) {
        case 37: // left
          self.queuePrev();
          break;
        case 32: // space
          event.preventDefault();
          self.queueToggle();
          break;
        case 39: // right
          self.queueNext();
          break;
      }
    });
  },

  methods: {
    fetchData: function() {
      var xhr = new XMLHttpRequest();
      var self = this;
      
      xhr.open('GET', this.endpoint);
      xhr.onload = function() {
        var response = JSON.parse(xhr.responseText).data;
        response = self.prepareData(response);
        
        // just make the first one the active one right?
        response.children[0].active = true;
        
        // setup meta stuff
        self.postMeta.after = response.after;
        self.postMeta.count += response.children.length;
        self.posts = self.posts.concat(response.children);
        
        // just preload the first (new) post
        self.loadPost(response.children[0]);
      };
      xhr.send();
    },
    prepareData: function(data) {
      var self = this;

      data.children.forEach(function(post, index, posts) {
        // we only like links here
        // And no self posts please
        if (post.kind !== self.linkPostType ||
            post.data.is_self ||
            post.data.media == null
        ) {
          delete posts[index];
        } else {
          posts[index].active = false;
          
          // normalize domain
          switch (post.data.media.type) {
            case 'youtube.com':
            case 'm.youtube.com':
              posts[index].data.media.type = 'youtube.com';
              break;
          }
        }
      });
      
      // clean up array
      data.children = data.children.filter(function(element) {
        return element;
      });
      
      return data;
    },
    // Take currently active post and copy all info into current post object
    loadPost: function(postToLoad) {
      var newPost;
      
      if (postToLoad != null) {
        // turn off current active
        var oldPostIndex = this.posts.findIndex(function(post, index, posts) {
          return post.active;
        }, this);
        this.posts[oldPostIndex].active = false;
        
        // turn on new active
        var newPostIndex = this.posts.findIndex(function(post, index, posts) {
            return post === this;
          },
          postToLoad // a bit weird but meh?
        );
        this.posts[newPostIndex].active = true;
        
        postToLoad.data = Object.assign({}, this.defaultPostData, postToLoad.data);
        this.postMeta.currentPost = postToLoad.data;
      } else {
        newPost = this.posts.find(function(post) {
          if (post.active) {
            return true;
          }
        }, this);
        
        newPost.data = Object.assign({}, this.defaultPostData, newPost.data);
        this.postMeta.currentPost = newPost.data;
      }
      
      this.fetchComments();
    },
    loadPostFromEvent: function(postToLoad) {
      this.loadPost(postToLoad);
    },
    // Find previous element in list based on id I guess?
    queuePrev: function() {
      var self = this,
          currentId = this.postMeta.currentPost.name;
      
      var currentIndex = this.posts.findIndex(function(post, index, posts) {
        if (post.data.name === currentId) {
          return true;
        }
      });
      
      if (currentIndex === -1) {
        console.log('Uh Oh, didn\'t see that one coming');
      }
      
      if (this.posts[currentIndex - 1] != null) {
        this.loadPost(this.posts[currentIndex - 1]);
      } else {
        console.log('wat do?');
      }
    },
    queueToggle: function() {
      switch (this.postMeta.currentPost.mediaStatus) {
        case app.mediaStatus.playing:
          this.postMeta.currentPost.mediaStatus = app.mediaStatus.stopped;
          break;
        
        default:
          this.postMeta.currentPost.mediaStatus = app.mediaStatus.playing;
      }
    },
    queueNext: function() {
      var self = this,
          currentId = this.postMeta.currentPost.name;
      
      var currentIndex = this.posts.findIndex(function(post, index, posts) {
        if (post.data.name === currentId) {
          return true;
        }
      });
      
      if (currentIndex === -1) {
        console.log('Uh Oh, didn\'t see that one coming');
      }
      
      if (this.posts[currentIndex + 1] != null) {
        this.loadPost(this.posts[currentIndex + 1]);
      } else {
        // Get more data's I guess?
        this.fetchData();
      }
    },
    updateStatePlaying: function() {
      this.postMeta.currentPost.mediaStatus = app.mediaStatus.playing;
    },
    updateStatePaused: function() {
      this.postMeta.currentPost.mediaStatus = app.mediaStatus.stopped;
    },
    fetchComments: function() {
      var xhr = new XMLHttpRequest();
      var self = this;
      
      xhr.open('GET', this.commentsEndpoint);
      xhr.onload = function () {
        var response = JSON.parse(xhr.responseText)[1].data;
        self.prepareComments(response);
      };
      xhr.send();
    },
    prepareComments: function(data) {
      var self = this;

      data.children.forEach(function(post, index, posts) {
        if (post.kind !== self.commentPostType ||
            post.data == null
        ) {
          delete posts[index];
        }
      });
      
      // clean up array
      data.children = data.children.filter(function(element) {
        return element;
      });
      
      // setup meta stuff
      this.comments = data.children;
    }
  }
});
