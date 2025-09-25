# DemoProject

App React (Vite) com simulação de sistema de gravação a laser, pronto para deploy na Vercel.

## Scripts
- `npm run dev` — inicia ambiente de desenvolvimento (Vite)
- `npm run build` — build para produção (gera `dist/`)
- `npm run preview` — serve o build localmente

## Stack
- React + Vite
- Tailwind CSS
- lucide-react (ícones)
- bwip-js (render de DataMatrix)

## Estrutura
- `index.html` — entrada do Vite
- `src/main.jsx` — bootstrap React + CSS global
- `src/App.jsx` — carrega `src/mockup_sistema_gravacao.jsx`
- `src/mockup_sistema_gravacao.jsx` — componente principal (UI e lógica)
- `src/components/ui/*` — componentes UI mínimos
- `tailwind.config.js` / `postcss.config.js` — configuração de estilo

## Desenvolvimento Local
1. Node 18+ recomendado
2. `npm install`
3. `npm run dev`
4. Abrir `http://localhost:5173`

## Deploy na Vercel
1. Conectar o repositório do GitHub no painel da Vercel (Add New → Project)
2. Framework detectado: Vite
3. Build Command: `vite build`
4. Output Directory: `dist`
5. Deploy

A cada novo push na branch `main`, a Vercel cria um novo deploy automaticamente.

## Notas
- O código usa classes utilitárias (Tailwind) para layout/cores. Os componentes de UI têm estilos mínimos inline; sinta-se à vontade para substituí-los por uma lib (ex.: shadcn/ui) se quiser visual mais rico.
- Ícone `ScanLine` foi trocado por `Scan` para compatibilidade com `lucide-react`.
