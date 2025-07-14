import Koa from 'koa'

const app = new Koa()

app.use(async (ctx) => {
  console.log('Request received:', ctx.path)
  if (ctx.path === '/health') {
    ctx.body = { status: 'ok', message: 'Test server working' }
  } else {
    ctx.body = { message: 'Hello from test server', path: ctx.path }
  }
})

const PORT = 3002

app.listen(PORT, () => {
  console.log(`Test server running on http://localhost:${PORT}`)
})
