'use strict';
/* jshint eqnull:true */
/* globals Vue */

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
    // because the reddit api is derped
    makeSSL: function(url) {
      return url.replace('http://', 'https://');
    }
  }
});
Vue.component('player', {
  template: '#player-template',
  
  props: {
    post: Object,
  },
  
  computed: {
    // TODO: make smart
    loading: function() {
      return false;
    },
    
    embedCode: function() {
      if (this.post.name == null ||
          this.post.name == null
      ) {
        return '<span class="no-media">No Media Found</span>';
      } else {
        switch (this.post.media.type) {
          case 'youtube.com':
          case 'vimeo.com':
            this.enablePostApi = true;
            return '<span id="embed-media-placeholder"></span>';
          
          default:
            this.enablePostApi = false;
            return this.post.secure_media_embed.content;
          }
        }
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