'use strict';
/* globals Vue */

Vue.component('mood', {
  template: '#mood-template',
  
  props: {
    data: Object
  },
  
  data: function() {
    return {
      title: this.data.title,
      options: this.data.options
    }
  }
});

var moods = new Vue({
  el: '.moods',
  
  data: {
    moods: [
      {
        name: 'video',
        title: 'Video',
        options: [
          {
            title: 'Videos',
            url: '/r/videos'
          },
          {
            title: 'Youtube Haiku',
            url: '/r/youtubehaiku'
          },
          {
            title: 'Obscure Media',
            url: '/r/obscuremedia'
          },
        ] 
      },
      {
        name: 'music',
        title: 'Music',
        options: [
          {
            title: 'Listen To This',
            url: '/r/listentothis'
          }
        ] 
      },
      {
        name: 'images',
        title: 'Images',
        options: [
          {
            title: 'High Quality Gifs',
            url: '/r/HighQualityGifs'
          },
          {
            title: 'Comics',
            url: '/r/comics'
          },
          {
            title: 'Me_Irl',
            url: '/r/me_irl'
          },
        ]
      }
    ]
  }
});