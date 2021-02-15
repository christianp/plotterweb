import {math, stroke, group, text, dash, attr, choice,polyline, path,fill,rect,line,circle,uniform,element} from '/static/page.js';

function gridify(n,w) {
    const h = n/w;
    const grid = [];
    for(let y=0;y<h;y++) {
        const row = [];
        grid.push(row);
        for(let x=0;x<w;x++) {
            row.push(false);
        }
    }
    const blocks = [];
    for(let i=0;i<h;i++) {
        console.log(`Block ${i}`);
        let x,y;
        for(y=0;y<h;y++) {
            const empties = grid[y].map((_,j)=>j).filter(j=>!grid[y][j]);
            if(empties.length) {
                x = choice(empties);
                break;
            }
        }
        const block = [];
        for(let j=0;j<w;j++) {
            grid[y][x] = i+1;
            block.push({x,y});
            if(i<h-1 || j<w-1) {
                const options = [];
                for(let b of block) {
                    if(b.x>0 && (!grid[b.y][b.x-1]) && (b.y==0 || grid[b.y-1][b.x-1])) {
                        options.push({x:b.x-1,y:b.y});
                    }
                    if(b.x<w-1 && !grid[b.y][b.x+1] && (b.y==0 || grid[b.y-1][b.x+1])) {
                        options.push({x:b.x+1,y:b.y});
                    }
                    if(b.y<h-1 && !grid[b.y+1][b.x]) {
                        options.push({x:b.x,y:b.y+1});
                    }
                    if(options.length) {
                        break;
                    }
                };
                console.log(x,y,options);
                if(!options.length) {
                    console.log(grid.map(r=>r.map(c=>c?c:' ').join(' ')).join('\n'));
                }
                const n = choice(options);
                x = n.x;
                y = n.y;
            }
        }
        console.log(grid.map(r=>r.map(c=>c?c:' ').join(' ')).join('\n'));
        blocks.push(block);
    }
    console.log(grid.map(r=>r.map(c=>c?c:' ').join(' ')).join('\n'));
    return blocks;
}

console.log(gridify(20,4));
