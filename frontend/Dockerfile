FROM node:20
WORKDIR /usr/src/app
COPY . .
RUN npx create-react-app . --template cra-template
EXPOSE 3000
CMD ["npm", "start"]
