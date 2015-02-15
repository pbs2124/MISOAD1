
     ,-----.,--.                  ,--. ,---.   ,--.,------.  ,------.
    '  .--./|  | ,---. ,--.,--. ,-|  || o   \  |  ||  .-.  \ |  .---'
    |  |    |  || .-. ||  ||  |' .-. |`..'  |  |  ||  |  \  :|  `--, 
    '  '--'\|  |' '-' ''  ''  '\ `-' | .'  /   |  ||  '--'  /|  `---.
     `-----'`--' `---'  `----'  `---'  `--'    `--'`-------' `------'
    ----------------------------------------------------------------- 


Welcome to your Node.js project on Cloud9 IDE!

## Running the server

0) If not already started, start the MongoDB Database using the following command

    $ mongod --dbpath database/db -f config/mongodb.conf &

1) Open `app.js` and start the app by clicking on the "Run" button in the top menu.

2) Alternatively you can launch the app from the Terminal:

    $ node app.js

Once the server is running, open the project in the shape of 'https://projectname-username.c9.io/'. As you enter your name, watch the Users list (on the left) update. 
Once you press Enter or Send, the message is shared with all connected clients.


## TODO

1)  Add Projection feature to all the GET requests
2)  Proper Error Handling
3)  POST Requests for all resources
4)  PUT for relational resources
5)  Filter feature for all GET Collection requests