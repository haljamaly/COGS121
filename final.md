**Final project file** 

**Team members and roles:**

1. Hasan Al - Jamaly: Worked on setting up the database tables, linking the database to the front end rendering of posts and the 
   input of new posts into the database. Implemented the use of the Google Places API for auto-completing location searches and the use
   of the Google Maps Javascript API to render the data about posts in the heatmap on the main page. Enabled the pinning and deleting of 
   posts as well, and the rendering of specific posts on the profile page depending on the user logged in.
   
2. Shuyuan Ma: Worked on enabling signing up for an account and signing in using a Google account, as well as enabling sessions that allow 
   users to extend use over a period of time rather than having to sign in constantly over a short period of time. Also worked on linking
   the database to the Google Map on the profile page and enabling pinning locations where posts have been made. Created the navigation bar.
   
3. Dominic Spencer: Created the front end place holders for forms. Implemented the wrapping of images in the gallery for the homepage. 
   Added features to the front end interface and organized the pages of the application. 
   
**Source code files:**

1. server.js : This contains all the get and post requests made to the website, including all the database manipulations (inserting, removing, looking up, etc.) that are required for the website to function. It organizes the data that needs to be rendered for each html page and determines where users are redirected when the url changes. Also contains all the dependencies that are required (such as the templating library nunjucks, the database api sqlite and the sessions needed to keep the user logged in with their Google account). 

2. create_database.js: This is the file that is first run to create the database file that will be used by the website. It involves creating multiple tables such as the users, posts, comments and pins). The file also inputs some data in the database so that the application doesn't start off empty. 

3. index.html: 

4. layout.html: 

5. login.html: 

6. newpost.html: 

7. post.html: 

8. profile.html: 

9. signup.html: 


