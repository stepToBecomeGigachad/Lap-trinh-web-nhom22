Book Store Static Site

A static homepage inspired by the demo at `https://websitedemos.net/book-store-04/?customize=template#`.

Run locally

- Open `index.html` directly in your browser, or
- Use a simple server:
  - PowerShell quick server (temporary):
    - Run:
      `powershell -NoProfile -Command "$h=New-Object System.Net.HttpListener; $h.Prefixes.Add('http://localhost:8080/'); $h.Start(); Write-Host 'Serving http://localhost:8080'; while($h.IsListening){ $c=$h.GetContext(); $p=$c.Request.Url.LocalPath.TrimStart('/'); if([string]::IsNullOrWhiteSpace($p)){ $p='index.html'}; $f=Join-Path (Get-Location) $p; if(Test-Path $f){ $b=[System.IO.File]::ReadAllBytes($f); $c.Response.OutputStream.Write($b,0,$b.Length) } else { $c.Response.StatusCode=404 }; $c.Response.Close() }"`
  - Or install Node and run: `npx serve .`

Replace assets

Put your images into `assets/` and update the `src` paths in `index.html` as needed:
- Hero: `assets/hero-cover1.jpg` .. `hero-cover4.jpg`
- Product grid: `assets/book1.jpg` .. `book8.jpg`
- Bestseller: `assets/bestseller.jpg`
- Author: `assets/author.jpg`
- Editors: `assets/pick1.jpg` .. `pick4.jpg`
- Partner: `assets/partner.jpg`

Customize

- Colors and spacing in `css/styles.css` under `:root` and section classes.
- Text content in `index.html`.
- Basic interactivity in `js/app.js` (slider, add-to-cart UX, subscribe mock).

Notes

This is a static approximation for demo purposes and not a full ecommerce implementation.

