$('#getobjects').on('click', function(event) {
  $.ajax({
    url: 'https://www.googleapis.com/storage/v1/b/nimbus-1485719300231.appspot.com/o',
    type: 'GET',
    success: function (response) {
    console.log(response)
    }
    })
})
