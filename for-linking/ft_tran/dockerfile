FROM node:20-alpine
WORKDIR /app
COPY package.json .
RUN npm install 
COPY . .
EXPOSE 8080
# CMD ["npm", "run", "dev"]
CMD ["npm", "run", "dev", "--", "--host", "--port", "8080"]

# docker run -d -p 8080:8080 --name my-react-app im1 npm run dev -- --host --port 8080
# now i will move it to the cmd 

# docker run -d -p 8080:8080 -v $(pwd):/app -v /app/node_modules --name react-dev im1 npm run dev -- --host --port 8080
