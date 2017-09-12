//ANGULAR CODE I STARTED
//STILL NEED TO ADD DIRECTIVES ON FRONT-END: AKA views/sign-up.pug
/*
app.factory('User', function ($resource) {
  return $resource()
})

app.controller('SignUpController', function ($scope, User) {
  $scope.user = {}
  //ez miert szukseges ide?
  $scope.newUser = function () {
    $scope.user = new User({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      company: user.company,
      industry: user.industry,
      phone_number: user.phone_number,
      password: user.password,
      source: user.source
    })
  }

  $scope.register = function () {
  //code
    $scope.user.$save().then(function () {$scope.newUser}) 
  }

  $scope.registerWithFacebook = function () {
  //code
  }

  $scope.registerWithGoogle = function () {
  //code
  }

  $scope.registerWithTwitter = function () {
  //code
  }

})

*/
// INITIALIZING FIREBASE SDK
var config = {
  apiKey: 'AIzaSyDSIklxHQF2HKN4sWO9VjPsoDP_GwbLXVg',
  authDomain: 'nimbus-1485719300231.firebaseapp.com',
  databaseURL: 'https://nimbus-1485719300231.firebaseio.com',
  projectId: 'nimbus-1485719300231',
  storageBucket: 'nimbus-1485719300231.appspot.com',
  messagingSenderId: '635636933541' 
}
firebase.initializeApp(config)

var google = new firebase.auth.GoogleAuthProvider()
var facebook = new firebase.auth.FacebookAuthProvider()
var twitter = new firebase.auth.TwitterAuthProvider()

var firebaseAUTH = firebase.auth()
var firebaseDB = firebase.database()
  /*
// Create a callback which logs the current auth state
var rootRef = firebase.database().ref();
rootRef.onAuth(function(authData) {
  if (authData) {
    console.log("User " + authData.uid + " is logged in with " + authData.provider);
  } else {
    console.log("User is logged out");
  }
});
*/

