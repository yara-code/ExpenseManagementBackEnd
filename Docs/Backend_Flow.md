When a request is made to our APIs:

# Backend Documentation
### Information on the flow and file duties

- They request and payload will be sent to the router.js for all calls.



## router.js
```
Function instance.resource: 
    - will look at endpoints.json which will hold all the request that can be called. (for more info look at endpoints.json section)
    - Go through each endpoint until either the endapoint requested matches one on file or there is no match. 
    - If there is a match return endpoints.json object.
    - If no match is found, exit router.js and respond back to request with "404, Path does not exist.".

router.js handler: 
    - Parse payload body from responds. 
    - Check if request requires an authorization code.
        - If auth is required, check database for correct auth
        - If no auth is need continue the flow. 
    - Find nodejs file that corresponds with the requested endpoint path.
    - router.js will then route the request event, context, and callback to get a response for the request. 
```
    
    
## endpoints.json
```
This file holds an array of objects. 
Each oject will have key and value pair that helps the router direct the request. 

example: 
  {
    "path": "/ping",
    "method": "GET",
    "handler": "handler",
    "require": "api/ping/Get.js",
    "auth"   : false
  },

path: What is the path being requested. 
method: The request can be a POST, GET, PUT, and DELETE.
handler: The module.exports is what returns a response back to the router. handler is the function being called. 
require: The internal file where the router can pass data to and finish the request. 
auth: Boolean which checks if a request needs an authorization code or not. 
```

# Directory View: 
```
Main Folder
    |
    |_______ api
                |
                |_______ router.js
                         "endpoint name" (ex. auth)
                                |
                                |________ "File name" (named after method)
                                          ex. Get.js, Post.js, Put.js, Delete.js
             model
             endpoints.js
             serverless.yml
             package.json
             .serverless
             node_modules
```


## api folder
```





```












