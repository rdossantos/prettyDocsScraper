jsdom = require("jsdom");
var fs = require('fs');
var mkdirp = require('mkdirp');

jsdom.env(
  "http://underscorejs.org/",
  ["http://code.jquery.com/jquery.js",
   "http://underscorejs.org/underscore.js"],

  function (errors, window) {
    var $ = window.$;
    var _ = window._;
function getSections(){
    var sections = {};

    $('a + ul').each(function(i, e){
        $e = $(e);
        sections[$e.prev().text().replace(/^\s+|\s+$/g,'')] = {
            $ul:$e
        };
    });

    _.each(sections, getDetailsForSection);

    return sections;
}

function getDetailsForSection(section, sectionName){
    if(sectionName.indexOf('Underscore.js') === -1){    
        section.functions = [];
        _.each($('li', section.$ul), function(li){
            var aFunction = {};

            aFunction.name = $(li).text().substring(2);
            if(aFunction.name === 'functions'){
                aFunction.name = 'object-functions';
            }

            $functionParagraph = $('#' + aFunction.name);

            
            var paragraphHtml = $functionParagraph.html();
            aFunction.description = paragraphHtml.substring(paragraphHtml.indexOf('<br>')+4);
            console.info(aFunction.description);
        
            _.extend(aFunction, getFunctionDetails($functionParagraph));

            aFunction.exampleText = $('#' + aFunction.name + ' + pre').text();

            section.functions.push(aFunction);
        });
    }
}

function getFunctionDetails($functionParagraph){
    var functionDetails = {};

    var signature = $('code', $functionParagraph).first().html();
    functionDetails.arguments = getFunctionArguments(signature);

    functionDetails.aliases = getFunctionAliases($functionParagraph);

    return functionDetails;
}

function getFunctionAliases($functionParagraph){
    var aliases;
    if($('span.alias > b', $functionParagraph).length > 1){
        aliases = [];
        $('span.alias > b', $functionParagraph).each(function(index, alias){
            aliases.push($(alias).text());
        });
    }else{
        var aliasString = $('span.alias > b', $functionParagraph).text();
        aliasString = aliasString.replace(/\s/g,'');
        aliases = aliasString.split(',');

        if(aliases.length === 1 && aliases[0] === ''){
            aliases = [];
        }
    }
    return aliases;
}

// var exampleFunction = {
//             aliases: ['alias1', 'alias2'],
//             arguments: [
//                 {
//                     text: 'list'
//                     isRequired: true
//                 },{
//                     text: 'iterator'
//                     isRequired: true
//                 },{
//                     text: 'context'
//                     isRequired: false
//                 }
//             ],
//             name: 'map'
//         }

function getFunctionArguments(signature){
    if(signature){
        var signatureCopy = signature;

        signatureCopy = signatureCopy.substring(signatureCopy.indexOf('(') + 1, signatureCopy.length-1);
        var args = signatureCopy.split(',');
        args = _.map(args, function(arg){
            var argObj = {};

            argObj.text = arg.replace(/\s/g,'');
            argObj.isRequired = true;
            argObj.isList = false;

            if(arg.indexOf('*')>=0){
                argObj.isList = true;
                argObj.text = argObj.text.replace(/\*/g,'');
            }

            if(arg.indexOf('[')>=0){
                argObj.isRequired = false;
                argObj.text = argObj.text.replace(/\[|\]/g,'');
            }

            return argObj;
        });

        // _.each(args, function(arg){
        //     if(arg.indexOf('[') === 0){
        //         arg = arg.substring(1);
        //         debugger;
        //     }
        // });
        return args; 
    }else{
        debugger;
    }   
}

function removeLeadingAndTrailingWhitespace(aString){
    return aString.replace(/^\s+|\s+$/g,'');
}

var sections = getSections();

_.each(sections, function(section, sectionName){
  _.each(section.functions, function(aFunction){
        var location = './api/' + sectionName + '/' + aFunction.name;
	mkdirp('./api/' + sectionName, function(error){
          if(error){
            console.log('error creating directory', location, ' - ', error);
          }else{
            fs.writeFile(location, JSON.stringify(aFunction), function(err) {
    	    if(err) {
        	console.log(err);
    	    } else {
        	console.log("The file was saved!");
    	    }
         });
        }
    });
  });
});



console.log('ending');
  }
);
