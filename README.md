# LetsGraduate

[![Join the chat at https://gitter.im/ehaydenr/LetsGraduate](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/ehaydenr/LetsGraduate?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Import DARS report and see what you need to graduate!

Environment Setup
-----------------

* NodeJS
    * Homebrew - `brew install node`
* Node-dev
    * NPM - `npm -g install node-dev`
* MySQL
    * Homebrew - `brew install mysql`
   
Database Setup
--------------
* Create dev database with user - `mysql -u root -p < db/createdb.sql`
* Load Schema - `mysql -u root -p letsgraduate_dev < db/schema.sql`
* Populate Database - `npm run populatedb`

[![Build Status](https://travis-ci.org/ehaydenr/LetsGraduate.svg?branch=master)](https://travis-ci.org/ehaydenr/LetsGraduate)
