app.animation('.page', function() {
return {	
enter: function(element, done) {
	var transitions = ['mb-slide mb-in','mb-slide-up mb-in','mb-slide mb-inl','mb-slide-up mb-inb'],
			transitions_rev = ['mb-slide mb-in mb-reverse','mb-slide mb-out mb-reverse','mb-slide-up mb-in reverse','mb-slide-up mb-out reverse'],
			random_nr = (Math.random() * 10) + 1;
			trans_nr = 0;

	if ((random_nr >=2.5) && (random_nr <5)) { trans_nr = 1; }
	if ((random_nr >=5) && (random_nr <7.5)) { trans_nr = 2; }
	if (random_nr >=7.5) { trans_nr= 3; }

  element.addClass(transitions[trans_nr]);
	return function(cancelled) {
  		element.remove();
	};
},
leave: function(element, done) { console.log('leave',element); 
	element.removeClass('mb-slide,mb-slide-up');
},
move: function(element, done) { console.log('move');},
beforeAddClass: function(element, className, done) { console.log('beforeAddClass');},
addClass: function(element, className, done) { console.log('addClass'); },
beforeRemoveClass: function(element, className, done) { console.log('beforeRemoveClass'); },
removeClass: function(element, className, done) { console.log('removeClass'); }
};
});