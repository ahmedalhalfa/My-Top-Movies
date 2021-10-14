
![screenshot](https://i.imgur.com/IqngikX.png)

> My Top Movies is a backend project built on NodeJs/Express Restful APIs

## Features

> CRUD (Create, Read, Update And Delete)

- Authentication with JWT
  - Login (User/Admin)
  - Register
- Lists
  - create a list
  - edit a list 
  - delete a list 
  - retrieve a single list information
  - retrieve all lists the logged in user created
- Movies
  - add a movie
  - edit a movie 
  - add a movie to a list 
  - edit the movie rank in a list 
  - delete a movie entirely
  - delete a single movie from a list 
  - retrieve a single movie 
  - retrieve all movies the logged in user has created.

> Ranking System
- Global Movies 
    - all the movies the user has created 
- Lists 
    - every list has ranked movies and these ranks are not related to the ranks in the general
 > API Security
 - HTTP Secure Headers with helmet



## API Documentation
documentation with postman: [My Top Movies API](https://documenter.postman.com/preview/17188484-1faa9dac-1499-4c7b-8d30-f30ba375e240)

## Database Model
### mogoose schemas 
![screenshot](https://i.imgur.com/4HhAwSa.jpeg)
## Requirement

- NodeJS
- MongoDB

## Environment Variables
just add a .env file in ./ and fill it with your keys
```
NODE_ENV=
MONGO_DB_URI=
PORT=
JWT_SECRET=
JWT_TOKEN_DURATION=
```
## installation
```
npm install 
```

## Start web server
```
npm start
```
## Developed by Ahmed Alhalfa

Reach me on twitter [@ahmedalhalfa](https://www.twitter.com/ahmedalhalfa)