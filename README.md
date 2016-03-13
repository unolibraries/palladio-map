To run on the latest version of main Palladio framework for testing purposes, first clone the main Palladio framework repository, then in that repository set up a bower link, then link this application to your local version of the Palladio framework:

```
cd palladio
bower link
cd ../palladio-embed-app
bower link Palladio palladio
python -m SimpleHTTPServer
```
