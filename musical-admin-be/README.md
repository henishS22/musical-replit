# Global Admin Functionalityy

This setup is designed with global admin capabilities, meaning it can be used to manage the admin side for any platform needing user, role, and admin management.

# Key features of this backend include:

## User Management: Comprehensive features for managing users within the system.
## Role Management: Assign and manage different roles and permissions for users.
## Admin Management: Centralized management of admin accounts and their activities.

# Core Modules
- Sign Up: User registration functionality.
- Sign In: Authentication of users using secure mechanisms.
- Activity Monitoring: Tracking user and admin activities.
- JWT-based Authentication: Secure authentication with JSON Web Tokens.
- Dashboard: A comprehensive dashboard for admins to view user and system data.
- Me Module: A module for admin profile and settings management.
- Helper Functions: Various helper utilities for common tasks, including middlewares, custom scalars, and data sources.
  Code Structure

- The code is structured into modules for better organization and maintenance. Below is an overview of the core structure:

   - modules/: Contains the core features such as user, auth, dashboard, role, and more.
   - helpers/: Houses utility functions to assist with various operations.
   - middlewares/: Contains middleware for tasks like request validation and authentication.
   - data-sources/: Manages connections and data operations.
   - models/: Contains database models for defining how data is stored.
   - schemas/: Houses schema definitions for GraphQL or REST APIs.

- Refer to the code for more details on each of these modules.

## Requirements
For development, you will only need Node.js and a node global package installed in your environement.

### Node
- #### Node installation on Windows

  Just go on [official Node.js website](https://nodejs.org/) and download the installer.
Also, be sure to have `git` available in your PATH, `npm` might need it (You can find git [here](https://git-scm.com/)).

- #### Node installation on Ubuntu

  You can install nodejs and npm easily with apt install, just run the following commands.

      $ sudo apt install nodejs
      $ sudo apt install npm

- #### Other Operating Systems
  You can find more information about the installation on the [official Node.js website](https://nodejs.org/) and the [official NPM website](https://npmjs.org/).
    

If you need to update `npm`, you can make it using `npm`! After running the following command, just open again the command line and run the following command

    $ npm install npm -g


## Install

    $ git clone https://github.com/SoluLab/BE-admin-boilerplate
    $ npm install

## Configure app

- Create a new .env file in root directory of the project
- Copy the .env

## Running the project
    $ npm start
    
<!-- sample admin module details (Additional details abt module) -->
<!-- remove category,  -->
