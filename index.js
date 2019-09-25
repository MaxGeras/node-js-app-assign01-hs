const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000 // Run locally

express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .get('/reformat', (req, res) => res.send(reformatString(req)))
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
  
 /********************************
 * Assume that the input String format is correct.
 * All quotation marks and commas have 
 * valid positions in the String.
 *********************************/
 reformatString = (req) => {
	// Validate request 
	var isValid = req && req.query && req.query.input,
	    output = isValid ? req.query.input : null;
	
	// Reformat String if we have a valid request and character set. 
	if (isValid && req.query.input.length > 0) {
		// Do we have ',' and '"' ?
		if (req.query.input.indexOf('"') > -1 || req.query.input.indexOf(',') > -1) {
			// Define variables
			var isOpenBracket = false // We need to know if we are dealing with open brackets or not.
			    isCommaCase = false,  // Special case ...,123,...
			
			    reformattedOutput = [], // This array will hold the formatted String. 
			    charArray = req.query.input.split(''), // Char array
				index = 0;
			
			while (index < charArray.length) {
				switch(charArray[index]) {	
					case '"':
						isOpenBracket = reformatQuotationMarks(charArray, index, reformattedOutput, isOpenBracket);
						break;
					case ',':
					    if (!isOpenBracket) {
						    reformattedOutput.push(' ');
					    }
						//'...example1"    ,   121' -> '...example1] [121' -> '...example1] [121]' 
						if (isCommaCase) {
							isCommaCase = isOpenBracket = false;
							reformattedOutput.push.apply(reformattedOutput,[']',' ']);
						}
						break;
				    default:
					    //  We are going to handle spaces between quotation marks and commas and format it correctly.
					    // ...,"Data example"    ,    "Data example1"    ,   12334343 ,"Data example2",...
						// -> ... [Data example] [Data example1] [12334343] [Data example2] ...
						if (isOpenBracket || charArray[index] == '\n') {
							if (isCommaCase) {
								 // '..., 1232132132                    ,...' -> [1232132132] = remove extra spaces
								if (charArray[index] != ' ') {
									reformattedOutput.push(charArray[index]);
								}
							} else {
								reformattedOutput.push(charArray[index]);
							}
						} else if (charArray[index] != ' ') {
							if (reformattedOutput[reformattedOutput.length - 1] == ' ') {
								reformattedOutput.push.apply(reformattedOutput,['[',charArray[index]]);
								isOpenBracket = isCommaCase = true;
							} 
						}
				}
			}
			// Get reformatted output String from character array.
			output = reformattedOutput.join("");
		}
	}
	return output;
 }

 /*********************************************************
 * Replace Quotation Marks with open and closed brackets.
 *
 ***********************************************************/
reformatQuotationMarks = (charArray, position, reformattedOutput, isOpenBracket) => {
	// Case "abc -> [abc
	if (position === charArray.length - 1 || (charArray[position + 1] === ',' || charArray[position + 1] === '\n') || isOpenBracket) {
		reformattedOutput.push(']');
		isOpenBracket = false
	} else { // Case abc" -> abc]
		reformattedOutput.push('[');
		isOpenBracket = true;
	}
	return isOpenBracket;
}
