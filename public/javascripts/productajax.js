window.onload = function() {
	$(".cat-check").change(function() {
		displayProducts(buildURL());
	})

	$("#product-search-btn").click(function() {
		var page = window.location.href.split('/').pop()
		var re = /products$/;
		if (!re.test(page)) {
			window.location.href = "/products?search=" + $('#product-search').val();
		} else {
			displayProducts(buildURL());
		}
	})

	$("#product-search").keypress(function(e) {
		var key = e.which;
		if (key==13) {
			$("#product-search-btn").click()
		}
	})

}

const RES_PER_PAGE = 12; // Number of products to display on each page

// Retrieve product JSON via AJAX based on a URL, then display all products in gallery view with pagination
function displayProducts(url) {
	$.getJSON(url, function(data) {
		if (data.length == 0) {
			$('#productdisplay').html("No results.");
			$('#page-nav').html('');
		} else {
			var pageHTML = "";
			var pages = []	// Hold html for each page
			var currentPage = 0; // Index of page currently being viewed by the user
			var pageMessage = "";

			$.each(data, function(i, product) {
				productHTML = '<div class="col-sm-6 col-lg-4 py-4">';
				productHTML += '<a href="products/' + product._id + '">';
				productHTML += '<img src="images/products/' + product.image + 
					'"alt="Product Image" class="product-gallery img-thumbnail no-border"/></a>';
				productHTML += '<div class="caption"><a href="products/' + product._id + '">' + product.name + '</a>';
				productHTML += '<br>$' + product.price.toFixed(2) + '</div></div>';

				pageHTML = pageHTML + productHTML;

				if ((i+1) % RES_PER_PAGE == 0 || i == data.length-1) {
					pages.push(pageHTML);
					pageHTML = "";
				}
			})
			
			// Implement pagination if there are multiple pages needed
			if (pages.length > 1) {
				var pageNavHTML = '<nav aria-label="Pagination">';
				pageNavHTML += '<ul class="pagination">';
				pageNavHTML += '<li class="page-item"><button class="page-link" id="previous">Previous</button></li>'
				for (i=0; i<pages.length; i++) {
					pageNavHTML += '<li class="page-item"><button class="page-link" id="page' + i + '">'+(i+1)+'</button></li>';
				}
				pageNavHTML += '<li class="page-item"><button class="page-link" id="next">Next</button></li>';
				pageNavHTML += '</ul></nav>';

				$('#page-nav').html(pageNavHTML);
				$('#previous').parent().addClass('disabled');
				$('#page0').parent().addClass('disabled');

				$('.page-link').click(function(event) {
					window.scroll(0,0);
					var buttonText = $(this).html();
					$('#page'+currentPage).parent().removeClass('disabled');

					if (buttonText == 'Previous' && currentPage > 0) {
						currentPage -= 1;
					} else if (buttonText == 'Next' && currentPage < pages.length-1) {
						currentPage += 1;
					} else if (Number(buttonText)) {
						currentPage = Number(buttonText-1);
					}

					$('#page'+currentPage).parent().addClass('disabled');
					if (currentPage == 0) {
						$('#previous').parent().addClass('disabled');
					} else {
						$('#previous').parent().removeClass('disabled');
					}
					if (currentPage == pages.length-1) {
						$('#next').parent().addClass('disabled');
					} else {
						$('#next').parent().removeClass('disabled');
					}
					pageMessage = buildPageMessage(currentPage, pages.length, data.length);
					$('#productdisplay').html(pageMessage + pages[currentPage]);
					
				})
			} else {
				$('#page-nav').html('');
			}

			// Display first page
			pageMessage = buildPageMessage(currentPage, pages.length, data.length);
			$('#productdisplay').html(pageMessage + pages[0]);

		}
	})

}

// Make a string for displaying current page number and total number of results
function buildPageMessage(current, numPages, numItems) {
	var message = "<div class='col-12 font-italic mb-4'>" +
		numItems + " products " + "(Page " + (current+1) + " of " + numPages + ")</div>";
	return message;
}

// Create a URL for product API
function buildURL() {
	var url = "/api/products?"

	$(".cat-check:checked").each(function() {
		url += "category=" + this.value + '&';
	})

	var searchVal = $("#product-search").val();
	if (searchVal != '') url += "search=" + searchVal + "&";

	url = url.substring(0, url.length-1);

	return url;
}