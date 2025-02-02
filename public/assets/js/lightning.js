console.clear();

var canvasLightning = function (c, cw, ch) {

    this.init = function () {
        this.loop();
    };

    var _this = this;
    this.c = c;
    this.ctx = c.getContext('2d');
    this.cw = cw;
    this.ch = ch;
    this.mx = 0;
    this.my = 0;

    this.now = Date.now();
    this.delta = 0
    this.then = this.now;

    this.lightning = [];
    this.lightTimeCurrent = 0;
    this.lightTimeTotal = 50;

    this.rand = function (rMi, rMa) { return ~~((Math.random() * (rMa - rMi + 1)) + rMi); };

    this.createL = function (x, y, canSpawn) {
        this.lightning.push({
            x: x,
            y: y,
            xRange: this.rand(5, 30),
            yRange: this.rand(5, 25),
            path: [{
                x: x,
                y: y
            }],
            pathLimit: this.rand(10, 35),
            canSpawn: canSpawn,
            hasFired: false,
            grower: 0,
            growerLimit: 5//this.rand(5, 15)
        });
    };

    this.updateL = function () {
        var i = this.lightning.length;
        while (i--) {
            var light = this.lightning[i];

            light.grower += this.delta;

            if (light.grower >= light.growerLimit) {
                light.grower = 0;
                light.growerLimit *= 1.05

                light.path.push({
                    x: light.path[light.path.length - 1].x + (this.rand(0, light.xRange) - (light.xRange / 2)),
                    y: light.path[light.path.length - 1].y + (this.rand(0, light.yRange))
                });

                if (light.path.length > light.pathLimit) {
                    this.lightning.splice(i, 1)
                }
                light.hasFired = true;
            }


        };
    };

    this.renderL = function () {
        var i = this.lightning.length;
        while (i--) {
            var light = this.lightning[i];

            this.ctx.strokeStyle = 'hsla(0, 100%, 100%, ' + this.rand(10, 100) / 100 + ')';
            this.ctx.lineWidth = 1;
            if (this.rand(0, 30) == 0) {
                this.ctx.lineWidth = 2;
            }
            if (this.rand(0, 60) == 0) {
                this.ctx.lineWidth = 3;
            }
            if (this.rand(0, 90) == 0) {
                this.ctx.lineWidth = 4;
            }

            this.ctx.beginPath();

            var pathCount = light.path.length;
            this.ctx.moveTo(light.x, light.y);
            for (var pc = 0; pc < pathCount; pc++) {

                this.ctx.lineTo(light.path[pc].x, light.path[pc].y);

                if (light.canSpawn) {
                    if (this.rand(0, 100) == 0) {
                        light.canSpawn = false;
                        this.createL(light.path[pc].x, light.path[pc].y, false);
                    }
                }
            }

            if (!light.hasFired) {
                this.ctx.fillStyle = 'rgba(255, 255, 255, ' + this.rand(4, 12) / 100 + ')';
                this.ctx.fillRect(0, 0, this.cw, this.ch);
            }

            if (this.rand(0, 60) == 0) {
                this.ctx.fillStyle = 'rgba(255, 255, 255, ' + this.rand(1, 3) / 100 + ')';
                this.ctx.fillRect(0, 0, this.cw, this.ch);
            }

            this.ctx.stroke();
        };
    };


    this.lightningTimer = function () {
        this.lightTimeCurrent += this.delta;
        if (this.lightTimeCurrent >= this.lightTimeTotal) {
            var newX = this.rand(100, cw - 100);
            var newY = this.rand(0, ch / 2);
            var createCount = this.rand(1, 3);
            while (createCount--) {
                this.createL(newX, newY, true);
            }
            this.lightTimeCurrent = 0;
            this.lightTimeTotal = this.rand(200, 1500);
        }
    }

    this.clearCanvas = function () {
        this.ctx.globalCompositeOperation = 'destination-out';
        this.ctx.fillStyle = 'rgba(0,0,0,' + this.rand(1, 30) / 100 + ')';
        this.ctx.fillRect(0, 0, this.cw, this.ch);
        this.ctx.globalCompositeOperation = 'source-over';
    };


    window.addEventListener('resize', () => {
        this.cw = this.c.width = window.innerWidth;
        this.ch = this.c.height = window.innerHeight;
    });


    this.loop = function () {
        requestAnimationFrame(this.loop.bind(this));

        this.now = Date.now();
        this.delta = this.now - this.then;
        this.then = this.now;

        this.clearCanvas();
        this.updateL();
        this.lightningTimer();
        this.renderL();
    };

};

var c = document.getElementById('canvas');
var cw = c.width = window.innerWidth;
var ch = c.height = window.innerHeight;
var cl = new canvasLightning(c, cw, ch);

cl.init();