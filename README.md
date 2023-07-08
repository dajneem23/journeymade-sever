


## Build docker
```bash
docker build --pull --rm -f "journeymade-sever/Dockerfile" -t journeymade-sever:latest "journeymade-sever"
```
## Run docker
```bash
docker run -it -p 3000:3000 -d journeymade-sever
```