docker rm -f web_armaxis
docker build -t web_armaxis .
docker run --name=web_armaxis --rm -p1337:1337 -p8080:8080 -it web_armaxis
