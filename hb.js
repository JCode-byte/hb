
const cakeContainer = document.getElementById('cakeContainer');
const presentContainer = document.getElementById('presentContainer');
const instructionText = document.getElementById('instructionText');
const fireworksContainer = document.getElementById('fireworks-container');

cakeContainer.addEventListener('click', () => {
    if (cakeContainer.classList.contains('blown-out')) return;

    cakeContainer.classList.add('blown-out');
    instructionText.style.opacity = '0';

    setTimeout(() => {
        cakeContainer.classList.add('hidden');
        presentContainer.classList.add('visible');
        instructionText.textContent = 'Tap the present!';
        instructionText.style.opacity = '1';
    }, 6000);
});

presentContainer.addEventListener('click', () => {
    if (presentContainer.classList.contains('opened')) return;

    presentContainer.classList.add('opened');
    instructionText.style.opacity = '0';

    setTimeout(() => {
        cakeContainer.style.display = 'none';
        presentContainer.style.display = 'none';
        document.body.classList.add('fireworks-active');
        
        fireworksContainer.style.display = 'block';
        startFireworks();
    }, 500);
});


function startFireworks() {
    const c = document.getElementById('fireworks-canvas');
    let w = (c.width = window.innerWidth),
        h = (c.height = window.innerHeight),
        ctx = c.getContext("2d"),
        hw = w / 2,
        hh = h / 2,
        opts = {
            strings: ["HAPPY", "BIRTHDAY!", "Nicay!"],
            charSize: 30,
            charSpacing: 35,
            lineHeight: 40,
            fireworkSpawnTime: 200,
            fireworkBaseReachTime: 30,
            fireworkAddedReachTime: 30,
            fireworkCircleBaseSize: 20,
            fireworkCircleAddedSize: 10,
            letterContemplatingWaitTime: 360,
            gravity: 0.1,
        },
        calc = {
            totalWidth: opts.charSpacing * Math.max(opts.strings[0].length, opts.strings[1].length),
        },
        Tau = Math.PI * 2,
        TauQuarter = Tau / 4,
        letters = [];

    ctx.font = opts.charSize + "px Verdana";

    function Letter(char, x, y) {
        this.char = char;
        this.x = x;
        this.y = y;
        this.dx = -ctx.measureText(char).width / 2;
        this.dy = +opts.charSize / 2;
        this.fireworkDy = this.y - hh;
        var hue = (x / calc.totalWidth) * 360;
        this.color = "hsl(hue,80%,50%)".replace("hue", hue);
        this.lightAlphaColor = "hsla(hue,80%,light%,alp)".replace("hue", hue);
        this.lightColor = "hsl(hue,80%,light%)".replace("hue", hue);
        this.alphaColor = "hsla(hue,80%,50%,alp)".replace("hue", hue);
        this.reset();
    }
    Letter.prototype.reset = function () {
        this.phase = "firework";
        this.tick = 0;
        this.spawned = false;
        this.spawningTime = (opts.fireworkSpawnTime * Math.random()) | 0;
        this.reachTime = (opts.fireworkBaseReachTime + opts.fireworkAddedReachTime * Math.random()) | 0;
        this.lineWidth = 5 + 8 * Math.random();
        this.prevPoints = [[0, hh, 0]];
    };
    Letter.prototype.step = function () {
        if (this.phase === "firework") {
            if (!this.spawned) {
                if (++this.tick >= this.spawningTime) {
                    this.tick = 0;
                    this.spawned = true;
                }
            } else {
                ++this.tick;
                var linearProportion = this.tick / this.reachTime,
                    armonicProportion = Math.sin(linearProportion * TauQuarter),
                    x = linearProportion * this.x,
                    y = hh + armonicProportion * this.fireworkDy;
                if (this.prevPoints.length > 10) this.prevPoints.shift();
                this.prevPoints.push([x, y, linearProportion * this.lineWidth]);
                for (var i = 1; i < this.prevPoints.length; ++i) {
                    var point = this.prevPoints[i], point2 = this.prevPoints[i - 1];
                    ctx.strokeStyle = this.alphaColor.replace("alp", i / this.prevPoints.length);
                    ctx.lineWidth = point[2] * (i / this.prevPoints.length);
                    ctx.beginPath();
                    ctx.moveTo(point[0], point[1]);
                    ctx.lineTo(point2[0], point2[1]);
                    ctx.stroke();
                }
                if (this.tick >= this.reachTime) {
                    this.phase = "contemplate";
                    this.circleFinalSize = opts.fireworkCircleBaseSize + opts.fireworkCircleAddedSize * Math.random();
                    this.circleCompleteTime = (30 + 30 * Math.random()) | 0;
                    this.circleCreating = true;
                    this.circleFading = false;
                    this.circleFadeTime = (10 + 5 * Math.random()) | 0;
                    this.tick = 0;
                    this.tick2 = 0;
                    this.shards = [];
                    var shardCount = (5 + 5 * Math.random()) | 0,
                        angle = Tau / shardCount,
                        cos = Math.cos(angle),
                        sin = Math.sin(angle),
                        shardX = 1,
                        shardY = 0;
                    for (let i = 0; i < shardCount; ++i) {
                        let x1 = shardX;
                        shardX = shardX * cos - shardY * sin;
                        shardY = shardY * cos + x1 * sin;
                        this.shards.push(new Shard(this.x, this.y, shardX, shardY, this.alphaColor));
                    }
                }
            }
        } else if (this.phase === "contemplate") {
            ++this.tick;
            if (this.circleCreating) {
                ++this.tick2;
                let proportion = this.tick2 / this.circleCompleteTime,
                    armonic = -Math.cos(proportion * Math.PI) / 2 + 0.5;
                ctx.beginPath();
                ctx.fillStyle = this.lightAlphaColor.replace("light", 50 + 50 * proportion).replace("alp", proportion);
                ctx.arc(this.x, this.y, armonic * this.circleFinalSize, 0, Tau);
                ctx.fill();
                if (this.tick2 > this.circleCompleteTime) {
                    this.tick2 = 0;
                    this.circleCreating = false;
                    this.circleFading = true;
                }
            } else if (this.circleFading) {
                ctx.fillStyle = this.lightColor.replace("light", 70);
                ctx.fillText(this.char, this.x + this.dx, this.y + this.dy);
                ++this.tick2;
                let proportion = this.tick2 / this.circleFadeTime,
                    armonic = -Math.cos(proportion * Math.PI) / 2 + 0.5;
                ctx.beginPath();
                ctx.fillStyle = this.lightAlphaColor.replace("light", 100).replace("alp", 1 - armonic);
                ctx.arc(this.x, this.y, this.circleFinalSize, 0, Tau);
                ctx.fill();
                if (this.tick2 >= this.circleFadeTime) this.circleFading = false;
            } else {
                ctx.fillStyle = this.lightColor.replace("light", 70);
                ctx.fillText(this.char, this.x + this.dx, this.y + this.dy);
            }
            for (let i = 0; i < this.shards.length; ++i) {
                this.shards[i].step();
                if (!this.shards[i].alive) {
                    this.shards.splice(i, 1);
                    --i;
                }
            }
            if (this.tick > opts.letterContemplatingWaitTime) {
                this.phase = "end";
            }
        }
    };
    function Shard(x, y, vx, vy, color) {
        var vel = 4 + 2 * Math.random();
        this.vx = vx * vel;
        this.vy = vy * vel;
        this.x = x;
        this.y = y;
        this.prevPoints = [[x, y]];
        this.color = color;
        this.alive = true;
        this.size = 3 + 3 * Math.random();
    }
    Shard.prototype.step = function () {
        this.x += this.vx;
        this.y += this.vy += opts.gravity;
        if (this.prevPoints.length > 3) this.prevPoints.shift();
        this.prevPoints.push([this.x, this.y]);
        for (var k = 0; k < this.prevPoints.length - 1; ++k) {
            var point = this.prevPoints[k],
                point2 = this.prevPoints[k + 1];
            ctx.strokeStyle = this.color.replace("alp", k / this.prevPoints.length);
            ctx.lineWidth = k * (this.size / this.prevPoints.length);
            ctx.beginPath();
            ctx.moveTo(point[0], point[1]);
            ctx.lineTo(point2[0], point2[1]);
            ctx.stroke();
        }
        if (this.prevPoints[0][1] > hh) this.alive = false;
    };
    function anim() {
        window.requestAnimationFrame(anim);
        ctx.clearRect(0, 0, w, h);
        ctx.translate(hw, hh);
        var done = true;
        for (var l = 0; l < letters.length; ++l) {
            letters[l].step();
            if (letters[l].phase !== "end") done = false;
        }
        ctx.translate(-hw, -hh);
        if (done) {
            for (var l = 0; l < letters.length; ++l) letters[l].reset();
        }
    }

    for (let i = 0; i < opts.strings.length; ++i) {
        for (var j = 0; j < opts.strings[i].length; ++j) {
            letters.push(
                new Letter(
                    opts.strings[i][j],
                    j * opts.charSpacing + opts.charSpacing / 2 - (opts.strings[i].length * opts.charSpacing) / 2,
                    i * opts.lineHeight + opts.lineHeight / 2 - (opts.strings.length * opts.lineHeight) / 2
                )
            );
        }
    }

    window.addEventListener("resize", function () {
        w = c.width = window.innerWidth;
        h = c.height = window.innerHeight;
        hw = w / 2;
        hh = h / 2;
        ctx.font = opts.charSize + "px Verdana";
    });
    
    anim();
}