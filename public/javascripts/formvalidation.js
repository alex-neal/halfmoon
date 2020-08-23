
// Validate password input
function passwordCheck(input) {
 if (input.value.length < 6 || !/\d/.test(input.value) || !/[A-Za-z]/.test(input.value)) {
   input.setCustomValidity('Password must be at least 6 characters long and contain both letters and numbers.');
 } else {
   input.setCustomValidity('');
 }
}

// Validate that password fields match
function passwordMatchCheck(input) {
	if (input.value != $('#cr-pwd1').val()) {
		input.setCustomValidity('Passwords do not match');
	} else {
		input.setCustomValidity('');
	}
}

// Validate that email is valid and not already used by another account
function emailCheck(input) {
	if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(input.value)) {
		input.setCustomValidity('Must be a valid email address.');
		$('#em-feedback').html('Must be a valid email address');
	} else {
		var url = '/api/account/check/' + input.value;
		$.getJSON(url, function(result) {
			if (result.found) {
				input.setCustomValidity('An account with this email already exists.');
				$('#em-feedback').html('An account with this email already exists');
			} else {
				input.setCustomValidity('');
			}
		});
	}
}


// Listeners for validation functions
$('#cr-pwd1').blur(function() {
	passwordCheck($(this).get(0));
	passwordMatchCheck($('#cr-pwd2').get(0));
});

$('#cr-pwd2').change(function() {
	passwordMatchCheck($(this).get(0));
});

$('#cr-email').blur(function() {
	emailCheck($(this).get(0));
});

(function() {
  'use strict';
  window.addEventListener('load', function() {
    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    var forms = document.getElementsByClassName('needs-validation');
    // Loop over them and prevent submission
    var validation = Array.prototype.filter.call(forms, function(form) {
      form.addEventListener('submit', function(event) {
        $("input").blur();
        if (form.checkValidity() === false) {
          event.preventDefault();
          event.stopPropagation();
        }
        form.classList.add('was-validated');
      }, false);
    });
  }, false);
})();