#!/bin/bash
read -s -p "Enter MySQL root Password: " mypassword
mysql -u root --password=$mypassword -e 'DROP DATABASE IF EXISTS letsgraduate_dev'
mysql -u root --password=$mypassword < db/createdb.sql
mysql -u root --password=$mypassword letsgraduate_dev < db/schema.sql
npm run scrapeterms
npm run populatedb
npm run generateclassdata
