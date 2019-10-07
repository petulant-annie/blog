const http = require('http');

class App {
  constructor() {
    this.middlewares = [];
  }

  use(middleware) {
    this.middlewares.push(middleware);
    console.log(this.middlewares);
  }

  handle(req, res) {
    this.middlewares = this.middlewares.map((middleware, i) => {
      return () => middleware(req, res, () => this.middlewares[i + 1](req, res));
    });
    this.middlewares[0]();
  }
}

const app = new App();
const server = http.createServer((req, res) => app.handle(req, res));

app.use((req, res, next) => {
  console.log('middleware 1 start');
  req.test = 'hello from middleware 1';
  next();
  console.log('middleware 1 end');
});

app.use((req, res, next) => {
  console.log('middleware 2');
  console.log(req.test);
  next();
});

app.use((req, res) => {
  console.log('middleware 3');
  res.end('Hello');
});

server.listen(3000, () => { console.log('started...') });

// Output in the console should be
// middleware 1 start
// middleware 2
// hello from middleware 1
// middleware 3
// middleware 1 end