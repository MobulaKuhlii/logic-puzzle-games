#!/bin/sh

docker run -it -u node -w /home/node/app -v ./:/home/node/app --rm node:19 bash
