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
      icon: this.data.icon,
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
        icon: 'film_frames',
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
          {
            title: 'Interdimensional Cable',
            url: '/r/InterdimensionalCable'
          },
        ] 
      },
      {
        name: 'music',
        icon: 'musical_keyboard',
        title: 'Music',
        options: [
          {
            title: 'Listen To This',
            url: '/r/listentothis'
          },
          {
            title: 'Electronic',
            url: '/r/electronicmusic'
          },
          {
            title: 'Classical',
            url: '/r/classicalmusic'
          }
        ] 
      },
      {
        name: 'images',
        icon: 'frame_photo',
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
          {
            title: 'The Way We Were',
            url: '/r/TheWayWeWere/'
          }
        ]
      }
    ]
  }
});