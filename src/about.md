---
layout: base
tags: nav
title: hakkımızda
eleventyNavigation:
  key: hakkımızda
  order: 3
permalink: /about/
---

# hakkımızda

biz SPRAY.

## bizi dinleyin!

{%- for platform, details in metadata.author.dsp %}

- [{% icon "music" %} {{ platform }}]({{ details.url }})
  {%- endfor %}

## bizi takip edin!

{%- for platform, details in metadata.author.social %}

- [{% icon platform %} {{ platform }}]({{ details.url }})
  {%- endfor %}

## iletişim

- [{% icon "envelope" %} e-posta](mailto:{{ metadata.author.email | obfuscate | safe }})
