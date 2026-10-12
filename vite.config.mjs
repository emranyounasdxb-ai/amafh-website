import { defineConfig } from 'vite';
export default defineConfig({
  plugins:[{
    name:'amafh-local-pages',
    configureServer(server) {
      server.middlewares.use((req,res,next)=>{
        if(req.headers.accept?.includes('text/html')) res.setHeader('X-Robots-Tag','noindex');
        next();
      });
    },
    transformIndexHtml: {
      order:'pre',
      async handler(html,ctx) {
        if(!ctx.server) return html;
        const [{renderSite},{readRoute},{renderDocument}]=await Promise.all([
          ctx.server.ssrLoadModule('/src/view.ts'),ctx.server.ssrLoadModule('/src/routes.ts'),ctx.server.ssrLoadModule('/src/seo.ts'),
        ]);
        const {locale,page}=readRoute(new URL(ctx.originalUrl||ctx.path,'http://localhost'));
        return renderDocument(html,renderSite(locale,page),locale,page);
      },
    },
  }],
});
