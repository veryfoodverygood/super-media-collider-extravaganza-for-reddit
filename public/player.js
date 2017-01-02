'use strict';
/* jshint eqnull:true */
/* globals Vue, YT */

var app = {
  config: {
    nsfwThumbnailUrl: 'https://cdn.gomix.com/630c7520-5581-4686-ba26-06f0aa5f7e5f%2Fnsfw-icon.png'
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
      if (this.post.name == null ||
          this.post.name == null
      ) {
        return '';
      } else {
        return this.post.media.type
      }
    },
    
    embedCode: function() {
      if (this.post.name == null ||
          this.post.name == null
      ) {
        return '';
      } else {
        return this.post.secure_media_embed.content;
      }
    },
    
    currentView: function() {
      if (this.post.name == null ||
          this.post.name == null
      ) {
        return 'no-media';
      } else {
        switch (this.post.media.type) {
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
        backupEmbedHtml: String
      },
      
      data: function() {
        return {
          playerApi: null
        };
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
        youtubeInit: function() {
          this.playerApi = new YT.Player(this.$refs.embedPlaceholder, {
            height: this.height,
            width: this.width,
            videoId: this.getYoutubeId(this.mediaUrl),
            playerVars: {
              origin: window.location.href, // why is this needed how is this not always implied??!,
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
          event.target.playVideo();
        },
        onYoutubeStateChange: function(event) {
          switch (event.data) {
            case YT.PlayerState.ENDED:
              console.log('done I guess?');
              this.$emit('media-finished');
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
    title: String
  },
  
  computed: {
    loading: function() {
      return false;
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

var vh = new Vue({
  el: 'header',
  
  data: {
    show: false
  }
});

var vm = new Vue({
  el: 'main',
  
  data: {
    endpointBase: 'https://www.reddit.com/r/{subreddit}/hot.json?raw_json=1',
    posts: null,
    linkPostType: 't3',
    postMeta: {
      after: null,
      count: 0,
      currentPost: {
        name: null,
        title: 'No Post Loaded'
      }
    }
  },
  
  computed: {
    subreddit: function() {
      var subredditString = /r\/([\w\d]+)/g;
      var searchResult = subredditString.exec(window.location.pathname);
      return searchResult[1];
    },
    endpoint: function() {
      return this.endpointBase.replace('{subreddit}', this.subreddit);
    }
  },
  
  created: function () {
    this.fetchData();
  },

  methods: {
    fetchData: function() {
      var xhr = new XMLHttpRequest();
      var self = this;
      
      xhr.open('GET', self.endpoint);
      xhr.onload = function () {
        var response = JSON.parse(xhr.responseText).data;
        self.prepareData(response);
        // just preload the first post
        self.loadPost();
      };
      xhr.send();
    },
    prepareData: function(data) {
      var self = this;

      data.children.forEach(function(post, index, posts) {
        // we only like links here
        // And no self posts please
        if (post.kind !== self.linkPostType ||
            post.data.is_self
        ) {
          delete posts[index];
        } else {
          posts[index].active = false;
        }
      });
      
      // clean up array
      data.children = data.children.filter(function(element) {
        return element;
      });
      
      // just make the first one the active one right?
      data.children[0].active = true;
      
      // setup meta stuff
      this.postMeta.after = data.after;
      this.postMeta.count += data.children.length;
      this.posts = data.children;
    },
    // Take currently active post and copy all info into current post object
    loadPost: function(postToLoad) {
      var self = this;
      
      if (postToLoad != null) {
        this.postMeta.currentPost = postToLoad.data;
        return true;
      }
          
      this.posts.some(function(post, index, posts) {
        if (post.active) {
          this.postMeta.currentPost = post.data;
          return true;
        }
      }, self);
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
        // Should this happen here? meh
        this.posts[currentIndex].active = false;
        this.posts[currentIndex - 1].active = true;
        this.loadPost(this.posts[currentIndex - 1]);
      } else {
        console.log('wat do?');
      }
    },
    queueToggle: function() {
      // TODO
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
        // Should this happen here? meh
        this.posts[currentIndex].active = false;
        this.posts[currentIndex + 1].active = true;
        this.loadPost(this.posts[currentIndex + 1]);
      } else {
        console.log('wat do?');
      }
    }
  }
});