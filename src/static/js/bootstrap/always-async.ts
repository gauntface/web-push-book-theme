import {OnLoad} from '../utils/_onload';

OnLoad(function() {
  const scripts = document.querySelectorAll<HTMLLinkElement>('link[rel="preload"][as="script"]')
  for (const s of scripts) {
    const script = document.createElement('script');
    script.src = s.href;
    document.body.appendChild(script);
  }
})