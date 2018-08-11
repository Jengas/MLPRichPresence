var storage = require('electron-json-storage');
var city = require('./assets/city.json')
var city_values = Object.values(city);

function save() {
  storage.set('activity', {
    state: $("#state").text(),
    details: $("#details").val(),
    autoload: $('#checkbox').get(0).checked
  }, function(error) {
    if (error) throw error;
  });
}

storage.get('activity', function(error, data) {
  if (error) throw error;

  var stateload = data.state;
  var detailsload = data.details;
  var autoload = data.autoload;
  if (stateload == undefined) {
    var newstate = "Понивиль";
    var newstatekey = "ponyville";
  } else {
    var newstate = city[stateload].city;
    var newstatekey = city[stateload].state;
  }
  if (detailsload == undefined) {
    var newdetails = "Только приехал";
  } else {
    var newdetails = detailsload
  }
  $("#state").text(newstate)
  $("#ltext").text(newstate)
  $("#lkey").text(newstatekey)
  $("#details").val(detailsload)
  $("#checkbox").prop('checked', autoload)
});

for (var i = 0; i < city_values.length; i++) {
  city_values[i]
  $("#dplist").append("<li>" + city_values[i].city + "</li>");
}

var selected = $('.selected');
var dropdown = $('.dropdown-list');
var optionList = $('.dropdown-list li');

selected.click(function() {
  dropdown.toggleClass('active');

  if (dropdown.hasClass('active')) {
    optionList.click(function() {

      if (optionList.hasClass('active')) {
        $(this).siblings().removeClass('active');
      } else {
        $(this).addClass('active');
      }
      dropdown.removeClass('active');
      selected.children('span').html($(this).html());
      for (var i = 0; i < city_values.length; i++) {
        city_values[i]
        if ($('#state').text() == city_values[i]) {
          $("#lkey").text(city_values[i].state);
          $("#ltext").text($('#state').text());
        }
      }
    })
  }
})

$('#disabledform').on('keyup keypress', function(e) {
  var keyCode = e.keyCode || e.which;
  if (keyCode === 13) {
    e.preventDefault();
    return false;
  }
});

$("#dplist").on('DOMSubtreeModified', function() {
  $(".button").removeClass('space');
  $(".button").addClass("space_save");
  $(".footer").addClass("enabled");
  $('.button').click(function() {
    $(".button").addClass("space");
    $(".button").removeClass('space_save');
    $(".footer").removeClass("enabled");
  })
});
$("#details").change(function() {
  $(".button").removeClass('space');
  $(".button").addClass("space_save");
  $(".footer").addClass("enabled");
  $('.button').click(function() {
    $(".button").addClass("space");
    $(".button").removeClass('space_save');
    $(".footer").removeClass("enabled");
  })
});
$("#checkbox").change(function() {
  $(".button").removeClass('space');
  $(".button").addClass("space_save");
  $(".footer").addClass("enabled");
  $('.button').click(function() {
    $(".button").addClass("space");
    $(".button").removeClass('space_save');
    $(".footer").removeClass("enabled");
  })
});

$('.button').mousedown(function(e) {
  var target = e.target;
  var rect = target.getBoundingClientRect();
  var ripple = target.querySelector('.ripple');
  $(ripple).remove();
  ripple = document.createElement('span');
  ripple.className = 'ripple';
  ripple.style.height = ripple.style.width = Math.max(rect.width, rect.height) + 'px';
  target.appendChild(ripple);
  var top = e.pageY - rect.top - ripple.offsetHeight / 2 - document.body.scrollTop;
  var left = e.pageX - rect.left - ripple.offsetWidth / 2 - document.body.scrollLeft;
  ripple.style.top = top + 'px';
  ripple.style.left = left + 'px';
  return false;
});


var xxs = $('.sf-checkbox').prop('checked', true);
var xx = $('.sf-checkbox').prop('checked', false);