$(document).ready(function () {
// SIGN-UP PAGE
$("#sign-up").on('click', function(event) {
  event.preventDefault()
  if ($('input[name=password]').val() != $('input[name=confirmPassword]').val()) {
    window.alert('Password and confirm password is not the same. Please check it again.')
    return}
  firebaseAUTH.createUserWithEmailAndPassword($('input[name=email]').val(), $('input[name=password]').val()).then(function (user) {
    user.sendEmailVerification()
    console.log('verification email sent')
    console.log('a new user has signed up with e-mail address: '+user.email+' | User ID given: '+user.uid)
  //signOut() returns firebase.Promise containing void
  //TODO: add Country information based on which IP registration came from
    firebaseDB.ref('users/' + user.uid).set({
      email: $('input[name=email]').val(),
      firstName: $('input[name=firstname]').val(),
      lastName: $('input[name=lastname]').val(),
      company: $('input[name=company]').val(),
      subscriptionPlan: 'Free Trial',
      phone: $('input[name=phone]').val(),
      industry: $('select option:selected').val(),
      source: $('input[name=source]').val()
    })
    alert('Please verify your account by clicking on the link sent to your e-mail address. You will now be redirected to the login page.')
    window.location = '/sign-in'
  }).catch(function(error) {
    $('#errorbox').html('Error: '+error.message)
  })
})

$('#googleSignUp').on('click', function(event) {
  event.preventDefault()
  firebaseAUTH.signInWithPopup(google).then(function (result) {
  var user = result.user
  //todo: redirect to logged in state
  }).catch(function (error) {
  console.log(error.message)
  })
})

$('#facebookSignUp').on('click', function(event) {
  event.preventDefault()
  firebaseAUTH.signInWithPopup(facebook).then(function (result) {
  var user = result.user
  console.log(user)
  //todo: redirect to logged in state
  }).catch(function (error) {
  console.log(error.message)
  })
})

$('#twitterSignUp').on('click', function(event) {
  event.preventDefault()
  firebaseAUTH.signInWithPopup(twitter).then(function (result) {
  var user = result.user
  //todo: redirect to logged in state
  }).catch(function (error) {
  console.log(error.message)
  })
})

// SIGN-IN PAGE
$("#sign-in").on('click', function(event) {
  event.preventDefault()
  var email = $("#email").val()
  var password = $("#password").val()
  firebaseAUTH.signInWithEmailAndPassword(email, password).then(function (user) {
    console.log('user has signed in')
    firebaseAUTH.currentUser.getToken(true).then(function(idToken) {
    $.ajax({
      // Send token to backend via HTTPS (JWT) - it is with HTTP now which is unsecure
      url: '/auth',
      type: 'POST',
      data: {token: idToken},
      success: function (response){
        // Make dashboard, implement onAuthStateChanged for log-out  
        var userID = response.userID
        //make post request, send userID and 'snapshot' object, on server-side: see if req.body. has something in it, only then render a pug file, send variables to pug template with .val().company commands
        firebaseDB.ref('/users/' + userID).once('value').then(function(snapshot) {
          var email = snapshot.val().email
          var company = snapshot.val().company
          var phone = snapshot.val().phone
          var lastname = snapshot.val().lastName
          var firstname = snapshot.val().firstName
          var subscriptionPlan = snapshot.val().subscriptionPlan
          var industry = snapshot.val().industry
          var source = snapshot.val().source
          $.ajax({url: '/members-area', type: 'POST', data: {userID: userID, email: email, company: company, phone: phone, password: password, lastname: lastname, subscriptionPlan: subscriptionPlan, industry: industry, source: source, email: email, firstname: firstname}, success: function(htmlresponse) {
            window.location.reload()
            window.location.href = '/'}
          })
        })
      }
      })
    }).catch(function(error) {
    // Handle error
    console.log(error.message)
    })
  }).catch(function(error) {
    $('#errorbox').html('Error: '+error.message).css('color', 'red')
  })
})

$('#email').on('keypress', function(e) {
  if (e.which == 13) {
  var email = $("#email").val()
  var password = $("#password").val()
  firebaseAUTH.signInWithEmailAndPassword(email, password).then(function (user) {
    console.log('user has signed in')
    firebaseAUTH.currentUser.getToken(true).then(function(idToken) {
    $.ajax({
      // Send token to backend via HTTPS (JWT) - it is with HTTP now which is unsecure
      url: '/auth',
      type: 'POST',
      data: {token: idToken},
      success: function (response){
        // Make dashboard, implement onAuthStateChanged for log-out  
        var userID = response.userID
        //make post request, send userID and 'snapshot' object, on server-side: see if req.body. has something in it, only then render a pug file, send variables to pug template with .val().company commands
        firebaseDB.ref('/users/' + userID).once('value').then(function(snapshot) {
          var email = snapshot.val().email
          var company = snapshot.val().company
          var phone = snapshot.val().phone
          var lastname = snapshot.val().lastName
          var firstname = snapshot.val().firstName
          var subscriptionPlan = snapshot.val().subscriptionPlan
          var industry = snapshot.val().industry
          var source = snapshot.val().source
          $.ajax({url: '/members-area', type: 'POST', data: {userID: userID, email: email, company: company, phone: phone, password: password, lastname: lastname, subscriptionPlan: subscriptionPlan, industry: industry, source: source, email: email, firstname: firstname}, success: function(htmlresponse) {
            window.location.reload()
            window.location.href = '/'}
          })
        })
      }
      })
    }).catch(function(error) {
    // Handle error
    console.log(error.message)
    })
  }).catch(function(error) {
    $('#errorbox').html('Error: '+error.message).css('color', 'red')
  })
  }
})

$('#password').on('keypress', function(e) {
  if (e.which == 13) {
  var email = $("#email").val()
  var password = $("#password").val()
  firebaseAUTH.signInWithEmailAndPassword(email, password).then(function (user) {
    console.log('user has signed in')
    firebaseAUTH.currentUser.getToken(true).then(function(idToken) {
    $.ajax({
      // Send token to backend via HTTPS (JWT) - it is with HTTP now which is unsecure
      url: '/auth',
      type: 'POST',
      data: {token: idToken},
      success: function (response){
        // Make dashboard, implement onAuthStateChanged for log-out  
        var userID = response.userID
        //make post request, send userID and 'snapshot' object, on server-side: see if req.body. has something in it, only then render a pug file, send variables to pug template with .val().company commands
        firebaseDB.ref('/users/' + userID).once('value').then(function(snapshot) {
          var email = snapshot.val().email
          var company = snapshot.val().company
          var phone = snapshot.val().phone
          var lastname = snapshot.val().lastName
          var firstname = snapshot.val().firstName
          var subscriptionPlan = snapshot.val().subscriptionPlan
          var industry = snapshot.val().industry
          var source = snapshot.val().source
          $.ajax({url: '/members-area', type: 'POST', data: {userID: userID, email: email, company: company, phone: phone, password: password, lastname: lastname, subscriptionPlan: subscriptionPlan, industry: industry, source: source, email: email, firstname: firstname}, success: function(htmlresponse) {
            window.location.reload()
            window.location.href = '/'}
          })
        })
      }
      })
    }).catch(function(error) {
    // Handle error
    console.log(error.message)
    })
  }).catch(function(error) {
    $('#errorbox').html('Error: '+error.message).css('color', 'red')
  })
  }
})


$('#forgot-pw').on('click', function(event) {
  event.preventDefault()
  var email = $('#email').val()
  firebaseAUTH.sendPasswordResetEmail(email).then($('#errorbox').html('Password reset e-mail sent.').css('color', 'green')).catch(function(error){
    $('#errorbox').html('Error: '+error.message)
  })
})

// PERSONAL DETAILS PAGE

$('#saveChanges').on('click', function() {
  var user = firebaseAUTH.currentUser
  $.get('/get-user-ID', function (data) {
    var userID = data.userID
    var source = data.source
    var industry = data.industry
    var firstName = $('#firstName').val()
    var lastName = $('#lastName').val()
    var companyName = $('#companyName').val()
    var phoneNumber = $('#phoneNumber').val()
    var newEmailAddress = $('#newEmailAddress').val()
    user.updateEmail(newEmailAddress).then(function () {})
    firebaseDB.ref('users/' + userID).set({
      firstName: firstName,
      lastName: lastName,
      company: companyName,
      phone: phoneNumber,
      email: newEmailAddress,
      industry: industry,
      source: source
    })
  })
  $('#msgBoxForGeneral').html('Changes have been saved successfully.').css('color', 'green')
})


$('#changePassword').on('click', function() {
var user = firebaseAUTH.currentUser
var currentPassword = $('#currentPassword').val()
var newPassword1 = $('#newPassword1').val()
var newPassword2 = $('#newPassword2').val()
if (newPassword1 === newPassword2) {
  user.updatePassword(newPassword1).then(function () {
    $('#msgBoxForPassword').html('Your password has been changed successfully.').css('color', 'green')
  })
} else {
  $('#msgBoxForPassword').html('Your two new passwords do not match. Please try again.').css('color', 'red')
}
})








})
