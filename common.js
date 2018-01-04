var Links = {
  setColor : function(color) {
    var aList = document.querySelectorAll('a');
    var i = 0;
    while(i < aList.length) {
      aList[i].style.color=color;
      i++;
    }
    //$('a').css('color',color);
  }
}

var Body = {
  setBackgroudColor : function(color) {
    document.querySelector('body').style.backgroundColor=color;
  },
  setColor : function(color) {
    document.querySelector('body').style.color=color;
  }
}

function nightDayHandler(self) {
  var target = document.querySelector('body');
  if(self.value==='night') {
    Body.setBackgroudColor('black');
    Body.setColor('white');
    Links.setColor('powderBlue');
    self.value='day';
  } else {
    Body.setBackgroudColor('white');
    Body.setColor('black');
    Links.setColor('blue');
    self.value='night';
  }
}
