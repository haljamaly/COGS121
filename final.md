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
   Added features to the front end interface and organized the pages of the application. Final video.
   
**Source code files:**

1. server.js : This contains all the get and post requests made to the website, including all the database manipulations (inserting, removing, looking up, etc.) that are required for the website to function. It organizes the data that needs to be rendered for each html page and determines where users are redirected when the url changes. Also contains all the dependencies that are required (such as the templating library nunjucks, the database api sqlite and the sessions needed to keep the user logged in with their Google account). 

2. create_database.js: This is the file that is first run to create the database file that will be used by the website. It involves creating multiple tables such as the users, posts, comments and pins). The file also inputs some data in the database so that the application doesn't start off empty. 

3. index.html: This is the html file that contains the homepage, which renders the main data visualization of the application (the heat map that displays the location of posts that are created by the users). Additionally, it contains of the ability to search for different posts in specific locations enabled by the auto-complete API, that narrows down the posts displayed to ones tagged in specific locations. These posts are also hyperlinks to the pages that contain the post itself. 

4. layout.html: This is the html code that enables the navigation bar rendering. It is included in all other html pages to include the navigation bar in all html pages. 

5. login.html: This is a simple page that prompts the user to login in order to use the full functionality of the website. 

6. newpost.html: This page is an html page that holds the form fields for a new post to be made, including a title, location, image url and body. The body of the post allows users to format the text of their post. When the user inputs all fields in the form and creates the post, they will return back to the index.html where their post can be seen on the home screen.

7. post.html: This page is the page that renders all the data for a specific post, starting with the image of the post, the title, author, time of the post creation and the body. All users are also able to comment on the post, pin the post so they have access to it from their own profile, and delete the post if they were the original creator of the post. 

8. profile.html: This is the page that holds the information for the profile of the user that is logged in. It involves the chosen profile picture of the user, the username of the user, a Google Map element that includes pins for all of the posts that have been created by the user that is logged in. The posts that have been created by the user are rendered on the left side of the page, whereas the posts pinned by the user are located on the right side of the page. 

9. signup.html: This is a simple form page that allows the user to fill in their username and image URL that will be connected to their user profile. This is also enabled once the user chooses a Google Account that will link to their website account. Afterwards, the user will be able to login using their Google account only.

**Demo Video Link:** 

https://www.youtube.com/watch?v=AJxKLjgEwU4&feature=youtu.be

