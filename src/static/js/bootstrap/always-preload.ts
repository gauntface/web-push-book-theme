import {OnLoad} from '../utils/_onload';

function analytics() {
  (<any>window).dataLayer = [];

  function gtag(...any: (string | Date)[]) {
    (<any>window).dataLayer.push(arguments);
  }
  gtag('js', new Date());
  gtag('config', 'UA-161686512-1');

  const s = document.createElement('script');
  s.src = "https://www.googletagmanager.com/gtag/js?id=UA-161686512-1";
  document.body.appendChild(s);
}

function asyncPreloadCSS() {
  const styles = document.querySelectorAll<HTMLLinkElement>('link[rel="preload"][as="style"]')
  for (const s of styles) {
    const l = document.createElement('link');
    l.href = s.href;
    l.rel = 'stylesheet';
    document.head.appendChild(l);
  }
}

function asyncDataSrc() {
  const elements = document.querySelectorAll<HTMLIFrameElement>("[data-src]");
  for (const e of elements) {
    e.src = e.dataset.src;
  }
}

function run() {
  analytics();
  asyncDataSrc();
  asyncPreloadCSS();
}

OnLoad(run);