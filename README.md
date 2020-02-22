Demo of multipart form/file uploading with `Hapi v18`. 


## Usage

    npm install
    npm run setup
    npm run server
    npm run test

You can also try with curl to try the upload request:

    curl --form file=@data.csv    \
         --form animal=Dog  \
         --form breed=Labrador   \
         http://localhost:8080/submit
