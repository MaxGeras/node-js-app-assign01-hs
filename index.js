const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000

express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .post('/reformat', (req, res) => res.send(reformatString(req)))
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
  
 /********************************************************
 * We ensured that the input String has been validated for
 * WHITE SPACES between commas and the format on the Client Side
 *********************************************************/
 reformatString = (req) => {
	// validate request 
	var isValid = req && req.query && req.query.input;
	var output = isValid ? req.query.input : null;
	// reformat string if we have valid request and characterSet 
	if (isValid && req.query.input.length > 0) {
		// Looking for ' " ' and ' , '
		if (req.query.input.indexOf('"') > -1 || req.query.input.indexOf(',') > -1) {
			// Define variables
			var isOpenBracket = false;
			var reformattedOutput = [];
			var charArray = req.query.input.split('');
			
			// Loop through each character and replace "" with [] and , with ' '
			for (var index = 0; index < charArray.length; index++) {
				switch(charArray[index]) {	
					case '"':
						isOpenBracket = reformatQuotationMarks(charArray, index, reformattedOutput);
						break;
					case ',':
					    if (!isOpenBracket) {
						    reformatCommas(charArray, index, reformattedOutput);
					    }
						break;
				  default:	  
					reformattedOutput.push(charArray[index]);
				}
			}
			// Get reformatred output string
			output = reformattedOutput.join("");
		}
	}
	
	return output;
 }

 /*********************************************************
 * Replace Quotation Marks with opening and closing brackets
 *
 ***********************************************************/
reformatQuotationMarks = (charArray, position, reformattedOutput) => {
	var isOpenBracket = false
	// case "abc -> abc]
	if (position === charArray.length -1 || (charArray[position + 1] === ',' || charArray[position + 1] === '\n')) {
		reformattedOutput.push(']');
	} else { // case abc" -> [abc
		reformattedOutput.push('[');
		isOpenBracket = true;
	}
	return isOpenBracket;
}

 /*********************************************************
 * Replace commas with white spaces 
 *
 ***********************************************************/
reformatCommas = (charArray, position, reformattedOutput) => {
	// case: "," -> ' '
	if (charArray[position - 1] === '"') {
		reformattedOutput.push(' ');
	} else {
		// case: ",12," -> 12]
		reformattedOutput.push(']');
		reformattedOutput.push(' ');
	}	
	// case: ",12," -> [12
	if (position != charArray.length - 1 && charArray[position + 1] != '"') {
		reformattedOutput.push('[');
	}
}
