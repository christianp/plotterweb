import {set_page_dimensions, math, stroke, group, text, dash, attr, choice,polyline, path,fill,rect,line,circle,uniform,element} from '/static/page.js';

const poem = `
I scan the shelves, I pick a book
To find a tasty thing to cook

When my tummy starts to rumble
I've got the skills - I'm not humble

Who knows just what I'll cook today?
Pommes dauphinoise, a crème brûlée?

I weigh, I stir, I peel, I chop
I fetch some extras from my shop

As I re-read the recipe
I sip my umpteenth cup of tea

In due course, and not too late
I serve it all onto a plate

A scrumptious feast, a top repast
Oh, what a way to break my fast!

I gaze a while at what I've got
I just can't wait, I scoff the lot

I must lie down, my heart's a-flutter
Perhaps next time, I'll use less butter
`.trim();

set_page_dimensions(210,210);

text('The Goddess of Good Grub',0,10,{halign: 'center',maxwidth: 210, size: 8, fontname: 'EMSBrush'});
text(poem,0,25,{fontname: 'EMSReadabilityItalic', valign: 'top',maxwidth:210, size: 5.5, halign: 'center' });
