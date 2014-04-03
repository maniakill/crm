app.animation('.my-crazy-animation', function() {
return {
enter: function(element, done) {
  console.log('enter');
  // element.css({'right': '-100%' }).removeClass('anim-leave').addClass('anim anim-enter').animate({ right: '0' },1000, done);
  element.css({'opacity':'0'}).animate({'opacity':'1'},800,done);
  
//run the animation here and call done when the animation is complete
return function(cancelled) {
  console.log('cancelled');

//this (optional) function will be called when the animation
//completes or when the animation is cancelled (the cancelled
//flag will be set to true if cancelled).
};
},
leave: function(element, done) { console.log('leave'); 
  // element.removeClass('anim-enter').addClass('anim anim-leave').animate({
  //       left: '0'
  //     },1000, done);
element.css({'opacity':'1'}).animate({'opacity':'0'},500,done);
          },
move: function(element, done) { console.log('move'); },
 
//animation that can be triggered before the class is added
beforeAddClass: function(element, className, done) { console.log('beforeAddClass');},
 
//animation that can be triggered after the class is added
addClass: function(element, className, done) { console.log('addClass'); },
 
//animation that can be triggered before the class is removed
beforeRemoveClass: function(element, className, done) { console.log('beforeRemoveClass'); },
 
//animation that can be triggered after the class is removed
removeClass: function(element, className, done) { console.log('removeClass'); }
};
});