var express = require('express');
var app = express();
var ig = require('instagram-node').instagram();

var accessToken = null;

//location of our static files(css,js,etc..)
app.use(express.static(__dirname + '/public'));

//set the view engine to use ejs
app.set('view engine', 'ejs');

ig.use({
    client_id: 'd07ebeeab2b243b5ac9f1ff622af8056',
    client_secret: '491fafa542444974b7ee45643b115940'
});

//the redirect uri we set when registering our application
var redirectUri = 'http://localhost:8080/handleAuth';


app.get('/authorize', function(req, res){
    // set the scope of our application to be able to access likes and public content
    res.redirect(ig.get_authorization_url(redirectUri, { scope : ['public_content','likes']}) );
});


app.get('/handleAuth', function(req, res){
    //retrieves the code that was passed along as a query to the '/handleAuth' route and uses this code to construct an access token
    ig.authorize_user(req.query.code, redirectUri, function(err, result){
        if(err){
        	res.send( err );
        	return;
        }
    // store this access_token in a global variable called accessToken
        accessToken = result.access_token;
    // After getting the access_token redirect to the '/' route 
        res.redirect('/');
    });
});

app.get('/', function(req, res){
   // create a new instance of the use method which contains the access token gotten
    ig.use({
     access_token : accessToken
    });

    ig.user_media_recent(accessToken.split('.')[0], function(err, result, pagination, remaining, limit) {
        if(err) res.json(err);
     // pass the json file gotten to our ejs template
     	// console.log(result[0]);
        res.render('pages/index', { instagram : result });
    });
});

app.get("/comments/:media_id", function(req, res){
	ig.comments('media_id', function(err, result, remaining, limit) {
		if(err) res.json(err);

		console.log(result[0]);
		res.json({error:0});
	});
});



app.listen(8080, function(){
	console.log("NO AR!!");
});