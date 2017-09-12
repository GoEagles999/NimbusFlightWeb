var socketio = io.connect('https://nimbusflight.io:5089')

$(document).ready(function() {

$("#getBucketObjects").click(function() {
  $.get('/get-images-from-cloud', function (data) {
    $(data).find('Contents').each(function (index) {
      var picName = ($(this).find('key').text())
      $('#container-for-images').append($('<img style="display: none;"/>').attr('src', 'https://storage.googleapis.com/nimbus-1485719300231.appspot.com/'+picName).attr('height','125px').attr('width','125px').css('border','1px solid black').delay(10*index).fadeIn('slow'))
    })
  })
})

})

socketio.on('a', function () {
  console.log('a')
})
